import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { assertTrustedCaller } from "./orders";
import { rateLimiter } from "./rateLimits";

/**
 * Everything that talks to PhonePe's payment gateway (Standard Checkout v2).
 * See docs/adr/0007-phonepe-payments.md for the flow and the reasoning.
 *
 * In short: the checkout route places the order, then calls startPayment,
 * which opens a PhonePe order for the exact total and hands back PhonePe's
 * payment page URL. The buyer pays there and is sent back to
 * /checkout/success. Payment is only ever recorded from PhonePe's own
 * order-status API, never from the browser and never from a webhook body
 * alone: the webhook, the success page and a cron all just ask PhonePe.
 *
 * Deployment env vars: PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET,
 * PHONEPE_CLIENT_VERSION, and PHONEPE_ENV ("production" for live keys,
 * anything else means the sandbox). The webhook adds
 * PHONEPE_WEBHOOK_USERNAME and PHONEPE_WEBHOOK_PASSWORD (see http.ts).
 */

const HOSTS = {
  sandbox: {
    token: "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token",
    pg: "https://api-preprod.phonepe.com/apis/pg-sandbox",
  },
  production: {
    token: "https://api.phonepe.com/apis/identity-manager/v1/oauth/token",
    pg: "https://api.phonepe.com/apis/pg",
  },
} as const;

/** How long the PhonePe payment page stays payable, in seconds (300–3600). */
const PAY_WINDOW_SECONDS = 20 * 60;

/**
 * Tries at paying one order. Each try is a fresh PhonePe order. The cap stops
 * a stuck buyer, or a script holding a tracking link, from opening hundreds.
 */
const MAX_ATTEMPTS = 8;

type GatewayState = "PENDING" | "COMPLETED" | "FAILED";

class NotConfiguredError extends Error {}

function hosts() {
  return process.env.PHONEPE_ENV === "production" ? HOSTS.production : HOSTS.sandbox;
}

function str(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return undefined;
}

function num(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function obj(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function errorText(body: unknown, fallback: string): string {
  const record = obj(body);
  return str(record?.message) ?? str(record?.code) ?? fallback;
}

// ---------------------------------------------------------------------------
// Login. PhonePe tokens last about an hour; cached until a minute before.
// ---------------------------------------------------------------------------

export const cachedToken = internalQuery({
  args: {},
  returns: v.union(v.object({ token: v.string(), expiresAt: v.number() }), v.null()),
  handler: async (ctx) => {
    const row = await ctx.db
      .query("integrationTokens")
      .withIndex("by_provider", (q) => q.eq("provider", "phonepe"))
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
      .withIndex("by_provider", (q) => q.eq("provider", "phonepe"))
      .unique();
    if (row) {
      await ctx.db.patch("integrationTokens", row._id, args);
    } else {
      await ctx.db.insert("integrationTokens", { provider: "phonepe", ...args });
    }
    return null;
  },
});

async function token(ctx: ActionCtx, forceRefresh: boolean): Promise<string> {
  if (!forceRefresh) {
    const cached = await ctx.runQuery(internal.phonepe.cachedToken, {});
    if (cached && cached.expiresAt > Date.now()) return cached.token;
  }

  const clientId = process.env.PHONEPE_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION;
  if (!clientId || !clientSecret || !clientVersion) {
    throw new NotConfiguredError(
      "PhonePe keys are not set. Set PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET and PHONEPE_CLIENT_VERSION on the Convex deployment.",
    );
  }

  const res = await fetch(hosts().token, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_version: clientVersion,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }).toString(),
  });
  const body: unknown = await res.json().catch(() => null);
  const fresh = str(obj(body)?.access_token);
  if (!res.ok || !fresh) {
    throw new NotConfiguredError(
      `PhonePe login failed (${res.status}): ${errorText(body, "no token returned")}. Check the keys and PHONEPE_ENV.`,
    );
  }

  // expires_at is epoch seconds. Refresh a minute early so a token never
  // expires between being read and being used.
  const expiresAtSec = num(obj(body)?.expires_at);
  const expiresAt = expiresAtSec ? expiresAtSec * 1000 - 60_000 : Date.now() + 30 * 60_000;
  await ctx.runMutation(internal.phonepe.saveToken, { token: fresh, expiresAt });
  return fresh;
}

async function call(
  ctx: ActionCtx,
  path: string,
  init: { method: "GET" | "POST"; body?: unknown },
  retried = false,
): Promise<{ status: number; ok: boolean; body: unknown }> {
  const bearer = await token(ctx, retried);
  const res = await fetch(`${hosts().pg}${path}`, {
    method: init.method,
    headers: {
      "content-type": "application/json",
      authorization: `O-Bearer ${bearer}`,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  // A cached token can die early (keys rotated, sandbox switched to live).
  if (res.status === 401 && !retried) return call(ctx, path, init, true);
  const body: unknown = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, body };
}

// ---------------------------------------------------------------------------
// Order status: the only thing a payment is ever recorded from.
// ---------------------------------------------------------------------------

type GatewayStatus = {
  state: GatewayState;
  amountPaise?: number;
  phonepeOrderId?: string;
  transactionId?: string;
  paymentMode?: string;
};

function parseStatus(body: unknown): GatewayStatus | null {
  const record = obj(body);
  const state = str(record?.state);
  if (state !== "PENDING" && state !== "COMPLETED" && state !== "FAILED") return null;

  const attempts = Array.isArray(record?.paymentDetails)
    ? record.paymentDetails.map(obj).filter((d): d is Record<string, unknown> => !!d)
    : [];
  // Several tries can sit under one PhonePe order. The one that paid is the
  // one that matters; otherwise the latest.
  const attempt = attempts.find((d) => str(d.state) === "COMPLETED") ?? attempts.at(-1);

  return {
    state,
    amountPaise: num(record?.amount),
    phonepeOrderId: str(record?.orderId),
    transactionId: str(attempt?.transactionId),
    paymentMode: str(attempt?.paymentMode),
  };
}

async function fetchStatus(ctx: ActionCtx, merchantOrderId: string): Promise<GatewayStatus | null> {
  const res = await call(
    ctx,
    `/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status?details=false`,
    { method: "GET" },
  );
  if (!res.ok) {
    console.warn(
      `PhonePe status for ${merchantOrderId} returned ${res.status}: ${errorText(res.body, "no body")}`,
    );
    return null;
  }
  return parseStatus(res.body);
}

/** Ask PhonePe, then write what it said. Returns the gateway state. */
async function syncAttempt(ctx: ActionCtx, merchantOrderId: string): Promise<GatewayState | null> {
  const status = await fetchStatus(ctx, merchantOrderId);
  if (!status) return null;
  if (status.state !== "PENDING") {
    await ctx.runMutation(internal.orders.recordPayment, {
      merchantOrderId,
      state: status.state,
      amountPaise: status.amountPaise,
      phonepeOrderId: status.phonepeOrderId,
      transactionId: status.transactionId,
      paymentMode: status.paymentMode,
    });
  }
  return status.state;
}

// ---------------------------------------------------------------------------
// Reads and writes on the order.
// ---------------------------------------------------------------------------

type PaymentView = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalPaise: number;
  attempts: number;
  merchantOrderId?: string;
};

type CheckResult = {
  status: string;
  paymentStatus: string;
  gateway: "NONE" | "PENDING" | "COMPLETED" | "FAILED" | "UNKNOWN";
};

const paymentView = v.object({
  orderNumber: v.string(),
  status: v.string(),
  paymentStatus: v.string(),
  paymentMethod: v.string(),
  totalPaise: v.number(),
  attempts: v.number(),
  merchantOrderId: v.optional(v.string()),
});

/** The order as payment sees it. The tracking token is the credential. */
export const orderForPayment = internalQuery({
  args: { orderNumber: v.string(), trackToken: v.string() },
  returns: v.union(paymentView, v.null()),
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_trackToken", (q) => q.eq("trackToken", args.trackToken))
      .unique();
    if (!order || order.orderNumber !== args.orderNumber) return null;
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalPaise: Math.round(order.totals.total * 100),
      attempts: order.paymentAttempts ?? 0,
      merchantOrderId: order.phonepeMerchantOrderId,
    };
  },
});

/**
 * Reserve the next attempt number. Done in a mutation so two tabs pressing
 * "Pay" at once get different PhonePe order ids instead of colliding.
 */
export const beginAttempt = internalMutation({
  args: { orderNumber: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
      .unique();
    if (!order || order.status !== "awaiting_payment" || order.paymentStatus === "paid") {
      return null;
    }
    const attempt = (order.paymentAttempts ?? 0) + 1;
    if (attempt > MAX_ATTEMPTS) return null;
    const merchantOrderId = `${order.orderNumber}-${attempt}`;
    await ctx.db.patch("orders", order._id, {
      paymentAttempts: attempt,
      phonepeMerchantOrderId: merchantOrderId,
      phonepeOrderId: undefined,
      paymentStatus: "pending",
      paymentStartedAt: Date.now(),
    });
    return merchantOrderId;
  },
});

export const saveGatewayOrderId = internalMutation({
  args: { merchantOrderId: v.string(), phonepeOrderId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const orderNumber = args.merchantOrderId.slice(0, args.merchantOrderId.lastIndexOf("-"));
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", orderNumber))
      .unique();
    // Only if this is still the latest attempt.
    if (order && order.phonepeMerchantOrderId === args.merchantOrderId) {
      await ctx.db.patch("orders", order._id, { phonepeOrderId: args.phonepeOrderId });
    }
    return null;
  },
});

// ---------------------------------------------------------------------------
// Public entry points. Both are called only by our own Next.js routes, which
// hold ORDER_WRITE_SECRET, and both need the order's tracking token.
// ---------------------------------------------------------------------------

async function limitCalls(ctx: ActionCtx) {
  const limited = await rateLimiter.limit(ctx, "paymentCalls");
  if (!limited.ok) throw new Error("Too many payment requests right now. Try again in a minute.");
}

/**
 * Open a PhonePe payment for an order and return the page to send the buyer
 * to. Also the "Try again" button: if an earlier attempt turns out to have
 * been paid after all, it reports that instead of charging twice.
 */
export const startPayment = action({
  args: {
    secret: v.string(),
    orderNumber: v.string(),
    trackToken: v.string(),
    /** Where PhonePe sends the buyer afterwards. Built by our server, not the browser. */
    returnUrl: v.string(),
  },
  returns: v.union(
    v.object({ kind: v.literal("redirect"), url: v.string() }),
    v.object({ kind: v.literal("paid") }),
    v.object({ kind: v.literal("closed") }),
  ),
  handler: async (ctx, args): Promise<{ kind: "redirect"; url: string } | { kind: "paid" } | { kind: "closed" }> => {
    assertTrustedCaller(args.secret);
    await limitCalls(ctx);

    const order: PaymentView | null = await ctx.runQuery(internal.phonepe.orderForPayment, {
      orderNumber: args.orderNumber,
      trackToken: args.trackToken,
    });
    if (!order) throw new Error("We could not find that order.");
    if (order.paymentStatus === "paid") return { kind: "paid" };
    if (order.paymentMethod === "cod" || order.status !== "awaiting_payment") {
      return { kind: "closed" };
    }

    // Never open a second payment while the first may have gone through.
    if (order.merchantOrderId) {
      const state = await syncAttempt(ctx, order.merchantOrderId);
      if (state === "COMPLETED") return { kind: "paid" };
    }

    if (order.attempts >= MAX_ATTEMPTS) {
      throw new Error("This order has had too many payment attempts. Write to us and we will help.");
    }
    const merchantOrderId: string | null = await ctx.runMutation(internal.phonepe.beginAttempt, {
      orderNumber: order.orderNumber,
    });
    if (!merchantOrderId) return { kind: "closed" };

    let res: Awaited<ReturnType<typeof call>>;
    try {
      res = await call(ctx, "/checkout/v2/pay", {
        method: "POST",
        body: {
          merchantOrderId,
          amount: order.totalPaise,
          expireAfter: PAY_WINDOW_SECONDS,
          metaInfo: { udf1: order.orderNumber },
          paymentFlow: {
            type: "PG_CHECKOUT",
            message: `Namakh order ${order.orderNumber}`,
            merchantUrls: { redirectUrl: args.returnUrl },
          },
        },
      });
    } catch (error) {
      console.error("PhonePe payment could not be created", error);
      throw new Error("We could not open the payment page. Try again in a moment.");
    }

    const body = obj(res.body);
    const url = str(body?.redirectUrl);
    if (!res.ok || !url) {
      console.error(
        `PhonePe refused payment ${merchantOrderId} (${res.status}): ${errorText(res.body, "no redirectUrl")}`,
      );
      throw new Error("We could not open the payment page. Try again in a moment.");
    }

    const phonepeOrderId = str(body?.orderId);
    if (phonepeOrderId) {
      await ctx.runMutation(internal.phonepe.saveGatewayOrderId, { merchantOrderId, phonepeOrderId });
    }
    return { kind: "redirect", url };
  },
});

/**
 * What the confirmation page polls after PhonePe sends the buyer back.
 * Asks PhonePe directly rather than waiting for the webhook, so the buyer
 * sees "paid" within a second or two of paying.
 */
export const checkPayment = action({
  args: { secret: v.string(), orderNumber: v.string(), trackToken: v.string() },
  returns: v.object({
    status: v.string(),
    paymentStatus: v.string(),
    /** NONE when no payment has been started for this order yet. */
    gateway: v.union(
      v.literal("NONE"),
      v.literal("PENDING"),
      v.literal("COMPLETED"),
      v.literal("FAILED"),
      v.literal("UNKNOWN"),
    ),
  }),
  handler: async (ctx, args): Promise<CheckResult> => {
    assertTrustedCaller(args.secret);
    await limitCalls(ctx);

    const lookup = { orderNumber: args.orderNumber, trackToken: args.trackToken };
    const before: PaymentView | null = await ctx.runQuery(internal.phonepe.orderForPayment, lookup);
    if (!before) throw new Error("We could not find that order.");

    if (before.paymentStatus === "paid") {
      return { status: before.status, paymentStatus: before.paymentStatus, gateway: "COMPLETED" };
    }
    if (!before.merchantOrderId || before.paymentMethod === "cod") {
      return { status: before.status, paymentStatus: before.paymentStatus, gateway: "NONE" };
    }

    const state = await syncAttempt(ctx, before.merchantOrderId);
    const after: PaymentView | null = await ctx.runQuery(internal.phonepe.orderForPayment, lookup);
    return {
      status: after?.status ?? before.status,
      paymentStatus: after?.paymentStatus ?? before.paymentStatus,
      gateway: state ?? "UNKNOWN",
    };
  },
});

// ---------------------------------------------------------------------------
// Background reconciliation: the webhook's follow-up, and a cron safety net
// for the buyer who pays and closes the tab before coming back.
// ---------------------------------------------------------------------------

export const reconcile = internalAction({
  args: { merchantOrderId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      await syncAttempt(ctx, args.merchantOrderId);
    } catch (error) {
      console.error(`PhonePe reconcile failed for ${args.merchantOrderId}`, error);
    }
    return null;
  },
});

/** Latest attempts still unresolved, started within the last few hours. */
export const openAttempts = internalQuery({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const since = Date.now() - 3 * 60 * 60 * 1000;
    const waiting = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", "awaiting_payment"))
      .order("desc")
      .take(100);
    return waiting
      .filter(
        (o) =>
          o.paymentMethod === "phonepe" &&
          o.paymentStatus === "pending" &&
          o.phonepeMerchantOrderId !== undefined &&
          (o.paymentStartedAt ?? 0) > since,
      )
      .slice(0, 25)
      .map((o) => o.phonepeMerchantOrderId!);
  },
});

export const reconcileOpen = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const ids = await ctx.runQuery(internal.phonepe.openAttempts, {});
    for (const merchantOrderId of ids) {
      try {
        await syncAttempt(ctx, merchantOrderId);
      } catch (error) {
        // Not configured, PhonePe down: try again on the next run.
        console.error(`PhonePe reconcile failed for ${merchantOrderId}`, error);
        if (error instanceof NotConfiguredError) break;
      }
    }
    return null;
  },
});
