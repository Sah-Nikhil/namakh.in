"use client";

import { IconCash, IconLock, IconShieldCheck } from "@tabler/icons-react";
import { COMMERCE, PAYMENTS_LIVE, type PaymentMethodId } from "@/lib/commerce/config";
import { codAvailable, formatINR } from "@/lib/commerce/pricing";

const RAILS = ["UPI", "Cards", "Net banking"];

function Option({
  active,
  onSelect,
  title,
  meta,
  children,
}: {
  active: boolean;
  onSelect: () => void;
  title: string;
  meta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-colors ${
        active ? "border-bone/40 bg-ink-3" : "border-line bg-ink-2"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span
          className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors ${
            active ? "border-salt" : "border-bone-faint"
          }`}
        >
          {active && <span className="h-2 w-2 rounded-full bg-salt" />}
        </span>
        <span className="flex-1 text-sm text-bone">{title}</span>
        {meta}
      </button>
      {active && children && (
        <div className="border-t border-line px-5 py-4">{children}</div>
      )}
    </div>
  );
}

export default function PaymentBlock({
  method,
  onChange,
  subtotal,
}: {
  method: PaymentMethodId;
  onChange: (method: PaymentMethodId) => void;
  subtotal: number;
}) {
  const showCod = codAvailable(subtotal);

  return (
    <div className="space-y-3">
      <Option
        // Anything but COD is online: a draft saved before the switch from
        // Razorpay still says "razorpay" and should land here.
        active={method !== "cod"}
        onSelect={() => onChange("phonepe")}
        title="Pay online with PhonePe"
        meta={
          <span className="hidden gap-1.5 sm:flex">
            {RAILS.map((rail) => (
              <span
                key={rail}
                className="rounded-md border border-line px-2 py-1 text-[0.65rem] text-bone-faint"
              >
                {rail}
              </span>
            ))}
          </span>
        }
      >
        <p className="flex items-start gap-2 text-xs leading-relaxed text-bone-dim">
          <IconLock className="mt-0.5 h-4 w-4 shrink-0" />
          {PAYMENTS_LIVE ? (
            <span>
              Placing the order takes you to PhonePe&rsquo;s secure payment page, then back here.
              Pay by UPI, card or net banking. Namakh never sees or stores your card or UPI
              details.
            </span>
          ) : (
            <span>
              Payments are processed securely by PhonePe. Namakh never sees or stores your card
              or UPI details.
            </span>
          )}
        </p>
      </Option>

      {showCod && (
        <Option
          active={method === "cod"}
          onSelect={() => onChange("cod")}
          title="Cash on delivery"
          meta={
            COMMERCE.cod.fee > 0 ? (
              <span className="font-mono-jb text-xs text-bone-faint">
                +{formatINR(COMMERCE.cod.fee)}
              </span>
            ) : null
          }
        >
          <p className="flex items-start gap-2 text-xs leading-relaxed text-bone-dim">
            <IconCash className="mt-0.5 h-4 w-4 shrink-0" />
            Pay the courier when your order arrives. Keep the exact amount ready.
          </p>
        </Option>
      )}

      <p className="flex items-center gap-2 pt-1 text-xs text-bone-faint">
        <IconShieldCheck className="h-4 w-4" />
        Your details are handled as set out in our{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-bone">
          privacy policy
        </a>
        .
      </p>
    </div>
  );
}
