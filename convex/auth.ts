import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";
import { ConvexError } from "convex/values";
import { Resend } from "resend";
import { isAdminEmail } from "./adminAllowlist";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { rateLimiter, retryMessage } from "./rateLimits";

/**
 * Sign-in for the admin panel, and nothing else. Buyers never authenticate:
 * an order is read with its tracking token, not an account.
 *
 * Email plus a 6-digit code, no passwords. The admin types an allowlisted
 * email, a code goes to that inbox, and the code signs them in. Nobody off the
 * allowlist gets a code or an account: `createOrUpdateUser` below refuses them
 * before anything is written. convex/admin.ts still re-checks the allowlist on
 * every call, so removing an email from ADMIN_EMAILS locks it out at once.
 *
 * Brute force: Convex Auth allows 10 wrong codes per hour per account
 * (`signIn.maxFailedAttempsPerHour`), and a code expires after 10 minutes, so
 * guessing a 6-digit code is not a realistic attack. Requests for a code are
 * limited separately so nobody can flood the admin inbox. Known residue: since
 * the admin email is public, someone can spend those 10 wrong guesses and lock
 * the admin out for up to an hour (ADR 0006).
 */

const CODE_TTL_SECONDS = 10 * 60;

/** Delete every session (and its refresh tokens) a user currently has. */
async function revokeSessions(ctx: MutationCtx, userId: Id<"users">) {
  const sessions = await ctx.db
    .query("authSessions")
    .withIndex("userId", (q) => q.eq("userId", userId))
    .collect();
  for (const session of sessions) {
    const tokens = await ctx.db
      .query("authRefreshTokens")
      .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
      .collect();
    for (const token of tokens) await ctx.db.delete("authRefreshTokens", token._id);
    await ctx.db.delete("authSessions", session._id);
  }
}

/** Six digits from the platform CSPRNG, without modulo bias. */
function sixDigitCode(): string {
  const limit = 4_294_000_000; // largest multiple of 1e6 below 2^32
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return String(buffer[0] % 1_000_000).padStart(6, "0");
}

const AdminEmailCode = Email({
  id: "admin-code",
  maxAge: CODE_TTL_SECONDS,
  generateVerificationToken: async () => sixDigitCode(),
  // The request limits are checked in `createOrUpdateUser` below, which runs
  // before the new code replaces the old one. Checking them here would be too
  // late: a refused request would still have cancelled the code already sent.
  async sendVerificationRequest({ identifier: email, token }) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      console.error("RESEND_API_KEY or EMAIL_FROM is not set on this Convex deployment.");
      throw new ConvexError("Sign-in email is not set up yet.");
    }

    const minutes = CODE_TTL_SECONDS / 60;
    // Cap the call so a stalled Resend request can't leave the form spinning.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to: email,
      subject: `${token} is your Namakh order panel code`,
      text: `Your sign-in code is ${token}.\n\nIt expires in ${minutes} minutes. If you did not try to sign in, ignore this email.`,
      html: `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#111">
  <div style="max-width:420px;margin:0 auto;background:#fff;padding:28px;border-radius:8px">
    <p style="margin:0 0 12px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#777">Namakh order panel</p>
    <p style="margin:0 0 16px;font-size:15px">Your sign-in code is</p>
    <p style="margin:0 0 16px;font-size:32px;font-weight:bold;letter-spacing:6px">${token}</p>
    <p style="margin:0;font-size:13px;color:#777">It expires in ${minutes} minutes. If you did not try to sign in, ignore this email.</p>
  </div>
</body></html>`,
    }, { signal: controller.signal }).finally(() => clearTimeout(timer));
    if (error) {
      console.error("Admin sign-in code could not be sent", error);
      throw new ConvexError("Could not send the code. Try again in a minute.");
    }
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [AdminEmailCode],
  callbacks: {
    /**
     * Replaces Convex Auth's default user upsert. Called twice per sign-in:
     * when a code is requested (`args.type === "email"`), inside the same
     * transaction that then writes the code, and when the code is redeemed
     * (`args.type === "verification"`).
     */
    async createOrUpdateUser(genericCtx, args) {
      // Convex Auth types this ctx against a generic data model; ours has the
      // users table and its indexes.
      const ctx = genericCtx as unknown as MutationCtx;
      const email = typeof args.profile.email === "string" ? args.profile.email : "";

      // Off the allowlist: no user, no account, no code, no email.
      if (!isAdminEmail(email)) {
        throw new ConvexError("This email cannot sign in to the order panel.");
      }

      if (args.type !== "verification") {
        // Only the exact lowercase form gets a code. Convex Auth keys accounts
        // and its wrong-code limit on the raw string, so "Admin@x.com" and
        // "admin@x.com" would otherwise be separate accounts with separate
        // guess budgets. The form always sends lowercase.
        if (email !== email.trim().toLowerCase()) {
          throw new ConvexError("Enter the email in lowercase.");
        }
        // Limits on asking for a code. Throwing here rolls back the whole
        // request, so a refused request leaves the last emailed code valid.
        const global = await rateLimiter.limit(ctx, "adminSignInGlobal");
        if (!global.ok) throw new ConvexError(retryMessage(global.retryAfter));
        const perEmail = await rateLimiter.limit(ctx, "adminSignInPerEmail", { key: email });
        if (!perEmail.ok) throw new ConvexError(retryMessage(perEmail.retryAfter));
      }

      // One user per email: reuse the row an old password account created.
      const userId =
        args.existingUserId ??
        (await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", email))
          .first())?._id ??
        (await ctx.db.insert("users", { email }));

      if (args.type === "verification") {
        const user = await ctx.db.get("users", userId);
        if (user && user.emailVerificationTime === undefined) {
          // First code sign-in for this user. Before this, the row may have
          // been reachable through the old password sign-in, which never
          // proved ownership of the inbox. End every session it already has;
          // `requireAdmin` refuses users without `emailVerificationTime`.
          await ctx.db.patch("users", userId, { emailVerificationTime: Date.now() });
          await revokeSessions(ctx, userId);
        }
      }
      return userId;
    },
  },
});
