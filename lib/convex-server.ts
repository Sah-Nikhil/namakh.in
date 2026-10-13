import { ConvexHttpClient } from "convex/browser";

/**
 * Server-side Convex client. Route handlers use this; the browser never talks
 * to Convex for writes, so the order-write secret stays on the server.
 */
export function convexServerClient(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is missing. Run `pnpm dlx convex dev` to configure it.",
    );
  }
  return new ConvexHttpClient(url);
}

export function orderWriteSecret(): string {
  const secret = process.env.ORDER_WRITE_SECRET;
  if (!secret) {
    throw new Error(
      "ORDER_WRITE_SECRET is missing from .env.local. It must match the value set on the Convex deployment.",
    );
  }
  return secret;
}

/**
 * Convex wraps thrown errors with its own framing, e.g.
 * `[CONVEX M(orders:place)] [Request ID: ...] Server Error\nUncaught Error: Your cart is empty.`
 * Buyers should see the sentence we wrote, not the frame around it.
 */
export function readableConvexError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const match = raw.match(/Uncaught Error:\s*([^\n]+)/);
  if (match) return match[1].trim();
  return "We could not place that order. Try again.";
}
