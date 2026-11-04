import type { EmailMessage } from '../email';

/** Invitation to the private beta. Plain text first; HTML is a nicety, not a requirement. */
export function invitationEmail(opts: {
  to: string;
  workspaceName?: string;
  acceptUrl: string;
  expiresAt: Date;
  invitationId: string;
}): EmailMessage {
  const greeting = opts.workspaceName
    ? `You have been invited to ${opts.workspaceName} on LAREI.`
    : 'You have been invited to LAREI.';

  return {
    to: opts.to,
    subject: 'Your LAREI invitation',
    businessKey: `invite:${opts.invitationId}`,
    text: [
      greeting,
      '',
      'LAREI is in private beta. The link below opens your workspace and sets your password.',
      '',
      opts.acceptUrl,
      '',
      `The link expires ${opts.expiresAt.toUTCString()}. If you were not expecting this, ignore it and nothing happens.`,
      '',
      'ORVN Labs',
      'hello@orvnlabs.com',
    ].join('\n'),
  };
}
