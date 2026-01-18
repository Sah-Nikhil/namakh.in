"use client";

import React, { useState } from "react";
import { useScroll } from 'framer-motion';
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/ui/footer-modern";
import Hero from "@/components/hero";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import QuizModal from "@/components/quiz-modal";
import { ScienceSection, RootedSection, ProductCTASection, BenefitsSection } from "@/components/sections";
import LandingSection from "@/components/sections/landing-section";

export default function Home() {
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const { scrollY } = useScroll();

    return (
        <div className="bg-white dark:bg-neutral-900 text-black dark:text-white min-h-screen font-sans selection:bg-blue-500/30">
            <Navbar scrollY={scrollY} onQuizClick={() => setIsQuizOpen(true)} />
            <MobileNav onQuizClick={() => setIsQuizOpen(true)} />

            <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />

            <div className="font-sans flex flex-col items-center justify-items-center relative min-h-screen">

                {/* Hero Section */}
                <BackgroundGradientAnimation containerClassName="h-screen w-full relative">
                    <div className="absolute z-50 inset-0 flex items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl">
                        <div className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-white/80 to-white/20">
                            <LandingSection scrollY={scrollY} />
                            {/* <Hero /> */}
                        </div>
                    </div>
                </BackgroundGradientAnimation>


                <section className="w-full pt-24 px-4 bg-white dark:bg-neutral-900">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold dark:text-white px-2">Electrolytes, Done Right.</h2>
                        </div>
                    </div>
                </section>

                <ScienceSection />
                <RootedSection />
                <ProductCTASection onQuizClick={() => setIsQuizOpen(true)} />

            </div>
            <Footer/>
        </div>
    );
}
