"use client";

import { useCallback, useEffect, useState } from "react";
import { COMMERCE } from "@/lib/commerce/config";
import type { CheckoutDraft, ShippingAddress } from "@/lib/commerce/types";

export const EMPTY_DRAFT: CheckoutDraft = {
  email: "",
  marketingOptIn: true,
  address: {
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    pincode: "",
    city: "",
    state: "",
    country: COMMERCE.country,
  },
  paymentMethod: "razorpay",
  notes: "",
};

/**
 * Checkout details survive a reload but not a closed tab: sessionStorage, not
 * localStorage. A half-typed address is not something to keep on a shared
 * machine longer than the visit that produced it.
 */
export function useCheckoutDraft() {
  const [draft, setDraft] = useState<CheckoutDraft>(EMPTY_DRAFT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(COMMERCE.cart.draftStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;
        setDraft({
          ...EMPTY_DRAFT,
          ...parsed,
          address: { ...EMPTY_DRAFT.address, ...(parsed.address ?? {}) },
        });
      }
    } catch {
      // Corrupt draft is not worth recovering. Start clean.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(COMMERCE.cart.draftStorageKey, JSON.stringify(draft));
  }, [draft, hydrated]);

  const patchDraft = useCallback((patch: Partial<CheckoutDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const patchAddress = useCallback((patch: Partial<ShippingAddress>) => {
    setDraft((current) => ({ ...current, address: { ...current.address, ...patch } }));
  }, []);

  const clearDraft = useCallback(() => {
    window.sessionStorage.removeItem(COMMERCE.cart.draftStorageKey);
    setDraft(EMPTY_DRAFT);
  }, []);

  return { draft, hydrated, patchDraft, patchAddress, clearDraft };
}
