"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import QtyStepper from "@/components/cart/qty-stepper";
import { formatINR, shippingPromise } from "@/lib/commerce/pricing";
import type { Product } from "@/lib/products";

/**
 * Product-page buy block: pick a quantity, add, and the drawer takes over.
 * The stepper resets to 1 after each add so a second add is not a surprise.
 */
export default function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3">
        <QtyStepper
          value={qty}
          onChange={setQty}
          label={product.name}
          className="shrink-0"
        />
        <button
          type="button"
          onClick={() => {
            add(product, qty);
            setQty(1);
          }}
          className="flex-1 rounded-full bg-bone py-4 text-base font-medium text-ink transition-colors hover:bg-salt md:text-lg"
        >
          Add to cart &mdash; {formatINR(product.price * qty)}
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-bone-faint">
        {shippingPromise()} &middot; dispatched in 2&ndash;3 business days
      </p>
    </div>
  );
}
