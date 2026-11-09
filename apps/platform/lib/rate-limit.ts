import { sql } from 'drizzle-orm';
import { db } from './db';
import { hashKey } from './crypto';
import { serverEnv } from './env';

/**
 * Fixed-window counters in Postgres.
 *
 * Why not memory: Workers have no shared memory between isolates, and a per-instance limiter
 * is decoration. Why not Redis yet: one more service to secure. A single atomic upsert is
 * enough to stop form spam and credential stuffing at beta scale.
 *
 * Keys are hashed with a server-side salt. We count the request, we do not keep the address.
 */

export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
};

export type RateLimitRule = {
  /** Logical bucket, e.g. `inquiry:submit`. */
  bucket: string;
  /** Stable identity for the bucket: an address hash, a workspace id, an email. */
  identity: string;
  limit: number;
  windowSeconds: number;
};

export const RULES = {
  inquirySubmit: { bucket: 'inquiry:submit', limit: 5, windowSeconds: 60 * 10 },
  inquiryPerProperty: { bucket: 'inquiry:property', limit: 3, windowSeconds: 60 * 60 },
  signInRequest: { bucket: 'auth:signin', limit: 6, windowSeconds: 60 * 15 },
  inviteAccept: { bucket: 'invite:accept', limit: 10, windowSeconds: 60 * 15 },
  betaApply: { bucket: 'beta:apply', limit: 4, windowSeconds: 60 * 60 },
  contactMessage: { bucket: 'contact:message', limit: 4, windowSeconds: 60 * 60 },
  viewCount: { bucket: 'view:count', limit: 60, windowSeconds: 60 },
} as const;

export function windowStartFor(now: Date, windowSeconds: number): Date {
  const size = windowSeconds * 1000;
  return new Date(Math.floor(now.getTime() / size) * size);
}

export function decide(count: number, limit: number): boolean {
  return count <= limit;
}

export async function rateLimitIdentity(parts: string[]): Promise<string> {
  const env = serverEnv();
  const salt = env.ANALYTICS_HASH_SALT ?? 'development-salt-not-for-production';
  return hashKey(parts, salt);
}

/**
 * Consumes one token. Fails closed: if the counter cannot be written, the caller is denied
 * and the caller is expected to show the "nothing was submitted" message.
 */
export async function consumeRateLimit(
  rule: Omit<RateLimitRule, 'bucket' | 'identity'> & { bucket: string; identity: string },
): Promise<RateLimitDecision> {
  const now = new Date();
  const resetAt = windowStartFor(now, rule.windowSeconds);
  resetAt.setSeconds(resetAt.getSeconds() + rule.windowSeconds);

  const key = `${rule.bucket}:${rule.identity}:${Math.floor(
    windowStartFor(now, rule.windowSeconds).getTime() / 1000,
  )}`;

  const result = await db.execute(sql`
    insert into rate_limits (key, window_start, count)
    values (${key}, now(), 1)
    on conflict (key) do update
      set count = rate_limits.count + 1
    returning count
  `);

  const count = Number((result.rows?.[0] as { count?: number | string } | undefined)?.count ?? 1);
  return { allowed: decide(count, rule.limit), remaining: Math.max(0, rule.limit - count), resetAt };
}
