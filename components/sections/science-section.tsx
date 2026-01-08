"use client";

import { motion } from "framer-motion";
import NMKGraph from "../graph";



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
                    <h2 className="text-sm font-semibold tracking-[0.3em] text-blue-400 uppercase">The Science Behind Namakh</h2>
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


            </div>
        </section>
    );
}
