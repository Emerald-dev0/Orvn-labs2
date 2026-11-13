#!/usr/bin/env tsx
/**
 * Prepares the operator account that opens /admin.
 *
 *   npm run admin:create -- --email you@example.com [--name 'Your name']
 *
 * D01: ORREI has no passwords. Accounts are created by the first magic-link sign-in — there is
 * nothing to seed here and no credential to print. This script checks the three things that
 * must hold for that first sign-in to work, and tells you what happens next. It never creates
 * or stores a password, and there is no default anywhere in the project.
 */
import '../scripts/load-env.mjs';

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const email = arg('--email')?.trim().toLowerCase();

function stop(message: string): never {
  console.error(`\n${message}\n`);
  process.exit(1);
}

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  stop(`Usage: npm run admin:create -- --email you@example.com [--name 'Your name']`);
}

for (const name of ['DATABASE_URL', 'BETTER_AUTH_SECRET'] as const) {
  if (!process.env[name]) {
    stop(`No ${name}. Set it in apps/platform/.env.local first (docs/neon-setup.md, docs/env-setup.md), then run this again.`);
  }
}

const allowlist = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

if (!allowlist.includes(email)) {
  console.log(`\nwarning  ${email} is not in ADMIN_EMAILS.`);
  console.log(`         The beta gate will refuse to create the account or send the link.`);
  console.log(`         Add it to apps/platform/.env.local and to Vercel:\n`);
  console.log(`         ADMIN_EMAILS=${[...allowlist, email].join(',')}\n`);
  process.exit(1);
}

const base = (process.env.BETTER_AUTH_URL ?? 'http://localhost:5174').replace(/\/$/, '');

console.log(`\nok    configuration verified for ${email}`);
console.log(`\nThere is no password to create. To get in:`);
console.log(`  1. Open ${base}/sign-in`);
console.log(`  2. Enter ${email} and request the sign-in link`);
console.log(`  3. Open the link — the account is created on first sign-in and the link works once`);
console.log(`\nThen: open /admin/early-access. With ADMIN_EMAILS containing ${email}, the queue is yours.\n`);
