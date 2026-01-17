"use client";

import { motion } from "framer-motion";
import NMKGraph from "../graph";

export default function ScienceSection() {
    return (
        <section className="w-full py-12 px-4 bg-white dark:bg-neutral-900 relative overflow-hidden">
            <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                >

                    <p className="text-3xl dark:text-4xl font-bold leading-tight dark:text-blue-400 text-white">
                        &ldquo;When you hydrate right, you think sharper, perform better, and recover faster.&rdquo;
                    </p>
                    {/* <h2 className="text-xl font-semibold tracking-[0.3em] text-blue-400 dark:text-blue-300 uppercase">The Science Behind Namakh</h2> */}
                    <p className="pt-4 text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                        Dehydration by just <span className="text-black dark:text-white font-bold">2%</span> can reduce endurance, focus, and mood.
                        <br />
                        Namakh restores optimal fluid balance and cellular hydration - FAST.
                    </p>
                    <NMKGraph />
                </motion.div>
            </div>
        </section>
    );
}
