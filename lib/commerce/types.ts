import type { PaymentMethodId } from "./config";

/** One line in the cart. Product fields are denormalised so a cart restored
 *  from storage still renders if the catalogue changes underneath it. */
export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  /** Unit price in whole rupees, matching lib/products.ts. */
  price: number;
  image: string;
  /** e.g. "/ per pack (50 servings)" — shown under the line name. */
  quantityLabel: string;
  qty: number;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
};

export type CheckoutDraft = {
  email: string;
  marketingOptIn: boolean;
  address: ShippingAddress;
  paymentMethod: PaymentMethodId;
  notes: string;
};

export type OrderTotals = {
  /** Sum of line price × qty. */
  subtotal: number;
  shipping: number;
  /** Only non-zero when tax.mode is "exclusive". */
  tax: number;
  /** Tax already contained in the subtotal. Display-only when "inclusive". */
  taxIncluded: number;
  codFee: number;
  total: number;
  itemCount: number;
  /** Rupees left to add before shipping goes free. 0 when not applicable. */
  freeShippingGap: number;
};

/** Where an order is in its life. Mirrors the union in convex/schema.ts. */
export type OrderStatus =
  | "awaiting_payment"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

/** What the checkout endpoint returns once the order is saved. */
export type PlacedOrder = {
  orderNumber: string;
  /** The secret in the tracking link. Never render it as visible text. */
  trackToken: string;
  status: OrderStatus;
  totals: OrderTotals;
  lines: CartLine[];
  address: ShippingAddress;
  email: string;
  paymentMethod: PaymentMethodId;
  placedAt: number;
};

export type PincodeLookup = {
  pincode: string;
  serviceable: boolean;
  city: string;
  state: string;
  /** Set when the lookup failed and the buyer must type city/state manually. */
  error?: string;
};
