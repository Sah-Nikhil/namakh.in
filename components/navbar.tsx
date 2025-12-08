"use client";
import React, { useState } from "react";
import { Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";

export default function Navbar({ className, onQuizClick }: { className?: string; onQuizClick?: () => void }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-7 inset-x-0 max-w-4xl mx-auto z-[999] hidden md:block", className)}
      >
      <Menu setActive={setActive}>

            <MenuItem href="/" setActive={setActive} active={null} item="Home">
            </MenuItem>

        <MenuItem setActive={setActive} active={active} item="Our Offerings">
          <div className="  text-sm grid grid-cols-2 gap-10 p-4">
            <ProductItem
              title="Sports Blend"
              href="/shop/sports-blend"
              src="/assets/sports_logo.png"
              description="FUEL. SWEAT. REPEAT."
            />
            <ProductItem
              title="Hydration Blend"
              href="/shop/hydration-blend"
              src="/assets/hydration_logo.png"
              description="PURE. DAILY. ESSENTIAL."
            />
          </div>
        </MenuItem>

        {/* <MenuItem setActive={setActive} active={null} item="Our Formulae">
          <div className="flex flex-col space-y-4 text-sm">
             <Link href="/shop" className="text-neutral-300 hover:text-white">All Products</Link>
          </div>
        </MenuItem> */}

        <button
            onClick={onQuizClick}
            className="cursor-pointer text-white hover:opacity-[0.9]"
        >
            Find Your Blend
        </button>

      </Menu>
    </div>
  );
}
