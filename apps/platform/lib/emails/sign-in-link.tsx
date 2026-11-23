import * as React from 'react';
import type { EmailMessage } from '../email';
import { renderEmail } from '../../emails/render';
import { SignInLink } from '../../emails/SignInLink';
import { formatWhen } from './when';

/** Passwordless sign-in. The token lives inside the URL and is never repeated elsewhere. */
export async function signInLinkEmail(opts: {
  to: string;
  url: string;
  expiresAt: Date;
}): Promise<EmailMessage> {
  // State the window relative to now as well as the absolute, zoned time. A reader in another
  // region misreads a bare foreign-zone clock ("3:15 AM EST") as a longer window; "in about 15
  // minutes" removes that ambiguity while the zoned time stays exact.
  const minutes = Math.max(1, Math.round((opts.expiresAt.getTime() - Date.now()) / 60_000));
  return {
    to: opts.to,
    subject: 'Sign in to ORREI',
    businessKey: `magic:${opts.to}:${Math.floor(opts.expiresAt.getTime() / 60_000)}`,
    text: [
      'Use the link below to sign in to ORREI.',
      '',
      opts.url,
      '',
      `It works once and expires in about ${minutes} minute${minutes === 1 ? '' : 's'} (${formatWhen(opts.expiresAt)}).`,
      'If you did not ask to sign in, ignore this email; the link will not be used.',
      '',
      'ORVN Labs · hello@orvnlabs.com',
    ].join('\n'),
    html: await renderEmail(<SignInLink url={opts.url} expiresAt={opts.expiresAt} />),
  };
}
