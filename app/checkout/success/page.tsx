"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconLoader2,
  IconLock,
  IconMail,
  IconTruck,
} from "@tabler/icons-react";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/ui/footer-modern";
import OrderSummary from "@/components/checkout/order-summary";
import DeliveryWindow from "@/components/checkout/delivery-window";
import { COMMERCE, LAST_ORDER_KEY, PAYMENTS_LIVE } from "@/lib/commerce/config";
import { formatINR } from "@/lib/commerce/pricing";
import { trackingPath } from "@/lib/commerce/tracking";
import type { PlacedOrder } from "@/lib/commerce/types";

/**
 * Where a prepaid order stands, as PhonePe reports it.
 *  offline  — COD, or payments are switched off: nothing to check.
 *  checking — first question to PhonePe still in flight.
 *  paid     — confirmed.
 *  waiting  — PhonePe has not settled it yet (UPI can take a few seconds).
 *  unpaid   — no payment, a failed one, or one never started.
 *  error    — we could not reach PhonePe.
 */
type Phase = "offline" | "checking" | "paid" | "waiting" | "unpaid" | "error";

/** Re-ask every few seconds while PhonePe says pending, then offer a retry. */
const POLL_MS = 3000;
const POLLS_BEFORE_RETRY = 10;

type StatusResult = {
  paymentStatus?: string;
  gateway?: "NONE" | "PENDING" | "COMPLETED" | "FAILED" | "UNKNOWN";
  error?: string;
};

type PayResult = { kind?: "redirect" | "paid" | "closed"; url?: string; error?: string };

async function paymentRequest<T>(order: PlacedOrder, intent: "status" | "pay"): Promise<T> {
  const response = await fetch("/api/payment", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ orderNumber: order.orderNumber, token: order.trackToken, intent }),
  });
  const result = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(result.error || "We could not reach the payment service.");
  return result;
}

function headline(phase: Phase, stuck: boolean, order: PlacedOrder) {
  const firstName = order.address.fullName ? `, ${order.address.fullName.split(" ")[0]}` : "";
  switch (phase) {
    case "paid":
      return {
        kicker: "Payment received",
        title: `Thank you${firstName}.`,
        body: "Your payment is confirmed and your order is in our dispatch queue. A confirmation email is on its way.",
      };
    case "checking":
      return {
        kicker: "Confirming payment",
        title: "One moment.",
        body: "Checking your payment with PhonePe.",
      };
    case "waiting":
      return {
        kicker: "Payment processing",
        title: "Waiting for PhonePe.",
        body: stuck
          ? "PhonePe hasn't confirmed this payment yet. If money left your account, the order confirms itself and we email you, so don't pay twice. If you didn't finish paying, try again."
          : "This usually takes a few seconds. Please don't pay again or close this page yet.",
      };
    case "unpaid":
      return {
        kicker: "Payment not completed",
        title: "Your order is saved, but not paid.",
        body: "Nothing has been charged. Pay now to confirm it; we only ship paid orders.",
      };
    case "error":
      return {
        kicker: "Order saved",
        title: "We couldn't check your payment.",
        body: "Your order is safe. Check again in a moment. If you paid, the order confirms itself and we email you.",
      };
    default:
      return {
        kicker: "Order received",
        title: `Thank you${firstName}.`,
        body:
          order.paymentMethod === "cod"
            ? "Your order is confirmed. You pay the courier when it arrives."
            : "Your order is saved and waiting for payment. Nothing has been charged yet.",
      };
  }
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [phase, setPhase] = useState<Phase>("offline");
  const [stuck, setStuck] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payProblem, setPayProblem] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkPayment = useCallback(async (placed: PlacedOrder, round: number) => {
    if (round === 0) {
      setPhase("checking");
      setStuck(false);
    }
    try {
      const result = await paymentRequest<StatusResult>(placed, "status");
      if (result.paymentStatus === "paid") return setPhase("paid");
      if (result.gateway === "NONE" || result.gateway === "FAILED") return setPhase("unpaid");

      setPhase("waiting");
      if (round + 1 >= POLLS_BEFORE_RETRY) return setStuck(true);
      pollRef.current = setTimeout(() => void checkPayment(placed, round + 1), POLL_MS);
    } catch {
      setPhase("error");
    }
  }, []);

  // The order itself is saved in Convex. This is the copy the checkout left
  // behind: it renders the page without a round trip, and carries the
  // tracking token needed to ask about the payment, across the trip to
  // PhonePe and back (same tab, so sessionStorage survives it).
  useEffect(() => {
    let placed: PlacedOrder | null = null;
    try {
      const raw = window.sessionStorage.getItem(LAST_ORDER_KEY);
      if (raw) placed = JSON.parse(raw) as PlacedOrder;
    } catch {
      placed = null;
    }
    setOrder(placed);
    setReady(true);
    if (placed && PAYMENTS_LIVE && placed.paymentMethod !== "cod") {
      void checkPayment(placed, 0);
    }
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [checkPayment]);

  const payNow = async () => {
    if (!order) return;
    if (pollRef.current) clearTimeout(pollRef.current);
    setPaying(true);
    setPayProblem(null);
    try {
      const result = await paymentRequest<PayResult>(order, "pay");
      if (result.kind === "redirect" && result.url) {
        window.location.assign(result.url);
        return; // leave the spinner on while the page unloads
      }
      // Paid after all, or no longer payable: show what the order says now.
      await checkPayment(order, 0);
    } catch (error) {
      setPayProblem(
        error instanceof Error && error.message
          ? error.message
          : "We could not open the payment page. Try again.",
      );
    }
    setPaying(false);
  };

  const trackPath = order ? trackingPath(order.orderNumber, order.trackToken) : "";
  const confirmed = phase === "paid" || (phase === "offline" && order?.paymentMethod === "cod");
  const copy = order ? headline(phase, stuck, order) : null;

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
        ) : !order || !copy ? (
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
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full ${
                    confirmed || phase === "offline" ? "bg-salt" : "bg-ink-3"
                  }`}
                >
                  {confirmed || phase === "offline" ? (
                    <IconCheck className="h-3 w-3 text-ink" />
                  ) : phase === "checking" || phase === "waiting" ? (
                    <IconLoader2 className="h-3 w-3 animate-spin text-bone-dim" />
                  ) : (
                    <IconAlertCircle className="h-3 w-3 text-bone-dim" />
                  )}
                </span>
                <span className="kicker !text-bone-dim">/ {copy.kicker}</span>
              </span>

              <h1 className="display-xl mt-6 text-4xl text-bone md:text-6xl">{copy.title}</h1>

              <p className="mt-5 max-w-xl text-lg text-bone-dim" aria-live="polite">
                {copy.body}
              </p>

              {payProblem && (
                <p className="mt-3 max-w-xl text-sm text-bone-dim" role="alert">
                  {payProblem}
                </p>
              )}

              {(phase === "unpaid" || (phase === "waiting" && stuck)) && (
                <button
                  type="button"
                  onClick={payNow}
                  disabled={paying}
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-bone px-8 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-salt disabled:opacity-60"
                >
                  {paying ? (
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconLock className="h-4 w-4" />
                  )}
                  {phase === "unpaid" ? "Pay" : "Try paying again"} &middot;{" "}
                  {formatINR(order.totals.total)}
                </button>
              )}

              {phase === "error" && (
                <button
                  type="button"
                  onClick={() => void checkPayment(order, 0)}
                  className="mt-7 rounded-full border border-line px-8 py-3.5 text-sm text-bone-dim transition-colors hover:border-bone/30 hover:text-bone"
                >
                  Check again
                </button>
              )}

              <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
                <div className="bg-ink p-5">
                  <dt className="text-xs text-bone-faint">Order number</dt>
                  <dd className="mt-1 font-mono-jb text-sm text-bone">{order.orderNumber}</dd>
                </div>
                <div className="bg-ink p-5">
                  <dt className="text-xs text-bone-faint">Status</dt>
                  <dd className="mt-1 font-mono-jb text-sm text-bone">
                    {confirmed ? "Confirmed" : "Awaiting payment"}
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
