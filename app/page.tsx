"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/ui/footer-modern";
import Hero from "@/components/hero";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import QuizModal from "@/components/quiz-modal";
import { ScienceSection, RootedSection, ProductCTASection } from "@/components/sections";

export default function Home() {
    const [isQuizOpen, setIsQuizOpen] = useState(false);

    return (
        <div className="bg-white text-black min-h-screen font-sans selection:bg-blue-500/30">
            <Navbar onQuizClick={() => setIsQuizOpen(true)} />
            <MobileNav onQuizClick={() => setIsQuizOpen(true)} />

            <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />

            <div className="font-sans flex flex-col items-center justify-items-center relative min-h-screen">

                {/* Hero Section */}
                <BackgroundGradientAnimation containerClassName="h-screen w-full relative">
                    <div className="absolute z-50 inset-0 flex items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl">
                        <div className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-white/80 to-white/20">
                            <Hero />
                        </div>
                    </div>
                </BackgroundGradientAnimation>


                <section className="w-full pt-16 pb-24 px-4 bg-white">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-5xl md:text-7xl font-bold">Hydrate smarter, not harder.</h2>
                            </div>
                    </div>
                </section>

                <RootedSection />
                <ScienceSection />
                <ProductCTASection onQuizClick={() => setIsQuizOpen(true)} />

            </div>
            <Footer/>
        </div>
    );
}
