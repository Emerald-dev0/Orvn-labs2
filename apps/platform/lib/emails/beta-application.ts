import type { EmailMessage } from '../email';

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * An early-access request, delivered to the operator inbox.
 *
 * `replyTo` is the applicant, so answering is one click in any mail client. The body is
 * plain text first: it is read on a phone, often between other things.
 */
export function betaApplicationEmail(opts: {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  role?: string | null;
  markets?: string | null;
  volume?: string | null;
  currentTools?: string | null;
  frustration?: string | null;
  website?: string | null;
  receivedAt: Date;
}): EmailMessage {
  const lines = [
    `${opts.name} (${opts.email}) asked for early access.`,
    '',
    opts.company ? `Company: ${opts.company}` : null,
    opts.role ? `Role: ${opts.role}` : null,
    opts.markets ? `Market: ${opts.markets}` : null,
    opts.volume ? `Properties per month: ${opts.volume}` : null,
    opts.website ? `Website: ${opts.website}` : null,
    '',
    opts.currentTools ? `Shares properties today with:\n${opts.currentTools}` : null,
    opts.frustration ? `\nMost frustrating part:\n${opts.frustration}` : null,
    '',
    `Received ${opts.receivedAt.toUTCString()} · application ${opts.id}`,
    '',
    'Reply to this email to answer them directly. Invitations are issued with:',
    `  npm run invite --email ${opts.email}`,
  ].filter((line): line is string => line !== null);

  return {
    to: '',
    subject: `Early access: ${opts.name}${opts.company ? ` · ${opts.company}` : ''}`,
    businessKey: `early-access:${opts.id}`,
    replyTo: opts.email,
    text: lines.join('\n'),
    html: [
      `<p><strong>${escape(opts.name)}</strong> (${escape(opts.email)}) asked for early access.</p>`,
      '<table style="font-size:14px;border-collapse:collapse">',
      opts.company ? `<tr><td style="color:#6b7280;padding:2px 12px 2px 0">Company</td><td>${escape(opts.company)}</td></tr>` : '',
      opts.role ? `<tr><td style="color:#6b7280;padding:2px 12px 2px 0">Role</td><td>${escape(opts.role)}</td></tr>` : '',
      opts.markets ? `<tr><td style="color:#6b7280;padding:2px 12px 2px 0">Market</td><td>${escape(opts.markets)}</td></tr>` : '',
      opts.volume ? `<tr><td style="color:#6b7280;padding:2px 12px 2px 0">Volume</td><td>${escape(opts.volume)}</td></tr>` : '',
      '<table>',
      opts.currentTools ? `<p style="color:#6b7280;font-size:13px">Today</p><p>${escape(opts.currentTools).replace(/\n/g, '<br>')}</p>` : '',
      opts.frustration ? `<p style="color:#6b7280;font-size:13px">Frustration</p><p>${escape(opts.frustration).replace(/\n/g, '<br>')}</p>` : '',
      `<p style="color:#9ca3af;font-size:12px">Received ${escape(opts.receivedAt.toUTCString())}</p>`,
    ].join(''),
  };
}
