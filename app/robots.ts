import type { MetadataRoute } from "next";

/**
 * Crawling stays allowed even while the site is hidden. Keeping it out of
 * search is the `noindex` tag's job (`SEARCH_INDEXING` in lib/site.ts, applied
 * in app/layout.tsx), and a crawler blocked here could never read that tag.
 * Blocking everything could also trip Razorpay's automated website check.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/track", "/api/"],
    },
  };
}
