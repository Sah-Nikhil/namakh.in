import { COMMERCE } from "../commerce/config";
import { getProductBySlug } from "../products";

/**
 * Pure helpers shared by checkout (Next) and the backend (Convex). No `next/*`
 * imports here, ever — Convex bundles this file too.
 */

export type Parcel = {
  weightGrams: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
};

/**
 * The parcel for a whole cart. Packs are assumed to stack: footprint is the
 * largest pack's, height is the sum. That over-estimates volume slightly for
 * mixed carts, which errs toward a quote the courier will honour.
 */
export function parcelFor(items: { slug: string; qty: number }[]): Parcel {
  let weightGrams = 0;
  let lengthCm = 0;
  let breadthCm = 0;
  let heightCm = 0;

  for (const item of items) {
    const product = getProductBySlug(item.slug);
    if (!product) continue;
    const { parcel } = product;
    weightGrams += parcel.weightGrams * item.qty;
    lengthCm = Math.max(lengthCm, parcel.lengthCm);
    breadthCm = Math.max(breadthCm, parcel.breadthCm);
    heightCm += parcel.heightCm * item.qty;
  }

  return { weightGrams, lengthCm, breadthCm, heightCm };
}

/**
 * Courier rate → what the buyer pays. Markup, rounding and the free-shipping
 * threshold all come from COMMERCE.liveRates so the client can tune them.
 */
export function customerShippingFee(courierRate: number, subtotal: number): number {
  const { markupPct, roundUpTo, freeAbove } = COMMERCE.liveRates;
  if (freeAbove > 0 && subtotal >= freeAbove) return 0;

  const marked = courierRate * (1 + markupPct / 100);
  const step = Math.max(1, roundUpTo);
  return Math.max(0, Math.ceil(marked / step) * step);
}

/**
 * What the buyer pays when Shiprocket can't be reached. This is already a
 * customer price, so markup and rounding don't apply — only the free-shipping
 * threshold does. (Routing it through customerShippingFee once turned a
 * configured ₹79 into a charged ₹80.)
 */
export function fallbackShippingFee(subtotal: number): number {
  const { fallbackFee, freeAbove } = COMMERCE.liveRates;
  if (freeAbove > 0 && subtotal >= freeAbove) return 0;
  return fallbackFee;
}
