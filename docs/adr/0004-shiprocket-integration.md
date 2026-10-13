# ADR 0004 — Shiprocket: live shipping quotes and automatic order hand-off

Date: 2026-10-13
Status: Accepted. Built and tested without credentials; the live API path is
unverified until the client's Shiprocket API user exists.

## Context

The client opened a Shiprocket account. Three decisions came with it:

- Orders go to Shiprocket **automatically once paid**.
- Courier booking stays **manual for now**, in the Shiprocket panel, but must be
  easy to automate later.
- Customers pay **live Shiprocket rates** at checkout, from day one.

ADR 0002 already built the inbound half (the status webhook). This is the
outbound half.

## Decisions

**1. A stored quote, not a price from the browser.**
Convex mutations cannot make network calls, so the rate can't be fetched inside
the transaction that places the order. Checkout instead asks for a quote
(`convex/shiprocket.ts:quote`), which prices the cart against Shiprocket and
stores the result in `shippingQuotes`. The order then references the quote by
id. `orders.place` charges the stored amount and rejects the quote unless it
matches this exact order: same PIN code, same parcel weight, same subtotal, and
inside its 15-minute window. A quote for a lighter cart or a cheaper address
can't be replayed, and the browser never states a shipping price.

**2. Shiprocket being down never blocks checkout.**
If Shiprocket can't be reached, or credentials or the pickup PIN code are
missing, the quote falls back to `COMMERCE.liveRates.fallbackFee` and is marked
`source: "fallback"`. The admin row flags those orders so someone checks the
real courier cost before booking. If Shiprocket answers and **no courier serves
the PIN code**, checkout refuses, rather than charging a fallback fee for a
parcel nobody can deliver.

**3. Courier rate ≠ customer price.**
Shiprocket quotes what the courier charges the store. `customerShippingFee`
applies the client's rules (markup, round-up, free-above threshold) from
`COMMERCE.liveRates`. The fallback fee is already a customer price, so it only
honours the free threshold; routing it through the markup rule once turned a
configured ₹79 into a charged ₹80.

**4. Pushes are queued exactly once, in the confirming transaction.**
`queueShiprocketPush` writes `shiprocketPush: "queued"` in the same transaction
that schedules `pushOrder`. A second confirmation (an admin click racing a
payment webhook) sees the flag and stops. Triggers: `recordPayment` (Razorpay,
later), `admin.markPaid`, a manual status change to confirmed, and placement
of a COD order. Shiprocket's own webhook updates never trigger a push. A failed
push stays failed until an admin presses Retry, so a broken address isn't
retried forever.

**5. Courier booking is a flag, off.**
`COMMERCE.shiprocket.autoAssignCourier` (and `autoRequestPickup`) gate an
implemented but **never-exercised** path that books the quoted courier and
requests pickup. Booking charges the Shiprocket wallet, so it stays off until
someone turns it on for one real order and watches it.

**6. Webhook path is brand-neutral.**
Shiprocket rejects webhook URLs containing "shiprocket", "kartrocket", "sr" or
"kr". The route moved from `/shiprocket/webhook` to `/hooks/parcel-status`.

## Consequences

- **Pack sizes are placeholders.** `parcel` on each product in
  `lib/products.ts` is estimated, not measured. Quotes and the parcel Shiprocket
  is told about are only as right as these numbers.
- **Field names are partly unverified.** The serviceability response shape
  (`data.available_courier_companies[].rate` / `courier_company_id` /
  `estimated_delivery_days`) is confirmed from secondary sources. The order
  payload follows Shiprocket's published field names but has not been sent to a
  live account. All responses are narrowed defensively. First live call must be
  watched.
- The token is cached in `integrationTokens` for nine days (Shiprocket issues
  ten) and refreshed once on a 401.
- `shippingQuotes` grows with every PIN code typed at checkout; `crons.ts`
  deletes rows a day past expiry.
- Quotes are rate limited (120/minute) and secret-guarded like order placement,
  so strangers can't spend the store's Shiprocket API allowance.

## Before going live

1. API user set: `SHIPROCKET_API_EMAIL`, `SHIPROCKET_API_PASSWORD`.
2. `COMMERCE.shiprocket.pickupLocation` and `pickupPincode` match the panel.
3. Real `parcel` figures in `lib/products.ts`.
4. Webhook configured with `/hooks/parcel-status` and the token.
5. One real order watched end to end: quote → place → mark paid → appears in
   Shiprocket → book courier in panel → webhook updates the tracking page.
