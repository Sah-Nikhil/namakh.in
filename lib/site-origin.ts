/**
 * The site's public origin for links that leave the site: tracking links in
 * emails, and the page PhonePe sends the buyer back to. NEXT_PUBLIC_SITE_URL
 * when set (production), otherwise whatever origin the request came in on
 * (localhost, Vercel previews).
 */
export function siteOrigin(request: Request): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/+$/, "");
}

/** Where PhonePe returns the buyer. The order number only; the token stays in the tab. */
export function paymentReturnUrl(origin: string, orderNumber: string): string {
  return `${origin}/checkout/success?order=${encodeURIComponent(orderNumber)}`;
}
