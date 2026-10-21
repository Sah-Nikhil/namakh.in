/**
 * Whether search engines may list the site.
 *
 * false until Razorpay approves the store (client, 2026-10-21): the site stays
 * reachable so Razorpay's reviewer can open every page, but it is kept out of
 * search results and not promoted. Flip to true at launch; `app/layout.tsx`
 * and `app/robots.ts` both read it.
 */
export const SEARCH_INDEXING = false;
