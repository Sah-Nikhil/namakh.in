import NMKGraph from "@/components/graph";
import Navbar from "@/components/navbar";
import Footer from "@/components/ui/footer-modern";
import HeroWaterDroplet from "@/components/ui/hero-water-droplet";

export default function Home() {
    return (
        <div>
            <Navbar />
            <div className="font-sans flex flex-col items-center justify-items-center min-h-screen">
            <HeroWaterDroplet />
            <NMKGraph />
            </div>
            <Footer/>
        </div>
    );
}
