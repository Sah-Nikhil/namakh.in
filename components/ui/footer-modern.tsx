import React from "react";
import Image from "next/image";
import Link from "next/link";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "Hydration Blend", href: "/shop/hydration-blend" },
      { label: "Sports Blend", href: "/shop/sports-blend" },
      { label: "All blends", href: "/shop" },
    ],
  },
  {
    heading: "Brand",
    links: [
      { label: "About", href: "/about" },
      { label: "Formulation", href: "/formulae" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Refunds & Returns", href: "/refund-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="relative z-[2] border-t border-line bg-ink px-5 md:px-10 pt-20 pb-28 md:pb-12">
      <div className="mx-auto max-w-6xl">
        {/* Newsletter band */}
        <div className="flex flex-col gap-8 border-b border-line pb-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <span className="kicker">/ Stay salty</span>
            <h3 className="font-display text-3xl md:text-4xl text-bone mt-4">
              The latest from Namakh,
              <span className="italic text-bone-dim"> once in a while.</span>
            </h3>
          </div>
          <form className="flex w-full max-w-sm gap-2">
            <input
              type="email"
              placeholder="you@email.com"
              className="w-full rounded-full border border-line bg-ink-2 px-5 py-3 text-sm text-bone placeholder:text-bone-faint focus:border-bone/40 focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-salt"
            >
              Notify me
            </button>
          </form>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/assets/namakh_logo.png"
              alt="NAMAKH"
              width={170}
              height={42}
              className="h-auto w-[150px]"
            />
            <p className="mt-4 max-w-[16rem] text-sm text-bone-faint leading-relaxed">
              Precision electrolytes. No sugar, no nonsense.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="kicker mb-5">{col.heading}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-bone-dim text-sm link-reveal hover:text-bone"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Baseline */}
        <div className="flex flex-col gap-4 border-t border-line pt-8 text-xs text-bone-faint md:flex-row md:items-center md:justify-between">
          <span className="font-mono-jb">
            © {new Date().getFullYear()} NAMAKH — Made with{" "}
            <span className="text-salt">✶</span> in India
          </span>
          <div className="flex gap-6">
            {["Instagram", "Twitter", "Facebook"].map((s) => (
              <Link key={s} href="#" className="link-reveal hover:text-bone">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
