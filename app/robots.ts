import type { MetadataRoute } from "next";
import { SEARCH_INDEXING } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!SEARCH_INDEXING) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/checkout", "/track", "/api/"] },
  };
}
