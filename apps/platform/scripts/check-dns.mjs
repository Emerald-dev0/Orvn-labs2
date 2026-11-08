#!/usr/bin/env node
/**
 * What the DNS actually says, right now.
 *
 *   npm run dns:check
 *   npm run dns:check -- --domain example.com
 *
 * Deployment steps are usually described in a dashboard that lies by omission: a record exists in
 * the zone editor but never left Cloudflare, or a DKIM key is there under a selector nobody
 * remembered. This asks public resolvers over DNS-over-HTTPS and prints what the internet sees.
 *
 * No dependencies and no credentials. Exit code 1 if anything required is missing, so it can run
 * in CI after a deployment.
 */

const args = process.argv.slice(2);
const domainFlag = args.indexOf('--domain');
const DOMAIN = (domainFlag >= 0 ? args[domainFlag + 1] : 'orvnlabs.com') ?? 'orvnlabs.com';

const RESOLVERS = [
  (name, type) => `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
  (name, type) =>
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}&ct=application/dns-json`,
];

/** The same record type in words, because "type 15" helps nobody at 2am. */
const TYPE_NAMES = { 1: 'A', 2: 'NS', 5: 'CNAME', 6: 'SOA', 15: 'MX', 16: 'TXT', 28: 'AAAA' };

async function query(name, type) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    for (const resolver of RESOLVERS) {
      try {
        const response = await fetch(resolver(name, type), {
          headers: { accept: 'application/dns-json' },
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) continue;
        const text = await response.text();
        if (!text.trim()) continue;
        const payload = JSON.parse(text);
        return (payload.Answer ?? []).map((answer) => ({
          type: TYPE_NAMES[answer.type] ?? String(answer.type),
          data: String(answer.data),
        }));
      } catch {
        // try the next resolver, then the next attempt
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
  }
  return null;
}

const DKIM_SELECTORS = ['google', 'zmail', 'calder', 'calder1', 'cf2024-1', 'resend', 'default'];

/** The hosts a mail provider publishes, so the check can name what it finds. */
const MAIL_HOSTS = [
  { name: 'Google Workspace', match: 'aspmx.l.google.com', spf: '_spf.google.com' },
  { name: 'Zoho Mail', match: 'mx.zoho.', spf: 'zoho.com' },
  { name: 'Microsoft 365', match: 'mail.protection.outlook.com', spf: 'spf.protection.outlook.com' },
  { name: 'Fastmail', match: 'messagingengine.com', spf: 'spf.messagingengine.com' },
  { name: 'Migadu', match: 'migadu.com', spf: 'spf.migadu.com' },
  { name: 'Proton Mail', match: 'protonmail.ch', spf: '_spf.protonmail.ch' },
  { name: 'Cloudflare Email Routing', match: 'mx.cloudflare.net', spf: '_spf.mx.cloudflare.net' },
  { name: 'ImprovMX', match: 'improvmx.com', spf: 'spf.improvmx.com' },
];

const checks = [];

function record(name, type, verdict, detail) {
  checks.push({ name, type, verdict, detail });
}

async function main() {
  console.log(`\nDNS check · ${DOMAIN}\n`);

  const ns = await query(DOMAIN, 'NS');
  const nameservers = (ns ?? []).map((answer) => answer.data);
  const onCloudflare = nameservers.some((value) => value.endsWith('cloudflare.com.'));
  record('nameservers', 'NS', nameservers.length ? 'ok' : 'missing', nameservers.join(' ') || 'no answer');
  record(
    'DNS provider',
    '',
    onCloudflare ? 'ok' : 'note',
    onCloudflare ? 'Cloudflare (records can be managed in the dashboard)' : 'not Cloudflare',
  );

  const apex = await query(DOMAIN, 'A');
  record('apex', 'A', apex && apex.length ? 'ok' : 'missing', (apex ?? []).map((a) => a.data).join(' ') || 'no A record — the bare domain does not load');

  const www = await query(`www.${DOMAIN}`, 'A');
  const wwwCname = await query(`www.${DOMAIN}`, 'CNAME');
  const wwwData = [...(www ?? []), ...(wwwCname ?? [])];
  record('www', 'A/CNAME', wwwData.length ? 'ok' : 'missing', wwwData.map((a) => `${a.type} ${a.data}`).join(' '));

  const mx = await query(DOMAIN, 'MX');
  const mxHosts = (mx ?? []).map((answer) => answer.data);
  const provider = MAIL_HOSTS.find((candidate) => mxHosts.some((host) => host.includes(candidate.match)));
  record(
    'mail host',
    'MX',
    mxHosts.length ? 'ok' : 'missing',
    mxHosts.length
      ? `${provider?.name ?? 'custom host'} · ${mxHosts.length} hosts`
      : 'no MX — nothing at this domain can receive mail',
  );
  if (provider?.name === 'Cloudflare Email Routing') {
    record('mailbox', '', 'note', 'Cloudflare Email Routing forwards only; there is no mailbox to send from');
  }

  const txt = await query(DOMAIN, 'TXT');
  const allTxt = (txt ?? []).map((answer) => answer.data);
  const spfs = allTxt.filter((value) => /v=spf1/i.test(value));
  const spf = spfs[0];
  record('SPF', 'TXT', spf ? 'ok' : 'missing', spf ?? 'no v=spf1 record');
  if (spfs.length > 1) {
    record('SPF records', '', 'warn', `${spfs.length} SPF records — receivers use the first and ignore the rest`);
  }
  if (spf && provider && !spf.includes(provider.spf)) {
    record('SPF covers mail host', '', 'warn', `mail sent through ${provider.name} would fail SPF`);
  }
  if (spf && !/include:.*calder|api\.calder/i.test(spf)) {
    record('SPF covers Calder', '', 'note', 'fine if Calder sends with its own return-path and DKIM aligns');
  }

  const dmarc = (await query(`_dmarc.${DOMAIN}`, 'TXT')) ?? [];
  const dmarcValue = dmarc.map((answer) => answer.data).find((value) => /v=DMARC1/i.test(value));
  record('DMARC', 'TXT', dmarcValue ? 'ok' : 'missing', dmarcValue ?? 'no DMARC record');
  if (dmarcValue) {
    const policy = /p=(\w+)/i.exec(dmarcValue)?.[1]?.toLowerCase();
    if (!policy || policy === 'none') {
      record('DMARC policy', '', 'note', `p=${policy ?? 'unset'} — monitoring only, nothing is enforced yet`);
    }

    // A reporting address that cannot receive is worse than none: it looks like coverage.
    const rua = /rua=mailto:([^;,\s]+)/i.exec(dmarcValue)?.[1];
    if (rua) {
      const ruaDomain = rua.split('@')[1];
      const ruaMx = ruaDomain ? await query(ruaDomain, 'MX') : null;
      record(
        'DMARC reports',
        'MX',
        ruaMx && ruaMx.length ? 'ok' : 'warn',
        ruaMx && ruaMx.length
          ? `${rua} can receive mail`
          : `${rua} has no MX — reports will bounce`,
      );
    }
  }

  for (const selector of DKIM_SELECTORS) {
    const host = `${selector}._domainkey.${DOMAIN}`;
    const answers = await query(host, 'TXT');
    if (answers && answers.length) {
      record(`DKIM ${selector}`, 'TXT', 'ok', answers[0].data.slice(0, 48) + '…');
    }
  }

  const width = Math.max(...checks.map((check) => check.name.length));
  for (const check of checks) {
    const mark = check.verdict === 'ok' ? 'ok  ' : check.verdict === 'missing' ? 'MISS' : check.verdict === 'warn' ? 'WARN' : 'note';
    console.log(`${mark}  ${check.name.padEnd(width)}  ${check.detail}`);
  }

  const missing = checks.filter((check) => check.verdict === 'missing');
  console.log(
    missing.length === 0
      ? '\nNothing required is missing.\n'
      : `\n${missing.length} required record(s) missing: ${missing.map((check) => check.name).join(', ')}\n`,
  );

  process.exit(missing.length === 0 ? 0 : 1);
}

await main();
