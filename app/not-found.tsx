import React from "react";
import Image from "next/image";
import Navbar from "../components/navbar";
import Footer from "../components/ui/footer-modern";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-white text-gray-900 px-6">
        <div className="max-w-3xl text-center py-24">
          <div className="mb-6">
            <Image src="/file.svg" alt="404" width={120} height={120} className="mx-auto" />
          </div>
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-6">Sorry — the page you were looking for doesn’t exist.</p>
          {/* <div className="flex items-center justify-center gap-4">
            <Link href="/" className="inline-block bg-black text-white px-6 py-3 rounded font-semibold hover:opacity-90">Go home</Link>
            <Link href="/" className="inline-block text-sm text-gray-500 underline">Or contact us</Link>
          </div> */}
        </div>
      </main>
      <Footer />
    </>
  );
}
