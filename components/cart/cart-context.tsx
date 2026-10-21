"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { COMMERCE } from "@/lib/commerce/config";
import { computeTotals } from "@/lib/commerce/pricing";
import type { CartLine, OrderTotals } from "@/lib/commerce/types";
import { getProductBySlug, type Product } from "@/lib/products";

type CartContextValue = {
  lines: CartLine[];
  totals: OrderTotals;
  /** False until localStorage has been read. Guards against SSR mismatch. */
  hydrated: boolean;
  isOpen: boolean;
  /** Slug of the line added most recently, for the drawer's highlight. */
  lastAdded: string | null;
  add: (product: Product, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function toLine(product: Product, qty: number): CartLine {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
    quantityLabel: product.quantity,
    qty,
  };
}

function clampQty(qty: number): number {
  return Math.max(1, Math.min(COMMERCE.cart.maxQtyPerLine, Math.floor(qty)));
}

/**
 * Storage can hold anything a previous build wrote. Only keep valid lines, and
 * rebuild each one from the catalogue so a renamed image, name or price from
 * an older build never shows in the cart. Products no longer stocked drop out.
 */
function parseStored(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is CartLine =>
        !!l &&
        typeof l === "object" &&
        typeof (l as CartLine).slug === "string" &&
        typeof (l as CartLine).price === "number" &&
        Number.isFinite((l as CartLine).qty),
    ).flatMap((l) => {
      const product = getProductBySlug(l.slug);
      return product ? [toLine(product, clampQty(l.qty))] : [];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  // Read once on mount. Rendering starts empty on both server and client, so
  // the first paint matches and the cart fills in immediately after.
  useEffect(() => {
    setLines(parseStored(window.localStorage.getItem(COMMERCE.cart.storageKey)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(COMMERCE.cart.storageKey, JSON.stringify(lines));
  }, [lines, hydrated]);

  // Keep two open tabs in agreement about what is in the cart.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== COMMERCE.cart.storageKey) return;
      setLines(parseStored(event.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // The drawer is a dialog: lock the page behind it and close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const add = useCallback((product: Product, qty = 1) => {
    setLines((current) => {
      const existing = current.find((l) => l.slug === product.slug);
      if (!existing) return [...current, toLine(product, clampQty(qty))];
      return current.map((l) =>
        l.slug === product.slug ? { ...l, qty: clampQty(l.qty + qty) } : l,
      );
    });
    setLastAdded(product.slug);
    setIsOpen(true);
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setLines((current) =>
      qty < 1
        ? current.filter((l) => l.slug !== slug)
        : current.map((l) => (l.slug === slug ? { ...l, qty: clampQty(qty) } : l)),
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setLines((current) => current.filter((l) => l.slug !== slug));
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totals = useMemo(() => computeTotals(lines), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      totals,
      hydrated,
      isOpen,
      lastAdded,
      add,
      setQty,
      remove,
      clear,
      openCart,
      closeCart,
    }),
    [lines, totals, hydrated, isOpen, lastAdded, add, setQty, remove, clear, openCart, closeCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>.");
  return ctx;
}
