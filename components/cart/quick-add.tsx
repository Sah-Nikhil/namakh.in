"use client";

import { IconPlus } from "@tabler/icons-react";
import { useCart } from "@/components/cart/cart-context";
import type { Product } from "@/lib/products";

/**
 * Add straight from a shop card. The card itself is a link to the product, so
 * the click has to be stopped here or the buyer gets navigated away mid-add.
 */
export default function QuickAdd({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(product);
      }}
      aria-label={`Add ${product.name} to cart`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-ink-3 px-4 py-2 text-xs text-bone-dim transition-colors hover:border-bone/30 hover:text-bone"
    >
      <IconPlus className="h-3.5 w-3.5" /> Add
    </button>
  );
}
