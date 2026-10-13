import type { CartLine, OrderTotals, ShippingAddress } from "@/lib/commerce/types";

/**
 * One order flattened into Shiprocket's bulk-upload column order, tab
 * separated so it pastes straight into a spreadsheet cell row.
 *
 * Their template changes between accounts and plan tiers. Check this header
 * against the sheet Shiprocket gives you before the first bulk upload, and
 * reorder here if it differs. Weight is a placeholder: nothing in the
 * catalogue records pack weight yet.
 */
export const SHIPROCKET_HEADERS = [
  "order_id",
  "order_date",
  "billing_customer_name",
  "billing_address",
  "billing_address_2",
  "billing_city",
  "billing_pincode",
  "billing_state",
  "billing_country",
  "billing_email",
  "billing_phone",
  "shipping_is_billing",
  "order_items",
  "sku",
  "units",
  "selling_price",
  "payment_method",
  "sub_total",
  "weight",
] as const;

export function shiprocketRow(order: {
  orderNumber: string;
  placedAt: number;
  email: string;
  address: ShippingAddress;
  lines: CartLine[];
  totals: OrderTotals;
  paymentMethod: "razorpay" | "cod";
}): string {
  const date = new Date(order.placedAt).toISOString().slice(0, 10);
  const names = order.lines.map((l) => l.name).join(" + ");
  const skus = order.lines.map((l) => l.slug).join(" + ");
  const units = order.lines.reduce((sum, l) => sum + l.qty, 0);

  return [
    order.orderNumber,
    date,
    order.address.fullName,
    order.address.line1,
    order.address.line2,
    order.address.city,
    order.address.pincode,
    order.address.state,
    order.address.country,
    order.email,
    order.address.phone,
    "1",
    names,
    skus,
    String(units),
    String(order.totals.subtotal),
    order.paymentMethod === "cod" ? "COD" : "Prepaid",
    String(order.totals.total),
    "0.5",
  ].join("\t");
}
