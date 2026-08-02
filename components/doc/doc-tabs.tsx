"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export type DocTab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

/**
 * Rail-plus-panel navigation: one section visible at a time, swapped by the
 * rail rather than scrolled to. Used by the FAQ. The rail mirrors the sticky
 * contents rail on the policy pages, so both read as the same component family.
 *
 * `content` arrives as already-rendered JSX from a server component, so the copy
 * itself stays server-rendered and in the HTML payload.
 */
export default function DocTabs({ tabs }: { tabs: DocTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  // Deep links (/faq#usage) open the matching tab instead of doing nothing.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.replace("#", "");
      if (id && tabs.some((t) => t.id === id)) setActive(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [tabs]);

  const select = (id: string) => {
    setActive(id);
    // Keep the URL shareable without jumping the scroll position.
    window.history.replaceState(null, "", `#${id}`);
  };

  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
      {/* Rail — vertical on desktop */}
      <div className="lg:col-span-3">
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="FAQ categories"
          className="hidden lg:flex lg:flex-col lg:sticky lg:top-32"
        >
          <h2 className="kicker mb-4">/ Categories</h2>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={tab.id === activeTab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => select(tab.id)}
              className={`doc-tab ${tab.id === activeTab.id ? "is-active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rail — horizontal chips on mobile */}
        <div
          role="tablist"
          aria-label="FAQ categories"
          className="flex lg:hidden gap-2 overflow-x-auto pb-1 -mx-5 px-5"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={tab.id === activeTab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => select(tab.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                tab.id === activeTab.id
                  ? "border-bone/30 bg-ink-3 text-bone"
                  : "border-line text-bone-faint hover:text-bone-dim"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel */}
      <div className="lg:col-span-9">
        <motion.div
          key={activeTab.id}
          id={`panel-${activeTab.id}`}
          role="tabpanel"
          initial={{ opacity: 0, y: 12, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {activeTab.content}
        </motion.div>
      </div>
    </div>
  );
}
