import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { convexServerClient, orderWriteSecret, readableConvexError } from "@/lib/convex-server";
import { paymentReturnUrl, siteOrigin } from "@/lib/site-origin";

type PaymentRequest = {
  orderNumber?: string;
  token?: string;
  /** "status": has it been paid? "pay": open a (new) PhonePe payment. */
  intent?: "status" | "pay";
};

/**
 * The confirmation page's line to PhonePe, through Convex. Both intents need
 * the order's tracking token, which only the buyer's tab and email hold.
 * The write secret stays here, never in the browser.
 */
export async function POST(request: Request) {
  let body: PaymentRequest;
  try {
    body = (await request.json()) as PaymentRequest;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const orderNumber = String(body?.orderNumber ?? "").trim();
  const trackToken = String(body?.token ?? "").trim();
  if (!orderNumber || !/^[a-f0-9]{32}$/.test(trackToken)) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const client = convexServerClient();
  const secret = orderWriteSecret();

  try {
    if (body.intent === "pay") {
      const started = await client.action(api.phonepe.startPayment, {
        secret,
        orderNumber,
        trackToken,
        returnUrl: paymentReturnUrl(siteOrigin(request), orderNumber),
      });
      return NextResponse.json(started);
    }

    const status = await client.action(api.phonepe.checkPayment, {
      secret,
      orderNumber,
      trackToken,
    });
    return NextResponse.json(status);
  } catch (error) {
    console.error(`Payment ${body.intent ?? "status"} failed for ${orderNumber}`, error);
    return NextResponse.json(
      { error: readableConvexError(error, "We could not reach the payment service. Try again.") },
      { status: 502 },
    );
  }
}
