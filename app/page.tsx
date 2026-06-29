"use client";

import { useState } from "react";
import { useScroll } from "framer-motion";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/ui/footer-modern";
import QuizModal from "@/components/quiz-modal";
import {
  LandingSection,
  Ticker,
  PrinciplesSection,
  ScienceSection,
  HowItWorksSection,
  ComparisonSection,
  ProductCTASection,
} from "@/components/sections";

export default function Home() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const { scrollY } = useScroll();

  return (
    <div className="grain relative min-h-screen bg-ink text-bone font-sans">
      <Navbar scrollY={scrollY} onQuizClick={() => setIsQuizOpen(true)} />
      <MobileNav onQuizClick={() => setIsQuizOpen(true)} />

      <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />

      <main className="relative z-[2]">
        {/* Hero — preserved sliding wordmark + arrow */}
        <LandingSection scrollY={scrollY} />

        <Ticker />
        <PrinciplesSection />
        <ScienceSection />
        <HowItWorksSection />
        <ComparisonSection />
        <ProductCTASection onQuizClick={() => setIsQuizOpen(true)} />
      </main>

      <Footer />
    </div>
  );
}
