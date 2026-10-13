import { COMMERCE } from "./config";
import type { CartLine, OrderTotals } from "./types";
import type { PaymentMethodId } from "./config";

/** Render a rupee amount the way the rest of the site does: no paise. */
export function formatINR(amount: number): string {
  return `${COMMERCE.currencySymbol}${Math.round(amount).toLocaleString("en-IN")}`;
}

export function lineTotal(line: CartLine): number {
  return line.price * line.qty;
}

function shippingFor(subtotal: number, quoted: number | undefined): number {
  const { mode, flatFee, freeAbove } = COMMERCE.shipping;
  if (subtotal <= 0) return 0;
  // In live mode the amount comes from a stored Shiprocket quote. Until there
  // is one, it contributes nothing and the UI says "calculated at checkout".
  if (mode === "live") return quoted ?? 0;
  if (mode === "free") return 0;
  if (mode === "flat") return flatFee;
  return subtotal >= freeAbove ? 0 : flatFee;
}

function freeShippingGapFor(subtotal: number): number {
  const { mode } = COMMERCE.shipping;
  const freeAbove =
    mode === "live"
      ? COMMERCE.liveRates.freeAbove
      : mode === "threshold"
        ? COMMERCE.shipping.freeAbove
        : 0;
  if (freeAbove <= 0 || subtotal <= 0 || subtotal >= freeAbove) return 0;
  return freeAbove - subtotal;
}

/** True when shipping cannot be shown until the buyer gives a PIN code. */
export function shippingNeedsQuote(): boolean {
  return COMMERCE.shipping.mode === "live";
}

/**
 * Single source of truth for the order summary. The cart page, the drawer,
 * the checkout summary and the server-side order record all call this, so the
 * number the buyer sees and the number that gets recorded cannot drift.
 */
export function computeTotals(
  lines: CartLine[],
  paymentMethod: PaymentMethodId = "razorpay",
  /** Customer shipping fee from a stored quote. Only read in live mode. */
  quotedShipping?: number,
): OrderTotals {
  const subtotal = lines.reduce((sum, l) => sum + lineTotal(l), 0);
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const shipping = shippingFor(subtotal, quotedShipping);

  const { mode: taxMode, ratePct } = COMMERCE.tax;
  const taxableBase = subtotal + shipping;
  const tax = taxMode === "exclusive" ? Math.round((taxableBase * ratePct) / 100) : 0;
  const taxIncluded =
    taxMode === "inclusive"
      ? Math.round(taxableBase - taxableBase / (1 + ratePct / 100))
      : 0;

  const codApplies = paymentMethod === "cod" && COMMERCE.cod.enabled;
  const codFee = codApplies ? COMMERCE.cod.fee : 0;

  return {
    subtotal,
    shipping,
    tax,
    taxIncluded,
    codFee,
    total: subtotal + shipping + tax + codFee,
    itemCount,
    freeShippingGap: freeShippingGapFor(subtotal),
  };
}

/** COD is hidden entirely when disabled, and above the value cap when enabled. */
export function codAvailable(subtotal: number): boolean {
  const { enabled, maxOrderValue } = COMMERCE.cod;
  if (!enabled) return false;
  return maxOrderValue === 0 || subtotal <= maxOrderValue;
}

/** "Arrives 28 Aug – 31 Aug" style copy for the shipping block. */
export function deliveryWindow(from: Date = new Date()): string {
  const [min, max] = COMMERCE.shipping.etaDays;
  const fmt = (days: number) => {
    const d = new Date(from);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };
  return `${fmt(min)} – ${fmt(max)}`;
}

/** One-line shipping promise, phrased from whatever mode config is in. */
export function shippingPromise(): string {
  const { mode, flatFee, freeAbove } = COMMERCE.shipping;
  if (mode === "live") {
    return COMMERCE.liveRates.freeAbove > 0
      ? `Free shipping on orders over ${formatINR(COMMERCE.liveRates.freeAbove)}`
      : `Shipping across ${COMMERCE.country}, calculated at checkout`;
  }
  if (mode === "free") return `Free shipping across ${COMMERCE.country}`;
  if (mode === "flat") return `${formatINR(flatFee)} flat shipping across ${COMMERCE.country}`;
  return `Free shipping on orders over ${formatINR(freeAbove)}`;
}
