"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import {
  IconChevronDown,
  IconCopy,
  IconCheck,
  IconLoader2,
} from "@tabler/icons-react";
import { api } from "@/convex/_generated/api";
import { formatINR } from "@/lib/commerce/pricing";
import { trackingPath } from "@/lib/commerce/tracking";
import { shiprocketRow } from "@/lib/admin/shiprocket-row";
import type { CartLine, OrderStatus, OrderTotals, ShippingAddress } from "@/lib/commerce/types";

export type AdminOrder = {
  orderNumber: string;
  trackToken: string;
  placedAt: number;
  email: string;
  marketingOptIn: boolean;
  address: ShippingAddress;
  notes: string;
  lines: CartLine[];
  totals: OrderTotals;
  status: OrderStatus;
  paymentStatus: "pending" | "paid" | "cod_pending" | "failed" | "refunded";
  paymentMethod: "razorpay" | "cod";
  courier?: string;
  awb?: string;
  trackingUrl?: string;
  shiprocketPush?: "queued" | "pushed" | "failed";
  shiprocketError?: string;
  shiprocketOrderId?: string;
  quotedCourierName?: string;
  shippingSource?: "live" | "fallback";
};

const STATUS_OPTIONS: OrderStatus[] = [
  "awaiting_payment",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  awaiting_payment: "Awaiting payment",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

/** Colour carries meaning here: red needs you, blue is moving, green is done. */
function statusTone(status: OrderStatus): string {
  if (status === "delivered") return "text-[var(--color-hydration)]";
  if (status === "cancelled" || status === "returned") return "text-[var(--color-sports)]";
  if (status === "awaiting_payment") return "text-salt";
  return "text-bone";
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs text-bone-dim transition-colors hover:border-bone/30 hover:text-bone"
    >
      {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

export default function OrderRow({ order }: { order: AdminOrder }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setStatus = useMutation(api.admin.setStatus);
  const markPaid = useMutation(api.admin.markPaid);
  const retryPush = useMutation(api.admin.retryShiprocketPush);

  const summary = order.lines.map((l) => `${l.name} ×${l.qty}`).join(", ");
  const placed = new Date(order.placedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  const run = async (label: string, action: () => Promise<unknown>) => {
    setBusy(label);
    setError(null);
    try {
      await action();
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      const match = message.match(/Uncaught Error:\s*([^\n]+)/);
      setError(match ? match[1].trim() : "That did not go through. Try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <li className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="grid w-full grid-cols-[auto_1fr] items-center gap-x-4 px-4 py-3 text-left transition-colors hover:bg-ink-3 md:grid-cols-[7.5rem_1fr_9rem_1fr_6rem_9rem_2rem] md:gap-x-5"
      >
        <span className="font-mono-jb text-xs text-bone-faint md:text-bone-dim">
          {order.orderNumber}
        </span>
        <span className="truncate text-sm text-bone">{order.address.fullName}</span>
        <span className="hidden truncate text-sm text-bone-dim md:block">
          {order.address.city}
        </span>
        <span className="hidden truncate text-sm text-bone-dim md:block">{summary}</span>
        <span className="hidden font-mono-jb text-sm tabular-nums text-bone md:block">
          {formatINR(order.totals.total)}
        </span>
        <span className={`hidden text-xs md:block ${statusTone(order.status)}`}>
          {STATUS_LABEL[order.status]}
          {order.paymentStatus !== "paid" && order.paymentMethod !== "cod" && (
            <span className="ml-1.5 text-bone-faint">· unpaid</span>
          )}
          {order.shiprocketPush === "failed" && (
            <span className="ml-1.5 text-[var(--color-sports)]">· Shiprocket failed</span>
          )}
        </span>
        <IconChevronDown
          className={`hidden h-4 w-4 text-bone-faint transition-transform md:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-line bg-ink-3/50 px-4 py-6">
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
            <div>
              <h3 className="kicker">/ Customer</h3>
              <address className="mt-3 text-sm not-italic leading-relaxed text-bone-dim">
                <span className="text-bone">{order.address.fullName}</span>
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
              </address>
              <p className="mt-3 space-y-1 text-sm text-bone-dim">
                <a href={`tel:${order.address.phone}`} className="block hover:text-bone">
                  {order.address.phone}
                </a>
                <a href={`mailto:${order.email}`} className="block hover:text-bone">
                  {order.email}
                </a>
              </p>
              {order.notes && (
                <p className="mt-3 rounded-xl border border-line px-3 py-2 text-xs text-bone-dim">
                  <span className="text-bone-faint">Delivery note: </span>
                  {order.notes}
                </p>
              )}
              <p className="mt-3 text-xs text-bone-faint">
                Placed {placed} · {order.marketingOptIn ? "Opted in to email" : "No marketing"}
              </p>
            </div>

            <div>
              <h3 className="kicker">/ Order</h3>
              <ul className="mt-3 space-y-1.5 text-sm">
                {order.lines.map((line) => (
                  <li key={line.slug} className="flex justify-between gap-4 text-bone-dim">
                    <span>
                      {line.name} <span className="text-bone-faint">×{line.qty}</span>
                    </span>
                    <span className="font-mono-jb tabular-nums text-bone">
                      {formatINR(line.price * line.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-bone-faint">Shipping</dt>
                  <dd className="font-mono-jb text-bone-dim">
                    {order.totals.shipping === 0 ? "Free" : formatINR(order.totals.shipping)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-bone">Total</dt>
                  <dd className="font-mono-jb tabular-nums text-bone">
                    {formatINR(order.totals.total)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-bone-faint">Payment</dt>
                  <dd className="text-bone-dim">
                    {order.paymentMethod === "cod" ? "Cash on delivery" : "Online"} ·{" "}
                    {order.paymentStatus.replace(/_/g, " ")}
                  </dd>
                </div>
              </dl>
              {order.awb && (
                <p className="mt-4 text-xs text-bone-faint">
                  {order.courier} · AWB {order.awb}
                </p>
              )}

              <div className="mt-4 rounded-xl border border-line px-3 py-2.5 text-xs">
                <p className="text-bone-faint">
                  Shiprocket:{" "}
                  <span
                    className={
                      order.shiprocketPush === "failed"
                        ? "text-[var(--color-sports)]"
                        : order.shiprocketPush === "pushed"
                          ? "text-[var(--color-hydration)]"
                          : "text-bone-dim"
                    }
                  >
                    {order.shiprocketPush === "pushed"
                      ? `Sent${order.shiprocketOrderId ? ` (#${order.shiprocketOrderId})` : ""}. Book the courier in the Shiprocket panel.`
                      : order.shiprocketPush === "queued"
                        ? "Sending…"
                        : order.shiprocketPush === "failed"
                          ? "Not sent"
                          : "Sent automatically once paid"}
                  </span>
                </p>
                {order.shiprocketError && (
                  <p className="mt-1.5 text-[var(--color-sports)]">{order.shiprocketError}</p>
                )}
                {order.shiprocketPush === "failed" && (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() =>
                      run("retry", () => retryPush({ orderNumber: order.orderNumber }))
                    }
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-bone-dim transition-colors hover:border-bone/30 hover:text-bone disabled:opacity-60"
                  >
                    {busy === "retry" && <IconLoader2 className="h-3 w-3 animate-spin" />}
                    Retry
                  </button>
                )}
                {order.shippingSource === "fallback" && (
                  <p className="mt-1.5 text-bone-faint">
                    Shipping was charged at the fixed fallback fee: Shiprocket could not be
                    reached at checkout. Check the courier cost before booking.
                  </p>
                )}
                {order.quotedCourierName && (
                  <p className="mt-1.5 text-bone-faint">Quoted courier: {order.quotedCourierName}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="kicker">/ Actions</h3>

              <label htmlFor={`status-${order.orderNumber}`} className="sr-only">
                Change status
              </label>
              <select
                id={`status-${order.orderNumber}`}
                value={order.status}
                disabled={busy !== null}
                onChange={(e) =>
                  run("status", () =>
                    setStatus({
                      orderNumber: order.orderNumber,
                      status: e.target.value as OrderStatus,
                    }),
                  )
                }
                className="mt-3 w-full rounded-xl border border-line bg-ink-3 px-3.5 py-2.5 text-sm text-bone outline-none transition-colors focus:border-bone/40"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option} className="bg-ink-3">
                    {STATUS_LABEL[option]}
                  </option>
                ))}
              </select>

              {order.paymentStatus !== "paid" && (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() =>
                    run("paid", () => markPaid({ orderNumber: order.orderNumber }))
                  }
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-bone py-2.5 text-sm font-medium text-ink transition-colors hover:bg-salt disabled:opacity-60"
                >
                  {busy === "paid" ? (
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconCheck className="h-4 w-4" />
                  )}
                  Mark payment received
                </button>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <CopyButton label="Shiprocket row" value={shiprocketRow(order)} />
                <CopyButton
                  label="Tracking link"
                  value={
                    typeof window === "undefined"
                      ? ""
                      : `${window.location.origin}${trackingPath(order.orderNumber, order.trackToken)}`
                  }
                />
                <CopyButton
                  label="Address"
                  value={[
                    order.address.fullName,
                    order.address.line1,
                    order.address.line2,
                    `${order.address.city}, ${order.address.state} ${order.address.pincode}`,
                    order.address.phone,
                  ]
                    .filter(Boolean)
                    .join("\n")}
                />
              </div>

              {error && (
                <p role="alert" className="mt-3 text-xs text-[var(--color-sports)]">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
