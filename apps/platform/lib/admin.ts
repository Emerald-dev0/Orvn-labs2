/**
 * Who counts as an operator.
 *
 * Admin is an allow-list of email addresses in `ADMIN_EMAILS`, checked on the server on every
 * request — not a flag in the session, and not a hidden navigation item. Somebody who is not on
 * the list gets a 404 rather than a 403, because "you are not allowed" confirms the page exists.
 *
 * This module stays pure so the rule can be tested without a session. The guard that reads the
 * session lives in `lib/admin-guard.ts`.
 */

/**
 * Read straight from the environment rather than through the parsed `serverEnv()` cache: the list
 * is expected to change without a redeploy, and a cached snapshot is the wrong shape for it.
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = adminEmails();
  if (list.length === 0) return false;
  return list.includes(email.trim().toLowerCase());
}
