import { NextResponse } from "next/server";
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
    const raw = error instanceof Error ? error.message : "";
    const limited = raw.match(/Too many sign-ups[^\n]*/);
    if (limited) return NextResponse.json({ error: limited[0] }, { status: 429 });
    console.error("Newsletter sign-up failed", error);
    return NextResponse.json({ error: "Could not sign you up. Try again." }, { status: 502 });
  }
}
