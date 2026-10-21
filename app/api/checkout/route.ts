import { after, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { convexServerClient, orderWriteSecret, readableConvexError } from "@/lib/convex-server";
import { hasErrors, validateDraft } from "@/lib/commerce/validation";
import type { CheckoutDraft } from "@/lib/commerce/types";
import { orderReceivedEmail } from "@/lib/email/order-received";
import { sendEmail } from "@/lib/email/send";
import type { Id } from "@/convex/_generated/dataModel";

type CheckoutRequest = {
  items: { slug: string; qty: number }[];
  draft: CheckoutDraft;
  /** The stored shipping quote the buyer saw. The price itself is never sent. */
  quoteId?: string;
};

/**
 * Checkout entry point for the browser.
 *
 * Pricing and the write both happen inside the Convex mutation, in one
 * transaction, from the catalogue — see convex/orders.ts. This route validates
 * early so the buyer gets per-field errors instead of one generic failure, and
 * holds the write secret so the browser never sees it.
 */
export async function POST(request: Request) {
  let body: CheckoutRequest;
  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { items, draft, quoteId } = body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (!draft) {
    return NextResponse.json({ error: "Delivery details are missing." }, { status: 400 });
  }

  const errors = validateDraft(draft);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: "Check the highlighted fields.", errors }, { status: 422 });
  }

  try {
    const order = await convexServerClient().mutation(api.orders.place, {
      secret: orderWriteSecret(),
      items: items.map((item) => ({ slug: String(item.slug), qty: Number(item.qty) })),
      draft: {
        email: draft.email,
        marketingOptIn: draft.marketingOptIn,
        address: draft.address,
        paymentMethod: draft.paymentMethod === "cod" ? "cod" : "razorpay",
        notes: draft.notes ?? "",
      },
      ...(quoteId ? { quoteId: quoteId as Id<"shippingQuotes"> } : {}),
    });

    // ---------------------------------------------------------------------
    // Razorpay handoff goes here, and nowhere else.
    //
    // The order is now saved with status "awaiting_payment". When keys land:
    //
    //   const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!,
    //                              key_secret: process.env.RAZORPAY_KEY_SECRET! });
    //   const rzpOrder = await rzp.orders.create({
    //     amount: order.totals.total * 100,   // paise
    //     currency: COMMERCE.currencyCode,
    //     receipt: order.orderNumber,
    //   });
    //
    // Return rzpOrder.id to the client, open the Razorpay modal against it,
    // and let Razorpay's webhook call convex/orders.ts:recordPayment — which
    // already exists — rather than trusting the browser's success callback.
    // ---------------------------------------------------------------------

    // Sent after the response, so a slow mail provider can't cost a saved order
    // its 201 (the buyer would see an error and order again). On Vercel,
    // after() keeps the function alive until the send finishes.
    const origin = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(
      /\/+$/,
      "",
    );
    after(async () => {
      try {
        await sendEmail(
          { to: order.email, ...orderReceivedEmail(order, origin) },
          `order-received/${order.orderNumber}`,
        );
      } catch (error) {
        console.error("Order email could not be built", error);
      }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order placement failed", error);
    return NextResponse.json({ error: readableConvexError(error) }, { status: 502 });
  }
}
