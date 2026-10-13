import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { convexServerClient } from "@/lib/convex-server";
import { trackingPath } from "@/lib/commerce/tracking";
import { validateEmail } from "@/lib/commerce/validation";

/**
 * The "lost my tracking link" path. Order number plus the email it was placed
 * with returns the link. A wrong email and an order that does not exist give
 * the same answer, so this cannot be used to find which orders exist.
 */
export async function POST(request: Request) {
  let body: { orderNumber?: string; email?: string };
  try {
    body = (await request.json()) as { orderNumber?: string; email?: string };
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const orderNumber = (body.orderNumber ?? "").trim().toUpperCase();
  const email = (body.email ?? "").trim();

  if (!orderNumber) {
    return NextResponse.json({ error: "Enter your order number." }, { status: 400 });
  }
  const emailError = validateEmail(email);
  if (emailError) {
    return NextResponse.json({ error: emailError }, { status: 400 });
  }

  try {
    const token = await convexServerClient().query(api.orders.tokenForOrder, {
      orderNumber,
      email,
    });

    if (!token) {
      return NextResponse.json(
        { error: "No order matches that number and email. Check both and try again." },
        { status: 404 },
      );
    }

    return NextResponse.json({ path: trackingPath(orderNumber, token) });
  } catch (error) {
    console.error("Tracking lookup failed", error);
    return NextResponse.json(
      { error: "We could not look that up right now. Try again in a moment." },
      { status: 502 },
    );
  }
}
