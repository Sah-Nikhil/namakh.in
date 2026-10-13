import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { convexServerClient, orderWriteSecret, readableConvexError } from "@/lib/convex-server";

/**
 * Shipping price for a cart and PIN code. The Convex action prices it against
 * Shiprocket and stores the quote; this route only holds the server secret so
 * nobody else can spend the store's Shiprocket allowance.
 */
export async function POST(request: Request) {
  let body: { pincode?: string; items?: { slug: string; qty: number }[] };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const pincode = String(body.pincode ?? "").trim();
  const items = Array.isArray(body.items) ? body.items : [];
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return NextResponse.json({ error: "Enter a valid 6-digit PIN code." }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  try {
    const quote = await convexServerClient().action(api.shiprocket.quote, {
      secret: orderWriteSecret(),
      pincode,
      items: items.map((item) => ({ slug: String(item.slug), qty: Number(item.qty) })),
    });
    return NextResponse.json(quote);
  } catch (error) {
    console.error("Shipping quote failed", error);
    return NextResponse.json({ error: readableConvexError(error) }, { status: 502 });
  }
}
