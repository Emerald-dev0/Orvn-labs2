import { describe, expect, it } from 'vitest';
import { trustedOriginsFrom } from '../lib/auth-origins';

/**
 * The origin list is what stops another site posting to `/api/auth/*` with a session cookie.
 *
 * It is also the other half of a 403 on sign-up: an untrusted origin and the beta gate answer with
 * the same status, so getting this list wrong looks exactly like "this address is not invited".
 */

describe('trusted origins', () => {
  it('includes the canonical address and the dev server', () => {
    const origins = trustedOriginsFrom({ BETTER_AUTH_URL: 'https://orvnlabs.com' });
    expect(origins).toContain('https://orvnlabs.com');
    expect(origins).toContain('http://localhost:5174');
  });

  it('normalizes a trailing slash instead of keeping two entries', () => {
    const origins = trustedOriginsFrom({ BETTER_AUTH_URL: 'https://orvnlabs.com/' });
    expect(origins).toContain('https://orvnlabs.com');
    expect(origins).not.toContain('https://orvnlabs.com/');
  });

  it('trusts the deployment Vercel is running on, so previews can be signed into', () => {
    const origins = trustedOriginsFrom({
      BETTER_AUTH_URL: 'https://orvnlabs.com',
      VERCEL_URL: 'orvn-labs2-abc123.vercel.app',
      VERCEL_BRANCH_URL: 'orvn-labs2-git-main-team.vercel.app',
    });
    expect(origins).toContain('https://orvn-labs2-abc123.vercel.app');
    expect(origins).toContain('https://orvn-labs2-git-main-team.vercel.app');
  });

  it('accepts a Vercel value that already has a scheme', () => {
    const origins = trustedOriginsFrom({ VERCEL_URL: 'https://orvn-labs2.vercel.app/' });
    expect(origins).toContain('https://orvn-labs2.vercel.app');
    expect(origins.filter((origin) => origin.includes('orvn-labs2.vercel.app'))).toHaveLength(1);
  });

  it('reads EXTRA_TRUSTED_ORIGINS as a comma-separated list and ignores blanks', () => {
    const origins = trustedOriginsFrom({
      EXTRA_TRUSTED_ORIGINS: 'https://staging.orvnlabs.com, ,https://tunnel.example.dev/',
    });
    expect(origins).toContain('https://staging.orvnlabs.com');
    expect(origins).toContain('https://tunnel.example.dev');
    expect(origins).not.toContain('');
  });

  it('never invents an origin when nothing is configured', () => {
    const origins = trustedOriginsFrom({});
    expect(origins).toEqual(['http://localhost:5174', 'http://127.0.0.1:5174']);
  });
});
