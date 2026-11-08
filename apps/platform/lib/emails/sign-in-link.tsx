import * as React from 'react';
import type { EmailMessage } from '../email';
import { renderEmail } from '../../emails/render';
import { SignInLink } from '../../emails/SignInLink';

/** Passwordless sign-in. The token lives inside the URL and is never repeated elsewhere. */
export async function signInLinkEmail(opts: {
  to: string;
  url: string;
  expiresAt: Date;
}): Promise<EmailMessage> {
  return {
    to: opts.to,
    subject: 'Sign in to ORREI',
    businessKey: `magic:${opts.to}:${Math.floor(opts.expiresAt.getTime() / 60_000)}`,
    text: [
      'Use the link below to sign in to ORREI.',
      '',
      opts.url,
      '',
      `It works once and expires ${opts.expiresAt.toUTCString()}.`,
      'If you did not ask to sign in, ignore this email; the link will not be used.',
      '',
      'ORVN Labs · hello@orvnlabs.com',
    ].join('\n'),
    html: await renderEmail(<SignInLink url={opts.url} expiresAt={opts.expiresAt} />),
  };
}
