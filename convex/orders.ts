import { v, type Infer } from "convex/values";
import { mutation, internalMutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { orderLine, orderStatus, orderTotals, shippingAddress } from "./schema";
import { getProductBySlug } from "../lib/products";
import { COMMERCE } from "../lib/commerce/config";
import { computeTotals, codAvailable, shippingNeedsQuote } from "../lib/commerce/pricing";
import { parcelFor } from "../lib/shiprocket/parcel";
import { hasErrors, validateDraft } from "../lib/commerce/validation";

/**
 * Order creation lives here, not in the Next.js route, so that prices are
 * rebuilt from the catalogue inside the same transaction that writes the
 * order. The browser only ever sends { slug, qty }.
 */

const checkoutDraft = v.object({
  email: v.string(),
  marketingOptIn: v.boolean(),
  address: shippingAddress,
  paymentMethod: v.union(v.literal("razorpay"), v.literal("cod")),
  notes: v.string(),
});

const placedOrder = v.object({
  orderNumber: v.string(),
  trackToken: v.string(),
  status: orderStatus,
  totals: orderTotals,
  lines: v.array(orderLine),
  address: shippingAddress,
  email: v.string(),
  placedAt: v.number(),
});

/** NMK-<base36 minute><random> — short, unambiguous, safe to read aloud. */
function newOrderNumber(): string {
  const stamp = Math.floor(Date.now() / 60_000).toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NMK-${stamp}-${rand}`;
}

/**
 * Only our own server may write orders. Re-pricing already makes a forged
 * total impossible; this stops anyone who finds the deployment URL from
 * filling the table with junk.
 */
export function assertTrustedCaller(secret: string) {
  const expected = process.env.ORDER_WRITE_SECRET;
  if (!expected) {
    throw new Error(
      "ORDER_WRITE_SECRET is not set on this deployment. Run: pnpm exec convex env set ORDER_WRITE_SECRET <value>",
    );
  }
  if (secret !== expected) throw new Error("Not authorised to place orders.");
}

export async function appendEvent(
  ctx: MutationCtx,
  orderId: Id<"orders">,
  status: Infer<typeof orderStatus>,
  label: string,
  source: "system" | "shiprocket" | "manual",
  detail?: string,
) {
  await ctx.db.insert("orderEvents", {
    orderId,
    status,
    label,
    detail,
    occurredAt: Date.now(),
    source,
  });
}

/**
 * Hand a confirmed order to Shiprocket, exactly once.
 *
 * "queued" is written in this same transaction as the schedule, so two
 * confirmations racing each other (an admin click and a payment webhook, say)
 * cannot both schedule a push: the second one sees the flag and stops.
 */
export async function queueShiprocketPush(ctx: MutationCtx, order: Doc<"orders">) {
  if (order.shiprocketPush) return;
  await ctx.db.patch("orders", order._id, { shiprocketPush: "queued", shiprocketError: undefined });
  await ctx.scheduler.runAfter(0, internal.shiprocket.pushOrder, { orderId: order._id });
}

export const place = mutation({
  args: {
    secret: v.string(),
    items: v.array(v.object({ slug: v.string(), qty: v.number() })),
    draft: checkoutDraft,
    /** The stored shipping quote the buyer saw. Required in live mode. */
    quoteId: v.optional(v.id("shippingQuotes")),
  },
  returns: placedOrder,
  handler: async (ctx, args) => {
    assertTrustedCaller(args.secret);

    if (args.items.length === 0) throw new Error("Your cart is empty.");

    // Rebuild every line from the catalogue. Prices sent by the browser are
    // display state, never trusted input.
    const lines = args.items.map((item) => {
      const product = getProductBySlug(item.slug);
      if (!product) {
        throw new Error(`We no longer stock "${item.slug}". Remove it and try again.`);
      }
      const qty = Math.floor(item.qty);
      if (!Number.isFinite(qty) || qty < 1 || qty > COMMERCE.cart.maxQtyPerLine) {
        throw new Error(
          `Quantity for ${product.name} must be between 1 and ${COMMERCE.cart.maxQtyPerLine}.`,
        );
      }
      return {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        quantityLabel: product.quantity,
        qty,
      };
    });

    const errors = validateDraft(args.draft);
    if (hasErrors(errors)) throw new Error("Check the highlighted fields.");

    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const method = args.draft.paymentMethod === "cod" ? "cod" : "razorpay";
    if (method === "cod" && !codAvailable(subtotal)) {
      throw new Error("Cash on delivery is not available for this order.");
    }

    // Shipping is charged from the stored quote the buyer was shown, never
    // from the request. The quote is checked against this exact order: same
    // PIN code, same weight, same subtotal, still within its time window. A
    // quote for a lighter cart or a cheaper address cannot be replayed.
    let quotedShipping: number | undefined;
    let quote: Doc<"shippingQuotes"> | null = null;
    if (shippingNeedsQuote()) {
      if (!args.quoteId) throw new Error("Enter your PIN code so we can work out shipping.");
      quote = await ctx.db.get("shippingQuotes", args.quoteId);
      if (!quote) throw new Error("We lost your shipping quote. Check the shipping section and try again.");
      if (quote.expiresAt < Date.now()) {
        throw new Error("Your shipping price expired. Check the shipping section and try again.");
      }
      if (quote.pincode !== args.draft.address.pincode.trim()) {
        throw new Error("Shipping was priced for a different PIN code. Check the shipping section.");
      }
      if (
        quote.weightGrams !== parcelFor(args.items).weightGrams ||
        quote.subtotal !== subtotal
      ) {
        throw new Error("Your cart changed after shipping was priced. Check the shipping section.");
      }
      quotedShipping = quote.amount;
    }

    const totals = computeTotals(lines, method, quotedShipping);

    // Collisions are vanishingly unlikely, but an order number is the buyer's
    // handle on their order and a duplicate would be silently wrong.
    let orderNumber = newOrderNumber();
    for (let attempt = 0; attempt < 5; attempt++) {
      const clash = await ctx.db
        .query("orders")
        .withIndex("by_orderNumber", (q) => q.eq("orderNumber", orderNumber))
        .unique();
      if (!clash) break;
      orderNumber = newOrderNumber();
    }

    const trackToken = crypto.randomUUID().replace(/-/g, "");
    const placedAt = Date.now();
    const status = "awaiting_payment" as const;

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      trackToken,
      email: args.draft.email.trim().toLowerCase(),
      marketingOptIn: args.draft.marketingOptIn,
      address: args.draft.address,
      notes: args.draft.notes,
      lines,
      totals,
      status,
      paymentStatus: method === "cod" ? "cod_pending" : "pending",
      paymentMethod: method,
      quotedCourierId: quote?.courierCompanyId,
      quotedCourierName: quote?.courierName,
      shippingSource: quote?.source,
      placedAt,
    });

    await appendEvent(ctx, orderId, status, "Order placed", "system");

    // A cash-on-delivery order needs no payment before it ships, so it goes
    // straight to Shiprocket. Prepaid orders wait for payment (see below).
    if (method === "cod") {
      const created = await ctx.db.get("orders", orderId);
      if (created) await queueShiprocketPush(ctx, created);
    }

    return {
      orderNumber,
      trackToken,
      status,
      totals,
      lines,
      address: args.draft.address,
      email: args.draft.email.trim(),
      placedAt,
    };
  },
});

const trackedOrder = v.object({
  orderNumber: v.string(),
  status: orderStatus,
  paymentStatus: v.union(
    v.literal("pending"),
    v.literal("paid"),
    v.literal("cod_pending"),
    v.literal("failed"),
    v.literal("refunded"),
  ),
  paymentMethod: v.union(v.literal("razorpay"), v.literal("cod")),
  placedAt: v.number(),
  lines: v.array(orderLine),
  totals: orderTotals,
  address: shippingAddress,
  email: v.string(),
  courier: v.optional(v.string()),
  awb: v.optional(v.string()),
  trackingUrl: v.optional(v.string()),
  events: v.array(
    v.object({
      status: orderStatus,
      label: v.string(),
      detail: v.optional(v.string()),
      occurredAt: v.number(),
    }),
  ),
});

/**
 * The tracking page's only read. The token is the credential: it is 32 random
 * hex characters, so holding the link is proof enough. Order numbers alone are
 * guessable and must never be sufficient.
 */
export const getByToken = query({
  args: { orderNumber: v.string(), token: v.string() },
  returns: v.union(trackedOrder, v.null()),
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_trackToken", (q) => q.eq("trackToken", args.token))
      .unique();

    if (!order || order.orderNumber !== args.orderNumber) return null;

    const events = await ctx.db
      .query("orderEvents")
      .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
      .order("asc")
      .take(50);

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      placedAt: order.placedAt,
      lines: order.lines,
      totals: order.totals,
      address: order.address,
      email: order.email,
      courier: order.courier,
      awb: order.awb,
      trackingUrl: order.trackingUrl,
      // Courier detail is useful to a buyer. The detail on a manual event is
      // internal attribution ("Updated by someone@namakh.in") and must never
      // reach the person whose order it is.
      events: events.map((e) => ({
        status: e.status,
        label: e.label,
        detail: e.source === "shiprocket" ? e.detail : undefined,
        occurredAt: e.occurredAt,
      })),
    };
  },
});

/**
 * The "lost my link" path: order number plus the email it was placed with
 * hands back the token. A wrong email and a non-existent order return the
 * same null, so this cannot be used to discover which order numbers exist.
 */
export const tokenForOrder = query({
  args: { orderNumber: v.string(), email: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) =>
        q.eq("orderNumber", args.orderNumber.trim().toUpperCase()),
      )
      .unique();

    if (!order) return null;
    if (order.email !== args.email.trim().toLowerCase()) return null;
    return order.trackToken;
  },
});

/** Written by the Shiprocket webhook, and by hand from the Convex dashboard. */
export const recordStatus = internalMutation({
  args: {
    orderNumber: v.string(),
    status: orderStatus,
    label: v.string(),
    detail: v.optional(v.string()),
    source: v.union(v.literal("shiprocket"), v.literal("manual")),
    courier: v.optional(v.string()),
    awb: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    shiprocketOrderId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
      .unique();

    if (!order) {
      // Shiprocket can hold references to orders placed outside this site.
      // Dropping the update is correct; throwing would make them retry forever.
      console.warn(`No order ${args.orderNumber} for a ${args.source} status update.`);
      return null;
    }

    await ctx.db.patch("orders", order._id, {
      status: args.status,
      ...(args.courier ? { courier: args.courier } : {}),
      ...(args.awb ? { awb: args.awb } : {}),
      ...(args.trackingUrl ? { trackingUrl: args.trackingUrl } : {}),
      ...(args.shiprocketOrderId ? { shiprocketOrderId: args.shiprocketOrderId } : {}),
    });

    await appendEvent(ctx, order._id, args.status, args.label, args.source, args.detail);

    // An admin confirming an order by hand is a confirmation like any other.
    // Shiprocket's own status updates never trigger a push — if Shiprocket is
    // telling us about it, the order is already there.
    if (args.source === "manual" && args.status === "confirmed") {
      await queueShiprocketPush(ctx, order);
    }
    return null;
  },
});

/**
 * Razorpay's success webhook will call this once payments go live. It exists
 * now so the payment leg is a wiring job, not a redesign.
 */
export const recordPayment = internalMutation({
  args: {
    orderNumber: v.string(),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
      .unique();

    if (!order) throw new Error(`No order ${args.orderNumber}.`);

    await ctx.db.patch("orders", order._id, {
      status: "confirmed",
      paymentStatus: "paid",
      razorpayOrderId: args.razorpayOrderId,
      razorpayPaymentId: args.razorpayPaymentId,
    });

    await appendEvent(ctx, order._id, "confirmed", "Payment received", "system");
    await queueShiprocketPush(ctx, order);
    return null;
  },
});
