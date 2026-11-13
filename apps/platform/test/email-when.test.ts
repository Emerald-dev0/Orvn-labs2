import { describe, expect, it } from 'vitest';
import { formatWhen, formatWhenOperator } from '../lib/emails/when';

/**
 * Person-facing times carry their zone. Recipient-facing mail uses the US-first launch locale
 * (America/New_York); mail the founder reads keeps Lagos time. A bare "expires 18:03 UTC"
 * mis-times the link for whoever cannot convert in their head.
 */
describe('times in email', () => {
  it('recipient-facing mail shows US Eastern time with the zone abbreviation', () => {
    // 17:53 UTC in early November is 12:53 EST (UTC-5, daylight saving ended 1 Nov 2026).
    const text = formatWhen(new Date('2026-11-09T17:53:00Z'));
    expect(text).toMatch(/12:53 PM EST$/);
  });

  it('recipient-facing mail uses the daylight-saving abbreviation in summer', () => {
    const text = formatWhen(new Date('2026-07-09T16:53:00Z'));
    expect(text).toMatch(/12:53 PM EDT$/);
  });

  it('operator-facing mail keeps Lagos time with a WAT label', () => {
    const text = formatWhenOperator(new Date('2026-11-09T17:53:00Z'));
    expect(text).toMatch(/18:53 WAT$/);
  });

  it('a ten-minute link shows the expiry in the same zone', () => {
    const expires = new Date(new Date('2026-11-09T17:53:00Z').getTime() + 10 * 60_000);
    expect(formatWhen(expires)).toMatch(/1:03 PM EST$/);
    expect(formatWhenOperator(expires)).toMatch(/19:03 WAT$/);
  });
});
