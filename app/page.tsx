"use client";

import { useScroll } from "framer-motion";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/ui/footer-modern";
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
  const { scrollY } = useScroll();

  return (
    <div className="grain relative min-h-screen bg-ink text-bone font-sans">
      <Navbar scrollY={scrollY} />
      <MobileNav />

      <main className="relative z-[2]">
        {/* Hero — preserved sliding wordmark + arrow */}
        <LandingSection scrollY={scrollY} />

        <Ticker />
        <PrinciplesSection />
        <ScienceSection />
        <HowItWorksSection />
        <ComparisonSection />
        <ProductCTASection />
      </main>

      <Footer />
    </div>
  );
}
