#!/usr/bin/env node
/**
 * Applies db/sql/policies.sql.
 *
 * Run after migrations, with a connection that owns the tables:
 *   DATABASE_URL_ADMIN=postgres://... npm run db:policies
 *
 * The file is idempotent, so this is safe to re-run after adding a table or a policy.
 * It must run as the owner: it creates the two application roles and grants to them.
 */
import './load-env.mjs';
import { readFile } from 'node:fs/promises';
import { Pool, neonConfig } from '@neondatabase/serverless';
import WebSocket from 'ws';

neonConfig.webSocketConstructor = WebSocket;

const connectionString = process.env.DATABASE_URL_ADMIN?.trim() || process.env.DATABASE_URL?.trim() || '';
if (!connectionString) {
  console.error('Set DATABASE_URL_ADMIN (owner role) or DATABASE_URL before running this script.');
  process.exit(1);
}

const file = new URL('../db/sql/policies.sql', import.meta.url);
const sql = await readFile(file, 'utf8');

const pool = new Pool({ connectionString, max: 1 });
try {
  await pool.query(sql);
  const { rows } = await pool.query(`
    select count(*)::int as policies,
           (select count(*)::int from pg_tables where schemaname = 'public' and rowsecurity) as protected_tables
      from pg_policies where schemaname = 'public'
  `);
  console.log(`Policies applied: ${rows[0].policies} policies across ${rows[0].protected_tables} protected tables.`);
} catch (error) {
  console.error('Failed to apply policies:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
