import { v } from "convex/values";
import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { appendEvent, queueShiprocketPush } from "./orders";
import { orderLine, orderStatus, orderTotals, shippingAddress } from "./schema";

/**
 * The admin panel's backend.
 *
 * Signing up is not the same as being let in. Convex Auth will happily create
 * an account for any email; every function here re-checks that email against
 * ADMIN_EMAILS before returning a single customer address. The allowlist is
 * the authorisation, the account is only the identity.
 */

function allowedEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Sign in to view orders.");

  const user = await ctx.db.get("users", userId);
  const email = user?.email?.toLowerCase();
  if (!email || !allowedEmails().includes(email)) {
    throw new Error("This account is not allowed to view orders.");
  }
  return email;
}

/** Drives the panel's header, and tells the sign-in screen when to step aside. */
export const me = query({
  args: {},
  returns: v.union(v.object({ email: v.string() }), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get("users", userId);
    const email = user?.email?.toLowerCase();
    if (!email || !allowedEmails().includes(email)) return null;

    return { email };
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
