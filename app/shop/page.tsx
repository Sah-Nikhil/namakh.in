"use client";

import React, { useState } from "react";
import Image from "next/image";

const images = [
  "/assets/mockup.png",
  "/assets/mockup2.png",
  "/assets/hydration_pack.png",
  "/assets/sports_pack.png",
];

export default function ShopPage() {
  const [mainIdx, setMainIdx] = useState(0);

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: gallery */}
        <div className="lg:col-span-7 flex gap-4">
          <div className="hidden md:flex flex-col gap-3 w-20">
            {images.map((src, i) => (
              <button
                key={src}
                onClick={() => setMainIdx(i)}
                className={`rounded border overflow-hidden p-1 bg-white/5 hover:scale-105 transition-transform ${
                  i === mainIdx ? "ring-2 ring-offset-2 ring-black/40" : ""
                }`}
              >
                <Image src={src} alt={`thumb-${i}`} width={72} height={96} className="object-cover" />
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white/5 rounded overflow-hidden flex items-center justify-center">
            <Image src={images[mainIdx]} alt="main" width={900} height={900} className="object-contain" />
          </div>
        </div>

        {/* Right: product info */}
        <aside className="lg:col-span-5">
          <h2 className="text-2xl font-semibold">Double Cuff Olive Shirt</h2>
          <p className="mt-2 text-lg font-medium">₹999</p>

          <div className="mt-6">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Colors</h3>
            <div className="mt-2 flex gap-3 flex-wrap">
              {/* Example color swatches using small images */}
              {images.slice(0, 4).map((src, i) => (
                <button key={src} className="w-12 h-12 rounded border flex items-center justify-center overflow-hidden">
                  <Image src={src} alt={`color-${i}`} width={48} height={48} className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Sizes</h3>
            <div className="mt-2 flex gap-2">
              {['S','M','L','XL','XXL'].map(s => (
                <button key={s} className="px-3 py-2 border rounded text-sm">{s}</button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <button className="w-full bg-black text-white py-3 rounded font-semibold">Add to Bag</button>
          </div>

          <div className="mt-8 space-y-4">
            <details className="border rounded p-4">
              <summary className="font-medium">Details</summary>
              <p className="mt-2 text-sm text-muted-foreground">A comfortable, stylish shirt with double cuffs.</p>
            </details>

            <details className="border rounded p-4">
              <summary className="font-medium">Reviews</summary>
              <p className="mt-2 text-sm text-muted-foreground">4.5 ★ — 5413 Ratings</p>
            </details>
          </div>
        </aside>
      </div>
    </main>
  );
}
