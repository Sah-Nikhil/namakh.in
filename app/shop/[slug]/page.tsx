"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/ui/footer-modern";
import { motion } from "framer-motion";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);

  const [selectedImage, setSelectedImage] = useState(product?.click || "");

  if (!product) {
    notFound();
  }

  const galleryImages = [product.click, product.image, product.nutritionalLabel].filter(
    Boolean
  );

  const stats: [string, string][] = [
    ["Sodium", `${product.stats.sodium} mg`],
    ["Potassium", `${product.stats.potassium} mg`],
    ["Magnesium", `${product.stats.magnesium} mg`],
    ["Citric Acid", `${product.stats.citricAcid} mg`],
    ["Sugar", `${product.stats.dextrose} g`],
  ];

  return (
    <div className="grain relative min-h-screen bg-ink text-bone font-sans">
      <Navbar />
      <MobileNav />

      <main className="relative z-[2] mx-auto max-w-6xl px-5 md:px-10 pt-28 md:pt-40 pb-24">
        {/* breadcrumb */}
        <nav className="mb-8 kicker">
          <Link href="/shop" className="link-reveal hover:text-bone">
            Shop
          </Link>
          <span className="px-2 text-bone-faint">/</span>
          <span className="text-bone-dim">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible scrollbar-hide md:w-24 shrink-0">
              {galleryImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(src)}
                  className={`relative h-20 w-20 md:h-24 md:w-24 shrink-0 overflow-hidden rounded-xl border bg-ink-2 transition-all ${
                    selectedImage === src
                      ? "border-bone/60 ring-1 ring-bone/20"
                      : "border-line hover:border-bone/30"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`View ${i + 1}`}
                    fill
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>

            <div className="relative flex flex-1 aspect-[4/5] md:aspect-square items-center justify-center overflow-hidden rounded-3xl border border-line bg-ink-2">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative h-full w-full"
              >
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-contain p-10"
                  priority
                />
              </motion.div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5">
            <span className="kicker">/ Namakh Performance</span>
            <h1 className="display-xl mt-4 text-4xl md:text-5xl text-bone">
              {product.name}
            </h1>
            <p className="mt-3 text-lg text-bone-dim font-light">
              {product.tagline}
            </p>

            <div className="mt-7 flex items-baseline gap-3">
              <span className="font-display text-4xl text-bone">
                ₹{product.price}
              </span>
              <span className="text-sm text-bone-faint">{product.quantity}</span>
            </div>

            {/* stats */}
            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
              {stats.map(([k, v]) => (
                <div key={k} className="bg-ink p-4">
                  <dt className="text-xs text-bone-faint">{k}</dt>
                  <dd className="mt-1 font-mono-jb text-lg text-bone">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 text-bone-dim leading-relaxed">
              {product.description}
            </p>

            <button className="mt-8 w-full rounded-full bg-bone py-4 text-lg font-medium text-ink transition-colors hover:bg-salt">
              Add to Cart — ₹{product.price}
            </button>

            {/* accordions */}
            <div className="mt-10 space-y-1">
              <details className="group border-t border-line py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-bone">
                  <span className="font-medium">How to use</span>
                  <span className="text-bone-faint transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="pt-4 text-sm text-bone-dim leading-relaxed">
                  <ol className="list-decimal space-y-1 pl-5">
                    {product.howToUse.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </details>

              <details className="group border-t border-line py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-bone">
                  <span className="font-medium">Ingredients (stats for nerds)</span>
                  <span className="text-bone-faint transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="space-y-3 pt-4 text-sm text-bone-dim leading-relaxed">
                  <p>
                    Full-spectrum electrolyte profile tailored for{" "}
                    {product.name.includes("Sports")
                      ? "heavy sweat and endurance"
                      : "daily balance"}
                    .
                  </p>
                  <div className="relative mt-2 h-64 w-full overflow-hidden rounded-2xl border border-line bg-ink-2">
                    <Image
                      src={product.nutritionalLabel}
                      alt="Nutrition label"
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
