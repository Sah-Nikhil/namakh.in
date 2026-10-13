"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Form primitives for checkout. Inputs sit on ink-3 with a hairline border so
 * they read as recessed panels rather than boxes, matching the cards used
 * across the rest of the site.
 */

const controlClass =
  "w-full rounded-xl border bg-ink-3 px-4 py-3.5 text-bone placeholder:text-bone-faint outline-none transition-colors focus:border-bone/40 focus:ring-1 focus:ring-bone/10";

function Shell({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-xs text-bone-dim">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-[var(--color-sports)]">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-bone-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  className,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange" | "className">) {
  return (
    <Shell id={id} label={label} error={error} hint={hint} className={className}>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(controlClass, error ? "border-[var(--color-sports)]/60" : "border-line")}
        {...rest}
      />
    </Shell>
  );
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  error,
  hint,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <Shell id={id} label={label} error={error} hint={hint} className={className}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          controlClass,
          "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236f6c66%22 stroke-width=%221.5%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:1.15rem] bg-[right_0.9rem_center] bg-no-repeat pr-11",
          value ? "text-bone" : "text-bone-faint",
          error ? "border-[var(--color-sports)]/60" : "border-line",
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-ink-3 text-bone">
            {option}
          </option>
        ))}
      </select>
    </Shell>
  );
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-bone-dim">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-line bg-ink-3 transition-colors checked:border-salt checked:bg-salt"
      />
      <span>{label}</span>
    </label>
  );
}

/** Numbered section heading, echoing the /01 kickers used site-wide. */
export function CheckoutSection({
  index,
  title,
  aside,
  children,
}: {
  index: number;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-8 first:border-t-0 first:pt-0">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="flex items-baseline gap-3">
          <span className="index-num text-sm text-bone-faint">
            /0{index}
          </span>
          <span className="font-display text-xl text-bone">{title}</span>
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
