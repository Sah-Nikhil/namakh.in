"use client";

import { usePathname } from "next/navigation";
import CartLauncher from "@/components/cart/cart-launcher";
import CartDrawer from "@/components/cart/cart-drawer";

/**
 * Cart chrome belongs to the storefront only. The root layout renders this on
 * every route, so the admin panel has to be excluded explicitly or a floating
 * Cart button turns up over the order list.
 */
export default function StorefrontCart() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <CartLauncher />
      <CartDrawer />
    </>
  );
}
