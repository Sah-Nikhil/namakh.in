"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconSearch } from "@tabler/icons-react";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/ui/footer-modern";
import { TextField } from "@/components/checkout/field";
import { COMMERCE } from "@/lib/commerce/config";

/**
 * Lookup form for anyone who lost their tracking link. The link itself is the
 * fast path; this is the fallback, and it needs the email as a second factor
 * because order numbers alone are guessable.
 */
export default function TrackLookupPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSearching(true);
    setError(null);

    try {
      const response = await fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const payload = (await response.json()) as { path?: string; error?: string };

      if (!response.ok || !payload.path) {
        setError(payload.error ?? "We could not find that order.");
        return;
      }
      router.push(payload.path);
    } catch {
      setError("Network problem. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="grain relative min-h-screen bg-ink text-bone font-sans">
      <Navbar />
      <MobileNav />

      <main className="relative z-[2] mx-auto max-w-2xl px-5 pb-32 pt-28 md:px-10 md:pt-40">
        <header className="mb-10">
          <span className="kicker">/ Tracking</span>
          <h1 className="display-xl mt-4 text-4xl text-bone md:text-6xl">Track your order</h1>
          <p className="mt-5 text-bone-dim">
            Enter your order number and the email you used at checkout. Your order number looks
            like <span className="font-mono-jb text-bone">NMK-XXXXX-XXXX</span> and is on your
            confirmation page.
          </p>
        </header>

        <form onSubmit={submit} className="rounded-3xl border border-line bg-ink-2 p-6 md:p-8">
          <div className="space-y-4">
            <TextField
              id="orderNumber"
              label="Order number"
              value={orderNumber}
              onChange={(v) => setOrderNumber(v.toUpperCase())}
              placeholder="NMK-XXXXX-XXXX"
              autoComplete="off"
              spellCheck={false}
            />
            <TextField
              id="email"
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-[var(--color-sports)]/40 px-4 py-3 text-sm text-[var(--color-sports)]"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={searching}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-bone py-4 text-base font-medium text-ink transition-colors hover:bg-salt disabled:cursor-not-allowed disabled:opacity-60"
          >
            {searching ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" /> Looking it up…
              </>
            ) : (
              <>
                <IconSearch className="h-4 w-4" /> Track order
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-sm text-bone-faint">
          Still stuck? Email{" "}
          <a
            href={`mailto:${COMMERCE.support.email}`}
            className="text-bone-dim underline underline-offset-2 hover:text-bone"
          >
            {COMMERCE.support.email}
          </a>{" "}
          or call {COMMERCE.support.phone}.
        </p>
      </main>

      <Footer />
    </div>
  );
}
