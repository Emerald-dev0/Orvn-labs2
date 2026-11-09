import { describe, expect, it } from 'vitest';
import { formatWhen } from '../lib/emails/when';

/**
 * The sign-in email said "expires 18:03 UTC" to someone in Ibadan, whose clock said 19:03. These
 * tests pin the zone, because the bug was only visible to the reader.
 */
describe('times in email', () => {
  it('shows Lagos time with a WAT label', () => {
    // 17:53 UTC is 18:53 in Lagos (UTC+1, no daylight saving).
    const text = formatWhen(new Date('2026-11-09T17:53:00Z'));
    expect(text).toMatch(/18:53 WAT$/);
  });

  it('a ten-minute link shows the expiry in the same local zone', () => {
    const expires = new Date(new Date('2026-11-09T17:53:00Z').getTime() + 10 * 60_000);
    expect(formatWhen(expires)).toMatch(/19:03 WAT$/);
  });
});
