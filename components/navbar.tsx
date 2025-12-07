"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";

export default function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-7 inset-x-0 max-w-4xl mx-auto z-999", className)}
      >
      <Menu setActive={setActive}>

        <HoveredLink href="/">
            <MenuItem href="/" setActive={setActive} active={active} item="Home">
            </MenuItem>
        </HoveredLink>

        <MenuItem setActive={setActive} active={active} item="Our Offerings">
          <div className="  text-sm grid grid-cols-2 gap-10 p-4">
            <ProductItem
              title="Sports Blend"
              href="/shop/sports"
              src="/assets/sports_logo.png"
              description="FUEL. SWEAT. REPEAT."
            />
            <ProductItem
              title="Hydration Blend"
              href="/shop/hydration"
              src="/assets/hydration_logo.png"
              description="PURE. DAILY. ESSENTIAL."
            />
          </div>
        </MenuItem>

        <MenuItem setActive={setActive} active={null} item="Our Formulae">
          <div className="flex flex-col space-y-4 text-sm">
            {/* <HoveredLink href="/web-dev">Web Development</HoveredLink>
            <HoveredLink href="/interface-design">Interface Design</HoveredLink>
            <HoveredLink href="/seo">Search Engine Optimization</HoveredLink>
            <HoveredLink href="/branding">Branding</HoveredLink> */}
          </div>
        </MenuItem>

      </Menu>
    </div>
  );
}
