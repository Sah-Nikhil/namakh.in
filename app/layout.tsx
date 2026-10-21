import type { Metadata } from "next";
import { Geist, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/components/cart/cart-context";
import StorefrontCart from "@/components/cart/storefront-cart";
import { QuizProvider } from "@/components/quiz/quiz-context";
import { Analytics } from "@vercel/analytics/next";
import { SEARCH_INDEXING } from "@/lib/site";

// Body / UI grotesque
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Editorial display serif — echoes the high-contrast NAMAKH wordmark
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Technical / numeric labels (/01, stats, prices)
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Namakh — Electrolytes, done right.",
  description:
    "Precision-formulated electrolytes. No nonsense. Two blends, engineered for how you actually live and train.",
  // Kept out of search until Razorpay approves the store. See lib/site.ts.
  robots: SEARCH_INDEXING ? undefined : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${fraunces.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          <CartProvider>
            <QuizProvider>
              {children}
              <StorefrontCart />
            </QuizProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
      <Analytics />
    </html>
  );
}
