"use client";

import { AnimatePresence, motion } from "framer-motion";
import { IconShoppingCart } from "@tabler/icons-react";
import { useCart } from "@/components/cart/cart-context";

/**
 * Desktop cart trigger, rendered inside the floating navbar pill (which is
 * light, hence the dark text). Mobile has its own cart entry in the floating
 * dock.
 */
export default function CartLauncher() {
  const { totals, openCart, hydrated } = useCart();
  const count = totals.itemCount;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={count > 0 ? `Open cart, ${count} ${count === 1 ? "item" : "items"}` : "Open cart"}
      // Padding with matching negative margin gives the hover glow room
      // without shifting the navbar layout. The glow is the salt accent, faint.
      className="-mx-3 -my-1.5 flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-black transition-[background-color,box-shadow] duration-300 hover:bg-white/70 hover:shadow-[0_0_18px_color-mix(in_oklab,var(--color-salt)_45%,transparent)] focus-visible:shadow-[0_0_18px_color-mix(in_oklab,var(--color-salt)_45%,transparent)] focus-visible:outline-none"
    >
      <IconShoppingCart className="h-4 w-4" />
      <span>Cart</span>
      <AnimatePresence>
        {hydrated && count > 0 && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1.5 font-mono-jb text-[0.65rem] text-bone"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
