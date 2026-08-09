"use client";

import Reveal from "@/components/ui/reveal";

const ROWS = [
  ["Magnesium per serve", "Up to 100mg", "Nothing"],
  ["Added sugar", "0g", "20–34g"],
  ["Artificial colours", "Never", "Usually"],
  ["Added Preservatives", "None", "Enough to take out an Elephant"],
  ["Made for", "Hydration & sweat", "Selling you a mascot"],
  ["What it costs you later", "Nothing", "The dentist"],
];

export default function ComparisonSection() {
  return (
    <section className="relative w-full px-5 md:px-10 py-24 md:py-36 border-t border-line">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-14 md:mb-20 text-center">
          <span className="kicker">/ The Comparison</span>
          <h2 className="display-xl mt-5 text-4xl md:text-6xl text-bone">
            Namakh vs.{" "}
            <span className="italic text-bone-dim">the sugary stuff.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="overflow-hidden rounded-3xl border border-line">
            {/* header */}
            <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-ink-2">
              <div className="p-5 md:p-6" />
              <div className="p-5 md:p-6 border-l border-line">
                <span className="font-display text-xl md:text-2xl text-bone">
                  Namakh
                </span>
              </div>
              <div className="p-5 md:p-6 border-l border-line">
                <span className="kicker">The other guys</span>
              </div>
            </div>

            {ROWS.map(([label, us, them], i) => (
              <div
                key={label}
                className={`grid grid-cols-[1.4fr_1fr_1fr] ${
                  i % 2 ? "bg-ink" : "bg-ink-2/40"
                }`}
              >
                <div className="p-5 md:p-6 text-bone-dim text-sm md:text-base border-t border-line">
                  {label}
                </div>
                <div className="p-5 md:p-6 border-l border-t border-line">
                  <span className="text-bone font-medium text-sm md:text-base">
                    {us}
                  </span>
                </div>
                <div className="p-5 md:p-6 border-l border-t border-line">
                  <span className="text-bone-faint text-sm md:text-base line-through decoration-salt/40">
                    {them}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <blockquote className="mt-16 mx-auto max-w-2xl text-center">
            <p className="font-display text-2xl md:text-3xl leading-snug text-bone">
              &ldquo;When you hydrate right, you think sharper, perform better,
              and recover faster.&rdquo;
            </p>
            <footer className="kicker mt-5">— The whole point of Namakh</footer>
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}
