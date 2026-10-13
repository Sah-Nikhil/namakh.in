import { v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { assertTrustedCaller } from "./orders";
import schema from "./schema";
import { rateLimiter } from "./rateLimits";
import { COMMERCE } from "../lib/commerce/config";
import { getProductBySlug } from "../lib/products";
import {
  customerShippingFee,
  fallbackShippingFee,
  parcelFor,
  type Parcel,
} from "../lib/shiprocket/parcel";

/**
 * Everything that talks to Shiprocket's API.
 *
 * Two jobs: quote a shipping price at checkout, and create the order in
 * Shiprocket once it is paid. Booking the courier stays a person's job in the
 * Shiprocket panel unless COMMERCE.shiprocket.autoAssignCourier is turned on.
 *
 * Credentials are the dedicated API user (Settings → API → Configure in the
 * panel), set on the deployment as SHIPROCKET_API_EMAIL and
 * SHIPROCKET_API_PASSWORD. Without them every quote falls back to the fixed
 * fee and every push records a "not configured" failure; nothing crashes.
 */

const BASE = "https://apiv2.shiprocket.in/v1/external";
const DAY = 24 * 60 * 60 * 1000;

class NotConfiguredError extends Error {}

// ---------------------------------------------------------------------------
// Response narrowing. Shiprocket's JSON is loosely typed — numbers sometimes
// arrive as strings — so nothing is trusted until it has been checked.
// ---------------------------------------------------------------------------

function num(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function str(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return undefined;
}

function obj(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

/** Shiprocket puts errors in `message`, or in an `errors` map of field → [msg]. */
function errorText(body: unknown, fallback: string): string {
  const record = obj(body);
  if (!record) return fallback;
  const errors = obj(record.errors);
  if (errors) {
    const first = Object.values(errors).flat().find((e) => typeof e === "string");
    if (typeof first === "string") return first;
  }
  return str(record.message) ?? fallback;
}

// ---------------------------------------------------------------------------
// Login. Tokens last ten days; we refresh after nine, and once more on a 401.
// ---------------------------------------------------------------------------

export const cachedToken = internalQuery({
  args: {},
  returns: v.union(v.object({ token: v.string(), expiresAt: v.number() }), v.null()),
  handler: async (ctx) => {
    const row = await ctx.db
      .query("integrationTokens")
      .withIndex("by_provider", (q) => q.eq("provider", "shiprocket"))
      .unique();
    return row ? { token: row.token, expiresAt: row.expiresAt } : null;
  },
});

export const saveToken = internalMutation({
  args: { token: v.string(), expiresAt: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("integrationTokens")
      .withIndex("by_provider", (q) => q.eq("provider", "shiprocket"))
      .unique();
    if (row) {
      await ctx.db.patch("integrationTokens", row._id, args);
    } else {
      await ctx.db.insert("integrationTokens", { provider: "shiprocket", ...args });
    }
    return null;
  },
});

async function token(ctx: ActionCtx, forceRefresh: boolean): Promise<string> {
  if (!forceRefresh) {
    const cached = await ctx.runQuery(internal.shiprocket.cachedToken, {});
    if (cached && cached.expiresAt > Date.now()) return cached.token;
  }

  const email = process.env.SHIPROCKET_API_EMAIL;
  const password = process.env.SHIPROCKET_API_PASSWORD;
  if (!email || !password) {
    throw new NotConfiguredError(
      "Shiprocket API user is not set. Run: pnpm exec convex env set 'SHIPROCKET_API_EMAIL=…' and SHIPROCKET_API_PASSWORD.",
    );
  }

  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body: unknown = await res.json().catch(() => null);
  const fresh = str(obj(body)?.token);
  if (!res.ok || !fresh) {
    throw new NotConfiguredError(
      `Shiprocket login failed (${res.status}): ${errorText(body, "no token returned")}. Check the API user's email and password.`,
    );
  }

  await ctx.runMutation(internal.shiprocket.saveToken, {
    token: fresh,
    expiresAt: Date.now() + 9 * DAY,
  });
  return fresh;
}

async function call(
  ctx: ActionCtx,
  path: string,
  init: { method: "GET" | "POST"; body?: unknown },
  retried = false,
): Promise<{ status: number; ok: boolean; body: unknown }> {
  const bearer = await token(ctx, retried);
  const res = await fetch(`${BASE}${path}`, {
    method: init.method,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${bearer}`,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  // A token can be revoked before its ten days are up, e.g. when the API
  // user's password changes. One fresh login, then give up.
  if (res.status === 401 && !retried) return call(ctx, path, init, true);

  const body: unknown = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, body };
}

/** What couriers bill on: the greater of actual and volumetric weight, in kg. */
function chargeableKg(parcel: Parcel): number {
  const actual = parcel.weightGrams / 1000;
  const volumetric = (parcel.lengthCm * parcel.breadthCm * parcel.heightCm) / 5000;
  return Math.round(Math.max(actual, volumetric) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Quotes.
// ---------------------------------------------------------------------------

export const storeQuote = internalMutation({
  args: {
    pincode: v.string(),
    weightGrams: v.number(),
    subtotal: v.number(),
    amount: v.number(),
    courierRate: v.optional(v.number()),
    courierCompanyId: v.optional(v.number()),
    courierName: v.optional(v.string()),
    estimatedDays: v.optional(v.number()),
    source: v.union(v.literal("live"), v.literal("fallback")),
  },
  returns: v.id("shippingQuotes"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("shippingQuotes", {
      ...args,
      expiresAt: Date.now() + COMMERCE.liveRates.quoteTtlMinutes * 60 * 1000,
    });
  },
});

const quoteResult = v.union(
  v.object({
    serviceable: v.literal(true),
    quoteId: v.id("shippingQuotes"),
    amount: v.number(),
    source: v.union(v.literal("live"), v.literal("fallback")),
    courierName: v.optional(v.string()),
    estimatedDays: v.optional(v.number()),
  }),
  v.object({ serviceable: v.literal(false), message: v.string() }),
);

type CourierOption = {
  id: number;
  name: string;
  rate: number;
  estimatedDays?: number;
};

/** Cheapest courier, from the serviceability response's courier list. */
function cheapestCourier(body: unknown): CourierOption | null {
  const list = obj(obj(body)?.data)?.available_courier_companies;
  if (!Array.isArray(list)) return null;

  let best: CourierOption | null = null;
  for (const raw of list) {
    const entry = obj(raw);
    if (!entry) continue;
    const id = num(entry.courier_company_id);
    const rate = num(entry.rate) ?? num(entry.freight_charge);
    const name = str(entry.courier_name);
    if (id === undefined || rate === undefined || !name) continue;
    if (!best || rate < best.rate) {
      best = { id, name, rate, estimatedDays: num(entry.estimated_delivery_days) };
    }
  }
  return best;
}

/**
 * Price shipping for a cart to a PIN code, and store that price.
 *
 * Called only by our own Next route (secret-guarded, like order placement), so
 * the store's Shiprocket allowance can't be spent by strangers. Outcomes:
 *   - live:        Shiprocket priced it. The normal case.
 *   - fallback:    Shiprocket unreachable or not configured. Fixed fee, so
 *                  checkout never stalls on an outside service.
 *   - unserviceable: Shiprocket answered, and no courier delivers there.
 */
export const quote = action({
  args: {
    secret: v.string(),
    pincode: v.string(),
    items: v.array(v.object({ slug: v.string(), qty: v.number() })),
  },
  returns: quoteResult,
  handler: async (ctx, args) => {
    assertTrustedCaller(args.secret);

    const limit = await rateLimiter.limit(ctx, "shippingQuote");
    if (!limit.ok) throw new Error("Too many shipping requests. Try again in a minute.");

    const pincode = args.pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(pincode)) throw new Error("Enter a valid 6-digit PIN code.");

    // Same catalogue rebuild as order placement: weight and subtotal come from
    // our prices, never from the request.
    const items = args.items.filter((item) => getProductBySlug(item.slug) && item.qty > 0);
    if (items.length === 0) throw new Error("Your cart is empty.");
    const subtotal = items.reduce(
      (sum, item) => sum + (getProductBySlug(item.slug)?.price ?? 0) * Math.floor(item.qty),
      0,
    );
    const parcel = parcelFor(items);

    const fallback = async (reason: string) => {
      console.warn(`Shipping quote fell back to the fixed fee: ${reason}`);
      const amount = fallbackShippingFee(subtotal);
      const quoteId: Id<"shippingQuotes"> = await ctx.runMutation(
        internal.shiprocket.storeQuote,
        { pincode, weightGrams: parcel.weightGrams, subtotal, amount, source: "fallback" },
      );
      return { serviceable: true as const, quoteId, amount, source: "fallback" as const };
    };

    const from = COMMERCE.shiprocket.pickupPincode;
    if (!from) return await fallback("pickupPincode is not set in lib/commerce/config.ts");

    let response: Awaited<ReturnType<typeof call>>;
    try {
      const query = new URLSearchParams({
        pickup_postcode: from,
        delivery_postcode: pincode,
        weight: String(chargeableKg(parcel)),
        cod: "0",
      });
      response = await call(ctx, `/courier/serviceability/?${query}`, { method: "GET" });
    } catch (error) {
      return await fallback(error instanceof Error ? error.message : String(error));
    }

    if (!response.ok && response.status !== 404) {
      return await fallback(`serviceability returned ${response.status}`);
    }

    const courier = cheapestCourier(response.body);
    if (!courier) {
      // Shiprocket answered and no courier serves this PIN code. Charging a
      // fallback fee here would take money for a parcel nobody can deliver.
      return {
        serviceable: false as const,
        message: "We can't deliver to this PIN code yet. Write to us and we'll see what we can do.",
      };
    }

    const amount = customerShippingFee(courier.rate, subtotal);
    const quoteId: Id<"shippingQuotes"> = await ctx.runMutation(internal.shiprocket.storeQuote, {
      pincode,
      weightGrams: parcel.weightGrams,
      subtotal,
      amount,
      courierRate: courier.rate,
      courierCompanyId: courier.id,
      courierName: courier.name,
      estimatedDays: courier.estimatedDays,
      source: "live",
    });

    return {
      serviceable: true as const,
      quoteId,
      amount,
      source: "live" as const,
      courierName: courier.name,
      estimatedDays: courier.estimatedDays,
    };
  },
});

/** Quotes are only honoured for minutes. Run daily from crons.ts. */
export const deleteExpiredQuotes = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const expired = await ctx.db
      .query("shippingQuotes")
      .withIndex("by_expiresAt", (q) => q.lt("expiresAt", Date.now() - DAY))
      .take(500);
    for (const row of expired) await ctx.db.delete("shippingQuotes", row._id);
    if (expired.length === 500) {
      await ctx.scheduler.runAfter(0, internal.shiprocket.deleteExpiredQuotes, {});
    }
    return null;
  },
});

// ---------------------------------------------------------------------------
// Pushing orders.
// ---------------------------------------------------------------------------

export const orderForPush = internalQuery({
  args: { orderId: v.id("orders") },
  returns: v.union(schema.doc("orders"), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get("orders", args.orderId);
  },
});

export const recordPushResult = internalMutation({
  args: {
    orderId: v.id("orders"),
    outcome: v.union(v.literal("pushed"), v.literal("failed")),
    error: v.optional(v.string()),
    shiprocketOrderId: v.optional(v.string()),
    shiprocketShipmentId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("orders", args.orderId, {
      shiprocketPush: args.outcome,
      shiprocketError: args.error,
      ...(args.shiprocketOrderId ? { shiprocketOrderId: args.shiprocketOrderId } : {}),
      ...(args.shiprocketShipmentId ? { shiprocketShipmentId: args.shiprocketShipmentId } : {}),
    });
    return null;
  },
});

/** Shiprocket wants "YYYY-MM-DD HH:MM". Orders are dated in IST, not UTC. */
function istStamp(ms: number): string {
  return new Date(ms + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 16).replace("T", " ");
}

function orderPayload(order: Doc<"orders">) {
  const [first, ...rest] = order.address.fullName.trim().split(/\s+/);
  const parcel = parcelFor(order.lines.map((l) => ({ slug: l.slug, qty: l.qty })));

  return {
    // Our order number, so Shiprocket's webhook can find the order again.
    order_id: order.orderNumber,
    order_date: istStamp(order.placedAt),
    pickup_location: COMMERCE.shiprocket.pickupLocation,
    billing_customer_name: first ?? order.address.fullName,
    billing_last_name: rest.join(" "),
    billing_address: order.address.line1,
    billing_address_2: order.address.line2,
    billing_city: order.address.city,
    billing_pincode: order.address.pincode,
    billing_state: order.address.state,
    billing_country: order.address.country,
    billing_email: order.email,
    billing_phone: order.address.phone,
    shipping_is_billing: true,
    order_items: order.lines.map((line) => ({
      name: line.name,
      sku: line.slug,
      units: line.qty,
      selling_price: line.price,
    })),
    payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
    shipping_charges: order.totals.shipping,
    sub_total: order.totals.subtotal,
    length: parcel.lengthCm,
    breadth: parcel.breadthCm,
    height: parcel.heightCm,
    weight: Math.max(0.5, Math.round((parcel.weightGrams / 1000) * 100) / 100),
  };
}

/**
 * Create the order in Shiprocket. Scheduled by queueShiprocketPush in
 * orders.ts the moment an order is confirmed. Never throws: every outcome is
 * written back to the order, where the admin panel shows it with a Retry.
 */
export const pushOrder = internalAction({
  args: { orderId: v.id("orders") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order: Doc<"orders"> | null = await ctx.runQuery(
      internal.shiprocket.orderForPush,
      args,
    );
    // Something else already took this push, or it was never queued.
    if (!order || order.shiprocketPush !== "queued") return null;

    const fail = async (error: string) => {
      await ctx.runMutation(internal.shiprocket.recordPushResult, {
        orderId: args.orderId,
        outcome: "failed",
        error,
      });
      return null;
    };

    let created: Awaited<ReturnType<typeof call>>;
    try {
      created = await call(ctx, "/orders/create/adhoc", {
        method: "POST",
        body: orderPayload(order),
      });
    } catch (error) {
      return await fail(error instanceof Error ? error.message : String(error));
    }

    const body = obj(created.body);
    const shiprocketOrderId = str(body?.order_id);
    const shipmentId = str(body?.shipment_id);
    if (!created.ok || !shiprocketOrderId) {
      return await fail(
        `Shiprocket rejected the order (${created.status}): ${errorText(created.body, "no order id returned")}`,
      );
    }

    await ctx.runMutation(internal.shiprocket.recordPushResult, {
      orderId: args.orderId,
      outcome: "pushed",
      shiprocketOrderId,
      shiprocketShipmentId: shipmentId,
    });

    // From here on the order exists in Shiprocket, so a failure is not a
    // failed push — it means a person books the courier, as they would anyway.
    if (COMMERCE.shiprocket.autoAssignCourier && shipmentId) {
      await bookCourier(ctx, order, shipmentId);
    }
    return null;
  },
});

/**
 * Automatic courier booking. OFF by default (COMMERCE.shiprocket) and not yet
 * exercised against a live account: assigning an AWB charges the Shiprocket
 * wallet. Turn it on for one real order and watch it before leaving it on.
 */
async function bookCourier(ctx: ActionCtx, order: Doc<"orders">, shipmentId: string) {
  const note = async (error: string) => {
    await ctx.runMutation(internal.shiprocket.recordPushResult, {
      orderId: order._id,
      outcome: "pushed",
      error: `Order is in Shiprocket, but booking the courier failed: ${error}. Book it in the panel.`,
    });
  };

  try {
    const assigned = await call(ctx, "/courier/assign/awb", {
      method: "POST",
      body: {
        shipment_id: Number(shipmentId),
        ...(order.quotedCourierId ? { courier_id: order.quotedCourierId } : {}),
      },
    });
    const data = obj(obj(obj(assigned.body)?.response)?.data);
    const awb = str(data?.awb_code);
    if (!assigned.ok || !awb) {
      return await note(errorText(assigned.body, `AWB assignment returned ${assigned.status}`));
    }

    await ctx.runMutation(internal.orders.recordStatus, {
      orderNumber: order.orderNumber,
      status: "packed",
      label: "Packed and ready to ship",
      source: "shiprocket",
      courier: str(data?.courier_name),
      awb,
      trackingUrl: `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`,
    });

    if (COMMERCE.shiprocket.autoRequestPickup) {
      const pickup = await call(ctx, "/courier/generate/pickup", {
        method: "POST",
        body: { shipment_id: [Number(shipmentId)] },
      });
      if (!pickup.ok) {
        await note(errorText(pickup.body, `pickup request returned ${pickup.status}`));
      }
    }
  } catch (error) {
    await note(error instanceof Error ? error.message : String(error));
  }
}
