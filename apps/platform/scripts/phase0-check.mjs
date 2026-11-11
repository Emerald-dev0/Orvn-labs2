#!/usr/bin/env node
/**
 * Checks the Phase 0 exceptions that a script can check, and prints the steps for the rest.
 *
 *   npm run phase0:check
 *   npm run phase0:check -- --base https://orvnlabs.com
 *
 * Reads apps/platform/.env.local (as the other scripts do). Needs DATABASE_URL_ADMIN for the
 * database items. Prints pass / FAIL / manual for each item. Exit code 1 if anything fails.
 * Manual items need a person: they live in dashboards or inboxes no script can see.
 */
import './load-env.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveTxt } from 'node:dns/promises';
import { Pool, neonConfig } from '@neondatabase/serverless';
import WebSocket from 'ws';
import {
  baseUrlVerdict,
  dmarcRecordCount,
  healthVerdict,
  parseAdminEmails,
  rlsTablesFromPolicies,
  tablesWithoutRls,
  templateTimeProblems,
} from './lib/phase0.mjs';

neonConfig.webSocketConstructor = WebSocket;

const here = dirname(fileURLToPath(import.meta.url));
const platformRoot = resolve(here, '..');
const argValue = (flag) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const DOMAIN = 'orvnlabs.com';
const BASE = argValue('--base') ?? process.env.BETTER_AUTH_URL ?? 'https://orvnlabs.com';

const results = [];
function record(id, label, status, detail = '', steps = []) {
  results.push({ id, label, status, detail, steps });
}

// 1. Redeploy and health (S0.1). The redeploy itself is manual; the health endpoint is not.
try {
  const response = await fetch(`${BASE.replace(/\/$/, '')}/api/health`, {
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.json().catch(() => null);
  const verdict = healthVerdict(response.status, body);
  if (verdict.ok) {
    record('S0.1', 'health endpoint', 'pass', `${BASE} ${verdict.reason}`);
    for (const note of verdict.notes ?? []) record('S0.1', 'health note', 'note', note);
  } else {
    record('S0.1', 'health endpoint', 'fail', `${BASE}: ${verdict.reason}`);
  }
} catch (error) {
  record('S0.1', 'health endpoint', 'fail', `${BASE}: ${error.message}`);
}
record('S0.1', 'redeploy after last env change', 'manual', '', [
  'Vercel → Deployments → latest: the build time is after your last change to Environment Variables.',
]);

// 2. Sign-in link base (S0.2): config, not the email itself.
const base = baseUrlVerdict(process.env.BETTER_AUTH_URL ?? BASE);
record('S0.2', 'BETTER_AUTH_URL is the public origin', base.ok ? 'pass' : 'fail', base.reason);

record('S0.2', 'click tracking off for sign-in mail', 'manual', '', [
  'Calder dashboard → project → sending/tracking settings: turn off click tracking for transactional mail,',
  'or confirm the sign-in button link is the plain https://orvnlabs.com URL.',
  'Then send a sign-in link and check the button host in the email.',
]);

// 3. DMARC (S0.3): the record count that broke alignment in Gmail.
try {
  const records = (await resolveTxt(`_dmarc.${DOMAIN}`)).map((chunks) => chunks.join(''));
  const count = dmarcRecordCount(records);
  if (count === 1) record('S0.3', `DMARC records at _dmarc.${DOMAIN}`, 'pass', 'one record');
  else
    record('S0.3', `DMARC records at _dmarc.${DOMAIN}`, 'fail',
      `${count} records; receivers ignore DMARC when there is not exactly one. Delete all but one in Cloudflare.`);
} catch (error) {
  record('S0.3', `DMARC records at _dmarc.${DOMAIN}`, 'fail', `lookup failed: ${error.code ?? error.message}`);
}
record('S0.3', 'Gmail shows dmarc=pass', 'manual', '', [
  `Run npm run mail:test -- --to <gmail>, then Gmail → Show original → look for dmarc=pass.`,
]);

// 4. Database items (S0.4, S0.5, S0.6, RLS). Needs the admin connection string.
const adminUrl = process.env.DATABASE_URL_ADMIN?.trim();
if (!adminUrl) {
  record('DB', 'database items', 'fail', 'DATABASE_URL_ADMIN is not set; skipped early access, contact, RLS and invitation checks');
} else {
  const pool = new Pool({ connectionString: adminUrl, max: 1 });
  try {
    // RLS on every table the policy file protects (S0.5).
    const expected = rlsTablesFromPolicies(readFileSync(join(platformRoot, 'db/sql/policies.sql'), 'utf8'));
    const rls = await pool.query(
      `select tablename, rowsecurity from pg_tables where schemaname = 'public' and tablename = any($1::text[])`,
      [expected],
    );
    const map = new Map(rls.rows.map((row) => [row.tablename, row.rowsecurity]));
    const missing = tablesWithoutRls(expected, map);
    if (missing.length === 0) record('S0.5', 'row level security on policy tables', 'pass', `${expected.length} tables`);
    else record('S0.5', 'row level security on policy tables', 'fail',
      `off for: ${missing.join(', ')}. Run npm run db:policies against this database.`);

    // Early access stored (S0.4).
    const early = await pool.query(`select count(*)::int as n from beta_applications`);
    if (early.rows[0].n >= 1) record('S0.4', 'early-access application stored', 'pass', `${early.rows[0].n} stored`);
    else record('S0.4', 'early-access application stored', 'fail', 'none stored yet');
    record('S0.4', 'confirmation email, reply-to, duplicate check', 'manual', '', [
      'Submit /early-access with a test address you control. Check the confirmation arrives.',
      'Submit the same address again: the count must not change, and the page says already received.',
      'Reply to the founder notification: the reply must go to the applicant.',
    ]);

    // Contact form stored (S0.5).
    const contact = await pool.query(`select count(*)::int as n from contact_messages`);
    if (contact.rows[0].n >= 1) record('S0.5', 'contact message stored', 'pass', `${contact.rows[0].n} stored`);
    else record('S0.5', 'contact message stored', 'fail', 'none stored yet. Submit /contact.');

    // A tester who is not the operator has accepted an invitation (S0.6).
    const admins = parseAdminEmails(process.env.ADMIN_EMAILS);
    const tester = await pool.query(
      `select count(*)::int as n from invitations
        where accepted_at is not null and lower(email) <> all($1::text[])`,
      [admins.length ? admins : ['']],
    );
    if (tester.rows[0].n >= 1) record('S0.6', 'invited tester has accepted', 'pass', `${tester.rows[0].n} accepted`);
    else record('S0.6', 'invited tester has accepted', 'fail', 'no non-operator invitation accepted yet');
  } catch (error) {
    record('DB', 'database items', 'fail', String(error.message).split('\n')[0]);
  } finally {
    await pool.end();
  }
}
record('S0.6', 'uninvited address is refused with the early-access notice', 'manual', '', [
  'Sign up with an address that has no invitation. Expect the early-access notice and a link to /early-access.',
  'Vercel → Logs: find [auth] refused account creation for that attempt.',
]);

// 5. Monitoring (S0.7): is there an error reporter in the dependencies?
const pkg = JSON.parse(readFileSync(join(platformRoot, 'package.json'), 'utf8'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const reporter = Object.keys(deps).find((name) => /sentry|rollbar|bugsnag|datadog|logrocket/i.test(name));
if (reporter) record('S0.7', 'error reporting installed', 'pass', reporter);
else record('S0.7', 'error reporting installed', 'fail', 'no error reporter in package.json');
record('S0.7', 'a test error raises an alert the founder receives', 'manual', '', [
  'Trigger a controlled error on a test route, confirm the alert arrives, screenshot it.',
]);

// 6. Email templates (S0.8): automated part, then the read-through.
const emailDirs = [join(platformRoot, 'emails'), join(platformRoot, 'lib/emails')];
const problems = [];
for (const dir of emailDirs) {
  for (const file of readdirSync(dir).filter((name) => /\.(tsx|ts)$/.test(name))) {
    problems.push(...templateTimeProblems(file, readFileSync(join(dir, file), 'utf8')));
  }
}
if (problems.length === 0) record('S0.8', 'no UTC wording in email templates', 'pass', 'grep-clean');
else record('S0.8', 'no UTC wording in email templates', 'fail', problems.join('; '));
record('S0.8', 'every template read once in preview', 'manual', '', [
  'npm run email:preview, then open each file in apps/platform/public/preview-emails and read it.',
]);

// Report.
const width = 52;
const mark = { pass: 'ok  ', fail: 'FAIL', manual: 'TODO', note: 'note' };
let current = '';
for (const row of results) {
  if (row.id !== current) {
    current = row.id;
    console.log(`\n${row.id}`);
  }
  const line = `  ${mark[row.status]}  ${row.label.padEnd(width)}${row.detail}`;
  console.log(line.trimEnd());
  for (const step of row.steps) console.log(`          ${step}`);
}

const failed = results.filter((row) => row.status === 'fail').length;
const manual = results.filter((row) => row.status === 'manual').length;
console.log(`\n${failed} failing, ${manual} need a person. Run again after each fix.`);
if (failed) process.exitCode = 1;
