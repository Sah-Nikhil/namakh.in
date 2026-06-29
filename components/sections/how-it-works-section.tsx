"use client";

import Reveal from "@/components/ui/reveal";

const STEPS = [
  {
    n: "1",
    label: "POUR",
    body: "Tip one stick into 500ml of water. No scoops, no mess, no measuring jug.",
  },
  {
    n: "2",
    label: "STIR",
    body: "Give it a shake. It dissolves clean — no chalky sediment hiding at the bottom.",
  },
  {
    n: "3",
    label: "GO",
    body: "Drink it before, during or after. Your cells get what they need, on time.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative w-full px-5 md:px-10 py-24 md:py-36 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h2 className="display-xl text-4xl md:text-6xl text-bone max-w-xl">
            Three steps.{" "}
            <span className="italic text-bone-dim">That&apos;s the ritual.</span>
          </h2>
          <span className="kicker">/ How it works</span>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line rounded-3xl overflow-hidden border border-line">
          {STEPS.map((s, i) => (
            <Reveal
              key={s.n}
              delay={i * 0.1}
              className="group bg-ink p-8 md:p-10 min-h-[280px] flex flex-col justify-between transition-colors hover:bg-ink-2"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-7xl md:text-8xl leading-none text-bone/15 transition-colors group-hover:text-salt/30">
                  {s.n}
                </span>
                <span className="kicker">{s.label}</span>
              </div>
              <p className="text-bone-dim leading-relaxed text-lg max-w-xs">
                {s.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
