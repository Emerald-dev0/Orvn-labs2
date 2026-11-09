/**
 * Which addresses may post to `/api/auth/*`.
 *
 * Better Auth rejects a request whose `Origin` is not on this list with a 403 — the same status the
 * beta gate uses for "not invited", which is why the two are easy to confuse when debugging. The
 * rule here is deliberately narrow:
 *
 * - `BETTER_AUTH_URL` — the canonical address, e.g. https://orvnlabs.com.
 * - localhost on the dev port, so `npm run dev` works with no configuration.
 * - the deployment's own Vercel URLs, so a preview build can be signed into without anyone adding
 *   it to a list. Vercel only sets these inside the deployment, so this trusts the build's own
 *   origin and nothing else.
 * - `EXTRA_TRUSTED_ORIGINS`, comma-separated, for anything else (a tunnel, a staging domain).
 *
 * Pure function: no `process.env` read, so it can be tested, and no trailing slash surprises —
 * `https://orvnlabs.com/` and `https://orvnlabs.com` are the same origin and normalize to one entry.
 */

const DEV_PORT_ORIGINS = ['http://localhost:5174', 'http://127.0.0.1:5174'];

/** Vercel exposes one of these per deployment; each is a bare hostname, not a URL. */
const VERCEL_HOST_KEYS = ['VERCEL_URL', 'VERCEL_BRANCH_URL', 'VERCEL_PROJECT_PRODUCTION_URL'] as const;

function normalize(value: string): string {
  return value.trim().replaceAll(/\/+$/g, '');
}

export function trustedOriginsFrom(env: Record<string, string | undefined>): string[] {
  const origins = new Set<string>();

  const add = (value: string | undefined) => {
    if (!value) return;
    const normalized = normalize(value);
    if (normalized) origins.add(normalized);
  };

  add(env.BETTER_AUTH_URL);
  for (const origin of DEV_PORT_ORIGINS) add(origin);

  for (const key of VERCEL_HOST_KEYS) {
    const host = env[key]?.trim();
    if (!host) continue;
    // Tolerate both "project.vercel.app" and "https://project.vercel.app".
    add(/^https?:\/\//.test(host) ? host : `https://${host}`);
  }

  for (const value of (env.EXTRA_TRUSTED_ORIGINS ?? '').split(',')) add(value);

  return [...origins];
}

/**
 * True when the beta gate has nobody to let in: no invitations exist for these addresses, and the
 * allow-list is empty, so every sign-up and every magic link is refused. Worth saying out loud in
 * the logs — a production deploy in this state looks like a broken sign-in page, not a policy.
 */
export function allowlistIsEmpty(emails: string[]): boolean {
  return emails.length === 0;
}
