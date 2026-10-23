# ADR 0005 — Order emails through Resend

Date: 2026-10-20
Status: Accepted. Built and keyed. DNS records added at GoDaddy on 2026-10-20
through Resend's "Auto configure" (Domain Connect).

## Context

The confirmation page promised "We will email you a secure payment link
shortly", and no email existed. Razorpay is still pending, so there is no
payment link to send, but a buyer still needs a durable record of the order and
the tracking link.

## Decisions

**1. Resend, from `orders@namakh.in`.**
`lib/email/send.ts` wraps the SDK and never throws. `lib/email/order-received.ts`
holds the one template. The domain sits in the client's Resend account
(hydratewithnamakh@gmail.com), region `us-east-1`, which is the same region as
Vercel's default functions. Resend has no Indian region; delivery time to Indian
inboxes doesn't depend on it.

**2. The email goes out after the response, not before.**
`app/api/checkout/route.ts` sends it inside `after()`. A slow or hung Resend call
can't cost a saved order its 201, which would make the buyer see an error and
order again. The send is capped at 8 seconds and carries the idempotency key
`order-received/<orderNumber>`.

**3. Checkout is rate limited because it now emails strangers.**
Each order mails the address typed at checkout, from the store's domain, with
the buyer's name and address in the body. Without a cap, a script could use
checkout to send text it wrote to any inbox. `orders.place` enforces
`checkoutPerEmail` (5 an hour per address) and `checkoutGlobal` (30 a minute),
and address fields have upper lengths in `validateAddress`. Shipping quotes are
not single-use: the limits already stop the abuse, and single-use quotes would
make a buyer who orders twice re-enter their PIN code.

**4. The key can only send.**
`RESEND_API_KEY` is a "Sending access" key named `namakh-site-production`,
restricted to the namakh.in domain (done 2026-10-21, after the domain verified).
A send from any other domain is refused with 403.

**5. Replies go to support.**
orders@namakh.in has no mailbox, so every email sets `replyTo` to the support
address in `COMMERCE.support` (`lib/email/send.ts`, and the admin code email in
`convex/auth.ts`).

## Consequences

- Until DNS verifies, Resend refuses every send with "The namakh.in domain is not
  verified". Orders are unaffected; the refusal is logged.
- DNS records now at GoDaddy (added by Domain Connect):
  - TXT `resend._domainkey` — the DKIM key shown in Resend → Domains → namakh.in
  - CNAME `send` → `send.forge.rmta.net`
  - CNAME `rsend` → `rsend.forge.rmta.net`
  - GoDaddy already had TXT `_dmarc` → `v=DMARC1; p=reject; adkim=r; aspf=r; …`.
    Left as is: Resend signs DKIM as namakh.in, which aligns, so `p=reject`
    only bites mail that fails DKIM. If order emails start disappearing,
    check this first.
- With `PAYMENTS_LIVE`, a prepaid buyer pays in the checkout modal, so the
  "payment received" email should come from `recordPayment`, not this route.
  Marked `TODO(PAYMENTS_LIVE)` in the template.
- `NEXT_PUBLIC_SITE_URL` is inlined at build time; changing it needs a redeploy.
  Without it, links use the request's own origin.
