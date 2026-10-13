"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";

/**
 * The admin panel is the only part of the site that authenticates, so the
 * Convex client is mounted here rather than in the root layout. The storefront
 * keeps talking to Convex from the server only.
 */
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
