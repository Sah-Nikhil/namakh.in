import React from "react";
import Reveal from "@/components/ui/reveal";

/**
 * One titled block of a document. `index` renders the mono numeral used by the
 * numbered policies; omit it for unnumbered prose (About, Contact).
 */
export default function DocSection({
  id,
  index,
  title,
  children,
}: {
  id?: string;
  index?: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal as="section" className="doc-anchor mb-14 md:mb-20">
      <div id={id} className="doc-anchor">
        <div className="flex items-baseline gap-4">
          {typeof index === "number" ? (
            <span className="index-num text-sm text-bone-faint tabular-nums">
              {String(index).padStart(2, "0")}
            </span>
          ) : null}
          <h2 className="font-display text-2xl md:text-[1.75rem] leading-tight text-bone">
            {title}
          </h2>
        </div>
        <div className="doc-prose mt-5">{children}</div>
      </div>
    </Reveal>
  );
}
