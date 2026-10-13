# ADR 0002 — Convex for orders, and a token-based tracking page

Date: 2026-09-03
Status: Accepted
Supersedes the "no order persistence" consequence in ADR 0001.

## Context

ADR 0001 shipped a checkout that priced an order, acknowledged it, and threw the
buyer's address away. Three things then landed at once that all need the same
missing piece:

1. An order placed today left no record. The confirmation page read it back from
   `sessionStorage`, so it existed only in the tab that placed it.
2. A tracking page is, by definition, "look this order up later, from another
   device". It cannot exist without storage.
3. Razorpay's success webhook calls our server, not the buyer's browser. That
   callback needs somewhere to write `paid`.

## Decisions

**1. Convex is the backend.**
TypeScript end to end, so the order schema and the app's types are one thing; no
migration tooling; every mutation is a transaction. Postgres via Neon or Supabase
would have worked. Convex won because this is a small TypeScript project with no
appetite for connection pooling, migrations, or a second deploy target.

**2. Pricing moved into the Convex mutation.**
`convex/orders.ts:place` rebuilds every line from `lib/products.ts` and calls the
same `computeTotals()` the browser uses, inside the transaction that writes the
order. Pricing and persistence cannot disagree because they are one operation.
The Next route at `app/api/checkout` still validates first, so buyers get
per-field errors instead of one generic failure, but it no longer prices.

**3. The order-write mutation is public and secret-guarded.**
`ConvexHttpClient` cannot call internal functions, so `place` has to be public.
Re-pricing already makes a forged total impossible; `ORDER_WRITE_SECRET` (set on
the deployment and in `.env.local`, and never sent to the browser) stops anyone
who finds the deployment URL from filling the table with junk orders.

**4. The tracking token is the credential, not the order number.**
Order numbers are `NMK-<base36 minute>-<4 chars>` and therefore semi-guessable.
Looking up by order number alone would let anyone enumerate other people's home
addresses and phone numbers. Every order carries a 32-character random
`trackToken`; `/track/<orderNumber>?t=<token>` is the only read path. The
"lost my link" form at `/track` requires the order number **and** the email the
order was placed with, and answers a wrong email and a non-existent order with
the same message, so it cannot be used to discover which orders exist.

**5. The timeline is stored events, not live courier polling.**
`orderEvents` is its own table with a foreign key to the order, because it grows
every time a courier scans the parcel and an array field on the order would
rewrite the whole document each time. Shiprocket's webhook posts to
`convex/http.ts:/hooks/parcel-status` (Shiprocket rejects URLs containing "shiprocket", "sr" or "kr"), guarded by `SHIPROCKET_WEBHOOK_TOKEN` in
the `x-api-key` header. Statuses map through `lib/shiprocket/status.ts`; an
unmapped status is logged and dropped with a 200 rather than guessed at, because
a wrong guess moves a buyer's timeline to a stage the parcel is not at. For live
scan detail the page links out to the courier's own tracking.

**6. Payment state is tracked separately from order state.**
A COD parcel can be packed, shipped and delivered without ever being paid online.
`status` and `paymentStatus` are two fields, not one merged lifecycle.

## Consequences

- Orders, addresses and delivery timelines are now durable. The confirmation page
  still reads `sessionStorage`, but only to save a round trip; the record is in
  Convex.
- There is a second deploy target. Vercel needs `NEXT_PUBLIC_CONVEX_URL` and
  `ORDER_WRITE_SECRET`, and production needs its own Convex deployment with both
  secrets set. Shipping the Next app alone is no longer enough.
- `lib/` is now imported by both Next and Convex. Anything under `lib/commerce/`
  or `lib/products.ts` must stay free of Next-only imports; a stray `next/image`
  import there breaks the Convex push. One such dead import was removed.
- No admin UI. The client edits order status from the Convex dashboard until
  Shiprocket credentials arrive, and `recordStatus` accepts `source: "manual"` so
  a hand correction stays distinguishable from a courier event.
- Still no accounts and no order history. One order, one link.

## Open, in the order it matters

1. Transactional email (Resend). The tracking link is only shown on the
   confirmation page today; the buyer has to bookmark it or use the form. The
   magic-link half of "both" is not real until email sends.
2. Shiprocket credentials. The webhook receiver and status mapping are built and
   tested against synthetic payloads. The push side — creating the shipment in
   Shiprocket when an order is confirmed — is not built.
3. Razorpay. `convex/orders.ts:recordPayment` exists and is unused. Wire the
   gateway's webhook to it, never the browser's success callback.
