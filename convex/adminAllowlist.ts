/**
 * The admin allowlist, read from the ADMIN_EMAILS env var (comma separated).
 *
 * Shared by sign-in, which refuses to send a code to anyone not on it, and by
 * every admin function, which re-checks it before returning customer data.
 */
export function allowedEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return allowedEmails().includes(email.trim().toLowerCase());
}
