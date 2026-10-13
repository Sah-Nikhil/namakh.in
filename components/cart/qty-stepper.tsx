"use client";

import { COMMERCE } from "@/lib/commerce/config";
import { cn } from "@/lib/utils";

/**
 * Quantity control shared by the drawer, the cart page and the product page.
 * At qty 1 the minus key removes the line when `removable`, otherwise it
 * simply stops — the two callers want different floors.
 */
export default function QtyStepper({
  value,
  onChange,
  removable = false,
  size = "md",
  label,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  removable?: boolean;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const min = removable ? 0 : 1;
  const max = COMMERCE.cart.maxQtyPerLine;
  const pad = size === "sm" ? "h-9 w-9 text-base" : "h-11 w-11 text-lg";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-ink-3",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={
          removable && value === 1
            ? `Remove ${label ?? "item"}`
            : `Decrease quantity${label ? ` of ${label}` : ""}`
        }
        className={cn(
          pad,
          "grid place-items-center rounded-full text-bone-dim transition-colors hover:text-bone disabled:cursor-not-allowed disabled:opacity-30",
        )}
      >
        &minus;
      </button>
      <span
        aria-live="polite"
        className={cn(
          "min-w-8 text-center font-mono-jb text-bone tabular-nums",
          size === "sm" ? "text-sm" : "text-base",
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity${label ? ` of ${label}` : ""}`}
        className={cn(
          pad,
          "grid place-items-center rounded-full text-bone-dim transition-colors hover:text-bone disabled:cursor-not-allowed disabled:opacity-30",
        )}
      >
        +
      </button>
    </div>
  );
}
