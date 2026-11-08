import * as React from 'react';
import type { EmailMessage } from '../email';
import { renderEmail } from '../../emails/render';
import { ResetPassword } from '../../emails/ResetPassword';

/**
 * Password reset. The business key buckets by the minute, so a double submit inside the same
 * minute is one email, while a genuine second request a minute later is not silently swallowed.
 */
export async function resetPasswordEmail(opts: { to: string; url: string }): Promise<EmailMessage> {
  return {
    to: opts.to,
    subject: 'Reset your ORREI password',
    businessKey: `reset:${opts.to}:${Math.floor(Date.now() / 60_000)}`,
    text: [
      'Someone asked to reset the password for this ORREI account.',
      '',
      'Choose a new password here:',
      opts.url,
      '',
      'The link works once. If that was not you, no action is needed and nothing has changed.',
      '',
      'ORVN Labs · hello@orvnlabs.com',
    ].join('\n'),
    html: await renderEmail(<ResetPassword url={opts.url} />),
  };
}
