import { NextResponse } from "next/server";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import { convexServerClient, orderWriteSecret } from "@/lib/convex-server";
import { validateEmail } from "@/lib/commerce/validation";

/**
 * The footer's "Notify me" form. Holds the write secret so the browser never
 * writes to Convex directly; the mutation validates and rate limits again.
 */
export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = (await request.json()) as { email?: unknown });
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const value = typeof email === "string" ? email : "";
  const invalid = validateEmail(value);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 422 });

  try {
    await convexServerClient().mutation(api.newsletter.subscribe, {
      secret: orderWriteSecret(),
      email: value,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    // Our own messages (bad email, rate limit) arrive as ConvexError; a
    // production deployment hides the text of any other error.
    if (error instanceof ConvexError && typeof error.data === "string") {
      const status = error.data.startsWith("Too many") ? 429 : 400;
      return NextResponse.json({ error: error.data }, { status });
    }
    console.error("Newsletter sign-up failed", error);
    return NextResponse.json({ error: "Could not sign you up. Try again." }, { status: 502 });
  }
}
