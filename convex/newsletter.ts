import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { assertTrustedCaller } from "./orders";
import { rateLimiter } from "./rateLimits";
import { validateEmail } from "../lib/commerce/validation";

type Source = "footer" | "checkout";

/**
 * Add an email to the list. An email already on it keeps its first source and
 * date, which is when consent was first given. Shared with `orders.place`,
 * which records buyers who ticked the opt-in box.
 */
export async function addSubscriber(ctx: MutationCtx, rawEmail: string, source: Source) {
  const email = rawEmail.trim().toLowerCase();
  const existing = await ctx.db
    .query("subscribers")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();
  if (existing) return;
  await ctx.db.insert("subscribers", { email, source });
}

/**
 * The footer sign-up. Called from `app/api/newsletter`, which holds the write
 * secret, so the browser cannot write to the table directly.
 */
export const subscribe = mutation({
  args: { secret: v.string(), email: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertTrustedCaller(args.secret);

    const invalid = validateEmail(args.email);
    if (invalid) throw new Error(invalid);

    const limit = await rateLimiter.limit(ctx, "newsletterGlobal");
    if (!limit.ok) throw new Error("Too many sign-ups right now. Try again in a minute.");

    await addSubscriber(ctx, args.email, "footer");
    return null;
  },
});
