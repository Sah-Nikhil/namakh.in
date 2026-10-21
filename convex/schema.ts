import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * Where an order is in its life. Payment state is tracked separately, because
 * a COD parcel can be shipped and delivered without ever being "paid" online.
 */
export const orderStatus = v.union(
  v.literal("awaiting_payment"),
  v.literal("confirmed"),
  v.literal("packed"),
  v.literal("shipped"),
  v.literal("out_for_delivery"),
  v.literal("delivered"),
  v.literal("cancelled"),
  v.literal("returned"),
);

export const paymentStatus = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("cod_pending"),
  v.literal("failed"),
  v.literal("refunded"),
);

export const shippingAddress = v.object({
  fullName: v.string(),
  phone: v.string(),
  line1: v.string(),
  line2: v.string(),
  pincode: v.string(),
  city: v.string(),
  state: v.string(),
  country: v.string(),
});

/** Copied onto the order, not referenced, so a catalogue edit never rewrites history. */
export const orderLine = v.object({
  productId: v.string(),
  slug: v.string(),
  name: v.string(),
  price: v.number(),
  image: v.string(),
  quantityLabel: v.string(),
  qty: v.number(),
});

export const orderTotals = v.object({
  subtotal: v.number(),
  shipping: v.number(),
  tax: v.number(),
  taxIncluded: v.number(),
  codFee: v.number(),
  total: v.number(),
  itemCount: v.number(),
  /** Derived, but stored so a saved order matches the OrderTotals type exactly. */
  freeShippingGap: v.number(),
});

export default defineSchema({
  // Users, sessions and accounts for the admin panel. Managed by Convex Auth.
  ...authTables,

  orders: defineTable({
    /** Human-facing id, e.g. NMK-HQL88-HZGU. What the buyer quotes to support. */
    orderNumber: v.string(),
    /** Unguessable secret in the tracking link. Anyone holding it sees the order. */
    trackToken: v.string(),

    email: v.string(),
    marketingOptIn: v.boolean(),
    address: shippingAddress,
    notes: v.string(),

    lines: v.array(orderLine),
    totals: orderTotals,

    status: orderStatus,
    paymentStatus,
    paymentMethod: v.union(v.literal("razorpay"), v.literal("cod")),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),

    /** Filled in once the parcel is handed to a courier. */
    courier: v.optional(v.string()),
    awb: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    shiprocketOrderId: v.optional(v.string()),
    shiprocketShipmentId: v.optional(v.string()),
    /**
     * Where the hand-off to Shiprocket stands. "queued" is written in the same
     * transaction that schedules the push, so a second confirmation can never
     * schedule a duplicate. Absent on orders that have not been confirmed.
     */
    shiprocketPush: v.optional(
      v.union(v.literal("queued"), v.literal("pushed"), v.literal("failed")),
    ),
    shiprocketError: v.optional(v.string()),

    /** The courier quoted at checkout. Used if courier booking is automated. */
    quotedCourierId: v.optional(v.number()),
    quotedCourierName: v.optional(v.string()),
    /** "live" when Shiprocket priced it, "fallback" when it could not be reached. */
    shippingSource: v.optional(v.union(v.literal("live"), v.literal("fallback"))),

    placedAt: v.number(),
  })
    .index("by_orderNumber", ["orderNumber"])
    .index("by_trackToken", ["trackToken"])
    .index("by_awb", ["awb"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  /**
   * A shipping price shown to a buyer, held server-side so the order is
   * charged exactly what was shown and the browser never supplies it. The
   * weight and PIN code are stored so a quote cannot be reused for a heavier
   * cart or a different address.
   */
  shippingQuotes: defineTable({
    pincode: v.string(),
    weightGrams: v.number(),
    subtotal: v.number(),
    /** What the buyer pays, after markup, rounding and any free threshold. */
    amount: v.number(),
    /** What the courier charges the store. Kept for margin checks later. */
    courierRate: v.optional(v.number()),
    courierCompanyId: v.optional(v.number()),
    courierName: v.optional(v.string()),
    estimatedDays: v.optional(v.number()),
    source: v.union(v.literal("live"), v.literal("fallback")),
    expiresAt: v.number(),
  }).index("by_expiresAt", ["expiresAt"]),

  /** Cached API logins. Shiprocket tokens last about ten days. */
  integrationTokens: defineTable({
    provider: v.literal("shiprocket"),
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_provider", ["provider"]),

  /**
   * The tracking timeline, one row per status change. A separate table rather
   * than an array on the order: it grows every time the courier scans the
   * parcel, and an array field would rewrite the whole order document each time.
   */
  orderEvents: defineTable({
    orderId: v.id("orders"),
    status: orderStatus,
    /** What the buyer reads on the timeline, e.g. "Shipped from Bengaluru". */
    label: v.string(),
    detail: v.optional(v.string()),
    occurredAt: v.number(),
    /** Who wrote this row, so a manual correction is distinguishable later. */
    source: v.union(
      v.literal("system"),
      v.literal("shiprocket"),
      v.literal("manual"),
    ),
  }).index("by_orderId", ["orderId"]),

  /**
   * People who asked for news: the footer form, or the opt-in box at checkout.
   * One row per email; signing up again changes nothing. Nothing is
   * sent from here yet. The list is read and exported from the admin panel.
   */
  subscribers: defineTable({
    email: v.string(),
    source: v.union(v.literal("footer"), v.literal("checkout")),
  }).index("by_email", ["email"]),
});
