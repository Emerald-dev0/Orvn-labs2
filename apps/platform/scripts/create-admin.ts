#!/usr/bin/env tsx
/**
 * Creates the operator account that opens /admin.
 *
 *   npm run admin:create -- --email you@example.com
 *   npm run admin:create -- --email you@example.com --password 'a long passphrase'
 *
 * There is no default password anywhere in this project — none is seeded, none is printed in a
 * doc, and none is baked into a fixture. The account is created here, by you, once.
 *
 * The address must appear in ADMIN_EMAILS. Sign-up is otherwise refused, because the beta gate in
 * lib/auth.ts only lets through an address on that list or one holding a usable invitation.
 */
import '../scripts/load-env.mjs';
import { randomBytes } from 'node:crypto';

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const email = arg('--email')?.trim().toLowerCase();
const name = arg('--name') ?? 'Operator';
const password = arg('--password') ?? randomBytes(24).toString('base64url');

function stop(message: string): never {
  console.error(`\n${message}\n`);
  process.exit(1);
}

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  stop(`Usage: npm run admin:create -- --email you@example.com [--password '…'] [--name 'Your name']`);
}

if (!process.env.DATABASE_URL) {
  stop(`No DATABASE_URL. Accounts live in Neon; set it in apps/platform/.env.local first
(docs/neon-setup.md), then run this again.`);
}

const allowlist = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

if (!allowlist.includes(email)) {
  console.log(`\nwarning  ${email} is not in ADMIN_EMAILS.`);
  console.log(`         The sign-up gate will refuse it. Add this to apps/platform/.env.local:`);
  console.log(`         ADMIN_EMAILS=${[...allowlist, email].join(',')}\n`);
}

if (password.length < 10) {
  stop('Better Auth requires at least 10 characters. Try a passphrase of three or four words.');
}

// Imported after the checks so a missing env fails with a sentence rather than a stack trace.
const { auth } = await import('../lib/auth');

try {
  await auth.api.signUpEmail({ body: { email, password, name } });

  console.log(`\nok    account created   ${email}`);
  console.log(`ok    sign in at        /sign-in  (password tab)`);
  console.log(`\nPassword: ${password}`);
  console.log('\nStore it in a password manager now — it is not written to disk anywhere, and this');
  console.log('is the only time it will be shown.\n');
  console.log(`Next: open /admin/early-access. With ADMIN_EMAILS containing ${email}, the queue is yours.\n`);
} catch (error) {
  const message = String((error as Error)?.message ?? error);
  const body = (error as { body?: { code?: string; message?: string } })?.body;
  const detail = body?.message ?? message;

  if (/already exists|user_exists/i.test(detail)) {
    console.log(`\n${email} already has an account. Sign in at /sign-in with the password you chose.`);
    console.log('Forgotten it? Use "Forgot password" on that page — it emails a reset link.\n');
    process.exit(0);
  }

  if (/FORBIDDEN|invitation/i.test(detail)) {
    stop(`Refused: ${email} is neither an operator nor an invitee.
Add it to ADMIN_EMAILS in .env.local (and in Vercel for the deployed site), then run this again.`);
  }

  stop(`Could not create the account: ${detail}`);
}
