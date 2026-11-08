#!/usr/bin/env node
/**
 * Prints what the database actually is, in the same shape as `npm run dns:check`.
 *
 *   npm run db:status
 *   npm run db:status -- --admin      (check with DATABASE_URL_ADMIN instead)
 *
 * Read-only. Answers the questions that otherwise need a dozen clicks in the Neon
 * console: did the migrations land, do the two application roles exist, does the
 * connecting user own them, and is row level security actually switched on.
 */
import './load-env.mjs';
import { Pool, neonConfig } from '@neondatabase/serverless';
import WebSocket from 'ws';

neonConfig.webSocketConstructor = WebSocket;

const useAdmin = process.argv.includes('--admin');
const key = useAdmin ? 'DATABASE_URL_ADMIN' : 'DATABASE_URL';
const connectionString = process.env[key] ?? (useAdmin ? process.env.DATABASE_URL : undefined);

let failed = false;
const width = 18;

function record(label, detail, status = 'ok') {
  if (status === 'missing') failed = true;
  const mark = status === 'ok' ? 'ok  ' : status === 'missing' ? 'MISS' : 'note';
  console.log(`${mark}  ${label.padEnd(width)}${detail}`);
}

if (!connectionString) {
  console.error(`
No ${key} in the environment.

Looked in the shell and in apps/platform/.env.local (and .env). Copy .env.example to
.env.local in apps/platform, paste the Neon connection strings, then run this again.
Step by step: docs/neon-setup.md
`);
  process.exit(1);
}

const pool = new Pool({ connectionString, max: 1 });

try {
  const who = await pool.query(`
    select current_user as current_user,
           current_database() as db,
           split_part(version(), ' ', 2) as server_version
  `);
  const { current_user: user, db, server_version: version } = who.rows[0];
  record('connected', `${user} on ${db} · Postgres ${version}`);

  const roles = await pool.query(`
    select rolname, rolcanlogin,
           pg_has_role(current_user, rolname, 'MEMBER') as is_member
      from pg_roles
     where rolname in ('orrei_app', 'orrei_public')
  `);
  const found = new Map(roles.rows.map((row) => [row.rolname, row]));
  for (const name of ['orrei_app', 'orrei_public']) {
    const row = found.get(name);
    if (!row) {
      record(`role ${name}`, 'missing — run npm run db:policies', 'missing');
    } else if (!row.is_member) {
      record(`role ${name}`, `exists, but ${user} cannot assume it — run npm run db:policies`, 'missing');
    } else {
      record(`role ${name}`, `${row.rolcanlogin ? 'login' : 'nologin'}, assumable by ${user}`);
    }
  }

  const migrations = await pool.query(`
    select to_regclass('drizzle.__drizzle_migrations') is not null as present
  `);
  if (!migrations.rows[0].present) {
    record('migrations', 'no drizzle journal — run npm run db:migrate', 'missing');
  } else {
    const { rows } = await pool.query(`select count(*)::int as applied from drizzle.__drizzle_migrations`);
    record('migrations', `${rows[0].applied} applied`);
  }

  const tables = await pool.query(`
    select count(*)::int as total,
           count(*) filter (where rowsecurity)::int as protected
      from pg_tables where schemaname = 'public'
  `);
  const { total, protected: guarded } = tables.rows[0];
  if (total === 0) {
    record('tables', 'none in public — run npm run db:migrate', 'missing');
  } else {
    record('tables', `${total} in public, ${guarded} with row level security`);
  }

  const policies = await pool.query(`select count(*)::int as n from pg_policies where schemaname = 'public'`);
  const policyCount = policies.rows[0].n;
  record('policies', policyCount ? `${policyCount} defined` : 'none — run npm run db:policies',
    policyCount ? 'ok' : 'missing');

  // The queue is the one table with a product-facing page; prove it is really there.
  const queue = await pool.query(`select to_regclass('public.beta_applications') is not null as present`);
  if (queue.rows[0].present) {
    const { rows } = await pool.query(`select count(*)::int as n from beta_applications`);
    record('early access', `${rows[0].n} application${rows[0].n === 1 ? '' : 's'} stored`);
  } else {
    record('early access', 'beta_applications missing — run npm run db:migrate', 'missing');
  }
} catch (error) {
  const message = String(error?.message ?? error);
  record('connection', message.split('\n')[0], 'missing');
  if (/ENOTFOUND|EAI_AGAIN/i.test(message)) {
    console.log('\nThat hostname does not resolve. The connection string was probably truncated when pasted.');
  } else if (/password|authentication/i.test(message)) {
    console.log('\nAuthentication failed. Re-copy the string from Neon → Connect with the password included.');
  } else if (/does not exist/i.test(message)) {
    console.log('\nThe database exists but is empty. Run npm run db:migrate, then npm run db:policies.');
  }
} finally {
  await pool.end();
}

if (failed) {
  console.log('\nThe deployment will fall back to demo mode until the missing steps above are run.');
  process.exitCode = 1;
}
