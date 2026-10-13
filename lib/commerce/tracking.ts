import type { OrderStatus } from "./types";

/** The tracking link. The token is the credential, so it travels in the URL. */
export function trackingPath(orderNumber: string, token: string): string {
  return `/track/${encodeURIComponent(orderNumber)}?t=${encodeURIComponent(token)}`;
}

/** What each status means to a buyer, in their words rather than ours. */
export const STATUS_COPY: Record<OrderStatus, { label: string; blurb: string }> = {
  awaiting_payment: {
    label: "Awaiting payment",
    blurb: "We have your order. It moves to packing once payment is confirmed.",
  },
  confirmed: {
    label: "Confirmed",
    blurb: "Payment is in. Your order is queued for packing.",
  },
  packed: {
    label: "Packed",
    blurb: "Your parcel is sealed and waiting for the courier.",
  },
  shipped: {
    label: "Shipped",
    blurb: "On its way. Follow the courier's own tracking for live scans.",
  },
  out_for_delivery: {
    label: "Out for delivery",
    blurb: "With the delivery agent today. Keep your phone reachable.",
  },
  delivered: {
    label: "Delivered",
    blurb: "Handed over. Mix a scoop in 500ml and drink up.",
  },
  cancelled: {
    label: "Cancelled",
    blurb: "This order was cancelled. Any payment made is being refunded.",
  },
  returned: {
    label: "Returned",
    blurb: "The parcel is on its way back to us. We will be in touch.",
  },
};

/** Cancelled and returned end the story; they get their own treatment. */
export function isTerminalFailure(status: OrderStatus): boolean {
  return status === "cancelled" || status === "returned";
}
