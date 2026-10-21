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
      aria-label={count > 0 ? `Open cart, ${count} items` : "Open cart"}
      className="flex cursor-pointer items-center gap-2 text-black hover:opacity-[0.9]"
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
