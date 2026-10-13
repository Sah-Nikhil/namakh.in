"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconCheck, IconCopy, IconMail, IconTruck } from "@tabler/icons-react";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/ui/footer-modern";
import OrderSummary from "@/components/checkout/order-summary";
import DeliveryWindow from "@/components/checkout/delivery-window";
import { COMMERCE, LAST_ORDER_KEY, PAYMENTS_LIVE } from "@/lib/commerce/config";
import { trackingPath } from "@/lib/commerce/tracking";
import type { PlacedOrder } from "@/lib/commerce/types";

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  // The order itself is saved in Convex. This is only the copy the checkout
  // left behind, so the page renders without a round trip.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(LAST_ORDER_KEY);
      if (raw) setOrder(JSON.parse(raw) as PlacedOrder);
    } catch {
      setOrder(null);
    }
    setReady(true);
  }, []);

  const trackPath = order ? trackingPath(order.orderNumber, order.trackToken) : "";

  const copyTrackingLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${trackPath}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grain relative min-h-screen bg-ink text-bone font-sans">
      <Navbar />
      <MobileNav />

      <main className="relative z-[2] mx-auto max-w-4xl px-5 pb-32 pt-28 md:px-10 md:pt-40">
        {!ready ? (
          <div className="h-72 animate-pulse rounded-3xl border border-line bg-ink-2" />
        ) : !order ? (
          <div className="rounded-3xl border border-line bg-ink-2 px-7 py-14 md:px-12">
            <span className="kicker">/ Order</span>
            <h1 className="display-xl mt-4 text-3xl text-bone md:text-5xl">
              Nothing to show here
            </h1>
            <p className="mt-5 max-w-lg text-bone-dim">
              This page only shows an order right after you place it. Your order is safe. Look
              it up with your order number and email, or write to us at{" "}
              <a
                href={`mailto:${COMMERCE.support.email}`}
                className="text-bone underline underline-offset-2"
              >
                {COMMERCE.support.email}
              </a>
              .
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/track"
                className="rounded-full bg-bone px-8 py-3.5 text-center text-sm font-medium text-ink transition-colors hover:bg-salt"
              >
                Track an order
              </Link>
              <Link
                href="/shop"
                className="rounded-full border border-line px-8 py-3.5 text-center text-sm text-bone-dim transition-colors hover:border-bone/30 hover:text-bone"
              >
                Back to the shop
              </Link>
            </div>
          </div>
        ) : (
          <>
            <header>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-ink-2 px-4 py-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-salt">
                  <IconCheck className="h-3 w-3 text-ink" />
                </span>
                <span className="kicker !text-bone-dim">/ Order received</span>
              </span>

              <h1 className="display-xl mt-6 text-4xl text-bone md:text-6xl">
                Thank you
                {order.address.fullName ? `, ${order.address.fullName.split(" ")[0]}` : ""}.
              </h1>

              <p className="mt-5 max-w-xl text-lg text-bone-dim">
                {PAYMENTS_LIVE
                  ? "Your payment is confirmed and your order is in our dispatch queue."
                  : "Your order is saved and held for payment. We will email you a secure payment link shortly, and pack it the moment payment lands."}
              </p>

              <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
                <div className="bg-ink p-5">
                  <dt className="text-xs text-bone-faint">Order number</dt>
                  <dd className="mt-1 font-mono-jb text-sm text-bone">{order.orderNumber}</dd>
                </div>
                <div className="bg-ink p-5">
                  <dt className="text-xs text-bone-faint">Status</dt>
                  <dd className="mt-1 font-mono-jb text-sm text-bone">
                    {order.status === "awaiting_payment" ? "Awaiting payment" : "Confirmed"}
                  </dd>
                </div>
                <div className="bg-ink p-5">
                  <dt className="text-xs text-bone-faint">Estimated delivery</dt>
                  <dd className="mt-1 font-mono-jb text-sm text-bone">
                    <DeliveryWindow />
                  </dd>
                </div>
              </dl>
            </header>

            <div className="mt-8 rounded-2xl border border-line bg-ink-2 p-6">
              <h2 className="font-display text-lg text-bone">Track this order</h2>
              <p className="mt-2 text-sm text-bone-dim">
                Bookmark this link. It works from any device, and no login is needed.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={trackPath}
                  className="rounded-full bg-bone px-7 py-3 text-center text-sm font-medium text-ink transition-colors hover:bg-salt"
                >
                  Open tracking
                </Link>
                <button
                  type="button"
                  onClick={copyTrackingLink}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-7 py-3 text-sm text-bone-dim transition-colors hover:border-bone/30 hover:text-bone"
                >
                  {copied ? (
                    <>
                      <IconCheck className="h-4 w-4" /> Copied
                    </>
                  ) : (
                    <>
                      <IconCopy className="h-4 w-4" /> Copy link
                    </>
                  )}
                </button>
              </div>
              <p className="mt-4 text-xs text-bone-faint">
                Lost it? Go to{" "}
                <Link href="/track" className="text-bone-dim underline underline-offset-2">
                  /track
                </Link>{" "}
                and enter your order number and email.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-3xl border border-line bg-ink-2 p-6 md:p-7">
                <h2 className="font-display text-lg text-bone">Delivering to</h2>
                <address className="mt-4 text-sm not-italic leading-relaxed text-bone-dim">
                  {order.address.fullName}
                  <br />
                  {order.address.line1}
                  {order.address.line2 && (
                    <>
                      <br />
                      {order.address.line2}
                    </>
                  )}
                  <br />
                  {order.address.city}, {order.address.state} {order.address.pincode}
                  <br />
                  {order.address.country}
                  <br />
                  {order.address.phone}
                </address>

                <div className="mt-6 space-y-2.5 border-t border-line pt-5 text-xs text-bone-faint">
                  <p className="flex items-start gap-2">
                    <IconMail className="mt-0.5 h-4 w-4 shrink-0" />
                    Confirmation goes to {order.email}
                  </p>
                  <p className="flex items-start gap-2">
                    <IconTruck className="mt-0.5 h-4 w-4 shrink-0" />
                    {COMMERCE.shipping.dispatchNote}
                  </p>
                </div>
              </div>

              <OrderSummary
                lines={order.lines}
                totals={order.totals}
                title="What you ordered"
              />
            </div>

            <div className="mt-12 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="rounded-full bg-bone px-8 py-3.5 text-center text-sm font-medium text-ink transition-colors hover:bg-salt"
              >
                Continue shopping
              </Link>
              <a
                href={`mailto:${COMMERCE.support.email}?subject=Order%20${order.orderNumber}`}
                className="rounded-full border border-line px-8 py-3.5 text-center text-sm text-bone-dim transition-colors hover:border-bone/30 hover:text-bone"
              >
                Question about this order
              </a>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
