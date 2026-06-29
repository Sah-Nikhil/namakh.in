"use client";

import Reveal from "@/components/ui/reveal";
import NMKGraph from "../graph";

export default function ScienceSection() {
  return (
    <section className="relative w-full px-5 md:px-10 py-24 md:py-36 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Copy column */}
          <div className="lg:col-span-5">
            <Reveal>
              <span className="kicker">/ The Science</span>
              <h2 className="display-xl mt-5 text-4xl md:text-6xl text-bone">
                Electrolytes,
                <br />
                done right.
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-7 text-lg text-bone-dim leading-relaxed max-w-md">
                Lose just{" "}
                <span className="text-bone font-medium">2% of your water</span>{" "}
                and endurance, focus and mood all drop with it. Namakh restores
                optimal fluid balance and cellular hydration — fast.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
                {[
                  ["≤2%", "dehydration to dull you"],
                  ["1000mg", "sodium, Sports Blend"],
                  ["0g", "sugar, Hydration Blend"],
                  ["2", "blends, zero guesswork"],
                ].map(([k, v]) => (
                  <div key={v} className="bg-ink p-5">
                    <dt className="font-display text-3xl md:text-4xl text-bone">
                      {k}
                    </dt>
                    <dd className="mt-1 text-xs text-bone-faint leading-snug">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* Graph column */}
          <Reveal delay={0.12} className="lg:col-span-7">
            <div className="rounded-3xl border border-line bg-ink-2/60 p-3 md:p-6 overflow-hidden">
              <NMKGraph />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
