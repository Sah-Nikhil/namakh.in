/**
 * Shiprocket's status vocabulary, mapped onto ours.
 *
 * Their webhook sends `current_status` as free-ish text that varies by courier
 * ("PICKED UP", "In Transit", "RTO INITIATED"). We normalise aggressively and
 * fall back to leaving the order where it is rather than guessing wrong.
 */

import type { OrderStatus } from "../commerce/types";

export type { OrderStatus };

type Mapped = { status: OrderStatus; label: string };

const MAP: Record<string, Mapped> = {
  "NEW": { status: "confirmed", label: "Order confirmed" },
  "INVOICED": { status: "confirmed", label: "Order confirmed" },
  "READY TO SHIP": { status: "packed", label: "Packed and ready to ship" },
  "AWB ASSIGNED": { status: "packed", label: "Packed and ready to ship" },
  "LABEL GENERATED": { status: "packed", label: "Packed and ready to ship" },
  "PICKUP SCHEDULED": { status: "packed", label: "Pickup scheduled" },
  "PICKUP GENERATED": { status: "packed", label: "Pickup scheduled" },
  "PICKUP QUEUED": { status: "packed", label: "Pickup scheduled" },
  "PICKUP RESCHEDULED": { status: "packed", label: "Pickup rescheduled" },
  "PICKED UP": { status: "shipped", label: "Picked up by the courier" },
  "SHIPPED": { status: "shipped", label: "Shipped" },
  "IN TRANSIT": { status: "shipped", label: "In transit" },
  "REACHED DESTINATION HUB": { status: "shipped", label: "Reached your city" },
  "OUT FOR DELIVERY": { status: "out_for_delivery", label: "Out for delivery" },
  "DELIVERED": { status: "delivered", label: "Delivered" },
  "UNDELIVERED": { status: "out_for_delivery", label: "Delivery attempted" },
  "CANCELED": { status: "cancelled", label: "Cancelled" },
  "CANCELLED": { status: "cancelled", label: "Cancelled" },
  "RTO INITIATED": { status: "returned", label: "Returning to us" },
  "RTO IN TRANSIT": { status: "returned", label: "Returning to us" },
  "RTO DELIVERED": { status: "returned", label: "Returned to us" },
  "LOST": { status: "cancelled", label: "Parcel lost in transit" },
};

export function mapShiprocketStatus(raw: string): Mapped | null {
  const key = raw.trim().toUpperCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  return MAP[key] ?? null;
}

/** The courier's own tracking page, which is always better than ours. */
export function courierTrackingUrl(awb: string): string {
  return `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`;
}

/** Order of the timeline shown to a buyer. Cancelled and returned sit outside it. */
export const TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: "awaiting_payment", label: "Order placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "packed", label: "Packed" },
  { status: "shipped", label: "Shipped" },
  { status: "out_for_delivery", label: "Out for delivery" },
  { status: "delivered", label: "Delivered" },
];

export function timelineIndex(status: OrderStatus): number {
  return TIMELINE.findIndex((step) => step.status === status);
}
