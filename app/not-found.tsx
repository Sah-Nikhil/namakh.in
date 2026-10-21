import Link from "next/link";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/ui/footer-modern";

export default function NotFound() {
  return (
    <div className="grain relative min-h-screen bg-ink text-bone font-sans">
      <Navbar />
      <MobileNav />
      <main className="relative z-[2] flex min-h-[80vh] items-center justify-center px-6">
        <div className="max-w-xl py-32 text-center">
          <span className="kicker">/ 404</span>
          <h1 className="display-xl mt-6 text-4xl text-bone md:text-6xl">Page not found.</h1>
          <p className="mt-5 text-lg text-bone-dim">
            The page you were looking for doesn&rsquo;t exist or has moved.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-salt"
            >
              Shop the blends
            </Link>
            <Link
              href="/"
              className="rounded-full border border-line px-6 py-3 text-sm text-bone-dim transition-colors hover:border-bone/30 hover:text-bone"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
