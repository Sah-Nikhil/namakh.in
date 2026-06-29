"use client";

import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/ui/reveal";
import { products } from "@/lib/products";

interface ProductCTASectionProps {
  onQuizClick: () => void;
}

const ACCENT: Record<string, string> = {
  "hydration-blend": "var(--color-hydration)",
  "sports-blend": "var(--color-sports)",
};

export default function ProductCTASection({
  onQuizClick,
}: ProductCTASectionProps) {
  return (
    <section
      id="blends"
      className="relative w-full px-5 md:px-10 py-24 md:py-36 border-t border-line"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-14 md:mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h2 className="display-xl text-4xl md:text-6xl text-bone max-w-xl">
            Find your blend.
          </h2>
          <p className="text-bone-dim max-w-xs md:text-right">
            Two formulas. Choose by how you sweat, not by the flavour wall.
          </p>
        </Reveal>

        {/* Product cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 0.1}>
              <Link
                href={`/shop/${product.slug}`}
                className="group relative block overflow-hidden rounded-3xl border border-line bg-ink-2 transition-colors duration-500 hover:border-bone/25"
                style={
                  { "--accent": ACCENT[product.slug] } as React.CSSProperties
                }
              >
                {/* glow on hover */}
                <div
                  className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-40"
                  style={{
                    background:
                      "radial-gradient(circle, var(--accent), transparent 65%)",
                  }}
                />

                <div className="relative flex items-center justify-between px-7 pt-7">
                  <span className="index-num text-bone-faint text-sm">
                    /0{i + 1}
                  </span>
                  <span className="font-mono-jb text-sm text-bone">
                    ₹{product.price}
                  </span>
                </div>

                <div className="relative flex h-[300px] md:h-[360px] items-center justify-center p-6">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={360}
                    height={360}
                    className="h-full w-auto object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </div>

                <div className="relative border-t border-line p-7">
                  <h3 className="font-display text-2xl md:text-3xl text-bone">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-bone-dim text-sm leading-relaxed">
                    {product.tagline}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.idealFor.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-line px-3 py-1 text-xs text-bone-dim"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-bone link-reveal text-sm font-medium">
                    Shop {product.name.split(" ")[0]}
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Quiz CTA */}
        <Reveal delay={0.1}>
          <div className="mt-8 md:mt-10 overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-ink-2 to-ink p-8 md:p-14 text-center">
            <span className="kicker">/ Still deciding?</span>
            <h3 className="font-display text-3xl md:text-5xl text-bone mt-4 max-w-2xl mx-auto">
              Let the numbers pick for you.
            </h3>
            <p className="mt-4 text-bone-dim max-w-md mx-auto">
              Six quick questions. We&apos;ll match you to the blend your routine
              actually needs.
            </p>
            <button
              onClick={onQuizClick}
              className="group mt-9 inline-flex items-center gap-3 rounded-full bg-bone px-8 py-4 font-medium text-ink transition-all hover:gap-4 hover:bg-salt"
            >
              Take the 60-second quiz
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </Reveal>

        {/* Trust marks */}
        <Reveal delay={0.12}>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {["No Sugar", "No Gluten", "Vegan Friendly", "No Dodgy Ingredients"].map(
              (b) => (
                <span key={b} className="kicker">
                  {b}
                </span>
              )
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
