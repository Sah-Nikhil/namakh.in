import { after, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { convexServerClient, orderWriteSecret, readableConvexError } from "@/lib/convex-server";
import { hasErrors, validateDraft } from "@/lib/commerce/validation";
import type { CheckoutDraft } from "@/lib/commerce/types";
import { orderReceivedEmail } from "@/lib/email/order-received";
import { sendEmail } from "@/lib/email/send";
import type { Id } from "@/convex/_generated/dataModel";
import { PAYMENTS_LIVE } from "@/lib/commerce/config";
import { paymentReturnUrl, siteOrigin } from "@/lib/site-origin";

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
 *
 * For a prepaid order it then opens the PhonePe payment and returns `payUrl`,
 * PhonePe's payment page, for the browser to go to (ADR 0007).
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
        paymentMethod: draft.paymentMethod === "cod" ? "cod" : "phonepe",
        notes: draft.notes ?? "",
      },
      ...(quoteId ? { quoteId: quoteId as Id<"shippingQuotes"> } : {}),
    });

    const origin = siteOrigin(request);
    const prepaid = PAYMENTS_LIVE && order.paymentMethod === "phonepe";

    // A prepaid order is emailed by Convex once PhonePe confirms the payment
    // (convex/emails.ts), so an abandoned payment never gets "order received".
    // Everything else is emailed now. Sent after the response, so a slow mail
    // provider can't cost a saved order its 201 (the buyer would see an error
    // and order again). On Vercel, after() keeps the function alive until the
    // send finishes.
    if (!prepaid) {
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
    }

    // Open the PhonePe payment. If that fails the order is still saved, and
    // the confirmation page offers "Pay now" to try again.
    let payUrl: string | undefined;
    let payError: string | undefined;
    try {
      const started = await convexServerClient().action(api.phonepe.startPayment, {
        secret: orderWriteSecret(),
        orderNumber: order.orderNumber,
        trackToken: order.trackToken,
        returnUrl: paymentReturnUrl(origin, order.orderNumber),
      });
      if (started.kind === "redirect") payUrl = started.url;
    } catch (error) {
      console.error(`Payment could not be started for ${order.orderNumber}`, error);
      payError = readableConvexError(error, "We saved your order but could not open the payment page.");
    }

    return NextResponse.json({ ...order, payUrl, payError }, { status: 201 });
  } catch (error) {
    console.error("Order placement failed", error);
    return NextResponse.json({ error: readableConvexError(error) }, { status: 502 });
  }
}
