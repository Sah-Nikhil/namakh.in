"use client";

import { useState } from "react";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";

type State =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "done" }
  | { status: "error"; message: string };

/** The footer sign-up. Posts to /api/newsletter; nothing is emailed on sign-up. */
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setState({ status: "done" });
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setState({ status: "error", message: body.error ?? "Could not sign you up. Try again." });
    } catch {
      setState({ status: "error", message: "Could not sign you up. Try again." });
    }
  };

  if (state.status === "done") {
    return (
      <p role="status" className="flex w-full max-w-sm items-center gap-2 text-sm text-bone-dim">
        <IconCheck className="h-4 w-4 text-salt" /> You&rsquo;re on the list.
      </p>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@email.com"
          className="w-full rounded-full border border-line bg-ink-2 px-5 py-3 text-sm text-bone placeholder:text-bone-faint focus:border-bone/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state.status === "sending"}
          className="flex shrink-0 items-center gap-2 rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-salt disabled:opacity-60"
        >
          {state.status === "sending" && <IconLoader2 className="h-4 w-4 animate-spin" />}
          Notify me
        </button>
      </form>
      {state.status === "error" && (
        <p role="alert" className="mt-2 px-5 text-xs text-[var(--color-sports)]">
          {state.message}
        </p>
      )}
    </div>
  );
}
