"use client";

import { usePathname } from "next/navigation";
import CartDrawer from "@/components/cart/cart-drawer";

/**
 * Cart chrome belongs to the storefront only. The root layout renders this on
 * every route, so the admin panel has to be excluded explicitly or the cart
 * drawer turns up over the order list. The desktop Cart button lives in the
 * navbar (components/ui/navbar-menu.tsx).
 */
export default function StorefrontCart() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return <CartDrawer />;
}
