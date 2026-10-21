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
import AddToCart from "@/components/cart/add-to-cart";
import { formatINR } from "@/lib/commerce/pricing";
import { COMMERCE } from "@/lib/commerce/config";

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

  // Photos fill their frame; the nutrition panel is a label crop, so it is
  // shown whole on white instead of being cropped like a photo.
  const galleryImages = [product.click, product.image, product.nutritionalLabel].filter(
    (src): src is string => Boolean(src)
  );
  const isLabel = (src: string) => src === product.nutritionalLabel;

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
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row md:items-start gap-4 lg:self-start lg:sticky lg:top-32">
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible scrollbar-hide md:w-24 shrink-0">
              {galleryImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(src)}
                  aria-label={isLabel(src) ? "Nutrition facts and ingredients" : `Photo ${i + 1}`}
                  className={`relative h-20 w-20 md:h-24 md:w-24 shrink-0 overflow-hidden rounded-xl border transition-all ${
                    isLabel(src) ? "bg-white" : "bg-ink-2"
                  } ${
                    selectedImage === src
                      ? "border-bone/60 ring-1 ring-bone/20"
                      : "border-line hover:border-bone/30"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="96px"
                    className={isLabel(src) ? "object-contain p-1" : "object-cover"}
                  />
                </button>
              ))}
            </div>

            <div
              className={`relative flex flex-1 aspect-[4/5] md:aspect-square items-center justify-center overflow-hidden rounded-3xl border border-line ${
                isLabel(selectedImage) ? "bg-white" : "bg-ink-2"
              }`}
            >
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative h-full w-full"
              >
                <Image
                  src={selectedImage}
                  alt={
                    isLabel(selectedImage)
                      ? `${product.name} nutrition facts and ingredients, from the pack label`
                      : product.name
                  }
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className={isLabel(selectedImage) ? "object-contain p-6" : "object-cover"}
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
                {formatINR(product.price)}
              </span>
              <span className="text-sm text-bone-faint">{product.quantity}</span>
            </div>
            <p className="mt-2 text-xs text-bone-faint">
              MRP {formatINR(product.price)} (inclusive of all taxes) · Net wt.{" "}
              {product.pack.netWeight} · {product.pack.unitPrice}
            </p>

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

            <AddToCart product={product} />

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
                  <span className="font-medium">Ingredients &amp; nutrition</span>
                  <span className="text-bone-faint transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="space-y-3 pt-4 text-sm text-bone-dim leading-relaxed">
                  <ul className="divide-y divide-line rounded-2xl border border-line">
                    {product.pack.ingredients.map((item) => (
                      <li key={item.name} className="flex justify-between px-4 py-2.5">
                        <span className="text-bone">{item.name}</span>
                        <span className="font-mono-jb text-bone-faint">{item.percent}</span>
                      </li>
                    ))}
                  </ul>
                  <p>Serving size: {product.pack.servingSize}.</p>
                  {product.nutritionalLabel && (
                    <div className="relative mt-2 aspect-[1056/877] w-full overflow-hidden rounded-2xl border border-line bg-white">
                      <Image
                        src={product.nutritionalLabel}
                        alt={`${product.name} nutrition facts and ingredients, from the pack label`}
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </details>
            </div>

            {/* Product information: the pack's declarations, from the label
                artwork (lib/products.ts `pack`). */}
            <section className="mt-2 border-t border-line pt-6">
              <h2 className="kicker">/ Product information</h2>
              <dl className="mt-4 space-y-3 text-sm leading-relaxed">
                <div>
                  <dt className="text-bone-faint">Net quantity</dt>
                  <dd className="text-bone-dim">
                    {product.pack.netWeight} ({product.pack.servingSize})
                  </dd>
                </div>
                <div>
                  <dt className="text-bone-faint">MRP</dt>
                  <dd className="text-bone-dim">
                    {formatINR(product.price)} (inclusive of all taxes), {product.pack.unitPrice}
                  </dd>
                </div>
                <div>
                  <dt className="text-bone-faint">Storage</dt>
                  <dd className="text-bone-dim">{product.pack.storage}</dd>
                </div>
                <div>
                  <dt className="text-bone-faint">Best before</dt>
                  <dd className="text-bone-dim">
                    Batch number, manufacturing date and use-by date are printed on the pack.
                  </dd>
                </div>
                <div>
                  <dt className="text-bone-faint">Manufacturer</dt>
                  <dd className="text-bone-dim">
                    Manufactured and sold by Harsh Nilesh Nisar (Namakh)
                    <br />
                    {COMMERCE.business.address}
                  </dd>
                </div>
                <div>
                  <dt className="text-bone-faint">Licence</dt>
                  <dd className="font-mono-jb text-bone-dim">
                    FSSAI Lic. No. {COMMERCE.business.fssaiLicence}
                  </dd>
                </div>
                <div>
                  <dt className="text-bone-faint">Origin</dt>
                  <dd className="text-bone-dim">Country of origin: India</dd>
                </div>
                <div>
                  <dt className="text-bone-faint">Customer care</dt>
                  <dd className="text-bone-dim">
                    <a
                      href={`mailto:${COMMERCE.support.email}`}
                      className="link-reveal break-all hover:text-bone"
                    >
                      {COMMERCE.support.email}
                    </a>
                    <br />
                    <a
                      href={`tel:${COMMERCE.support.phone.replace(/\s/g, "")}`}
                      className="link-reveal hover:text-bone"
                    >
                      {COMMERCE.support.phone}
                    </a>
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
