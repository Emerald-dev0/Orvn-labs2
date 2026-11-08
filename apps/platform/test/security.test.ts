import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { randomToken, sha256Hex, timingSafeEqual, hashKey } from '../lib/crypto';
import { isWellFormedStorageKey, contentTypeFor } from '../lib/media';
import { isLikelyBot, dayBucket } from '../lib/analytics';
import { windowStartFor, decide } from '../lib/rate-limit';
import { usernameTaken } from '../lib/data/public-site';

describe('tokens', () => {
  it('produces URL-safe tokens with real entropy', () => {
    const a = randomToken();
    const b = randomToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a.length).toBeGreaterThanOrEqual(40);
  });

  it('hashes deterministically and never returns the input', async () => {
    const token = 'invitation-token-value';
    const digest = await sha256Hex(token);
    expect(digest).toBe(await sha256Hex(token));
    expect(digest).not.toContain(token);
    expect(digest).toHaveLength(64);
  });

  it('compares without early exit', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
  });

  it('salts hashed identifiers so two deployments cannot be joined', async () => {
    expect(await hashKey(['1.2.3.4'], 'salt-a')).not.toBe(await hashKey(['1.2.3.4'], 'salt-b'));
  });
});

describe('media gate', () => {
  const key = 'w/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333/photo.jpg';

  it('accepts only workspace-scoped, opaque keys', () => {
    expect(isWellFormedStorageKey(key)).toBe(true);
    expect(isWellFormedStorageKey('../../etc/passwd')).toBe(false);
    expect(isWellFormedStorageKey('photo.jpg')).toBe(false);
    expect(isWellFormedStorageKey('w/not-a-uuid/also-not/photo.jpg')).toBe(false);
  });

  it('refuses to serve types a browser could execute', () => {
    expect(contentTypeFor('w/a/b/photo.jpg')).toBe('image/jpeg');
    expect(contentTypeFor('w/a/b/plan.pdf')).toBe('application/pdf');
    expect(contentTypeFor('w/a/b/run.svg')).toBeNull();
    expect(contentTypeFor('w/a/b/notes.html')).toBeNull();
    expect(contentTypeFor('w/a/b/app.js')).toBeNull();
  });
});

describe('bot filtering and rates', () => {
  it('flags link previewers so a WhatsApp unfurl is not a buyer', () => {
    expect(isLikelyBot('WhatsApp/2.23')).toBe(true);
    expect(isLikelyBot('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
    expect(isLikelyBot('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/605.1')).toBe(false);
    expect(isLikelyBot(null)).toBe(true);
  });

  it('buckets the day for the visitor salt', () => {
    expect(dayBucket(new Date('2026-11-04T23:59:00Z'))).toBe('2026-11-04');
  });

  it('rounds a window start down and refuses past the limit', () => {
    const start = windowStartFor(new Date('2026-11-04T12:07:41Z'), 600);
    expect(start.toISOString()).toBe('2026-11-04T12:00:00.000Z');
    expect(decide(5, 5)).toBe(true);
    expect(decide(6, 5)).toBe(false);
  });
});

/**
 * Static checks over the SQL. They cannot prove Postgres behaves, but they do catch the
 * failure mode that matters most: a new tenant table shipped without a policy.
 */
describe('row level security coverage', () => {
  const root = path.resolve(__dirname, '..');
  const policies = readFileSync(path.join(root, 'db/sql/policies.sql'), 'utf8');
  const schema = readFileSync(path.join(root, 'db/schema.ts'), 'utf8');

  const tenantTables = [
    'workspaces',
    'memberships',
    'properties',
    'property_details',
    'property_media',
    'property_publications',
    'inquiries',
    'analytics_events',
    'invitations',
    'ai_generations',
    'professional_profiles',
    'audit_events',
    'rate_limits',
    'beta_applications',
  ];

  it('enables RLS on every table that holds workspace data', () => {
    for (const table of tenantTables) {
      expect(policies, `${table} has no RLS`).toContain(
        `alter table ${table} enable row level security;`,
      );
      expect(schema, `${table} is not in the schema`).toContain(`'${table}'`);
    }
  });

  it('keeps beta applications operator-only: RLS on, no policy, no grant', () => {
    expect(policies).toContain('alter table beta_applications enable row level security;');
    expect(policies).not.toMatch(/create policy [a-z_]* on beta_applications/i);
    expect(policies).not.toMatch(/grant [^;]*on beta_applications/i);
  });

  it('never grants the public role read access to inquiries, invitations or audit', () => {
    const publicReadGrants = policies
      .split('\n')
      .filter((line) => line.startsWith('grant ') && line.includes('orrei_public'))
      .filter((line) => line.includes('select'))
      .join('\n');

    expect(publicReadGrants).not.toMatch(/inquiries/);
    expect(publicReadGrants).not.toMatch(/invitations/);
    expect(publicReadGrants).not.toMatch(/audit_events/);
    expect(publicReadGrants).not.toMatch(/memberships/);
  });

  it('lets a visitor insert an inquiry but not read one back', () => {
    expect(policies).toContain('grant insert on inquiries, analytics_events to orrei_public;');
    const publicPolicy = policies.match(
      /create policy inquiries_public_insert on inquiries for (\w+)[\s\S]*?;/,
    );
    expect(publicPolicy).not.toBeNull();
    expect(publicPolicy![1]).toBe('insert');
    expect(policies).not.toMatch(/create policy inquiries_public_read/);
  });

  it('requires consent and a published property for a public inquiry insert', () => {
    expect(policies).toContain('consent = true');
    expect(policies).toContain('app_property_is_public(property_id)');
  });

  it('makes snapshots immutable and analytics append-only', () => {
    expect(policies).toContain('property_publications_immutable');
    expect(policies).toContain('publication snapshots are immutable');
    const analytics = policies.split('create policy').filter((b) => b.includes('on analytics_events'));
    expect(analytics.some((b) => b.includes('for update'))).toBe(false);
    expect(analytics.some((b) => b.includes('for delete'))).toBe(false);
  });

  it('keeps the privileged functions narrow and unrevoked only to the app role', () => {
    expect(policies).toContain('revoke all on function app_accept_invitation');
    expect(policies).toContain('grant execute on function app_accept_invitation');
    expect(policies).toContain('app_is_member');
  });
});

describe('public data layer', () => {
  it('is importable without a database connection', async () => {
    // The module must not open a connection at import time; this would throw otherwise.
    expect(typeof usernameTaken).toBe('function');
  });
});
