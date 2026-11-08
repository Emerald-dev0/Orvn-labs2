import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config.mjs';

/**
 * A permanent redirect to /sign-in once sat on top of /admin, which silently shadowed the whole
 * early-access queue: the pages built, the links in the notification worked, and every request
 * bounced to the sign-in form. Next applies redirects before the filesystem, so nothing in the
 * route itself could have caught it.
 */
describe('redirects', () => {
  it('does not shadow the admin queue', async () => {
    const redirects = await nextConfig.redirects();
    const shadowing = redirects.filter((rule) => rule.source === '/admin' || rule.source.startsWith('/admin/'));
    expect(shadowing).toEqual([]);
  });

  it('still sends the old sign-in entry point to its replacement', async () => {
    const redirects = await nextConfig.redirects();
    const login = redirects.find((rule) => rule.source === '/login');
    expect(login?.destination).toBe('/sign-in');
  });

  it('declares each source once, so a later rule is never unreachable', async () => {
    const redirects = await nextConfig.redirects();
    const sources = redirects.map((rule) => rule.source);
    expect(sources).toHaveLength(new Set(sources).size);
  });
});
