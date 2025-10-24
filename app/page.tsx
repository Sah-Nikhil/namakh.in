import NMKGraph from "@/components/graph";
import Navbar from "@/components/navbar";
import Footer from "@/components/ui/footer-modern";
import Hero from "@/components/hero";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

export default function Home() {
    return (
        <div>
            <Navbar />
            <div className="font-sans flex flex-col items-center justify-items-center min-h-screen">
            <BackgroundGradientAnimation>
            <div className="absolute z-50 inset-0 flex items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl">
                <p className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-white/80 to-white/20">
                <Hero />
                </p>
            </div>
            </BackgroundGradientAnimation>
            <NMKGraph />
            </div>
            <Footer/>
        </div>
    );
}
