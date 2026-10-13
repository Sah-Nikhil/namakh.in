"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconCheck,
  IconLoader2,
  IconLock,
  IconTruck,
} from "@tabler/icons-react";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/ui/footer-modern";
import { useCart } from "@/components/cart/cart-context";
import AddressForm from "@/components/checkout/address-form";
import PaymentBlock from "@/components/checkout/payment-block";
import OrderSummary from "@/components/checkout/order-summary";
import { CheckboxField, CheckoutSection, TextField } from "@/components/checkout/field";
import { useCheckoutDraft } from "@/components/checkout/use-checkout-draft";
import { computeTotals, formatINR, shippingNeedsQuote } from "@/lib/commerce/pricing";
import { useShippingQuote } from "@/components/checkout/use-shipping-quote";
import DeliveryWindow from "@/components/checkout/delivery-window";
import {
  hasErrors,
  validateAddress,
  validateDraft,
  normalisePhone,
  validateEmail,
  type FieldErrors,
} from "@/lib/commerce/validation";
import { COMMERCE, LAST_ORDER_KEY } from "@/lib/commerce/config";
import type { PlacedOrder } from "@/lib/commerce/types";
import { useIsDesktop } from "@/lib/use-media-query";

const STEPS = ["Delivery", "Shipping", "Payment"] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, hydrated, clear } = useCart();
  const { draft, hydrated: draftHydrated, patchDraft, patchAddress, clearDraft } =
    useCheckoutDraft();
  const { matches: isDesktop, ready: breakpointReady } = useIsDesktop();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Set the moment an order is accepted, so the empty-cart guard below does
  // not bounce the buyer back to /cart while we navigate to the confirmation.
  const placedRef = useRef(false);

  // Live shipping: the price comes from a quote stored on the server, keyed
  // by quoteId. The amount here is display only; the order is charged from
  // the stored row.
  const needsQuote = shippingNeedsQuote();
  const { state: quoteState, refresh: refreshQuote } = useShippingQuote(
    draft.address.pincode,
    lines,
  );
  const quote = quoteState.status === "ready" ? quoteState.quote : null;
  const shippingReady = !needsQuote || quote !== null;

  const totals = useMemo(
    () => computeTotals(lines, draft.paymentMethod, quote?.amount),
    [lines, draft.paymentMethod, quote?.amount],
  );

  const shippingLabel = !needsQuote || quote
    ? undefined
    : quoteState.status === "loading"
      ? "Calculating…"
      : quoteState.status === "unserviceable"
        ? "Not available"
        : quoteState.status === "error"
          ? "Unavailable"
          : "Enter PIN code";

  // An empty cart has nothing to check out. Wait for hydration first, or this
  // fires against the empty initial state on every page load.
  useEffect(() => {
    if (hydrated && lines.length === 0 && !placedRef.current) {
      router.replace("/cart");
    }
  }, [hydrated, lines.length, router]);

  const validateStep = useCallback(
    (index: number): FieldErrors => {
      if (index === 0) {
        const stepErrors: FieldErrors = { ...validateAddress(draft.address) };
        const emailError = validateEmail(draft.email);
        if (emailError) stepErrors.email = emailError;
        return stepErrors;
      }
      if (index === 2) return validateDraft(draft);
      return {};
    },
    [draft],
  );

  const goToStep = (next: number) => {
    if (next > step) {
      const stepErrors = validateStep(step);
      setErrors(stepErrors);
      if (hasErrors(stepErrors)) return;
      if (step === 1 && !shippingReady) {
        setFormError(
          quoteState.status === "unserviceable"
            ? quoteState.message
            : "Shipping hasn't been priced yet. Give it a moment, or check your PIN code.",
        );
        return;
      }
    }
    setErrors({});
    setFormError(null);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = async () => {
    const allErrors = validateDraft(draft);
    setErrors(allErrors);
    if (hasErrors(allErrors)) {
      setFormError("Some details are missing. Check the highlighted fields.");
      if (!isDesktop) setStep(0);
      return;
    }

    if (!shippingReady) {
      setFormError(
        quoteState.status === "unserviceable"
          ? quoteState.message
          : "Shipping hasn't been priced yet. Check your PIN code.",
      );
      return;
    }

    setSubmitting(true);
    setFormError(null);

    // Store one canonical form of the number, not whatever spacing was typed.
    const submitted = {
      ...draft,
      address: { ...draft.address, phone: normalisePhone(draft.address.phone) },
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ slug: l.slug, qty: l.qty })),
          draft: submitted,
          quoteId: quote?.quoteId,
        }),
      });

      const payload = (await response.json()) as PlacedOrder & {
        error?: string;
        errors?: FieldErrors;
      };

      if (!response.ok) {
        setErrors(payload.errors ?? {});
        setFormError(payload.error ?? "We could not place that order. Try again.");
        // Every shipping rejection (expired, wrong PIN, cart changed) is fixed
        // by pricing again, so do that rather than leave the buyer stuck.
        if (payload.error && /shipping/i.test(payload.error)) refreshQuote();
        return;
      }

      placedRef.current = true;
      // The order is saved in Convex now. This copy only saves the confirmation
      // page a round trip; it is not the record of the order.
      window.sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(payload));
      clear();
      clearDraft();
      router.push(`/checkout/success?order=${encodeURIComponent(payload.orderNumber)}`);
    } catch {
      setFormError("Network problem. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Until the breakpoint resolves, render the desktop layout: it shows every
  // section, so nothing is hidden if a buyer lands mid-measurement.
  const stepped = breakpointReady && !isDesktop;
  const showStep = (index: number) => !stepped || step === index;

  const contactSection = (
    <CheckoutSection index={1} title="Contact">
      <div className="space-y-4">
        <TextField
          id="email"
          label="Email"
          value={draft.email}
          onChange={(v) => patchDraft({ email: v })}
          error={errors.email}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          hint="Your order confirmation and tracking go here."
        />
        <CheckboxField
          id="marketing"
          checked={draft.marketingOptIn}
          onChange={(v) => patchDraft({ marketingOptIn: v })}
          label="Email me hydration notes and new blend launches. No spam, unsubscribe anytime."
        />
      </div>
    </CheckoutSection>
  );

  const addressSection = (
    <CheckoutSection index={2} title="Delivery address">
      <AddressForm address={draft.address} onChange={patchAddress} errors={errors} />
    </CheckoutSection>
  );

  const shippingSection = (
    <CheckoutSection index={3} title="Shipping">
      {needsQuote && quoteState.status === "unserviceable" ? (
        <p
          role="alert"
          className="rounded-2xl border border-[var(--color-sports)]/40 bg-ink-3 px-5 py-4 text-sm text-[var(--color-sports)]"
        >
          {quoteState.message}
        </p>
      ) : needsQuote && !quote ? (
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-ink-3 px-5 py-4 text-sm text-bone-dim">
          {quoteState.status === "loading" ? (
            <>
              <IconLoader2 className="h-4 w-4 animate-spin" /> Working out shipping to{" "}
              {draft.address.pincode}…
            </>
          ) : quoteState.status === "error" ? (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {quoteState.message}
              <button
                type="button"
                onClick={refreshQuote}
                className="text-bone underline underline-offset-2"
              >
                Try again
              </button>
            </span>
          ) : (
            <>
              <IconTruck className="h-4 w-4 shrink-0" /> Enter your PIN code above to see
              shipping.
            </>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-bone/40 bg-ink-3 px-5 py-4">
          <div className="flex items-start gap-3">
            <IconTruck className="mt-0.5 h-5 w-5 shrink-0 text-bone-dim" />
            <div className="flex-1">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm text-bone">Standard delivery</span>
                <span className="font-mono-jb text-sm text-bone">
                  {totals.shipping === 0 ? "Free" : formatINR(totals.shipping)}
                </span>
              </div>
              <p className="mt-1 text-xs text-bone-faint">
                {quote?.estimatedDays
                  ? `Arrives in about ${quote.estimatedDays} ${quote.estimatedDays === 1 ? "day" : "days"} after dispatch.`
                  : (
                    <>
                      Arrives <DeliveryWindow />.
                    </>
                  )}{" "}
                {COMMERCE.shipping.dispatchNote}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-xs text-bone-dim">
          Delivery instructions (optional)
        </label>
        <textarea
          id="notes"
          value={draft.notes}
          onChange={(e) => patchDraft({ notes: e.target.value })}
          rows={3}
          placeholder="Gate code, preferred time, anything the courier should know."
          className="w-full resize-none rounded-xl border border-line bg-ink-3 px-4 py-3.5 text-bone outline-none transition-colors placeholder:text-bone-faint focus:border-bone/40 focus:ring-1 focus:ring-bone/10"
        />
      </div>
    </CheckoutSection>
  );

  const paymentSection = (
    <CheckoutSection index={4} title="Payment">
      <PaymentBlock
        method={draft.paymentMethod}
        onChange={(method) => patchDraft({ paymentMethod: method })}
        subtotal={totals.subtotal}
      />
    </CheckoutSection>
  );

  const placeOrderButton = (
    <button
      type="button"
      onClick={placeOrder}
      disabled={submitting || lines.length === 0 || !shippingReady}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-bone py-4 text-base font-medium text-ink transition-colors hover:bg-salt disabled:cursor-not-allowed disabled:opacity-60"
    >
      {submitting ? (
        <>
          <IconLoader2 className="h-4 w-4 animate-spin" /> Placing order…
        </>
      ) : !shippingReady ? (
        // No total exists until shipping is priced, so don't show one.
        <>Add your PIN code to see the total</>
      ) : (
        <>
          <IconLock className="h-4 w-4" /> Place order &middot; {formatINR(totals.total)}
        </>
      )}
    </button>
  );

  if (!hydrated || !draftHydrated) {
    return (
      <div className="grain relative min-h-screen bg-ink text-bone font-sans">
        <Navbar />
        <main className="relative z-[2] mx-auto max-w-6xl px-5 pt-40 md:px-10">
          <div className="h-96 animate-pulse rounded-3xl border border-line bg-ink-2" />
        </main>
      </div>
    );
  }

  return (
    <div className="grain relative min-h-screen bg-ink text-bone font-sans">
      <Navbar />
      <MobileNav />

      <main className="relative z-[2] mx-auto max-w-6xl px-5 pb-40 pt-28 md:px-10 md:pt-40 md:pb-28">
        <header className="mb-8 md:mb-14">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-bone-dim transition-colors hover:text-bone"
          >
            <IconArrowLeft className="h-4 w-4" /> Back to cart
          </Link>
          <h1 className="display-xl mt-5 text-4xl text-bone md:text-6xl">Checkout</h1>
        </header>

        {/* Mobile: three gated steps. Desktop renders every section at once. */}
        {stepped && (
          <ol className="mb-8 flex items-center gap-2">
            {STEPS.map((label, index) => {
              const done = index < step;
              const active = index === step;
              return (
                <li key={label} className="flex flex-1 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => index < step && goToStep(index)}
                    disabled={index > step}
                    className={`flex w-full items-center gap-2 rounded-full border px-3 py-2 text-left text-xs transition-colors ${
                      active
                        ? "border-bone/40 bg-ink-3 text-bone"
                        : done
                          ? "border-line text-bone-dim"
                          : "border-line text-bone-faint"
                    }`}
                  >
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full font-mono-jb text-[0.65rem] ${
                        done ? "bg-salt text-ink" : active ? "bg-bone text-ink" : "bg-ink-3 text-bone-faint"
                      }`}
                    >
                      {done ? <IconCheck className="h-3 w-3" /> : index + 1}
                    </span>
                    <span className="truncate">{label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-8 lg:col-span-7 lg:space-y-10 xl:col-span-7">
            {showStep(0) && contactSection}
            {showStep(0) && addressSection}
            {showStep(1) && shippingSection}
            {showStep(2) && paymentSection}

            {formError && (
              <p
                role="alert"
                className="rounded-xl border border-[var(--color-sports)]/40 bg-ink-2 px-4 py-3 text-sm text-[var(--color-sports)]"
              >
                {formError}
              </p>
            )}
          </div>

          <aside className="lg:col-span-5 xl:col-span-5">
            <div className="lg:sticky lg:top-28">
              {/* On mobile the summary is only worth the space on the last step. */}
              {(!stepped || step === 2) && (
                <>
                  <OrderSummary
                    lines={lines}
                    totals={totals}
                    showTerms
                    shippingLabel={shippingLabel}
                  />
                  {!stepped && <div className="mt-5">{placeOrderButton}</div>}
                </>
              )}
            </div>
          </aside>
        </div>
      </main>

      {stepped && (
        <div className="fixed inset-x-0 bottom-0 z-[900] border-t border-line bg-ink-2/95 px-5 pb-24 pt-4 backdrop-blur-md">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-xs text-bone-dim">
              {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
            </span>
            <span className="font-display text-xl tabular-nums text-bone">
              {formatINR(totals.total)}
            </span>
          </div>
          {step < 2 ? (
            <button
              type="button"
              onClick={() => goToStep(step + 1)}
              className="w-full rounded-full bg-bone py-4 text-base font-medium text-ink transition-colors hover:bg-salt"
            >
              Continue to {STEPS[step + 1]}
            </button>
          ) : (
            placeOrderButton
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
