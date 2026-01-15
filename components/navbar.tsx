"use client";
import React, { useState } from "react";
import { motion, useTransform, useMotionValue, MotionValue } from "framer-motion";
import { Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";

export default function Navbar({ className, onQuizClick, scrollY }: { className?: string; onQuizClick?: () => void; scrollY?: MotionValue<number> }) {
  const [active, setActive] = useState<string | null>(null);

  // Create a dummy motion value for when scrollY is not provided
  // This ensures hooks are always called in the same order
  const dummyScrollY = useMotionValue(1000);
  const effectiveScrollY = scrollY ?? dummyScrollY;

  // Scroll-based transforms - always called (hooks must be unconditional)
  const opacity = useTransform(effectiveScrollY, [250, 350], [0, 1]);
  const y = useTransform(effectiveScrollY, [250, 350], [-20, 0]);

  const containerClassName = cn("fixed top-7 inset-x-0 max-w-4xl mx-auto z-[999] hidden md:block", className);

  const menuContent = (
    <Menu setActive={setActive}>
      <MenuItem href="/" setActive={setActive} active={null} item="Home" />
      <MenuItem setActive={setActive} active={active} item="Our Offerings">
        <div className="text-sm grid grid-cols-2 gap-10 p-4">
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
      <button
        onClick={onQuizClick}
        className="cursor-pointer text-black hover:opacity-[0.9]"
      >
        Find Your Blend
      </button>
    </Menu>
  );

  // If scrollY is provided, use motion.div with animations. Otherwise, use a regular div.
  if (!scrollY) {
    return (
      <div className={containerClassName}>
        {menuContent}
      </div>
    );
  }

  return (
    <motion.div
      style={{ opacity, y }}
      className={containerClassName}
    >
      {menuContent}
    </motion.div>
  );
}
