"use client";

import { useCallback, useEffect, useState } from "react";
import type { CartLine } from "@/lib/commerce/types";

export type ShippingQuote = {
  quoteId: string;
  amount: number;
  source: "live" | "fallback";
  courierName?: string;
  estimatedDays?: number;
};

export type QuoteState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; quote: ShippingQuote }
  | { status: "unserviceable"; message: string }
  | { status: "error"; message: string };

/**
 * Fetches a shipping price whenever the PIN code or the cart changes. Each
 * quote is stored server-side and identified by quoteId; the order is later
 * charged from that stored row, so nothing here is trusted for the price.
 *
 * Debounced, and stale responses are dropped, so typing a PIN code or
 * tapping + on quantity doesn't fire a request per keystroke.
 */
export function useShippingQuote(
  pincode: string,
  lines: CartLine[],
): { state: QuoteState; refresh: () => void } {
  const [state, setState] = useState<QuoteState>({ status: "idle" });
  // Bumped to re-price without any input changing, e.g. after a quote expires.
  const [nonce, setNonce] = useState(0);
  const refresh = useCallback(() => setNonce((n) => n + 1), []);
  const code = pincode.trim();
  // A stable key for the cart's contents, so the effect reruns on real changes only.
  const cartKey = lines.map((l) => `${l.slug}:${l.qty}`).join(",");

  useEffect(() => {
    if (!/^[1-9][0-9]{5}$/.test(code) || !cartKey) {
      setState({ status: "idle" });
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setState({ status: "loading" });
      try {
        const res = await fetch("/api/shipping-quote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            pincode: code,
            items: cartKey.split(",").map((pair) => {
              const [slug, qty] = pair.split(":");
              return { slug, qty: Number(qty) };
            }),
          }),
        });
        const body = (await res.json()) as
          | ({ serviceable: true } & ShippingQuote)
          | { serviceable: false; message: string }
          | { error: string };

        if (controller.signal.aborted) return;
        if (!res.ok || "error" in body) {
          setState({
            status: "error",
            message: "error" in body ? body.error : "Could not price shipping. Try again.",
          });
        } else if (!body.serviceable) {
          setState({ status: "unserviceable", message: body.message });
        } else {
          setState({ status: "ready", quote: body });
        }
      } catch {
        if (!controller.signal.aborted) {
          setState({ status: "error", message: "Network problem pricing shipping. Try again." });
        }
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [code, cartKey, nonce]);

  return { state, refresh };
}
