import { describe, expect, it } from 'vitest';
import { magicLinkDecision } from '../lib/magic-link-gate';

describe('whether a sign-in email is sent', () => {
  it('sends to an operator', () => {
    expect(magicLinkDecision({ isAdmin: true, hasAccount: false, hasInvitation: false })).toBe('send');
  });
  it('sends to an existing account holder', () => {
    expect(magicLinkDecision({ isAdmin: false, hasAccount: true, hasInvitation: false })).toBe('send');
  });
  it('sends to an address with a usable invitation', () => {
    expect(magicLinkDecision({ isAdmin: false, hasAccount: false, hasInvitation: true })).toBe('send');
  });
  it('skips an address with no account, no invitation and no operator entry', () => {
    expect(magicLinkDecision({ isAdmin: false, hasAccount: false, hasInvitation: false })).toBe('skip');
  });
});
