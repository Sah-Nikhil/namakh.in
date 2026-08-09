"use client";

import Reveal from "@/components/ui/reveal";

const PRINCIPLES = [
  {
    n: "01",
    title: "No sugar",
    body: "Zero grams in the Hydration Blend*. Nothing to spike you, crash you, or rot your routine. Just the minerals.",
  },
  {
    n: "02",
    title: "Precisely formulated",
    body: "Up to 600mg Potassium per serve — the amounts research actually points to, not the homeopathic pinch most brands ship.",
  },
  {
    n: "03",
    title: "Rapid absorption",
    body: "The right sodium-to-glucose ratio pulls water into your cells fast. Hydration you feel, not just drink.",
  },
  {
    n: "04",
    title: "Two blends.",
    body: "One for everyday hydration. One for when you sweat. No endless flavours or complicated choices. Just pick what fits your day.",
  },
];

export default function PrinciplesSection() {
  return (
    <section className="relative w-full px-5 md:px-10 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-14 md:mb-20 max-w-3xl">
          <span className="kicker">/ The Brief</span>
          <h2 className="display-xl mt-5 text-4xl md:text-6xl text-bone">
            Less in the Scoop.{" "}
            <span className="italic text-bone-dim">More in the Science.</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <Reveal
              key={p.n}
              delay={(i % 2) * 0.08}
              className="group relative border-t border-line py-9 md:py-12 md:[&:nth-child(odd)]:pr-12 md:[&:nth-child(even)]:pl-12 md:[&:nth-child(even)]:border-l"
            >
              <div className="flex items-start gap-6">
                <span className="index-num text-salt/80 text-sm pt-2">
                  /{p.n}
                </span>
                <div>
                  <h3 className="font-display text-2xl md:text-3xl text-bone mb-3 transition-colors group-hover:text-salt">
                    {p.title}
                  </h3>
                  <p className="text-bone-dim leading-relaxed max-w-md">
                    {p.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
