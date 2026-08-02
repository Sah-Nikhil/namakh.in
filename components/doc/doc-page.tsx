import React from "react";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/ui/footer-modern";
import Reveal from "@/components/ui/reveal";

export type TocEntry = { id: string; label: string };

/**
 * Shell for every long-form document page (About, FAQ, Contact, and the four
 * policies). Owns the page chrome, the editorial masthead, and the optional
 * sticky contents rail so the individual pages hold nothing but their copy.
 */
export default function DocPage({
  kicker,
  title,
  titleAccent,
  intro,
  updated,
  toc,
  children,
}: {
  kicker: string;
  title: string;
  /** Rendered italic + dimmed on the second line, per the house display style. */
  titleAccent?: string;
  /** ReactNode, not string — /about sets the wordmark inline in the sentence. */
  intro?: React.ReactNode;
  updated?: string;
  toc?: TocEntry[];
  children: React.ReactNode;
}) {
  const hasToc = Boolean(toc?.length);

  return (
    <div className="grain relative min-h-screen bg-ink text-bone font-sans">
      <Navbar />
      <MobileNav />

      <main className="relative z-[2] mx-auto max-w-6xl px-5 md:px-10 pt-32 md:pt-44 pb-28 md:pb-32">
        {/* Masthead */}
        <Reveal as="section" className="max-w-3xl">
          <span className="kicker">{kicker}</span>
          <h1 className="display-xl mt-5 text-4xl md:text-6xl text-bone">
            {title}
            {titleAccent ? (
              <>
                {" "}
                <span className="italic text-bone-dim">{titleAccent}</span>
              </>
            ) : null}
          </h1>
          {intro ? (
            <p className="mt-6 text-lg text-bone-dim max-w-xl">{intro}</p>
          ) : null}
          {updated ? (
            <p className="mt-8 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-bone-faint">
              Last updated — {updated}
            </p>
          ) : null}
        </Reveal>

        <div className="rule mt-12 md:mt-16" />

        <div
          className={
            hasToc
              ? "mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16"
              : "mt-12 md:mt-16"
          }
        >
          {hasToc ? (
            <aside className="hidden lg:block lg:col-span-3">
              <nav className="doc-toc sticky top-32" aria-label="On this page">
                <h2 className="kicker mb-4">/ Contents</h2>
                {toc!.map((entry) => (
                  <a key={entry.id} href={`#${entry.id}`}>
                    {entry.label}
                  </a>
                ))}
              </nav>
            </aside>
          ) : null}

          <div className={hasToc ? "lg:col-span-9" : ""}>{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
