"use client";

import Link from "next/link";
import BenefitsSection from "./benefit-section";

interface ProductCTASectionProps {
    onQuizClick: () => void;
}

export default function ProductCTASection({ onQuizClick }: ProductCTASectionProps) {
    return (
        <section className="w-full pt-16 pb-24 px-4 bg-white dark:bg-neutral-900">
            <div className="max-w-4xl mx-auto text-center space-y-10">
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold dark:text-white px-2">Find your perfect blend today.</h2>
                    {/* <p className="text-xl text-neutral-600 dark:text-neutral-300"></p> */}
                </div>


                <div className="grid md:grid-cols-2 gap-8">
                    <div className="group p-8 rounded-3xl bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 hover:border-blue-500/50 transition-all">
                        <h3 className="text-2xl font-bold mb-2 dark:text-white">Hydration Blend</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-6 text-sm">For daily balance & wellness.</p>
                        <ul className="text-left space-y-2 mb-8 text-sm text-neutral-600 dark:text-neutral-300">
                            <li className="flex gap-2 justify-center">600mg Sodium</li>
                            <li className="flex gap-2 justify-center">Zero Sugar</li>
                            <li className="flex gap-2 justify-center">Daily Use</li>
                        </ul>
                        <Link href="/shop/hydration-blend" className="block w-[70%] mx-auto py-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black font-bold transition-all">
                            Shop Hydration
                        </Link>
                    </div>

                    <div className="group p-8 rounded-3xl bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 hover:border-red-500/50 transition-all">
                        <h3 className="text-2xl font-bold mb-2 dark:text-white">Sports Blend</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-6 text-sm">For athletes & sweat.</p>
                        <ul className="text-left space-y-2 mb-8 text-sm text-neutral-600 dark:text-neutral-300">
                            <li className="flex gap-2 justify-center">1000mg Sodium</li>
                            <li className="flex gap-2 justify-center">3g Carb for Energy</li>
                            <li className="flex gap-2 justify-center">Intense Training</li>
                        </ul>
                        <Link href="/shop/sports-blend" className="block w-[70%] mx-auto py-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black font-bold transition-all">
                            Shop Sports
                        </Link>
                    </div>
                </div>
                <BenefitsSection />
                <div>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-4">Unsure which one is right for you?</p>
                    <button
                        onClick={onQuizClick}
                        className="px-8 py-4 rounded-full bg-gradient-to-br from-neutral-700 to-black dark:from-neutral-600 dark:to-neutral-500 text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-black/40 border border-white/10 dark:border-black/10"
                    >
                        Take the Quiz
                    </button>
                </div>
            </div>
        </section>
    );
}
