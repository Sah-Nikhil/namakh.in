"use client";

import { AnimatePresence, motion } from "framer-motion";
import { IconShoppingCart } from "@tabler/icons-react";
import { useCart } from "@/components/cart/cart-context";

/**
 * Desktop cart trigger. Sits opposite the floating navbar; mobile already has
 * a cart entry in the floating dock, so this is hidden below md.
 */
export default function CartLauncher() {
  const { totals, openCart, isOpen, hydrated } = useCart();
  const count = totals.itemCount;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={count > 0 ? `Open cart, ${count} items` : "Open cart"}
      className={`fixed right-7 top-7 z-[999] hidden h-12 items-center gap-2 rounded-full border border-line bg-ink-2/90 px-5 text-sm text-bone backdrop-blur-md transition-all hover:border-bone/30 md:flex ${
        isOpen ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <IconShoppingCart className="h-4 w-4" />
      <span>Cart</span>
      <AnimatePresence>
        {hydrated && count > 0 && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="grid h-5 min-w-5 place-items-center rounded-full bg-salt px-1.5 font-mono-jb text-[0.65rem] text-ink"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
