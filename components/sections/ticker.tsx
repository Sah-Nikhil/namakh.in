"use client";

const WORDS = [
  "SODIUM",
  "POTASSIUM",
  "MAGNESIUM",
  "ZERO SUGAR",
  "RAPID ABSORPTION",
  "NO NONSENSE",
  "ELECTROLYTES",
];

/**
 * Editorial marquee — an endless mineral ticker, lawn.video-flavoured.
 * Track is duplicated so the -50% translate loops seamlessly.
 */
export default function Ticker() {
  const Row = () => (
    <div className="ticker-track">
      {WORDS.concat(WORDS).map((w, i) => (
        <span key={i} className="flex items-center">
          <span className="font-display text-3xl md:text-5xl font-light tracking-tight text-bone/90 px-7 md:px-10">
            {w}
          </span>
          <span className="text-salt text-lg">✶</span>
        </span>
      ))}
    </div>
  );

  return (
    <section className="relative w-full overflow-hidden border-y border-line py-6 md:py-8 bg-ink-2/40">
      <div className="flex">
        <Row />
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-ink to-transparent" />
    </section>
  );
}
