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
    ? `You have been invited to ${opts.workspaceName} on ORREI.`
    : 'You have been invited to ORREI, the workspace ORVN Labs is building.';

  return {
    to: opts.to,
    subject: 'Your ORREI invitation',
    businessKey: `invite:${opts.invitationId}`,
    text: [
      greeting,
      '',
      'This workspace is part of an early-access release. The link below opens it and sets your password.',
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
