import { describe, expect, it } from 'vitest';
import { refusalRedirect } from '../lib/magic-link-refusal';

const ORIGIN = 'https://orvnlabs.com';

describe('magic-link refusal redirect', () => {
  it('sends a refused verify (403) to the sign-in notice, not raw JSON', () => {
    expect(refusalRedirect('/api/auth/magic-link/verify', 403, ORIGIN)).toBe(
      'https://orvnlabs.com/sign-in?refused=1',
    );
  });

  it('sends an expired or invalid verify (400) to the same notice', () => {
    expect(refusalRedirect('/api/auth/magic-link/verify', 400, ORIGIN)).toBe(
      'https://orvnlabs.com/sign-in?refused=1',
    );
  });

  it('leaves a successful verify alone so sign-in can complete', () => {
    expect(refusalRedirect('/api/auth/magic-link/verify', 302, ORIGIN)).toBeNull();
  });

  it('does not touch other auth endpoints', () => {
    expect(refusalRedirect('/api/auth/get-session', 403, ORIGIN)).toBeNull();
    expect(refusalRedirect('/api/auth/sign-in/magic-link', 400, ORIGIN)).toBeNull();
  });
});
