import type { EmailMessage } from '../email';

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Passwordless sign-in. The token is inside the URL; the email never repeats it elsewhere. */
export function signInLinkEmail(opts: { to: string; url: string; expiresAt: Date }): EmailMessage {
  const safeUrl = escape(opts.url);
  return {
    to: opts.to,
    subject: 'Sign in to ORVN Labs',
    businessKey: `magic:${opts.to}:${Math.floor(opts.expiresAt.getTime() / 60_000)}`,
    text: [
      'Use the link below to sign in to ORVN Labs.',
      '',
      opts.url,
      '',
      `It works once and expires ${opts.expiresAt.toUTCString()}.`,
      'If you did not ask to sign in, ignore this email; the link will not be used.',
      '',
      'ORVN Labs',
    ].join('\n'),
    html: [
      '<p>Use the link below to sign in to ORVN Labs.</p>',
      `<p><a href="${safeUrl}">Sign in to ORVN Labs</a></p>`,
      `<p style="color:#6b7280;font-size:13px">It works once and expires ${escape(opts.expiresAt.toUTCString())}. If you did not ask to sign in, ignore this email.</p>`,
    ].join(''),
  };
}
