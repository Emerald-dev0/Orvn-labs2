import { afterEach, describe, expect, it } from 'vitest';
import { adminEmails, isAdminEmail } from '../lib/admin';
import { APPLICATION_STATUSES, statusCounts, type Application } from '../lib/data/admin';

/**
 * The admin gate is an allow-list, and the queue is a fixed set of states.
 *
 * Both rules are pure, so they are tested without a session and without a database. The point of
 * `isAdminEmail` failing closed is that an unset `ADMIN_EMAILS` must not mean "everybody".
 */

const original = process.env.ADMIN_EMAILS;

afterEach(() => {
  if (original === undefined) delete process.env.ADMIN_EMAILS;
  else process.env.ADMIN_EMAILS = original;
});

describe('who is an admin', () => {
  it('reads a comma-separated list, trimmed and case-insensitive', () => {
    process.env.ADMIN_EMAILS = ' Daniel@OrvnLabs.com , ops@orvnlabs.com ';
    expect(adminEmails()).toEqual(['daniel@orvnlabs.com', 'ops@orvnlabs.com']);
    expect(isAdminEmail('daniel@orvnlabs.com')).toBe(true);
    expect(isAdminEmail('DANIEL@ORVＮLABS.com'.replace('Ｎ', 'N'))).toBe(true);
    expect(isAdminEmail('ops@orvnlabs.com')).toBe(true);
  });

  it('refuses everybody else', () => {
    process.env.ADMIN_EMAILS = 'daniel@orvnlabs.com';
    expect(isAdminEmail('someone@example.com')).toBe(false);
    expect(isAdminEmail('')).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it('fails closed when the list is not configured', () => {
    delete process.env.ADMIN_EMAILS;
    expect(adminEmails()).toEqual([]);
    expect(isAdminEmail('daniel@orvnlabs.com')).toBe(false);
  });
});

describe('the queue', () => {
  const application = (status: string): Application => ({
    id: 'a',
    name: 'Ada',
    email: 'ada@example.com',
    company: null,
    role: null,
    markets: null,
    volume: null,
    currentTools: null,
    frustration: null,
    website: null,
    status,
    source: 'early-access',
    createdAt: new Date().toISOString(),
  });

  it('has four states and nothing else', () => {
    expect([...APPLICATION_STATUSES]).toEqual(['new', 'reviewing', 'invited', 'declined']);
  });

  it('counts each state, plus the total', () => {
    const counts = statusCounts([application('new'), application('new'), application('invited')]);
    expect(counts).toEqual({ all: 3, new: 2, reviewing: 0, invited: 1, declined: 0 });
  });
});
