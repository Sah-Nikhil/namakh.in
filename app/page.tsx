"use client";

import React, { useState } from "react";
import NMKGraph from "@/components/graph";
import Navbar from "@/components/navbar";
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

            <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />

            <div className="font-sans flex flex-col items-center justify-items-center relative min-h-screen">

                {/* Hero Section */}
                <BackgroundGradientAnimation containerClassName="h-screen w-full relative">
                    <div className="absolute z-50 inset-0 flex items-center justify-center pointer-events-none px-4 text-center">
                        <div className="drop-shadow-2xl">
                            <Hero />
                        </div>
                    </div>
                </BackgroundGradientAnimation>


                <ScienceSection />
                <RootedSection />
                <ProductCTASection onQuizClick={() => setIsQuizOpen(true)} />

            </div>
            <Footer/>
        </div>
    );
}
