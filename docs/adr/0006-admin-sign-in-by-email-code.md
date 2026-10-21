# ADR 0006 — Admin sign-in by email code

Date: 2026-10-21
Status: Accepted. Supersedes decision 2 of ADR 0003 (email and password) and
its sign-in rate-limit notes.

## Context

The order panel signed in with email and password, and anyone could create an
account; the allowlist only decided what an account could see. The client asked
for the allowlisted email itself to be the login: type it, get a 6-digit code
in that inbox, enter the code. The admin inbox is hydratewithnamakh@gmail.com.

## Decisions

**1. Convex Auth's `Email` provider with a 6-digit code, no passwords.**
`convex/auth.ts` registers one provider, `admin-code`. The code comes from
`crypto.getRandomValues` with rejection sampling, expires after 10 minutes, and
is stored hashed by Convex Auth. The default `authorize` check stays on, so a
code only works together with the email it was sent to. The old `Password`
provider is gone; its leftover `authAccounts` rows are inert.

**2. Off the allowlist, nothing is created and nothing is sent.**
`callbacks.createOrUpdateUser` runs when a code is requested, before any row is
written. It throws for an email not in `ADMIN_EMAILS`, so a stranger gets no
user, no account, no code and no email. The form says "This email cannot sign
in to the order panel." That reveals whether an email is an admin, which is
acceptable: the admin address is the public support address.
`requireAdmin` in `convex/admin.ts` still re-checks the allowlist on every call,
so removing an email from `ADMIN_EMAILS` locks it out immediately, session or not.
Only the exact lowercase email gets a code. Convex Auth keys accounts and its
wrong-code limit on the raw string, so `Admin@x.com` would otherwise be a second
account with its own guess budget.

**2a. The old password sign-in is not trusted.**
Anyone could create a password account for any email, including the admin's,
without proving they own the inbox. So `requireAdmin` (and `me`) also require
`emailVerificationTime` on the user, which only a code sign-in sets. The first
code sign-in for a user also deletes every session that user already had, which
ends any session that came from the password sign-in. Because a token outlives its
deleted session by up to an hour, the admin check also loads the session behind
the token and refuses it if the session is gone or expired.

**3. The code email is sent by Convex, not Next.**
Sign-in runs inside Convex Auth's action, so the Resend call lives in
`convex/auth.ts`. The Convex deployment therefore needs its own
`RESEND_API_KEY` and `EMAIL_FROM`, the same values Next uses.

**4. Two limits, for two attacks.**
- Guessing codes: Convex Auth's built-in limit, 10 wrong codes per hour per
  account (`signIn.maxFailedAttempsPerHour`, default). With a 10-minute code,
  that is a negligible chance against a 6-digit space.
- Flooding the admin inbox: `adminSignInPerEmail` (5 per 5 minutes) and
  `adminSignInGlobal` (40 per minute) in `convex/rateLimits.ts`. They are
  checked in `createOrUpdateUser`, inside the transaction that writes the new
  code, so a refused request rolls back and the last emailed code stays valid.

## Consequences

- Known residue: the admin email is public, so someone can spend the 10 wrong
  guesses and keep the admin out for up to an hour. Recovery is to wait, or to
  delete the email's row in `authRateLimits` from the Convex dashboard.
- Each existing admin has to sign in with a code once; older sessions end then.
- A new code always replaces the previous one, including when the email then
  fails to send. If "Could not send the code" appears, the earlier code no
  longer works either: wait a minute and send a new one.
- Adding an admin is one env change: append the email to `ADMIN_EMAILS` on the
  Convex deployment (`pnpm exec convex env set ADMIN_EMAILS a@x.com,b@y.com`).
  There is no sign-up screen.
- If Resend is down or the domain loses verification, nobody can sign in.
  The form says "Could not send the code. Try again in a minute." and the
  Convex logs carry Resend's error.
- A production Convex deployment needs `RESEND_API_KEY`, `EMAIL_FROM` and
  `ADMIN_EMAILS` (including hydratewithnamakh@gmail.com) set before the panel
  can be used there.
