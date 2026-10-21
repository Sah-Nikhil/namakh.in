"use client";

import Image from "next/image";
import Link from "next/link";
import { IconArrowLeft, IconTrash } from "@tabler/icons-react";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/ui/footer-modern";
import { useCart } from "@/components/cart/cart-context";
import QtyStepper from "@/components/cart/qty-stepper";
import OrderSummary from "@/components/checkout/order-summary";
import { formatINR, lineTotal, shippingNeedsQuote, shippingPromise } from "@/lib/commerce/pricing";

export default function CartPage() {
  const { lines, totals, hydrated, setQty, remove } = useCart();

  return (
    <div className="grain relative min-h-screen bg-ink text-bone font-sans">
      <Navbar />
      <MobileNav />

      <main className="relative z-[2] mx-auto max-w-6xl px-5 pb-32 pt-28 md:px-10 md:pt-40">
        <header className="mb-10 md:mb-14">
          <span className="kicker">/ Cart</span>
          <h1 className="display-xl mt-4 text-4xl text-bone md:text-6xl">
            Your cart
          </h1>
        </header>

        {!hydrated ? (
          <div className="h-64 animate-pulse rounded-3xl border border-line bg-ink-2" />
        ) : lines.length === 0 ? (
          <div className="flex flex-col items-start gap-6 rounded-3xl border border-line bg-ink-2 px-7 py-16 md:px-12">
            <span className="kicker">/ Empty</span>
            <p className="max-w-md text-lg text-bone-dim">
              Your cart is empty. Two blends, one for the everyday and one for the days that
              take everything out of you.
            </p>
            <Link
              href="/shop"
              className="rounded-full bg-bone px-8 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-salt"
            >
              Browse the collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7 xl:col-span-8">
              <ul className="divide-y divide-line border-y border-line">
                {lines.map((line) => (
                  <li
                    key={line.slug}
                    className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:gap-7"
                  >
                    <Link
                      href={`/shop/${line.slug}`}
                      className="relative h-32 w-28 shrink-0 overflow-hidden rounded-2xl border border-line bg-ink-2 transition-colors hover:border-bone/25"
                    >
                      <Image
                        src={line.image}
                        alt={line.name}
                        fill
                        sizes="112px"
                        className="object-contain p-3"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/shop/${line.slug}`}
                        className="font-display text-xl text-bone transition-colors hover:text-salt"
                      >
                        {line.name}
                      </Link>
                      <p className="mt-1 text-sm text-bone-faint">
                        {line.quantityLabel.replace(/^\/\s*/, "")}
                      </p>
                      <p className="mt-1 font-mono-jb text-sm text-bone-dim">
                        {formatINR(line.price)} each
                      </p>

                      <div className="mt-4 flex items-center gap-4">
                        <QtyStepper
                          value={line.qty}
                          onChange={(next) => setQty(line.slug, next)}
                          label={line.name}
                          size="sm"
                        />
                        <button
                          type="button"
                          onClick={() => remove(line.slug)}
                          className="flex items-center gap-1.5 text-xs text-bone-faint transition-colors hover:text-bone"
                        >
                          <IconTrash className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    </div>

                    <span className="font-display text-2xl tabular-nums text-bone sm:text-right">
                      {formatINR(lineTotal(line))}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/shop"
                className="mt-8 inline-flex items-center gap-2 text-sm text-bone-dim transition-colors hover:text-bone"
              >
                <IconArrowLeft className="h-4 w-4" /> Continue shopping
              </Link>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <div className="lg:sticky lg:top-28">
                <OrderSummary
                  lines={lines}
                  totals={totals}
                  showLines={false}
                  shippingLabel={shippingNeedsQuote() ? "Calculated at checkout" : undefined}
                />

                <Link
                  href="/checkout"
                  className="mt-5 block rounded-full bg-bone py-4 text-center text-base font-medium text-ink transition-colors hover:bg-salt"
                >
                  Proceed to checkout
                </Link>
                <p className="mt-3 text-center text-xs text-bone-faint">
                  {shippingPromise()} &middot; dispatched in 2&ndash;3 business days
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
