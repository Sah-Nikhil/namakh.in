import Link from "next/link";
import Image from "next/image";
import { products } from "@/lib/products";
import Navbar from "@/components/navbar";
import Footer from "@/components/ui/footer-modern";
import MobileNav from "@/components/mobile-nav";

export default function ShopIndex() {
  return (
    <div className="bg-white min-h-screen text-black font-sans selection:bg-blue-500/30">
      <Navbar />
      <MobileNav />

      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-black">
              The Collection
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Precision-formulated electrolytes for every lifestyle. Find your perfect balance.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {products.map((product) => (
            <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="group relative bg-neutral-50 border border-black/10 rounded-3xl overflow-hidden hover:border-black/20 hover:shadow-xl transition-all duration-500"
            >
              <div className="relative h-[400px] md:h-[500px] w-full p-8 flex items-center justify-center bg-gradient-to-b from-neutral-100 to-white">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="object-contain z-0 group-hover:scale-110 transition-transform duration-700 ease-out"
                 />
              </div>

              <div className="p-6 md:p-8 space-y-3 bg-white border-t border-black/5">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-black group-hover:text-blue-600 transition-colors">{product.name}</h2>
                        <p className="text-neutral-500 mt-1 line-clamp-1">{product.tagline}</p>
                    </div>
                    <div className="text-xl font-semibold bg-black text-white px-4 py-1 rounded-full">
                        ₹{product.price}
                    </div>
                </div>

                <div className="pt-2 flex gap-2 flex-wrap">
                    {product.features.slice(0, 2).map((feat, i) => (
                        <span key={i} className="text-xs px-3 py-1 rounded-full border border-black/10 bg-neutral-100 text-neutral-700">
                            {feat}
                        </span>
                    ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
