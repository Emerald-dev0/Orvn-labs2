import { describe, expect, it } from 'vitest';
import {
  baseUrlVerdict,
  dmarcRecordCount,
  healthVerdict,
  parseAdminEmails,
  rlsTablesFromPolicies,
  tablesWithoutRls,
  templateTimeProblems,
} from '../scripts/lib/phase0.mjs';

describe('DMARC record count', () => {
  it('passes with exactly one record', () => {
    expect(dmarcRecordCount(['v=DMARC1; p=none; rua=mailto:a@b.co'])).toBe(1);
  });
  it('counts two records as two, which is the failure Gmail reported', () => {
    expect(dmarcRecordCount(['v=DMARC1; p=none; pct=100', 'v=DMARC1; p=none; rua=mailto:a@b.co'])).toBe(2);
  });
  it('ignores unrelated TXT records', () => {
    expect(dmarcRecordCount(['v=spf1 -all', 'v=DMARC1; p=none'])).toBe(1);
  });
});

describe('RLS table list comes from the policy file', () => {
  const sql = `
    alter table invitations enable row level security;
    ALTER TABLE  contact_messages ENABLE ROW LEVEL SECURITY;
    -- alter table commented enable row level security
  `;
  it('reads every enable statement, case-insensitively', () => {
    expect(rlsTablesFromPolicies(sql)).toEqual(['contact_messages', 'invitations']);
  });
  it('lists tables with RLS off', () => {
    const map = new Map([
      ['invitations', true],
      ['contact_messages', false],
    ]);
    expect(tablesWithoutRls(['invitations', 'contact_messages', 'workspaces'], map)).toEqual([
      'contact_messages',
      'workspaces',
    ]);
  });
});

describe('admin email list', () => {
  it('trims and lowercases, as the app does', () => {
    expect(parseAdminEmails(' Daniel@Example.com ,ops@example.com,')).toEqual([
      'daniel@example.com',
      'ops@example.com',
    ]);
  });
  it('is empty when unset', () => {
    expect(parseAdminEmails(undefined)).toEqual([]);
  });
});

describe('base URL for sign-in links', () => {
  it('accepts the production origin', () => {
    expect(baseUrlVerdict('https://orvnlabs.com').ok).toBe(true);
    expect(baseUrlVerdict('https://orvnlabs.com/').ok).toBe(true);
  });
  it('refuses localhost', () => {
    expect(baseUrlVerdict('http://localhost:5174').ok).toBe(false);
  });
  it('refuses another host', () => {
    expect(baseUrlVerdict('https://www.orvnlabs.com').ok).toBe(false);
  });
});

describe('email time wording', () => {
  it('flags toUTCString and UTC timeZone', () => {
    const problems = templateTimeProblems(
      'x.tsx',
      "d.toUTCString(); new Intl.DateTimeFormat('en', { timeZone: 'UTC' })",
    );
    expect(problems).toHaveLength(2);
  });
  it('passes Lagos time', () => {
    expect(templateTimeProblems('x.tsx', "{ timeZone: 'Africa/Lagos' }")).toEqual([]);
  });
});

describe('health verdict', () => {
  it('is ok when ready, and notes missing storage', () => {
    const verdict = healthVerdict(200, { status: 'ready', checks: { storage: false } });
    expect(verdict.ok).toBe(true);
    expect(verdict.notes).toHaveLength(1);
  });
  it('fails on 503 or misconfigured', () => {
    expect(healthVerdict(503, { status: 'misconfigured' }).ok).toBe(false);
    expect(healthVerdict(200, { status: 'misconfigured' }).ok).toBe(false);
  });
});
