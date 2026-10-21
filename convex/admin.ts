import { v } from "convex/values";
import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { getAuthSessionId, getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { appendEvent, queueShiprocketPush } from "./orders";
import { orderLine, orderStatus, orderTotals, shippingAddress } from "./schema";
import { isAdminEmail } from "./adminAllowlist";

/**
 * The admin panel's backend.
 *
 * Sign-in already refuses anyone off the allowlist (convex/auth.ts), but every
 * function here re-checks the email against ADMIN_EMAILS before returning a
 * single customer address. An account left over from the old password sign-in,
 * or an email removed from the list later, must still be turned away.
 */

/**
 * The signed-in admin's email, or null.
 *
 * Three checks beyond "has a token":
 * - The session behind the token still exists and hasn't expired. A JWT stays
 *   valid for up to an hour after its session is deleted, and the first code
 *   sign-in deletes sessions left over from the old password sign-in.
 * - `emailVerificationTime` is set, which only an emailed-code sign-in does
 *   (convex/auth.ts). A row only reached through the old password sign-in
 *   never proved it owns the inbox.
 * - The email is on the allowlist right now.
 */
async function currentAdminEmail(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const userId = await getAuthUserId(ctx);
  const sessionId = await getAuthSessionId(ctx);
  if (!userId || !sessionId) return null;

  const session = await ctx.db.get("authSessions", sessionId);
  if (!session || session.userId !== userId || session.expirationTime <= Date.now()) {
    return null;
  }

  const user = await ctx.db.get("users", userId);
  const email = user?.email?.toLowerCase();
  if (!email || !isAdminEmail(email) || user?.emailVerificationTime === undefined) {
    return null;
  }
  return email;
}

async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<string> {
  const email = await currentAdminEmail(ctx);
  if (!email) throw new Error("This account is not allowed to view orders. Sign in again.");
  return email;
}

/** Drives the panel's header, and tells the sign-in screen when to step aside. */
export const me = query({
  args: {},
  returns: v.union(v.object({ email: v.string() }), v.null()),
  handler: async (ctx) => {
    const email = await currentAdminEmail(ctx);
    return email ? { email } : null;
  },
});

const adminOrder = v.object({
  orderNumber: v.string(),
  trackToken: v.string(),
  placedAt: v.number(),
  email: v.string(),
  marketingOptIn: v.boolean(),
  address: shippingAddress,
  notes: v.string(),
  lines: v.array(orderLine),
  totals: orderTotals,
  status: orderStatus,
  paymentStatus: v.union(
    v.literal("pending"),
    v.literal("paid"),
    v.literal("cod_pending"),
    v.literal("failed"),
    v.literal("refunded"),
  ),
  paymentMethod: v.union(v.literal("razorpay"), v.literal("cod")),
  courier: v.optional(v.string()),
  awb: v.optional(v.string()),
  trackingUrl: v.optional(v.string()),
  shiprocketPush: v.optional(
    v.union(v.literal("queued"), v.literal("pushed"), v.literal("failed")),
  ),
  shiprocketError: v.optional(v.string()),
  shiprocketOrderId: v.optional(v.string()),
  quotedCourierName: v.optional(v.string()),
  shippingSource: v.optional(v.union(v.literal("live"), v.literal("fallback"))),
});

/**
 * Newest orders first. Paginated rather than collected, because this table
 * only grows and a full read would eventually blow the query's limits.
 */
export const listOrders = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(orderStatus),
  },
  returns: paginationResultValidator(adminOrder),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const rows = args.status
      ? await ctx.db
          .query("orders")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .paginate(args.paginationOpts)
      : await ctx.db.query("orders").order("desc").paginate(args.paginationOpts);

    return {
      ...rows,
      page: rows.page.map((order) => ({
        orderNumber: order.orderNumber,
        trackToken: order.trackToken,
        placedAt: order.placedAt,
        email: order.email,
        marketingOptIn: order.marketingOptIn,
        address: order.address,
        notes: order.notes,
        lines: order.lines,
        totals: order.totals,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        courier: order.courier,
        awb: order.awb,
        trackingUrl: order.trackingUrl,
        shiprocketPush: order.shiprocketPush,
        shiprocketError: order.shiprocketError,
        shiprocketOrderId: order.shiprocketOrderId,
        quotedCourierName: order.quotedCourierName,
        shippingSource: order.shippingSource,
      })),
    };
  },
});

/** Counts for the filter chips. Cheap while the store is small; revisit past a few thousand orders. */
export const statusCounts = query({
  args: {},
  returns: v.record(v.string(), v.number()),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const counts: Record<string, number> = {};
    const recent = await ctx.db.query("orders").order("desc").take(500);
    for (const order of recent) {
      counts[order.status] = (counts[order.status] ?? 0) + 1;
    }
    return counts;
  },
});

/**
 * Move an order along by hand. Recorded with source "manual" so a correction
 * made here is always distinguishable from a courier's own update.
 */
export const setStatus = mutation({
  args: {
    orderNumber: v.string(),
    status: orderStatus,
    detail: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const email = await requireAdmin(ctx);

    await ctx.runMutation(internal.orders.recordStatus, {
      orderNumber: args.orderNumber,
      status: args.status,
      label: LABELS[args.status],
      detail: args.detail ?? `Updated by ${email}`,
      source: "manual",
    });
    return null;
  },
});

const LABELS: Record<string, string> = {
  awaiting_payment: "Awaiting payment",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

/**
 * Records a payment that arrived outside the gateway — the manual payment-link
 * flow that runs until Razorpay is approved. Razorpay's own webhook will use
 * orders.recordPayment instead, which carries the gateway's ids.
 */
export const markPaid = mutation({
  args: { orderNumber: v.string(), reference: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const email = await requireAdmin(ctx);

    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
      .unique();
    if (!order) throw new Error(`No order ${args.orderNumber}.`);
    if (order.paymentStatus === "paid") return null;

    await ctx.db.patch("orders", order._id, {
      paymentStatus: "paid",
      // Only advance the order if payment was the thing holding it back.
      status: order.status === "awaiting_payment" ? "confirmed" : order.status,
    });

    await appendEvent(
      ctx,
      order._id,
      order.status === "awaiting_payment" ? "confirmed" : order.status,
      "Payment received",
      "manual",
      args.reference ? `Reference ${args.reference}, recorded by ${email}` : `Recorded by ${email}`,
    );

    // Paid means ready to ship. Re-read so the push sees the patched order.
    const paid = await ctx.db.get("orders", order._id);
    if (paid) await queueShiprocketPush(ctx, paid);
    return null;
  },
});

/**
 * Try the Shiprocket hand-off again after a failure — typically once the API
 * user is set, a pickup address exists, or a bad address has been fixed.
 */
export const retryShiprocketPush = mutation({
  args: { orderNumber: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
      .unique();
    if (!order) throw new Error(`No order ${args.orderNumber}.`);
    if (order.shiprocketPush === "pushed") throw new Error("This order is already in Shiprocket.");
    if (order.shiprocketPush === "queued") throw new Error("This order is already being sent.");

    // Clearing the flag lets queueShiprocketPush take it from the top.
    await ctx.db.patch("orders", order._id, { shiprocketPush: undefined });
    const fresh = await ctx.db.get("orders", order._id);
    if (fresh) await queueShiprocketPush(ctx, fresh);
    return null;
  },
});

const subscriberRow = v.object({
  email: v.string(),
  source: v.union(v.literal("footer"), v.literal("checkout")),
  createdAt: v.number(),
});

/**
 * The newsletter list, newest first, for the panel's Subscribers tab and its
 * CSV export. Capped well above what a launch-stage store will collect.
 */
export const listSubscribers = query({
  args: {},
  returns: v.array(subscriberRow),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("subscribers").order("desc").take(5000);
    return rows.map((row) => ({
      email: row.email,
      source: row.source,
      createdAt: row._creationTime,
    }));
  },
});
