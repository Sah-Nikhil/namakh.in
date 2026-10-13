/**
 * Tells Convex which issuer to trust for JWTs. Without this file every request
 * is silently signed out, with no error anywhere to explain why.
 *
 * CONVEX_SITE_URL is provided by the platform, and is this deployment's own
 * site URL because Convex Auth issues its own tokens.
 */
const authConfig = {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
