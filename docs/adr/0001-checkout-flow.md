# ADR 0001 — Cart and checkout, built ahead of the payment gateway

Date: 2026-08-25
Status: Accepted

## Context

Namakh needs a working purchase flow. Razorpay is the chosen aggregator, but the
merchant account is not live: Razorpay reviews the full storefront — including a
complete checkout and the policy pages — before approving an account and issuing
keys. So the flow has to exist and be demonstrable **before** payments can be
wired, not after.

The project also has no backend, no database, and no auth. The catalogue is a
hardcoded array in `lib/products.ts`. Several commercial rules (shipping charges,
GST treatment, cash on delivery) were undecided by the client at build time.

## Decisions

**1. The flow ends at order acknowledgement, not at payment.**
`POST /api/checkout` validates the cart and the delivery details, prices the order
server-side, and returns an order with status `awaiting_payment`. The buyer lands
on `/checkout/success`. The Razorpay handoff has exactly one home, marked in a
comment block in that route; `PAYMENTS_LIVE` in `lib/commerce/config.ts` is the
switch the UI copy already branches on.

**2. Prices are recomputed on the server, always.**
The browser sends `{ slug, qty }` only. Prices, shipping, tax and totals are
rebuilt from `lib/products.ts` inside the route. A cart edited in devtools cannot
change what an order costs. `computeTotals()` in `lib/commerce/pricing.ts` is the
single implementation, shared by every surface, so the number shown and the number
recorded cannot drift apart.

**3. Every commercial rule lives in `lib/commerce/config.ts`.**
*Update 2026-09-15:* GST-inclusive is now the client's decision, not a default.
Shipping will be charged and calculated at checkout; rates pending.

Shipping mode (`free` / `flat` / `threshold`), GST mode (`inclusive` / `exclusive`)
and COD sit there as constants. Defaults today: free shipping, GST-inclusive
prices, COD built but disabled. The client can settle these later without touching
a component. COD is fully implemented behind `cod.enabled: false` — the option
renders, prices and validates the moment the flag flips.

**4. Cart state is React context over `localStorage`; the checkout draft is
`sessionStorage`.**
No backend means no server cart. A cart should survive a closed tab; a half-typed
home address on a shared machine should not. Both stores are read after mount and
guarded by a `hydrated` flag, so the server and first client render agree.

**5. One checkout route, two shapes.**
Desktop gets the LMNT-style arrangement: a slide-out drawer on add-to-cart, a full
`/cart` page, and `/checkout` as one scrolling page with a sticky summary. Below
`md`, the same route gates itself into three steps (Delivery, Shipping, Payment)
with a sticky total bar, and the drawer becomes a bottom sheet. This is one
component tree with a breakpoint check (`useIsDesktop`), not two implementations —
the layout differs, the state and validation do not. Until the breakpoint resolves,
the unstepped layout renders, so nothing is ever hidden by a measurement race.

**6. PIN code lookup goes through our own route.**
`/api/pincode/[code]` proxies `api.postalpincode.in`, caches for a day, and
reshapes the response. Going through our own origin means an upstream CORS change
cannot break checkout, and a failed lookup degrades to manual city/state entry
rather than blocking the order.

## Consequences

- **Orders are not persisted.** The confirmation page reads the order from
  `sessionStorage`, so it is only meaningful in the tab that placed it, and
  elsewhere degrades to the support inbox. Whatever store gets chosen must be
  written to inside `POST /api/checkout` before it responds. This is the largest
  open gap and it is deliberate — it is a database decision, not a checkout one.
- No confirmation email is sent. The copy promises a payment link; someone has to
  send it manually until email and payments are wired.
- Buyers cannot see past orders. There are no accounts.
- Prices remain whole rupees. `formatINR` rounds; there is no paise handling
  anywhere, which is fine for INR retail but would need revisiting for discounts
  computed as percentages.

## Follow-ups, in the order they matter

1. Order persistence, then Razorpay order creation and signature verification in
   `app/api/checkout/verify/route.ts`.
2. Transactional email for order confirmation and the payment link.
3. ~~Settle GST with the client.~~ Inclusive, settled 2026-09-15. Shipping rates
   still to be supplied.
4. Real stock handling if a SKU can ever sell out — `Product.quantity` is display
   copy, not inventory.
