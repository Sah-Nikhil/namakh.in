"use client";

import { motion } from "framer-motion";
import NMKGraph from "../graph";

const audienceItems = [
    { icon: "🏃‍♂", label: "Athletes\n& Lifters" },
    { icon: "🌞", label: "Heat & Humid\nClimates" },
    { icon: "🧘", label: "Everyday\nWellness" },
    { icon: "💼", label: "Work\n& Travel" },
];

export default function ScienceSection() {
    return (
        <section className="w-full py-16 px-4 bg-white relative overflow-hidden">
            <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                >
                    <h2 className="text-sm font-semibold tracking-[0.3em] text-blue-400 uppercase">🧠 The Science Behind Namakh</h2>
                    <p className="text-3xl md:text-5xl font-bold leading-tight">
                        &ldquo;When you hydrate right, you think sharper, perform better, and recover faster.&rdquo;
                    </p>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                        Dehydration by just <span className="text-black font-bold">2%</span> can reduce endurance, focus, and mood.
                        <br />
                        Namakh restores optimal fluid balance and cellular hydration — fast.
                    </p>
                    <NMKGraph />

                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-2 pt-12"
                >
                    <h1 className="text-[1.4rem] font-semibold tracking-[0.3em] text-blue-400 uppercase">Who is Namakh for?</h1>
                </motion.div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
                    {audienceItems.map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-black/5 border border-black/10 hover:bg-black/10 transition-colors">
                            <span className="text-4xl">{item.icon}</span>
                            <span className="text-sm font-medium text-neutral-600 whitespace-pre-line">{item.label}</span>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
