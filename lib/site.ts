/**
 * Whether search engines may list the site.
 *
 * true since launch on 2026-11-23, once PhonePe live payments were confirmed
 * working. Before that it was false (client, 2026-10-21, "until the payment
 * gateway approves"), which added a noindex tag while keeping every page
 * reachable for the gateway's reviewers. `app/layout.tsx` reads it.
 * robots.txt allows crawling either way.
 */
export const SEARCH_INDEXING = true;
