"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { products, getProductBySlug } from "@/lib/products";
import Navbar from "@/components/navbar";
import Footer from "@/components/ui/footer-modern";
import { motion } from "framer-motion";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params using React.use()
  const { slug } = use(params);
  const product = getProductBySlug(slug);

  // Initialize selected image with the main product image
  const [selectedImage, setSelectedImage] = useState(product?.image || "");

  if (!product) {
    notFound();
  }

  // Create a gallery array (ensuring main image is first)
  // We can add more images here if available in the future
  const galleryImages = [
    product.image,
    product.nutritionalLabel,
    // "/assets/mockup.png", // Generic fallback for extra angles
    // "/assets/mockup2.png"
  ].filter(Boolean);

  return (
    <div className="bg-white text-neutral-900 min-h-screen font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left Column: Image Gallery Layout */}
            <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
                 {/* Thumbnails (Vertical on Desktop, Horizontal on Mobile) */}
                 <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible scrollbar-hide md:w-24 shrink-0">
                    {galleryImages.map((src, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedImage(src)}
                            className={`relative w-20 h-20 md:w-24 md:h-24 rounded-lg bg-neutral-100 border overflow-hidden flex-shrink-0 transition-all ${
                                selectedImage === src ? "border-blue-500 ring-2 ring-blue-500/20" : "border-neutral-200 hover:border-neutral-400"
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

                 {/* Main Image Viewport */}
                 <div className="flex-1 bg-neutral-50 rounded-2xl border border-neutral-200 relative aspect-[4/5] md:aspect-square flex items-center justify-center overflow-hidden">
                      <motion.div
                        key={selectedImage}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full h-full"
                      >
                         <Image
                            src={selectedImage}
                            alt={product.name}
                            fill
                            className="object-contain p-8"
                            priority
                         />
                      </motion.div>
                 </div>
            </div>

            {/* Right Column: Product Details */}
            <div className="lg:col-span-5 space-y-8">
                <div>
                     <p className="text-blue-700 font-medium tracking-wider text-sm uppercase mb-2">Namakh Performance</p>
                     <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">{product.name}</h1>
                     <p className="text-xl text-neutral-700 mt-2 font-light">{product.tagline}</p>
                </div>

                <div className="text-3xl font-semibold text-neutral-900">
                    ₹{product.price}
                    <span className="text-sm font-normal text-neutral-600 ml-2">/ per pack (30 servings)</span>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4 py-6 border-y border-neutral-200">
                    <div className="space-y-1">
                        <p className="text-sm text-neutral-600">Sodium</p>
                        <p className="text-xl font-bold">{product.stats.sodium} mg</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-neutral-600">Potassium</p>
                        <p className="text-xl font-bold">{product.stats.potassium} mg</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-neutral-600">Magnesium</p>
                        <p className="text-xl font-bold">{product.stats.magnesium} mg</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-sm text-neutral-600">Sugar</p>
                        <p className="text-xl font-bold">{product.stats.sugar} g</p>
                    </div>
                </div>

                <div className="prose text-neutral-800">
                    <p>{product.description}</p>
                </div>

                <div className="space-y-4 pt-4">
                    <button className="w-full bg-neutral-900 text-white py-4 rounded-full font-bold text-lg hover:bg-neutral-700 transition-colors">
                        Add to Cart — ₹{product.price}
                    </button>
                    <p className="text-center text-xs text-neutral-600">
                        Free shipping on all orders above ₹500. Secure checkout.
                    </p>
                </div>

                {/* Simple Accordions for Details */}
                <div className="space-y-4 pt-8">
                    <details className="group border-b border-neutral-200 pb-4">
                        <summary className="flex justify-between items-center cursor-pointer list-none text-neutral-800 font-medium group-hover:text-neutral-900">
                            <span>Ingredients & Nutritional Info</span>
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                         <div className="pt-4 text-neutral-700 text-sm space-y-2">
                            <p>Full spectrum electrolyte profile tailored for {product.name.includes("Sports") ? "heavy sweating and endurance" : "daily balance"}.</p>
                            <div className="relative h-64 w-full bg-neutral-100 rounded-lg overflow-hidden mt-4">
                                <Image src={product.nutritionalLabel} alt="Nutrition Label" fill className="object-contain" />
                            </div>
                         </div>
                    </details>

                     <details className="group border-b border-neutral-200 pb-4">
                        <summary className="flex justify-between items-center cursor-pointer list-none text-neutral-800 font-medium group-hover:text-neutral-900">
                            <span>How to Use</span>
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                         <div className="pt-4 text-neutral-700 text-sm">
                            <ol className="list-decimal pl-5 space-y-2">
                                <li>Mix one scoop with 500ml of water.</li>
                                <li>Shake well/stir and enjoy.</li>
                            </ol>
                            <br></br>
                            {product.name.includes("Sports")
                            ? "Best consumed during or immediately after intense physical activity."
                            : "Best consumed first thing in the morning or during travel/work."}
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
