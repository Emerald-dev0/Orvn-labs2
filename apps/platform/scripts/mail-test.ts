#!/usr/bin/env tsx
/**
 * Proves the outbound mail path before an applicant finds out it is broken.
 *
 *   npm run mail:test                    → sends to EARLY_ACCESS_INBOX
 *   npm run mail:test -- --to you@gmail.com
 *   npm run mail:test -- --dry           → prints the configuration, sends nothing
 *
 * It goes through the same `sendEmail()` seam the site uses, with the same MAIL_FROM, so a pass
 * here means the sender identity, the key and the network are all correct. What it cannot test
 * is whether the message lands in an inbox or a spam folder — open the mail client for that.
 *
 * Inbound (Cloudflare Email Routing → your Gmail) is a separate path and cannot be tested from
 * here: send yourself something at hello@orvnlabs.com from a phone.
 */
import '../scripts/load-env.mjs';
import { EmailError, sendEmail } from '../lib/email';

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const dryRun = process.argv.includes('--dry');
const from = process.env.MAIL_FROM ?? '(unset — the provider default would be used)';
const to = arg('--to') ?? process.env.EARLY_ACCESS_INBOX;
const key = process.env.CALDER_API_KEY;
const apiUrl = process.env.CALDER_API_URL ?? 'https://api.calder.click/v1';

function stop(message: string): never {
  console.error(`\n${message}\n`);
  process.exit(1);
}

console.log('\nOutbound mail configuration');
console.log(`  provider     Calder (${apiUrl})`);
console.log(`  from         ${from}`);
console.log(`  to           ${to ?? '(unset)'}`);
console.log(`  api key      ${key ? `${key.slice(0, 12)}… (${key.length} chars)` : '(unset)'}`);

if (dryRun) {
  // Preflight: say what is missing without sending anything.
  const checks: [string, boolean, string][] = [
    ['api key', Boolean(key), 'CALDER_API_KEY'],
    ['from', Boolean(process.env.MAIL_FROM), 'MAIL_FROM'],
    ['recipient', Boolean(to), 'EARLY_ACCESS_INBOX'],
  ];
  let missing = false;
  for (const [label, present, variable] of checks) {
    if (!present) missing = true;
    console.log(`${present ? 'ok  ' : 'MISS'}  ${label.padEnd(12)}${present ? 'set' : `${variable} is empty`}`);
  }
  console.log(
    missing
      ? '\nConfiguration incomplete — fill the MISS lines in apps/platform/.env.local.\n'
      : '\nConfiguration complete. Drop --dry to send a real message.\n',
  );
  process.exit(missing ? 1 : 0);
}

if (!key) {
  stop(`No CALDER_API_KEY. Calder → project → API keys → create, then paste it into
apps/platform/.env.local as CALDER_API_KEY=calder_sk_live_…
Without it the site still saves every submission and says it could not email.`);
}

if (!process.env.MAIL_FROM) {
  stop(`No MAIL_FROM. Set it to a sender identity Calder has verified, exactly:
MAIL_FROM=hello@orvnlabs.com   (bare address: no name, no <>, no quotes)
A From that is not a verified identity is the classic "API returned 200, nothing arrived".`);
}

if (!to) {
  stop('No recipient. Set EARLY_ACCESS_INBOX, or pass --to someone@example.com');
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
  stop(`"${to}" is not an email address. If MAIL_FROM looks fine but this does not, EARLY_ACCESS_INBOX is wrong.`);
}

const started = Date.now();
try {
  const result = await sendEmail({
    to,
    subject: 'ORREI mail path test',
    text: [
      'This is a test message from the ORREI platform.',
      '',
      'It was sent through the same code path the site uses for early-access and inquiry',
      'notifications, so if you are reading it, outbound mail works: the Calder key is',
      'valid and the sender identity is verified.',
      '',
      `Sent ${new Date().toISOString()}.`,
      'Inbound is separate — reply to this message to test that direction.',
    ].join('\n'),
    businessKey: `mail-test:${new Date().toISOString().slice(0, 10)}`,
  });

  console.log(`\nok    sent        ${result.provider} accepted it in ${Date.now() - started}ms`);
  console.log(`ok    message id  ${result.id ?? '(none returned)'}${result.replayed ? ' (replayed — same key)' : ''}`);
  console.log(`\nNext: open ${to} and check the inbox — and the spam folder, which is where an`);
  console.log('unauthenticated domain lands. If it is in spam, SPF and DKIM are still incomplete:');
  console.log('npm run dns:check\n');
} catch (error) {
  if (error instanceof EmailError) {
    const hint: Record<string, string> = {
      unauthorized: 'The key is wrong, revoked, or from another project.',
      forbidden: 'The key is valid but not allowed to send — check the sending domain is verified.',
      sender_not_verified: 'MAIL_FROM names an address that is not a verified sender identity in Calder.',
      invalid_from: 'MAIL_FROM is malformed. Use a bare address, e.g. hello@orvnlabs.com — no name and no angle brackets',
      rate_limited: 'Too many messages just now. Wait a minute and try again.',
    };
    console.error(`\nMISS  delivery    ${error.message}`);
    console.error(`      provider    ${error.provider} · status ${error.status} · code ${error.code}`);
    if (error.requestId) console.error(`      request id  ${error.requestId} (quote this to Calder support)`);
    if (hint[error.code]) console.error(`      likely      ${hint[error.code]}`);
    if (error.retryable) console.error('      retryable   yes');
    console.error('');
    process.exit(1);
  }

  const message = (error as Error).message;
  console.error(`\nMISS  delivery    ${message}`);
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|timeout/i.test(message)) {
    console.error(`      likely      could not reach ${apiUrl}`);
    console.error('                  check CALDER_API_URL, and that this machine can reach the host.');
  }
  console.error('');
  process.exit(1);
}
