import { Resend } from "resend";

/**
 * Sends one email through Resend. Never throws: an order is already saved by
 * the time we get here, so a mail failure is logged, not surfaced to the buyer.
 *
 * Needs RESEND_API_KEY and EMAIL_FROM (e.g. "Namakh <orders@namakh.in>", on a
 * domain verified in Resend). Without them it logs and skips, so local dev and
 * preview deploys keep working.
 */
export async function sendEmail(
  message: { to: string; subject: string; html: string; text: string },
  /** Resend drops a second send with the same key inside 24 hours. */
  idempotencyKey?: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn("Email skipped: RESEND_API_KEY or EMAIL_FROM is not set.");
    return false;
  }

  try {
    // The SDK has no timeout of its own; a stalled connection would otherwise
    // hold the function open until the platform kills it.
    const { error } = await new Resend(apiKey).emails.send(
      { from, ...message },
      { idempotencyKey, signal: AbortSignal.timeout(8_000) },
    );
    if (error) {
      console.error("Resend rejected the email", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Email send failed", error);
    return false;
  }
}
