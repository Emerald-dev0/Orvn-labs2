/**
 * Pure checks behind `npm run phase0:check`. No network, no database, no env reads: each
 * function takes what it needs and returns a verdict, so the rules are testable.
 */

/** Count the DMARC policy records in a TXT answer set. Mail receivers ignore all of them when there are two. */
export function dmarcRecordCount(txtRecords) {
  return txtRecords.filter((record) => /^\s*v=DMARC1\b/i.test(record)).length;
}

/** Tables the policy file turns RLS on for. Read from db/sql/policies.sql, not hard-coded. */
export function rlsTablesFromPolicies(sqlText) {
  const found = new Set();
  // Drop SQL line comments first, so a commented-out statement does not count.
  const code = sqlText.replace(/--[^\n]*/g, '');
  const pattern = /alter\s+table\s+([a-z_][a-z0-9_]*)\s+enable\s+row\s+level\s+security/gi;
  for (const match of code.matchAll(pattern)) found.add(match[1]);
  return [...found].sort();
}

/** Which expected tables do not have RLS switched on in the database. */
export function tablesWithoutRls(expected, rowsecurityByTable) {
  return expected.filter((table) => rowsecurityByTable.get(table) !== true);
}

/** Admin emails from the ADMIN_EMAILS variable, normalised the same way the app does. */
export function parseAdminEmails(raw) {
  return (raw ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

/** The base URL the magic link is built from. It must be the public origin, never localhost. */
export function baseUrlVerdict(url) {
  if (!url) return { ok: false, reason: 'BETTER_AUTH_URL is not set' };
  if (/localhost|127\.0\.0\.1/i.test(url)) return { ok: false, reason: `${url} is a local address` };
  if (!/^https:\/\//.test(url)) return { ok: false, reason: `${url} is not https` };
  if (url !== 'https://orvnlabs.com' && url !== 'https://orvnlabs.com/') {
    return { ok: false, reason: `${url} is not https://orvnlabs.com` };
  }
  return { ok: true, reason: url };
}

/** Email templates must not print UTC or the browser's zone; WAT is the zone the founder reads. */
export function templateTimeProblems(fileName, sourceText) {
  const problems = [];
  if (/toUTCString\s*\(/.test(sourceText)) problems.push(`${fileName}: uses toUTCString()`);
  if (/timeZone:\s*['"]UTC['"]/.test(sourceText)) problems.push(`${fileName}: timeZone 'UTC' for a person-facing time`);
  return problems;
}

/** A health response is good only when it says ready. Storage is reported, not required. */
export function healthVerdict(status, body) {
  if (status !== 200) return { ok: false, reason: `HTTP ${status}` };
  if (body?.status !== 'ready') return { ok: false, reason: `status is ${body?.status ?? 'unknown'}` };
  const notes = [];
  if (body?.checks?.storage === false) notes.push('storage not configured (uploads will not work)');
  return { ok: true, reason: 'ready', notes };
}
