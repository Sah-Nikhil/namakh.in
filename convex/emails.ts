import { v } from "convex/values";
import { Resend } from "resend";
import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import schema from "./schema";
import { COMMERCE } from "../lib/commerce/config";
import { orderReceivedEmail } from "../lib/email/order-received";
import type { PlacedOrder } from "../lib/commerce/types";

/**
 * Order emails sent from the backend: today only the "order confirmed" email
 * once PhonePe confirms a prepaid order. Uses the same RESEND_API_KEY and
 * EMAIL_FROM as the admin sign-in code, and SITE_URL for the tracking link.
 */

export const orderForEmail = internalQuery({
  args: { orderId: v.id("orders") },
  returns: v.union(schema.doc("orders"), v.null()),
  handler: async (ctx, args) => ctx.db.get("orders", args.orderId),
});

export const orderConfirmed = internalAction({
  args: { orderId: v.id("orders") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await ctx.runQuery(internal.emails.orderForEmail, args);
    if (!order) return null;

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    const origin = (process.env.SITE_URL ?? "").replace(/\/+$/, "");
    if (!apiKey || !from || !origin) {
      console.error("Order email skipped: RESEND_API_KEY, EMAIL_FROM or SITE_URL is not set on this deployment.");
      return null;
    }

    const placed: PlacedOrder = {
      orderNumber: order.orderNumber,
      trackToken: order.trackToken,
      status: order.status,
      totals: order.totals,
      lines: order.lines,
      address: order.address,
      email: order.email,
      paymentMethod: order.paymentMethod === "cod" ? "cod" : "phonepe",
      placedAt: order.placedAt,
    };

    // Cap the call so a stalled Resend request can't hold the action open.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    try {
      const { error } = await new Resend(apiKey).emails.send(
        {
          from,
          to: order.email,
          replyTo: COMMERCE.support.email,
          ...orderReceivedEmail(placed, origin, { paid: true }),
        },
        // Resend drops a repeat inside 24 hours, so a retried action never
        // sends the buyer two confirmations.
        { idempotencyKey: `order-confirmed/${order.orderNumber}`, signal: controller.signal },
      );
      if (error) console.error(`Order email for ${order.orderNumber} was rejected`, error);
    } catch (error) {
      console.error(`Order email for ${order.orderNumber} failed`, error);
    } finally {
      clearTimeout(timer);
    }
    return null;
  },
});
