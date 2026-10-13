"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { IconShieldCheck, IconTruck, IconX } from "@tabler/icons-react";
import { useCart } from "@/components/cart/cart-context";
import QtyStepper from "@/components/cart/qty-stepper";
import { formatINR, lineTotal, shippingPromise } from "@/lib/commerce/pricing";
import { COMMERCE } from "@/lib/commerce/config";
import { useIsDesktop } from "@/lib/use-media-query";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function CartDrawer() {
  const { lines, totals, isOpen, closeCart, setQty, remove, lastAdded } = useCart();
  const { matches: isDesktop } = useIsDesktop();

  // Right-hand panel on desktop, bottom sheet on mobile. Same markup; the
  // entry direction is the only thing that differs.
  const panelMotion = isDesktop
    ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-[1000] bg-ink/80 backdrop-blur-sm"
            aria-hidden
          />

          <motion.aside
            key="cart-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            {...panelMotion}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-[1001] flex max-h-[88vh] flex-col rounded-t-3xl border border-line bg-ink-2 md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[28rem] md:rounded-none md:border-y-0 md:border-r-0"
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-5">
              <div className="flex items-baseline gap-3">
                <h2 className="font-display text-xl text-bone">Your cart</h2>
                {totals.itemCount > 0 && (
                  <span className="font-mono-jb text-xs text-bone-faint">
                    {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-bone-dim transition-colors hover:border-bone/30 hover:text-bone"
              >
                <IconX className="h-4 w-4" />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-16 text-center">
                <span className="kicker">/ Empty</span>
                <p className="max-w-xs text-bone-dim">
                  Nothing in here yet. Two blends, both worth the trip.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="rounded-full bg-bone px-7 py-3 text-sm font-medium text-ink transition-colors hover:bg-salt"
                >
                  Browse the collection
                </Link>
              </div>
            ) : (
              <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-5">
                <ul className="divide-y divide-line">
                  {lines.map((line) => (
                    <li key={line.slug} className="flex gap-4 py-5 first:pt-0">
                      <Link
                        href={`/shop/${line.slug}`}
                        onClick={closeCart}
                        className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border bg-ink-3 transition-colors ${
                          lastAdded === line.slug ? "border-salt/50" : "border-line"
                        }`}
                      >
                        <Image
                          src={line.image}
                          alt={line.name}
                          fill
                          sizes="80px"
                          className="object-contain p-2"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/shop/${line.slug}`}
                              onClick={closeCart}
                              className="block truncate font-medium text-bone hover:text-salt"
                            >
                              {line.name}
                            </Link>
                            <p className="mt-0.5 truncate text-xs text-bone-faint">
                              {line.quantityLabel.replace(/^\/\s*/, "")}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(line.slug)}
                            aria-label={`Remove ${line.name}`}
                            className="shrink-0 text-bone-faint transition-colors hover:text-bone"
                          >
                            <IconX className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <QtyStepper
                            value={line.qty}
                            onChange={(next) => setQty(line.slug, next)}
                            removable
                            size="sm"
                            label={line.name}
                          />
                          <span className="font-mono-jb text-sm tabular-nums text-bone">
                            {formatINR(lineTotal(line))}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lines.length > 0 && (
              <footer className="border-t border-line px-6 pb-7 pt-5">
                {totals.freeShippingGap > 0 && (
                  <p className="mb-4 rounded-xl border border-line bg-ink-3 px-4 py-3 text-xs text-bone-dim">
                    Add {formatINR(totals.freeShippingGap)} more for free shipping.
                  </p>
                )}

                <div className="flex items-baseline justify-between">
                  <span className="text-bone">Subtotal</span>
                  <span className="font-display text-2xl tabular-nums text-bone">
                    {formatINR(totals.subtotal)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-bone-faint">
                  {COMMERCE.tax.mode === "inclusive"
                    ? "Inclusive of all taxes. Shipping calculated at checkout."
                    : `${COMMERCE.tax.label} and shipping calculated at checkout.`}
                </p>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="mt-5 block rounded-full bg-bone py-4 text-center text-base font-medium text-ink transition-colors hover:bg-salt"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="mt-3 block text-center text-sm text-bone-dim underline-offset-4 transition-colors hover:text-bone hover:underline"
                >
                  View full cart
                </Link>

                <div className="mt-6 flex flex-col gap-2 text-xs text-bone-faint">
                  <span className="flex items-center gap-2">
                    <IconTruck className="h-4 w-4" /> {shippingPromise()}
                  </span>
                  <span className="flex items-center gap-2">
                    <IconShieldCheck className="h-4 w-4" />
                    <Link href="/refund-policy" onClick={closeCart} className="hover:text-bone">
                      Refund &amp; return policy
                    </Link>
                  </span>
                </div>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
