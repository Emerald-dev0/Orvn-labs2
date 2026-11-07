import type { EmailMessage } from '../email';

/** Invitation to an early-access workspace. Plain text first; HTML is a nicety, not a requirement. */
export function invitationEmail(opts: {
  to: string;
  workspaceName?: string;
  acceptUrl: string;
  expiresAt: Date;
  invitationId: string;
}): EmailMessage {
  const greeting = opts.workspaceName
    ? `You have been invited to ${opts.workspaceName} on the ORVN Labs platform.`
    : 'You have been invited to the ORVN Labs platform.';

  return {
    to: opts.to,
    subject: 'Your ORVN Labs invitation',
    businessKey: `invite:${opts.invitationId}`,
    text: [
      greeting,
      '',
      'This workspaces is part of an early-access release. The link below opens your workspace and sets your password.',
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
