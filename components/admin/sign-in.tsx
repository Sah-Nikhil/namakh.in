"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ConvexError } from "convex/values";
import { IconLoader2, IconLock, IconMail } from "@tabler/icons-react";
import { TextField } from "@/components/checkout/field";

/**
 * Sign-in for the order panel: an allowlisted email, then a 6-digit code sent
 * to that inbox. There is no sign-up. Only emails in ADMIN_EMAILS get a code,
 * and convex/admin.ts re-checks the allowlist on every call.
 */

/** The sentence we wrote on the server, without Convex's framing around it. */
function messageFrom(caught: unknown, fallback: string): string {
  if (caught instanceof ConvexError && typeof caught.data === "string") return caught.data;
  const raw = caught instanceof Error ? caught.message : "";
  const known = raw.match(
    /(Too many sign-in attempts[^\n"]*|This email cannot sign in[^\n"]*|Could not send the code[^\n"]*|Sign-in email is not set up[^\n"]*)/,
  );
  return known ? known[0] : fallback;
}

export default function AdminSignIn({ notAllowed }: { notAllowed: boolean }) {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const normalisedEmail = email.trim().toLowerCase();

  const sendCode = async () => {
    setBusy(true);
    setError(null);
    try {
      await signIn("admin-code", { email: normalisedEmail });
      setCode("");
      setStep("code");
    } catch (caught) {
      setError(messageFrom(caught, "Could not send the code. Try again."));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      await signIn("admin-code", { email: normalisedEmail, code: code.trim() });
    } catch (caught) {
      setError(messageFrom(caught, "That code did not work. Check it, or send a new one."));
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    void (step === "email" ? sendCode() : verify());
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-line bg-ink-2 p-7 md:p-9">
        <span className="kicker">/ Namakh</span>
        <h1 className="display-xl mt-4 text-3xl text-bone">Order panel</h1>
        <p className="mt-3 text-sm text-bone-dim">
          {step === "email"
            ? "Enter your admin email and we will send you a sign-in code."
            : `We sent a 6-digit code to ${normalisedEmail}. It expires in 10 minutes.`}
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
          {step === "email" ? (
            <TextField
              id="admin-email"
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              autoComplete="email"
              placeholder="you@namakh.in"
            />
          ) : (
            <TextField
              id="admin-code"
              label="Code"
              value={code}
              onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
            />
          )}

          {error && (
            <p role="alert" className="text-xs text-[var(--color-sports)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || (step === "email" ? !normalisedEmail : code.length !== 6)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-bone py-3.5 text-sm font-medium text-ink transition-colors hover:bg-salt disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : step === "email" ? (
              <IconMail className="h-4 w-4" />
            ) : (
              <IconLock className="h-4 w-4" />
            )}
            {step === "email" ? "Send code" : "Sign in"}
          </button>
        </form>

        {step === "code" && (
          <div className="mt-5 flex justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError(null);
              }}
              className="text-bone-faint underline underline-offset-4 transition-colors hover:text-bone-dim"
            >
              Use a different email
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void sendCode()}
              className="text-bone-faint underline underline-offset-4 transition-colors hover:text-bone-dim disabled:opacity-50"
            >
              Send a new code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
