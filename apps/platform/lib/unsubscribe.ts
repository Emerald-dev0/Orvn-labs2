import crypto from 'node:crypto';
import { serverEnv } from './env';

/**
 * Unsubscribe tokens for optional (marketing) updates.
 *
 * Operational mail — invitations, sign-in links, security notices — is never gated by the
 * suppression list, so this token never needs to prove an account, only that we sent the mail.
 * The payload is the lower-cased address; the MAC proves it came from us. No expiry: an
 * unsubscribe link that stops working after a month is worse than none.
 */
const PURPOSE = 'orvn:unsubscribe:v1';

function secret(): string {
  const key = serverEnv().BETTER_AUTH_SECRET;
  if (!key) {
    throw new Error('BETTER_AUTH_SECRET is not configured');
  }
  return key;
}

export function signUnsubscribeToken(email: string, key?: string): string {
  const payload = Buffer.from(email.trim().toLowerCase(), 'utf8').toString('base64url');
  const mac = crypto.createHmac('sha256', key ?? secret()).update(`${PURPOSE}:${payload}`).digest('base64url');
  return `${payload}.${mac}`;
}

/** Returns the normalised address when the token is valid, otherwise null. Never throws. */
export function verifyUnsubscribeToken(token: string | null | undefined, key?: string): string | null {
  if (!token || typeof token !== 'string') return null;
  const dot = token.indexOf('.');
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  if (!/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]+$/.test(mac)) return null;
  let expected: string;
  try {
    expected = crypto.createHmac('sha256', key ?? secret()).update(`${PURPOSE}:${payload}`).digest('base64url');
  } catch {
    return null;
  }
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const email = Buffer.from(payload, 'base64url').toString('utf8').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
    return email;
  } catch {
    return null;
  }
}

/** Absolute unsubscribe URL for an address, based on the configured site origin. */
export function unsubscribeUrlFor(email: string): string {
  const base = serverEnv().BETTER_AUTH_URL ?? 'https://orvnlabs.com';
  return `${base.replace(/\/$/, '')}/unsubscribe?t=${signUnsubscribeToken(email)}`;
}
