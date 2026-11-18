import { describe, expect, it } from 'vitest';
import { needsOnboarding, parseOnboarding, roleLabel } from '../lib/onboarding';

const GOOD = {
  displayName: 'Ada Bello',
  role: 'wholesaler',
  market: 'Miami, FL',
  contactEmail: 'ada@example.com',
  contactPhone: '',
};

describe('parseOnboarding', () => {
  it('accepts a complete answer set', () => {
    const result = parseOnboarding(GOOD);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.market).toBe('Miami, FL');
      expect(result.role).toBe('wholesaler');
      expect(result.contactPhone).toBeNull();
    }
  });

  it('trims whitespace everywhere', () => {
    const result = parseOnboarding({ ...GOOD, displayName: '  Ada Bello  ', market: '  Miami, FL ' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.displayName).toBe('Ada Bello');
      expect(result.market).toBe('Miami, FL');
    }
  });

  it('rejects a missing name', () => {
    const result = parseOnboarding({ ...GOOD, displayName: ' ' });
    expect(result.ok).toBe(false);
  });

  it('rejects an unknown role rather than guessing', () => {
    const result = parseOnboarding({ ...GOOD, role: 'banker' });
    expect(result.ok).toBe(false);
  });

  it('rejects a missing market', () => {
    const result = parseOnboarding({ ...GOOD, market: '' });
    expect(result.ok).toBe(false);
  });

  it('rejects a bogus email', () => {
    const result = parseOnboarding({ ...GOOD, contactEmail: 'not-an-email' });
    expect(result.ok).toBe(false);
  });

  it('allows an oversized phone to be rejected', () => {
    const result = parseOnboarding({ ...GOOD, contactPhone: 'x'.repeat(41) });
    expect(result.ok).toBe(false);
  });
});

describe('needsOnboarding', () => {
  it('is true for a profile that never reached the step', () => {
    expect(needsOnboarding(null)).toBe(true);
    expect(needsOnboarding({ onboardedAt: null })).toBe(true);
  });

  it('is false once the step is done or skipped', () => {
    expect(needsOnboarding({ onboardedAt: new Date() })).toBe(false);
  });
});

describe('roleLabel', () => {
  it('maps stored ids to display labels', () => {
    expect(roleLabel('wholesaler')).toBe('Wholesaler');
    expect(roleLabel('agent')).toBe('Agent');
    expect(roleLabel('investor')).toBe('Investor');
  });

  it('says nothing for other or unknown roles', () => {
    expect(roleLabel('other')).toBeNull();
    expect(roleLabel('banker')).toBeNull();
    expect(roleLabel(null)).toBeNull();
  });
});
