#!/usr/bin/env node
import './load-env.mjs';
/**
 * Operator tool: issue or revoke a beta invitation.
 *
 *   node scripts/invite.mjs --email person@example.com [--role owner|editor|viewer] [--days 7]
 *   node scripts/invite.mjs --revoke <invitation-id>
 *
 * Uses the admin connection (owner role) because beta invitations have no workspace and are
 * deliberately invisible to every tenant role. Prints the accept URL once; the token is not
 * stored anywhere else, only its hash is.
 */
import { createHash, randomBytes } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const args = process.argv.slice(2);
const value = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};

const connectionString = process.env.DATABASE_URL_ADMIN ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Set DATABASE_URL_ADMIN (owner role) before running this script.');
  process.exit(1);
}

const sql = neon(connectionString);
const revokeId = value('revoke');

if (revokeId) {
  const rows = await sql`
    update invitations set revoked_at = now()
     where id = ${revokeId} and accepted_at is null and revoked_at is null
    returning id, email
  `;
  if (!rows[0]) {
    console.error('No usable invitation with that id.');
    process.exit(1);
  }
  console.log(`Revoked invitation for ${rows[0].email}.`);
  process.exit(0);
}

const email = (value('email') ?? '').trim().toLowerCase();
const role = value('role') ?? 'owner';
const days = Number(value('days') ?? 7);

if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
  console.error('Usage: node scripts/invite.mjs --email person@example.com [--role owner] [--days 7]');
  process.exit(1);
}
if (!['owner', 'editor', 'viewer'].includes(role)) {
  console.error('Role must be owner, editor or viewer.');
  process.exit(1);
}

const token = randomBytes(32).toString('base64url');
const tokenHash = createHash('sha256').update(token).digest('hex');

const existing = await sql`
  select id from invitations
   where email = ${email} and accepted_at is null and revoked_at is null and expires_at > now()
   limit 1
`;
if (existing[0]) {
  console.error(`An open invitation already exists for ${email} (${existing[0].id}). Revoke it first.`);
  process.exit(1);
}

const inserted = await sql`
  insert into invitations (email, role, token_hash, expires_at)
  values (${email}, ${role}, ${tokenHash}, now() + (${days} || ' days')::interval)
  returning id, expires_at
`;

const base = (process.env.BETTER_AUTH_URL ?? 'http://localhost:5174').replace(/\/$/, '');
console.log(`\nInvitation created for ${email} (${role}), id ${inserted[0].id}`);
console.log(`Expires ${new Date(inserted[0].expires_at).toUTCString()}\n`);
console.log(`  ${base}/invite/${token}\n`);
console.log('Send that link to the person. It is shown once and cannot be recovered.\n');
