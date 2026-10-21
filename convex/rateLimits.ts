import { RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

const MINUTE = 60_000;

/**
 * Brute-force protection for the admin sign-in.
 *
 * Two limits, because they stop different attacks. The per-email bucket stops
 * someone grinding passwords against one known admin address. The global
 * bucket stops the same attacker spreading attempts across many addresses to
 * stay under that first limit.
 *
 * Token buckets rather than fixed windows: an admin who fumbles their password
 * three times and gets it right on the fourth is not locked out for the rest of
 * the window, and the allowance refills gradually instead of all at once.
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  /** One person, one email. Five tries, refilling over five minutes. */
  adminSignInPerEmail: {
    kind: "token bucket",
    rate: 5,
    period: 5 * MINUTE,
    capacity: 5,
  },
  /** Everyone, everywhere. Generous for real use, ruinous for a spray. */
  adminSignInGlobal: {
    kind: "token bucket",
    rate: 40,
    period: MINUTE,
    capacity: 40,
  },
  /**
   * Shipping quotes call Shiprocket on every request, so a loop hitting the
   * checkout could burn through their API allowance and get the store's
   * account throttled. A real checkout asks once or twice per PIN code.
   */
  shippingQuote: {
    kind: "token bucket",
    rate: 120,
    period: MINUTE,
    capacity: 120,
  },
  /**
   * Every order sends an email to the address typed at checkout, from the
   * store's own domain. Without a cap, a loop could use checkout to mail any
   * inbox with text it wrote into the address fields. A real buyer places one
   * order, occasionally two or three.
   */
  checkoutPerEmail: {
    kind: "token bucket",
    rate: 5,
    period: 60 * MINUTE,
    capacity: 5,
  },
  /** Everyone, everywhere. Far above a launch-day rush, well below a spray. */
  checkoutGlobal: {
    kind: "token bucket",
    rate: 30,
    period: MINUTE,
    capacity: 30,
  },
});

/** Shared by the sign-in path so the wording is identical wherever it surfaces. */
export function retryMessage(retryAfterMs: number | undefined): string {
  const seconds = Math.ceil((retryAfterMs ?? 60_000) / 1000);
  if (seconds < 90) {
    return `Too many sign-in attempts. Try again in ${seconds} seconds.`;
  }
  return `Too many sign-in attempts. Try again in ${Math.ceil(seconds / 60)} minutes.`;
}
