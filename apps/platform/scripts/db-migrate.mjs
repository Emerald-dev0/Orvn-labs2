#!/usr/bin/env node
/**
 * `npm run db:migrate` — applies db/migrations and then says what it did.
 *
 * This wraps the drizzle migrator rather than shelling out to `drizzle-kit migrate`
 * for one reason: drizzle-kit is silent on success. A run that applied six migrations
 * and a run that opened no socket at all produce the same three lines of output — and
 * with the Neon serverless driver the second one is easy to hit, because the driver
 * needs a WebSocket constructor that drizzle-kit does not give it in Node (the
 * "can only connect to remote Neon/Vercel Postgres/Supabase instances through a
 * websocket" warning). Silence there looks exactly like success.
 *
 * So: same migrations, same bookkeeping table (`drizzle.__drizzle_migrations`, so
 * drizzle-kit and this script stay interchangeable), same SQL — but the socket is
 * opened here, the transaction is real, and the result is printed.
 *
 *   npm run db:migrate
 *   npm run db:migrate -- --dry     (report what would run, apply nothing)
 *
 * Connection: DATABASE_URL_ADMIN wins, because migrations are DDL and a pooled
 * connection can land on a different backend mid-transaction. Falls back to
 * DATABASE_URL with a note. Never prints the string itself.
 */
import './load-env.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool, neonConfig } from '@neondatabase/serverless';
import WebSocket from 'ws';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

// Without this the driver falls back to HTTP and cannot run a migration at all.
neonConfig.webSocketConstructor = WebSocket;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const folder = join(root, 'db', 'migrations');
const dry = process.argv.includes('--dry');

// `??` would take an empty string as a value, which is the shape a half-filled .env.local has.
const direct = process.env.DATABASE_URL_ADMIN?.trim() || '';
const pooled = process.env.DATABASE_URL?.trim() || '';
const connectionString = direct || pooled;

const width = 20;
let failed = false;

function record(label, detail, status = 'ok') {
  if (status === 'missing') failed = true;
  const mark = status === 'ok' ? 'ok  ' : status === 'missing' ? 'MISS' : 'note';
  console.log(`${mark}  ${label.padEnd(width)}${detail}`);
}

console.log('\ndb:migrate\n');

let journal;
try {
  journal = JSON.parse(readFileSync(join(folder, 'meta', '_journal.json'), 'utf8'));
} catch {
  console.error(`
db/migrations/meta/_journal.json is missing or unreadable.

The SQL files alone are not enough — drizzle reads this journal to know the order and
timestamps. Regenerate it with: npm run db:generate
`);
  process.exit(1);
}

const pendingOnDisk = journal.entries.length;
record('migrations on disk', `${pendingOnDisk} in db/migrations`);

if (!connectionString) {
  console.error(`
No DATABASE_URL in the environment (and no DATABASE_URL_ADMIN).

Looked in the shell and in apps/platform/.env.local (and .env). Copy .env.example to
.env.local in apps/platform, paste the Neon connection strings, then run this again.
Step by step: docs/neon-setup.md
`);
  process.exit(1);
}

if (!direct) {
  record(
    'connection string',
    'DATABASE_URL (pooled) — set DATABASE_URL_ADMIN for DDL, see docs/neon-setup.md',
    'note',
  );
}

const pool = new Pool({ connectionString, max: 1 });

async function appliedCount() {
  const { rows } = await pool.query(`
    select case
             when to_regclass('drizzle.__drizzle_migrations') is null then 0
             else (select count(*)::int from drizzle.__drizzle_migrations)
           end as applied
  `);
  return rows[0].applied;
}

try {
  const who = await pool.query(`
    select current_user as current_user,
           current_database() as db,
           split_part(version(), ' ', 2) as server_version
  `);
  const { current_user: user, db, server_version: version } = who.rows[0];
  record('connected', `${user} on ${db} · Postgres ${version}`);

  const before = await appliedCount();
  record('already applied', `${before} of ${pendingOnDisk}`);

  if (dry) {
    const wouldRun = journal.entries.slice(before).map((entry) => entry.tag);
    record('would apply', wouldRun.length ? wouldRun.join(', ') : 'nothing pending');
  } else if (before >= pendingOnDisk) {
    record('pending', 'none — the database is up to date');
  } else {
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: folder });

    const after = await appliedCount();
    const ran = journal.entries.slice(before, after).map((entry) => entry.tag);
    record('applied now', ran.length ? ran.join(', ') : 'nothing (journal disagreed with the table)');

    if (after < pendingOnDisk) {
      record('still pending', `${pendingOnDisk - after} migration(s) did not apply`, 'missing');
    }
  }

  const tables = await pool.query(`
    select count(*)::int as total from pg_tables where schemaname = 'public'
  `);
  record('tables', `${tables.rows[0].total} in public`);

  // The newest table is also the canary: if this is present, 0005 landed.
  const contact = await pool.query(`
    select to_regclass('public.contact_messages') is not null as present
  `);
  record(
    'contact form',
    contact.rows[0].present
      ? 'contact_messages present'
      : 'contact_messages missing — 0005 did not apply',
    contact.rows[0].present ? 'ok' : 'missing',
  );

  if (!dry && !failed) {
    console.log('\nSchema is up to date. Next: npm run db:policies');
  }
} catch (error) {
  const message = String(error?.message ?? error);
  record('migration', message.split('\n')[0], 'missing');
  if (/ENOTFOUND|EAI_AGAIN/i.test(message)) {
    console.log('\nThat hostname does not resolve. The connection string was probably truncated when pasted.');
  } else if (/password|authentication/i.test(message)) {
    console.log('\nAuthentication failed. Re-copy the string from Neon → Connect with the password included.');
  } else if (/websocket|fetch failed/i.test(message)) {
    console.log('\nThe socket to Neon never opened. Check the host, and that nothing is blocking outbound TLS.');
  } else if (/already exists/i.test(message)) {
    console.log('\nA table from these migrations already exists but is not recorded in');
    console.log('drizzle.__drizzle_migrations — that happens when SQL was pasted into the Neon console');
    console.log('by hand. Run npm run db:status to see what is there before forcing anything.');
  }
} finally {
  await pool.end();
}

if (failed) {
  console.log('\nThe deployment will fall back to demo mode until the step above is fixed.');
  process.exitCode = 1;
}
