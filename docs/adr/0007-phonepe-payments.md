# ADR 0007 — Online payments through PhonePe, and keeping the order system

Date: 2026-11-23
Status: Accepted. Built and verified end to end in PhonePe's sandbox on
2026-11-23 (paid, failed-then-retried, webhook, confirmation email), then
launched the same day on the production Convex deployment with live keys.

## Context

Razorpay was the planned gateway (ADR 0001) but was never wired. The client
was approved by PhonePe Payment Gateway instead (merchant M232O857EBE4M), with
production keys generated on 2026-10-29. The PhonePe dashboard lists two steps
before the business goes live: a webhook, and the API integration.

That raised a second question: with PhonePe taking the money and Shiprocket
shipping the parcel, is the Convex order system (ADR 0002) and the order panel
(ADR 0003) still needed?

## Decisions

**1. Keep the Convex order system. It is the only thing that knows an order.**
PhonePe knows an amount and an id. Shiprocket knows a parcel, and only after
something pushes it there. Neither holds the cart lines, the address, the
stored shipping quote, the tracking token or the email, and neither tells the
other anything. Convex is what turns "PhonePe says paid" into "push this exact
order to Shiprocket and email this buyer", and it backs `/track`. Removing it
would mean rebuilding the same thing inside one of them, which neither allows.

**2. Keep the order panel as it is; build nothing more into it.**
It remains the only place that shows unpaid and abandoned orders, failed
Shiprocket pushes (with Retry), payment references, and the newsletter list.
Day to day the client should not need it: a paid order confirms, pushes to
Shiprocket and emails the buyer by itself. Courier booking and labels stay in
the Shiprocket panel; refunds are issued from the PhonePe dashboard.

**3. Standard Checkout v2, redirect mode, plain `fetch`.**
No SDK: the API is four calls (token, pay, status, refund) and the Convex
default runtime has `fetch` and `crypto.subtle`. Redirect rather than the
iframe: one code path for desktop and mobile, and UPI apps hand back to the
same tab. All of it lives in `convex/phonepe.ts`, next to the Shiprocket
client, and the keys live only on the Convex deployment.

**4. Payment is recorded only from PhonePe's status API.**
The browser's return, the webhook and a ten-minute cron all just ask PhonePe
`GET /checkout/v2/order/{id}/status` and pass the answer to
`orders.recordPayment`. A webhook body is never trusted on its own, even
though it is signed. `recordPayment` checks the paid amount equals the order
total in paise, is safe to run repeatedly, and confirms only an order that is
`awaiting_payment`.

**5. One PhonePe order per attempt: `<orderNumber>-<n>`.**
PhonePe refuses a reused `merchantOrderId`, so "Try again" opens attempt n+1,
reserved in a mutation so two tabs can't collide. Before opening a new one,
`startPayment` asks about the previous attempt and stops if it was paid. If
two attempts are both paid anyway (the buyer paid, then retried while the
first was still pending), the second is flagged on the order's timeline for a
refund. Attempts are capped at 8 per order.

**6. The "order confirmed" email moves to Convex for prepaid orders.**
A prepaid order is emailed only once PhonePe confirms it
(`convex/emails.ts`, idempotency key `order-confirmed/<orderNumber>`), so an
abandoned payment never gets an "order received" email. COD orders, and every
order while `PAYMENTS_LIVE` is false, are still emailed by the checkout route.

**7. The webhook is signed with SHA-256 of `username:password`.**
`/hooks/payment-status` on the Convex site URL. PhonePe sends
`Authorization: <hex sha256("username:password")>`; the credentials are
`PHONEPE_WEBHOOK_USERNAME` / `PHONEPE_WEBHOOK_PASSWORD`. PhonePe's form wants
the password under 20 characters, letters and digits only, with at least one
digit and one capital; its error message ("must be upto 20 characters") shows
for any failure. The dashboard's "Validate" sends
`{success, code, message, data}` with no `event`; that is answered 200 and
ignored.

## Consequences

- Env on the Convex deployment: `PHONEPE_ENV` (`production` for live keys,
  anything else means sandbox), `PHONEPE_CLIENT_ID`, `PHONEPE_CLIENT_SECRET`,
  `PHONEPE_CLIENT_VERSION`, `PHONEPE_WEBHOOK_USERNAME`,
  `PHONEPE_WEBHOOK_PASSWORD`. The dev deployment (steady-pony-163) holds the
  sandbox keys and the test-mode webhook.
- Launched 2026-11-23. Production Convex deployment `harmless-swan-740` holds
  the live keys (`PHONEPE_ENV=production`), fresh auth keys and its own
  `ORDER_WRITE_SECRET`; Vercel production points at it. A second PhonePe
  webhook (Test Mode off, username `namakhpay`) points at
  `https://harmless-swan-740.convex.site/hooks/payment-status`. PhonePe's
  live API accepted a payment request for the merchant the same day. The dev
  deployment `steady-pony-163` keeps the sandbox keys and the test-mode
  webhook, for local work.
- `paymentMethod` is now `"phonepe" | "cod"`. The schema still accepts
  `"razorpay"` for old test rows, and `orders.place` still accepts it from a
  storefront build deployed before this change, recording it as `"phonepe"`.
  Drop both once the old build and the test rows are gone.
- The tracking token now travels in sessionStorage across the trip to PhonePe
  and back. If the tab is lost (a phone browser killed it), the buyer still
  gets the confirmation email with the tracking link once the cron or webhook
  confirms the payment.
- Refunds are manual, from the PhonePe dashboard. `pg.refund.*` webhooks are
  logged and nothing else; the order panel's status dropdown records it.
- Verified on 2026-11-23, sandbox: order NMK-HTD5H-AKWY paid first time;
  NMK-HTD5M-MU6M failed, retried from the confirmation page, paid on attempt 2;
  PhonePe's `checkout.order.completed` webhook passed the signature check;
  both "Order … confirmed" emails delivered via Resend. Both Shiprocket pushes
  failed because the Shiprocket account has no pickup address yet (see
  ADR 0004).
- Verified on 2026-11-23, live (after deploy `4021665`): the site is indexable;
  order NMK-HTD6I-LSUR on www.namakh.in got a live Shiprocket quote (₹130),
  opened PhonePe's production payment page for ₹1,580, and showed "Waiting
  for PhonePe" when abandoned. The live admin panel signed in by emailed code
  and cancelled it. The Shiprocket webhook was moved to the production site
  URL and its test ping passed the token check there. No live payment has
  been completed yet; the first real order is the remaining end-to-end test.
