"use client";

import Image from "next/image";
import Link from "next/link";
import { COMMERCE } from "@/lib/commerce/config";
import { formatINR, lineTotal } from "@/lib/commerce/pricing";
import type { CartLine, OrderTotals } from "@/lib/commerce/types";

/**
 * The money box. Used on /cart, on /checkout and on the confirmation page, so
 * the arithmetic the buyer sees is identical at every step.
 */
export default function OrderSummary({
  lines,
  totals,
  title = "Order summary",
  showLines = true,
  compact = false,
  showTerms = false,
  shippingLabel,
}: {
  lines: CartLine[];
  totals: OrderTotals;
  title?: string;
  showLines?: boolean;
  compact?: boolean;
  /** The consent line only belongs where an order is actually placed. */
  showTerms?: boolean;
  /**
   * Shown in place of the shipping amount when there is no price yet, e.g.
   * "Calculated at checkout". Without it, a zero would read as "Free", which
   * is a promise live shipping can't keep.
   */
  shippingLabel?: string;
}) {
  const rows: { label: string; value: string; muted?: boolean }[] = [
    { label: "Subtotal", value: formatINR(totals.subtotal) },
    {
      label: "Shipping",
      value:
        shippingLabel ?? (totals.shipping === 0 ? "Free" : formatINR(totals.shipping)),
      muted: !shippingLabel && totals.shipping === 0,
    },
  ];

  if (COMMERCE.tax.mode === "exclusive") {
    rows.push({
      label: `${COMMERCE.tax.label} (${COMMERCE.tax.ratePct}%)`,
      value: formatINR(totals.tax),
    });
  }

  if (totals.codFee > 0) {
    rows.push({ label: "Cash on delivery fee", value: formatINR(totals.codFee) });
  }

  return (
    <div className={compact ? "" : "rounded-3xl border border-line bg-ink-2 p-6 md:p-7"}>
      <h2 className="font-display text-lg text-bone">{title}</h2>

      {showLines && (
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {lines.map((line) => (
            <li key={line.slug} className="flex items-center gap-4 py-4">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-ink-3">
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  sizes="56px"
                  className="object-contain p-1.5"
                />
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-bone px-1 font-mono-jb text-[0.65rem] text-ink">
                  {line.qty}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-bone">{line.name}</p>
                <p className="truncate text-xs text-bone-faint">
                  {line.quantityLabel.replace(/^\/\s*/, "")}
                </p>
              </div>
              <span className="font-mono-jb text-sm tabular-nums text-bone">
                {formatINR(lineTotal(line))}
              </span>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-5 space-y-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-bone-dim">{row.label}</dt>
            <dd
              className={`font-mono-jb tabular-nums ${
                row.muted ? "text-[var(--color-hydration)]" : "text-bone"
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
        <span className="text-bone">Total</span>
        <span className="flex items-baseline gap-2">
          <span className="font-mono-jb text-xs text-bone-faint">
            {COMMERCE.currencyCode}
          </span>
          <span className="font-display text-2xl tabular-nums text-bone">
            {formatINR(totals.total)}
          </span>
        </span>
      </div>

      {COMMERCE.tax.mode === "inclusive" && totals.taxIncluded > 0 && (
        <p className="mt-2 text-xs text-bone-faint">
          Inclusive of {COMMERCE.tax.label} of {formatINR(totals.taxIncluded)}.
        </p>
      )}

      {totals.freeShippingGap > 0 && (
        <p className="mt-4 rounded-xl border border-line bg-ink-3 px-4 py-3 text-xs text-bone-dim">
          Add {formatINR(totals.freeShippingGap)} more to unlock free shipping.
        </p>
      )}

      {showTerms && (
        <p className="mt-5 text-xs leading-relaxed text-bone-faint">
          By placing this order you agree to our{" "}
          <Link href="/terms" className="text-bone-dim underline underline-offset-2 hover:text-bone">
            Terms
          </Link>
          ,{" "}
          <Link
            href="/refund-policy"
            className="text-bone-dim underline underline-offset-2 hover:text-bone"
          >
            Refund &amp; return policy
          </Link>{" "}
          and{" "}
          <Link
            href="/shipping-policy"
            className="text-bone-dim underline underline-offset-2 hover:text-bone"
          >
            Shipping policy
          </Link>
          .
        </p>
      )}
    </div>
  );
}
