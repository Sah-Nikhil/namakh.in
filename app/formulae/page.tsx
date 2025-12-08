import React from "react";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/ui/footer-modern";

export default function FormulaePage() {
	return (
		<div className="bg-white min-h-screen text-black font-sans selection:bg-blue-500/30">
			<Navbar />
			<MobileNav />
			<main className="min-h-screen flex items-center justify-center">
				<h1 className="text-2xl">Formulae</h1>
			</main>
			<Footer />
		</div>
	);
}
