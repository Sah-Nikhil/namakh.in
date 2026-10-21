# ADR 0003 — An order panel, and why it is not Shiprocket

Date: 2026-09-03
Status: Accepted

## Context

Shiprocket has a perfectly good order list. The question was whether building
one here duplicated it.

It does not, because Shiprocket only knows about an order once something pushes
it there, and an unpaid order must never be pushed. While Razorpay approval is
pending, every order is unpaid and manually chased, so Shiprocket would show an
empty list. The Convex dashboard covers the same ground for free, but it needs a
Convex account per person and renders raw JSON columns, which means the client
would look at it once and never again.

## Decisions

**1. Build a thin panel, not a fulfilment system.**
`/admin` is one list, one row per order, expandable. It stops where Shiprocket
starts: no label printing, no rate shopping, no manifest. The one concession to
fulfilment is a "copy Shiprocket row" button that flattens an order into their
bulk-upload column order, for pasting batches until the API push exists.

**2. Convex Auth with email and password, not passkeys.**
*Superseded 2026-10-21 by ADR 0006: sign-in is now an emailed 6-digit code.*
Passkeys are the better default and the Convex skill's recommendation, but the
people running this store sign in from whatever device is nearby and a
device-bound credential would strand them. Reconsider once the team is stable.

**3. The account is identity; the allowlist is authorisation.**
Convex Auth will create an account for any email that asks. Every function in
`convex/admin.ts` calls `requireAdmin`, which re-reads the signed-in user's
email and checks it against the `ADMIN_EMAILS` env var. A stranger can sign up
and reach nothing. The check lives in the backend functions, not in the page, so
calling the API directly gains nothing over loading the UI.

**4. Manual actions are recorded as events, with attribution.**
`setStatus` and `markPaid` write to the same `orderEvents` timeline the courier
writes to, tagged `source: "manual"` with the acting admin's email in `detail`.
Six months from now it is answerable whether a status came from Delhivery or
from someone clicking a dropdown.

**5. Internal attribution never reaches the buyer.**
`orders.getByToken` returns `detail` only for events with
`source === "shiprocket"`. Courier and AWB detail is useful to a buyer; "Updated
by someone@namakh.in" is an internal email address on a public page. This was
caught in testing, having leaked staff emails onto the tracking page.

**6. `markPaid` only advances an order that payment was blocking.**
An order already shipped stays shipped when a payment is recorded late; only
`awaiting_payment` moves to `confirmed`. Recording a payment must never walk a
parcel backwards.

## Consequences

- The panel is client-rendered and mounts its own `ConvexReactClient` in
  `app/admin/layout.tsx`. The storefront still talks to Convex from the server
  only, so no Convex provider was added to the root layout.
- Orders update live. Convex queries are reactive, so an order placed while the
  panel is open appears without a refresh.
- `statusCounts` reads the most recent 500 orders. Fine now, wrong past a few
  thousand; replace with `@convex-dev/aggregate` rather than raising the limit.
- The Shiprocket column order in `lib/admin/shiprocket-row.ts` is written from
  their published template and has not been checked against a real account's
  sheet. Verify before the first bulk upload. Weight is hardcoded at 0.5kg
  because nothing in the catalogue records pack weight.
- *(Superseded by ADR 0006; kept for the history.)*
  Sign-in is rate limited with `@convex-dev/rate-limiter`: five attempts per
  email per five minutes, and forty across all emails per minute. The limit
  wraps the provider's `authorize`, which is the only place every attempt has
  to pass through — the form can be skipped by calling the action directly, and
  the `profile` hook is invoked synchronously so it cannot await a limiter.

  Two traps found while building it. `ConvexCredentials` returns a stub
  `authorize` at the top level and keeps the real one on `options`, so the
  obvious override compiles, deploys, and silently never runs; it took five
  wrong passwords sailing through to notice. And the sign-in form originally
  reported every failure as a wrong password, which would have told a
  locked-out admin to go hunting for a password that was already correct.

  A successful sign-in refunds its allowance, so the limit only accumulates
  against failures.

## Addendum, 2026-10-21: Subscribers tab

The panel has an Orders / Subscribers switch. Subscribers are the `subscribers`
table: emails from the footer "Notify me" form (via `app/api/newsletter`, which
holds the write secret) and from buyers who ticked the opt-in box at checkout.
One row per email. Nothing is sent to them yet; the tab offers "Copy emails"
and a CSV download for whichever mailing tool the client picks.
