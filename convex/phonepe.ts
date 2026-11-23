import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import type { ActionCtx, MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { internal } from "./_generated/api";
import { assertTrustedCaller } from "./orders";
import { rateLimiter } from "./rateLimits";
import { PAYMENTS_LIVE } from "../lib/commerce/config";

/**
 * Everything that talks to PhonePe's payment gateway (Standard Checkout v2).
 * See docs/adr/0007-phonepe-payments.md for the flow and the reasoning.
 *
 * In short: once an order is placed, startPayment opens a PhonePe order (an
 * "attempt") for the exact total and hands back PhonePe's payment page. The
 * buyer pays there and is sent back to /checkout/success. Payment is only
 * ever recorded from PhonePe's own order-status API, never from the browser
 * and never from a webhook body alone.
 *
 * The rule that keeps a buyer from paying twice: an order has at most one
 * open attempt. "Try again" reuses that attempt's payment page; a new attempt
 * is only opened once PhonePe has said the previous one failed. Every attempt
 * is a row in `paymentAttempts`, and the reconcile cron keeps asking PhonePe
 * about each open one until it settles, however long that takes.
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

const MINUTE = 60_000;

/** How long the PhonePe payment page stays payable, in seconds (300–3600). */
const PAY_WINDOW_SECONDS = 20 * 60;

/** Fresh attempts are checked this soon, in case no webhook ever comes. */
const FIRST_CHECK_MS = 2 * MINUTE;

/** Backoff between background checks of one open attempt tops out here. */
const MAX_CHECK_GAP_MS = 6 * 60 * MINUTE;

/** Every call to PhonePe gives up after this, so nothing hangs a request. */
const REQUEST_TIMEOUT_MS = 10_000;

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

/** fetch plus reading the JSON body, all inside one deadline. */
async function fetchJson(
  url: string,
  init: RequestInit,
): Promise<{ status: number; ok: boolean; body: unknown }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const body: unknown = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, body };
  } finally {
    clearTimeout(timer);
  }
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

  const res = await fetchJson(hosts().token, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_version: clientVersion,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }).toString(),
  });
  const fresh = str(obj(res.body)?.access_token);
  if (!res.ok || !fresh) {
    throw new NotConfiguredError(
      `PhonePe login failed (${res.status}): ${errorText(res.body, "no token returned")}. Check the keys and PHONEPE_ENV.`,
    );
  }

  // expires_at is epoch seconds. Refresh a minute early so a token never
  // expires between being read and being used.
  const expiresAtSec = num(obj(res.body)?.expires_at);
  const expiresAt = expiresAtSec ? expiresAtSec * 1000 - MINUTE : Date.now() + 30 * MINUTE;
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
  const res = await fetchJson(`${hosts().pg}${path}`, {
    method: init.method,
    headers: {
      "content-type": "application/json",
      authorization: `O-Bearer ${bearer}`,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  // A cached token can die early (keys rotated, sandbox switched to live).
  if (res.status === 401 && !retried) return call(ctx, path, init, true);
  return res;
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

  const tries = Array.isArray(record?.paymentDetails)
    ? record.paymentDetails.map(obj).filter((d): d is Record<string, unknown> => !!d)
    : [];
  // Several tries can sit under one PhonePe order. The one that paid is the
  // one that matters; otherwise the latest.
  const paid = tries.find((d) => str(d.state) === "COMPLETED") ?? tries.at(-1);

  return {
    state,
    amountPaise: num(record?.amount),
    phonepeOrderId: str(record?.orderId),
    transactionId: str(paid?.transactionId),
    paymentMode: str(paid?.paymentMode),
  };
}

/**
 * Ask PhonePe about one attempt and write the answer. Returns the gateway
 * state, or null when PhonePe could not say (unreachable, or no such order).
 * Anything short of a final answer reschedules the attempt's next check.
 */
async function syncAttempt(
  ctx: ActionCtx,
  merchantOrderId: string,
): Promise<GatewayState | "REVIEW" | null> {
  let status: GatewayStatus | null = null;
  let notFound = false;
  try {
    const res = await call(
      ctx,
      `/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status?details=false`,
      { method: "GET" },
    );
    if (res.ok) {
      status = parseStatus(res.body);
    } else {
      // PhonePe has no order by that id: the create call never landed.
      notFound = str(obj(res.body)?.code) === "INVALID_MERCHANT_ORDER_ID";
      console.warn(
        `PhonePe status for ${merchantOrderId} returned ${res.status}: ${errorText(res.body, "no body")}`,
      );
    }
  } catch (error) {
    if (error instanceof NotConfiguredError) throw error;
    console.warn(`PhonePe status for ${merchantOrderId} could not be read`, error);
  }

  if (status && status.state !== "PENDING") {
    const outcome = await ctx.runMutation(internal.orders.recordPayment, {
      merchantOrderId,
      state: status.state,
      amountPaise: status.amountPaise,
      phonepeOrderId: status.phonepeOrderId,
      transactionId: status.transactionId,
      paymentMode: status.paymentMode,
    });
    if (outcome === "settled") return status.state;
    if (outcome === "review") return "REVIEW";
    if (outcome !== "unresolved") return null; // ignored: no verdict
    status = null; // incomplete answer: check again later
  }

  await ctx.runMutation(internal.phonepe.recheckLater, {
    merchantOrderId,
    now: Date.now(),
    notFound,
  });
  return status?.state ?? null;
}

// ---------------------------------------------------------------------------
// The attempt ledger.
// ---------------------------------------------------------------------------

const openAttemptView = v.object({
  merchantOrderId: v.string(),
  payUrl: v.optional(v.string()),
  expiresAt: v.number(),
  /** Held for a person to check (amount mismatch); never reused or replaced. */
  review: v.boolean(),
});

const paymentView = v.object({
  orderNumber: v.string(),
  status: v.string(),
  paymentStatus: v.string(),
  paymentMethod: v.string(),
  attempts: v.number(),
  /** The one attempt that could still take money, if any. */
  open: v.optional(openAttemptView),
});

type PaymentView = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  attempts: number;
  open?: { merchantOrderId: string; payUrl?: string; expiresAt: number; review: boolean };
};

type StartResult =
  | { kind: "redirect"; url: string }
  | { kind: "paid" }
  | { kind: "closed" }
  /** An attempt is open but its page can't be reused; wait for it to settle. */
  | { kind: "wait" };

type CheckResult = {
  status: string;
  paymentStatus: string;
  gateway: "NONE" | "PENDING" | "COMPLETED" | "FAILED" | "UNKNOWN";
};

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

    const open = (
      await ctx.db
        .query("paymentAttempts")
        .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
        .take(20)
    ).find((a) => a.state === "open" || a.state === "review");

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      attempts: order.paymentAttempts ?? 0,
      ...(open
        ? {
            open: {
              merchantOrderId: open.merchantOrderId,
              payUrl: open.payUrl,
              expiresAt: open.expiresAt,
              review: open.state === "review",
            },
          }
        : {}),
    };
  },
});

/**
 * Open the next attempt, unless one is already open. Being a mutation, this
 * is the serialisation point: two tabs pressing "Pay" at once cannot both
 * get a fresh payable attempt; the second is handed the first.
 */
export const reserveAttempt = internalMutation({
  args: { orderNumber: v.string(), now: v.number() },
  returns: v.union(
    v.object({ kind: v.literal("reserved"), merchantOrderId: v.string(), amountPaise: v.number() }),
    v.object({ kind: v.literal("open"), merchantOrderId: v.string(), payUrl: v.optional(v.string()) }),
    v.object({ kind: v.literal("closed") }),
    v.object({ kind: v.literal("limit") }),
  ),
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
      .unique();
    if (!order || order.status !== "awaiting_payment" || order.paymentStatus === "paid") {
      return { kind: "closed" as const };
    }

    // Attempts made before the ledger existed get their rows now, inside
    // this transaction, so one of them still pending blocks a new attempt.
    await ensureLedger(ctx, order, args.now);

    const open = (
      await ctx.db
        .query("paymentAttempts")
        .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
        .take(20)
    ).find((a) => a.state === "open" || a.state === "review");
    if (open) {
      return {
        kind: "open" as const,
        merchantOrderId: open.merchantOrderId,
        payUrl: open.state === "open" ? open.payUrl : undefined,
      };
    }

    const attempt = (order.paymentAttempts ?? 0) + 1;
    if (attempt > MAX_ATTEMPTS) return { kind: "limit" as const };

    const merchantOrderId = `${order.orderNumber}-${attempt}`;
    const amountPaise = Math.round(order.totals.total * 100);
    await ctx.db.insert("paymentAttempts", {
      orderId: order._id,
      merchantOrderId,
      attempt,
      state: "open",
      amountPaise,
      createdAt: args.now,
      expiresAt: args.now + PAY_WINDOW_SECONDS * 1000,
      nextCheckAt: args.now + FIRST_CHECK_MS,
      checks: 0,
    });
    await ctx.db.patch("orders", order._id, {
      paymentAttempts: attempt,
      phonepeMerchantOrderId: merchantOrderId,
      phonepeOrderId: undefined,
      paymentStatus: "pending",
      paymentStartedAt: args.now,
    });
    return { kind: "reserved" as const, merchantOrderId, amountPaise };
  },
});

/** PhonePe accepted the attempt: keep its page so "Try again" can reuse it. */
export const attemptCreated = internalMutation({
  args: {
    merchantOrderId: v.string(),
    payUrl: v.string(),
    phonepeOrderId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("paymentAttempts")
      .withIndex("by_merchantOrderId", (q) => q.eq("merchantOrderId", args.merchantOrderId))
      .unique();
    if (!row) return null;
    await ctx.db.patch("paymentAttempts", row._id, {
      payUrl: args.payUrl,
      ...(args.phonepeOrderId ? { phonepeOrderId: args.phonepeOrderId } : {}),
      ...(args.expiresAt ? { expiresAt: args.expiresAt } : {}),
    });
    if (args.phonepeOrderId) {
      const order = await ctx.db.get("orders", row.orderId);
      if (order && order.phonepeMerchantOrderId === args.merchantOrderId) {
        await ctx.db.patch("orders", order._id, { phonepeOrderId: args.phonepeOrderId });
      }
    }
    return null;
  },
});

/**
 * No final answer yet (pending, unreachable, or unknown to PhonePe): check
 * again later, backing off, but never give up on an open attempt. One PhonePe
 * has never heard of, minutes after we asked it to create, was never created
 * and so can't take money; it is closed as failed.
 */
export const recheckLater = internalMutation({
  args: { merchantOrderId: v.string(), now: v.number(), notFound: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("paymentAttempts")
      .withIndex("by_merchantOrderId", (q) => q.eq("merchantOrderId", args.merchantOrderId))
      .unique();
    if (!row || row.state !== "open") return null;

    if (args.notFound && args.now - row.createdAt > 5 * MINUTE) {
      await ctx.db.patch("paymentAttempts", row._id, { state: "failed", resolvedAt: args.now });
      const order = await ctx.db.get("orders", row.orderId);
      if (order && order.paymentStatus === "pending") {
        const others = await ctx.db
          .query("paymentAttempts")
          .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
          .take(20);
        if (!others.some((a) => (a.state === "open" || a.state === "review") && a._id !== row._id)) {
          await ctx.db.patch("orders", order._id, { paymentStatus: "failed" });
        }
      }
      return null;
    }

    const checks = row.checks + 1;
    const gap = Math.min(FIRST_CHECK_MS * 2 ** Math.min(checks, 10), MAX_CHECK_GAP_MS);
    await ctx.db.patch("paymentAttempts", row._id, { checks, nextCheckAt: args.now + gap });
    if (args.now > row.expiresAt + 24 * 60 * MINUTE && checks % 4 === 0) {
      console.error(
        `PhonePe attempt ${row.merchantOrderId} is still unresolved a day after it expired. Check it in the PhonePe dashboard.`,
      );
    }
    return null;
  },
});

/** PhonePe definitely refused to create the attempt, so it can never be paid. */
export const attemptRefused = internalMutation({
  args: { merchantOrderId: v.string(), now: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("paymentAttempts")
      .withIndex("by_merchantOrderId", (q) => q.eq("merchantOrderId", args.merchantOrderId))
      .unique();
    if (!row || row.state !== "open") return null;
    await ctx.db.patch("paymentAttempts", row._id, { state: "failed", resolvedAt: args.now });
    const order = await ctx.db.get("orders", row.orderId);
    if (order && order.paymentStatus === "pending") {
      await ctx.db.patch("orders", order._id, { paymentStatus: "failed" });
    }
    return null;
  },
});

// ---------------------------------------------------------------------------
// Public entry points. Both are called only by our own Next.js route, which
// holds ORDER_WRITE_SECRET, and both need the order's tracking token.
// ---------------------------------------------------------------------------

/** Spent only after the order and token checked out; see rateLimits.ts. */
async function limitCalls(ctx: ActionCtx, orderNumber: string) {
  const busy = "Too many payment requests right now. Try again in a minute.";
  const perOrder = await rateLimiter.limit(ctx, "paymentPerOrder", { key: orderNumber });
  if (!perOrder.ok) throw new Error(busy);
  const global = await rateLimiter.limit(ctx, "paymentCalls");
  if (!global.ok) throw new Error(busy);
}

async function findOrder(ctx: ActionCtx, orderNumber: string, trackToken: string): Promise<PaymentView> {
  const order: PaymentView | null = await ctx.runQuery(internal.phonepe.orderForPayment, {
    orderNumber,
    trackToken,
  });
  if (!order) throw new Error("We could not find that order.");
  return order;
}

/** An open attempt's page is worth reusing only with time left on it. */
function reusable(open: { payUrl?: string; expiresAt: number } | undefined, now: number) {
  return open?.payUrl && open.expiresAt - now > MINUTE ? open.payUrl : undefined;
}

/**
 * Send the buyer to PhonePe for an order: the open attempt's page if there
 * is one, otherwise a new attempt. Also the "Pay" / "Try again" button. Never
 * opens a second attempt while the first could still take money.
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
    v.object({ kind: v.literal("wait") }),
  ),
  handler: async (ctx, args): Promise<StartResult> => {
    assertTrustedCaller(args.secret);
    // The switch is enforced here, not only in the storefront, so no build
    // of the site can open a payment while it is off.
    if (!PAYMENTS_LIVE) return { kind: "closed" };

    const order = await findOrder(ctx, args.orderNumber, args.trackToken);
    if (order.paymentStatus === "paid") return { kind: "paid" };
    if (order.paymentMethod === "cod" || order.status !== "awaiting_payment") {
      return { kind: "closed" };
    }
    await limitCalls(ctx, order.orderNumber);

    if (order.open?.review) return { kind: "wait" };
    if (order.open) {
      const state = await syncAttempt(ctx, order.open.merchantOrderId);
      if (state === "COMPLETED") return { kind: "paid" };
      if (state === "REVIEW") return { kind: "wait" }; // just quarantined; never reuse its page
      if (state !== "FAILED") {
        // Still open (or PhonePe couldn't say): the same page, or wait.
        const url = reusable(order.open, Date.now());
        return url ? { kind: "redirect", url } : { kind: "wait" };
      }
      // FAILED: settled, so a new attempt is safe.
    }

    const reserved = await ctx.runMutation(internal.phonepe.reserveAttempt, {
      orderNumber: order.orderNumber,
      now: Date.now(),
    });
    if (reserved.kind === "closed") return { kind: "closed" };
    if (reserved.kind === "limit") {
      throw new Error("This order has had too many payment attempts. Write to us and we will help.");
    }
    if (reserved.kind === "open") {
      // Another tab opened one a moment ago.
      return reserved.payUrl ? { kind: "redirect", url: reserved.payUrl } : { kind: "wait" };
    }

    const { merchantOrderId, amountPaise } = reserved;
    let res: Awaited<ReturnType<typeof call>>;
    try {
      res = await call(ctx, "/checkout/v2/pay", {
        method: "POST",
        body: {
          merchantOrderId,
          amount: amountPaise,
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
      // Timed out or unreachable: PhonePe may or may not have created it.
      // The attempt stays open and the cron settles it, so no second one is
      // opened in the meantime.
      console.error(`PhonePe payment ${merchantOrderId} may not have been created`, error);
      throw new Error("PhonePe is not responding. Give it a few minutes, then try again.");
    }

    const body = obj(res.body);
    const url = str(body?.redirectUrl);
    if (res.ok && url) {
      const expireAt = num(body?.expireAt) ?? num(body?.expiryAt);
      await ctx.runMutation(internal.phonepe.attemptCreated, {
        merchantOrderId,
        payUrl: url,
        phonepeOrderId: str(body?.orderId),
        ...(expireAt ? { expiresAt: expireAt } : {}),
      });
      return { kind: "redirect", url };
    }

    console.error(
      `PhonePe refused payment ${merchantOrderId} (${res.status}): ${errorText(res.body, "no redirectUrl")}`,
    );
    // A 4xx is a definite no (nothing was created). Anything else is
    // ambiguous and left open for the cron.
    if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
      await ctx.runMutation(internal.phonepe.attemptRefused, { merchantOrderId, now: Date.now() });
    }
    throw new Error("We could not open the payment page. Try again in a moment.");
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
    const before = await findOrder(ctx, args.orderNumber, args.trackToken);
    const settled = { status: before.status, paymentStatus: before.paymentStatus };

    // Answered from our own records, costing PhonePe nothing.
    if (before.paymentStatus === "paid") return { ...settled, gateway: "COMPLETED" };
    if (before.paymentMethod === "cod" || before.attempts === 0) return { ...settled, gateway: "NONE" };
    if (!before.open) return { ...settled, gateway: "FAILED" };
    if (before.open.review) return { ...settled, gateway: "UNKNOWN" };

    await limitCalls(ctx, before.orderNumber);
    const checked = before.open.merchantOrderId;
    const state = await syncAttempt(ctx, checked);
    const after: PaymentView | null = await ctx.runQuery(internal.phonepe.orderForPayment, {
      orderNumber: args.orderNumber,
      trackToken: args.trackToken,
    });
    const now = after ?? before;
    // The answer is about the order, not just the attempt checked: another
    // attempt still open (older ones restored by the backfill) means the
    // payment is unresolved, never "failed".
    const gateway: CheckResult["gateway"] =
      now.paymentStatus === "paid"
        ? "COMPLETED"
        : now.open
          ? now.open.merchantOrderId === checked && state === "PENDING"
            ? "PENDING"
            : "UNKNOWN"
          : "FAILED";
    return { status: now.status, paymentStatus: now.paymentStatus, gateway };
  },
});

// ---------------------------------------------------------------------------
// Background reconciliation: the webhook's follow-up, and a cron that works
// through every open attempt until PhonePe gives a final answer.
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

/** Open attempts due a check, oldest due first. Order status doesn't matter. */
export const dueAttempts = internalQuery({
  args: { now: v.number() },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const due = await ctx.db
      .query("paymentAttempts")
      .withIndex("by_state_and_nextCheckAt", (q) => q.eq("state", "open").lte("nextCheckAt", args.now))
      .take(25);
    return due.map((a) => a.merchantOrderId);
  },
});

export const reconcileOpen = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Each check pushes the attempt's nextCheckAt forward, so every run
    // starts with whatever has waited longest and nothing is starved.
    const ids = await ctx.runQuery(internal.phonepe.dueAttempts, { now: Date.now() });
    for (const merchantOrderId of ids) {
      try {
        await syncAttempt(ctx, merchantOrderId);
      } catch (error) {
        console.error(`PhonePe reconcile failed for ${merchantOrderId}`, error);
        // Not configured: every other attempt would fail the same way.
        if (error instanceof NotConfiguredError) break;
      }
    }
    return null;
  },
});

// ---------------------------------------------------------------------------
// Attempts made before the ledger existed (live until 2026-11-23).
// ---------------------------------------------------------------------------

/**
 * Give every attempt an order has ever made a ledger row. An attempt that is
 * not the recorded paying one starts "open" and due now, so the cron asks
 * PhonePe about it: a pending one blocks retries until it settles, a late
 * success confirms the order or is flagged as a duplicate, an expired one
 * closes as failed. Returns how many rows were added. Idempotent.
 */
async function ensureLedger(ctx: MutationCtx, order: Doc<"orders">, now: number): Promise<number> {
  const count = order.paymentAttempts ?? 0;
  if (count === 0) return 0;
  const existing = await ctx.db
    .query("paymentAttempts")
    .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
    .take(20);
  const have = new Set(existing.map((a) => a.merchantOrderId));
  let added = 0;
  for (let attempt = 1; attempt <= count; attempt++) {
    const merchantOrderId = `${order.orderNumber}-${attempt}`;
    if (have.has(merchantOrderId)) continue;
    const paidWithThis =
      order.paymentStatus === "paid" && order.phonepeMerchantOrderId === merchantOrderId;
    const createdAt =
      attempt === count ? (order.paymentStartedAt ?? order.placedAt) : order.placedAt;
    await ctx.db.insert("paymentAttempts", {
      orderId: order._id,
      merchantOrderId,
      attempt,
      state: paidWithThis ? "completed" : "open",
      amountPaise: Math.round(order.totals.total * 100),
      createdAt,
      expiresAt: createdAt + PAY_WINDOW_SECONDS * 1000,
      nextCheckAt: now,
      checks: 0,
      ...(paidWithThis ? { resolvedAt: order.paidAt ?? now } : {}),
    });
    added++;
  }
  return added;
}

/**
 * One-off, run once per deployment after this code ships:
 * `pnpm exec convex run phonepe:backfillLedger` (add `--prod` for the live
 * site). Walks every order a page at a time and schedules itself for the
 * next page.
 */
export const backfillLedger = internalMutation({
  args: { paginationOpts: v.optional(paginationOptsValidator) },
  returns: v.object({ scanned: v.number(), added: v.number(), done: v.boolean() }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const page = await ctx.db
      .query("orders")
      .paginate(args.paginationOpts ?? { numItems: 100, cursor: null });
    let added = 0;
    for (const order of page.page) added += await ensureLedger(ctx, order, now);
    if (!page.isDone) {
      await ctx.scheduler.runAfter(0, internal.phonepe.backfillLedger, {
        paginationOpts: { numItems: 100, cursor: page.continueCursor },
      });
    }
    return { scanned: page.page.length, added, done: page.isDone };
  },
});
