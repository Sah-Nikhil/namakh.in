import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import type { RunMutationCtx } from "@convex-dev/rate-limiter";
import { rateLimiter, retryMessage } from "./rateLimits";

/**
 * Sign-in for the admin panel, and nothing else. Buyers never authenticate:
 * an order is read with its tracking token, not an account.
 *
 * Email and password rather than passkeys, because the people running this
 * store sign in from whatever device is to hand. Creating an account is not
 * the same as being allowed in — every admin function checks the email
 * against ADMIN_EMAILS. See convex/admin.ts.
 */

const base = Password({ id: "password" });

/**
 * ConvexCredentials returns `{ id, type, authorize: async () => null, options }`,
 * where the visible `authorize` is a stub and the real one lives on `options`.
 * Overriding the visible one silently does nothing — the limit below was
 * written that way first and never fired, through five wrong passwords in a
 * row. Hence the cast.
 */
type CredentialsInternals = {
  options: {
    authorize: (params: Record<string, unknown>, ctx: RunMutationCtx) => Promise<unknown>;
  };
};

const internals = base as unknown as CredentialsInternals;
const originalAuthorize = internals.options.authorize;

/**
 * Password sign-in with a rate limit around it.
 *
 * The limit wraps `authorize` rather than the provider's `profile` hook, which
 * is called synchronously and so cannot await anything, and rather than the
 * form, which an attacker would skip by calling the action directly.
 * `authorize` is the one place every attempt has to pass through.
 *
 * A successful sign-in refunds its allowance, so the limit only accumulates
 * against failures. Someone signing in correctly all day never meets it;
 * someone guessing runs out in five tries.
 */
async function rateLimitedAuthorize(
  params: Record<string, unknown>,
  ctx: RunMutationCtx,
): Promise<unknown> {
  const email = String(params.email ?? "").trim().toLowerCase();
  const flow = String(params.flow ?? "signIn");
  const guarded = flow === "signIn" || flow === "signUp";

  if (guarded) {
    const global = await rateLimiter.limit(ctx, "adminSignInGlobal");
    if (!global.ok) throw new Error(retryMessage(global.retryAfter));

    if (email) {
      const perEmail = await rateLimiter.limit(ctx, "adminSignInPerEmail", { key: email });
      if (!perEmail.ok) throw new Error(retryMessage(perEmail.retryAfter));
    }
  }

  const result = await originalAuthorize(params, ctx);

  // The attempt was legitimate, so give the allowance back. A real admin is
  // never throttled by their own successful sign-ins.
  if (guarded && email) {
    await rateLimiter.reset(ctx, "adminSignInPerEmail", { key: email });
  }
  return result;
}

const RateLimitedPassword = {
  ...base,
  options: { ...internals.options, authorize: rateLimitedAuthorize },
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [RateLimitedPassword],
});
