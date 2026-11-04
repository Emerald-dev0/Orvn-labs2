import type { EmailMessage } from '../email';

export function resetPasswordEmail(opts: { to: string; url: string }): EmailMessage {
  return {
    to: opts.to,
    subject: 'Reset your LAREI password',
    businessKey: `reset:${opts.to}:${Math.floor(Date.now() / 60_000)}`,
    text: [
      'Someone asked to reset the password for this LAREI account.',
      '',
      opts.url,
      '',
      'If that was not you, no action is needed and the link will expire.',
      '',
      'ORVN Labs',
    ].join('\n'),
  };
}
