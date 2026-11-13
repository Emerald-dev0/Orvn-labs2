import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { signUnsubscribeToken, verifyUnsubscribeToken } from '../lib/unsubscribe';
import { betaApplySchema } from '../lib/validation/invite';

const KEY = 'test-secret-that-is-long-enough-0123456789abcdef';

describe('unsubscribe tokens', () => {
  it('round-trips an address', () => {
    const token = signUnsubscribeToken('Ada@Example.com', KEY);
    expect(verifyUnsubscribeToken(token, KEY)).toBe('ada@example.com');
  });

  it('refuses a token signed with a different key', () => {
    const token = signUnsubscribeToken('ada@example.com', KEY);
    expect(verifyUnsubscribeToken(token, 'other-key-other-key-other-key-00000000')).toBeNull();
  });

  it('refuses a token with a tampered address', () => {
    const token = signUnsubscribeToken('ada@example.com', KEY);
    const [payload, mac] = token.split('.');
    const forged = `${Buffer.from('attacker@example.com').toString('base64url')}.${mac}`;
    expect(verifyUnsubscribeToken(forged, KEY)).toBeNull();
    expect(verifyUnsubscribeToken(`${payload}.${mac.slice(0, -2)}aa`, KEY)).toBeNull();
  });

  it('refuses garbage without throwing', () => {
    expect(verifyUnsubscribeToken('', KEY)).toBeNull();
    expect(verifyUnsubscribeToken('.', KEY)).toBeNull();
    expect(verifyUnsubscribeToken('a.b.c', KEY)).toBeNull();
    expect(verifyUnsubscribeToken('###.###', KEY)).toBeNull();
    expect(verifyUnsubscribeToken(null, KEY)).toBeNull();
    expect(verifyUnsubscribeToken(undefined, KEY)).toBeNull();
  });

  it('refuses a well-formed MAC over a non-address payload', () => {
    const payload = Buffer.from('not-an-email').toString('base64url');
    const mac = crypto.createHmac('sha256', KEY).update(`orvn:unsubscribe:v1:${payload}`).digest('base64url');
    expect(verifyUnsubscribeToken(`${payload}.${mac}`, KEY)).toBeNull();
  });
});

describe('optional marketing consent', () => {
  const base = {
    name: 'Ada Bello',
    email: 'ada@example.com',
    consent: 'on',
  };

  it('is not implied by the operational consent checkbox', () => {
    const parsed = betaApplySchema.parse(base);
    expect(parsed.marketingConsent).toBeUndefined();
  });

  it('parses an explicit opt-in', () => {
    const parsed = betaApplySchema.parse({ ...base, marketingConsent: 'on' });
    expect(parsed.marketingConsent).toBe('on');
  });

  it('still requires the operational consent checkbox', () => {
    const result = betaApplySchema.safeParse({ ...base, consent: undefined });
    expect(result.success).toBe(false);
  });
});
