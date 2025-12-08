import Link from "next/link";
import Image from "next/image";
import { products } from "@/lib/products";
import Navbar from "@/components/navbar";
import Footer from "@/components/ui/footer-modern";

export default function ShopIndex() {
  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <Navbar />

      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
            The Collection
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Precision-formulated electrolytes for every lifestyle. Find your perfect balance.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {products.map((product) => (
            <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="group relative bg-zinc-900/30 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />

              <div className="relative h-[500px] w-full p-8 flex items-center justify-center bg-zinc-950">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="object-contain z-0 group-hover:scale-110 transition-transform duration-700 ease-out"
                 />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 z-20 space-y-2">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold group-hover:text-blue-400 transition-colors">{product.name}</h2>
                        <p className="text-zinc-400 mt-1 line-clamp-1">{product.tagline}</p>
                    </div>
                    <div className="text-xl font-semibold bg-white/10 px-4 py-1 rounded-full backdrop-blur-md">
                        ₹{product.price}
                    </div>
                </div>

                <div className="pt-4 flex gap-2 overflow-hidden">
                    {product.features.slice(0, 2).map((feat, i) => (
                        <span key={i} className="text-xs px-3 py-1 rounded-full border border-white/10 bg-black/50 text-zinc-300">
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
