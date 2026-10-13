"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { IconLoader2, IconLock } from "@tabler/icons-react";
import { TextField } from "@/components/checkout/field";

/**
 * Sign-in for the order panel. Both flows are here because someone has to
 * create the first account, but creating one grants nothing on its own — the
 * allowlist in convex/admin.ts decides who actually sees an order.
 */
export default function AdminSignIn({ notAllowed }: { notAllowed: boolean }) {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn("password", { email, password, flow });
    } catch (caught) {
      // Being rate limited is not the same as getting the password wrong, and
      // saying so would send someone hunting for a password that is correct.
      const raw = caught instanceof Error ? caught.message : "";
      const limited = raw.match(/Too many sign-in attempts[^\n"]*/);
      setError(
        limited
          ? limited[0]
          : flow === "signIn"
            ? "That email and password did not match."
            : "Could not create that account. The password needs at least 8 characters.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-line bg-ink-2 p-7 md:p-9">
        <span className="kicker">/ Namakh</span>
        <h1 className="display-xl mt-4 text-3xl text-bone">Order panel</h1>
        <p className="mt-3 text-sm text-bone-dim">
          {flow === "signIn"
            ? "Sign in to see orders as they come in."
            : "Create your account. Access is granted separately, by email."}
        </p>

        {notAllowed && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-[var(--color-sports)]/40 px-4 py-3 text-sm text-[var(--color-sports)]"
          >
            You are signed in, but this email is not on the allowlist. Ask for it to be added,
            then reload.
          </p>
        )}

        <form onSubmit={submit} className="mt-7 space-y-4">
          <TextField
            id="admin-email"
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            autoComplete="email"
            placeholder="you@namakh.in"
          />
          <TextField
            id="admin-password"
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            autoComplete={flow === "signIn" ? "current-password" : "new-password"}
            placeholder="••••••••"
          />

          {error && (
            <p role="alert" className="text-xs text-[var(--color-sports)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-bone py-3.5 text-sm font-medium text-ink transition-colors hover:bg-salt disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconLock className="h-4 w-4" />
            )}
            {flow === "signIn" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setFlow(flow === "signIn" ? "signUp" : "signIn");
            setError(null);
          }}
          className="mt-5 w-full text-center text-xs text-bone-faint underline underline-offset-4 transition-colors hover:text-bone-dim"
        >
          {flow === "signIn" ? "Need an account?" : "Already have an account?"}
        </button>
      </div>
    </div>
  );
}
