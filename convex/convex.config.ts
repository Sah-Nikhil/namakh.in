import { defineApp } from "convex/server";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp();

// Brute-force protection for the admin sign-in. See convex/rate-limits.ts.
app.use(rateLimiter);

export default app;
