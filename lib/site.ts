/**
 * Whether search engines may list the site.
 *
 * false until Razorpay approves the store (client, 2026-10-21): the site stays
 * reachable so Razorpay's reviewer can open every page, but it is kept out of
 * search results (via the noindex tag) and not promoted. Flip to true at
 * launch; `app/layout.tsx` reads it. robots.txt allows crawling either way.
 */
export const SEARCH_INDEXING = false;
