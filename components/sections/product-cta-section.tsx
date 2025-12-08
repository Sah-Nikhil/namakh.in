"use client";

import Link from "next/link";

interface ProductCTASectionProps {
    onQuizClick: () => void;
}

export default function ProductCTASection({ onQuizClick }: ProductCTASectionProps) {
    return (
        <section className="w-full py-32 px-4 bg-white">
            <div className="max-w-4xl mx-auto text-center space-y-12">
                <div className="space-y-4">
                    <h2 className="text-5xl md:text-7xl font-bold">Hydrate smarter, not harder.</h2>
                    <p className="text-xl text-neutral-600">Find your perfect blend today.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="group p-8 rounded-3xl bg-white border border-black/10 hover:border-blue-500/50 transition-all">
                        <h3 className="text-2xl font-bold mb-2">Hydration Blend</h3>
                        <p className="text-neutral-600 mb-6 text-sm">For daily balance & wellness.</p>
                        <ul className="text-left space-y-2 mb-8 text-sm text-neutral-600">
                            <li className="flex gap-2">🔹 600mg Sodium</li>
                            <li className="flex gap-2">🔹 Zero Sugar</li>
                            <li className="flex gap-2">🔹 Daily Use</li>
                        </ul>
                        <Link href="/shop/hydration-blend" className="block w-full py-3 rounded-full bg-black/5 hover:bg-black text-black hover:text-white font-bold transition-all">
                            Shop Hydration
                        </Link>
                    </div>

                    <div className="group p-8 rounded-3xl bg-white border border-black/10 hover:border-red-500/50 transition-all">
                        <h3 className="text-2xl font-bold mb-2">Sports Blend</h3>
                        <p className="text-neutral-600 mb-6 text-sm">For athletes & sweat.</p>
                        <ul className="text-left space-y-2 mb-8 text-sm text-neutral-600">
                            <li className="flex gap-2">🔥 1000mg Sodium</li>
                            <li className="flex gap-2">🔥 3g Carb for Energy</li>
                            <li className="flex gap-2">🔥 Intense Training</li>
                        </ul>
                        <Link href="/shop/sports-blend" className="block w-full py-3 rounded-full bg-black/5 hover:bg-black text-black hover:text-white font-bold transition-all">
                            Shop Sports
                        </Link>
                    </div>
                </div>

                <div className="pt-12">
                    <p className="text-neutral-500 mb-4">Unsure which one is right for you?</p>
                    <button
                        onClick={onQuizClick}
                        className="px-8 py-4 rounded-full bg-gradient-to-br from-neutral-700 to-black text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-black/40 border border-white/10"
                    >
                        Take the Quiz
                    </button>
                </div>
            </div>
        </section>
    );
}
