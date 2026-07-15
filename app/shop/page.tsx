import Link from "next/link";
import Image from "next/image";
import { products } from "@/lib/products";
import Navbar from "@/components/navbar";
import Footer from "@/components/ui/footer-modern";
import MobileNav from "@/components/mobile-nav";

const ACCENT: Record<string, string> = {
  "hydration-blend": "var(--color-hydration)",
  "sports-blend": "var(--color-sports)",
};

export default function ShopIndex() {
  return (
    <div className="grain relative min-h-screen bg-ink text-bone font-sans">
      <Navbar />
      <MobileNav />

      <main className="relative z-[2] mx-auto max-w-6xl px-5 md:px-10 pt-36 md:pt-44 pb-24">
        <header className="mb-16 md:mb-24 max-w-3xl">
          <span className="kicker">/ The Collection</span>
          <h1 className="display-xl mt-5 text-5xl md:text-7xl text-bone">
            Two blends.{" "}
            <span className="italic text-bone-dim">Zero filler.</span>
          </h1>
          <p className="mt-6 text-lg text-bone-dim max-w-xl">
            Precision-formulated electrolytes for every lifestyle. Find your
            perfect balance — and nothing you didn&apos;t ask for.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {products.map((product, i) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-line bg-ink-2 transition-colors duration-500 hover:border-bone/25"
              style={{ "--accent": ACCENT[product.slug] } as React.CSSProperties}
            >
              <div
                className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-40"
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

              <div className="relative flex h-[340px] md:h-[420px] items-center justify-center p-8">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={420}
                  height={420}
                  className="h-full w-auto object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
              </div>

              <div className="relative border-t border-line p-7">
                <h2 className="font-display text-2xl md:text-3xl text-bone">
                  {product.name}
                </h2>
                <p className="mt-2 text-bone-dim text-sm line-clamp-1">
                  {product.tagline}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {product.features.slice(0, 2).map((feat) => (
                    <span
                      key={feat}
                      className="rounded-full border border-line px-3 py-1 text-xs text-bone-dim"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
