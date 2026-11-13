import * as React from 'react';
import type { EmailMessage } from '../email';
import { renderEmail } from '../../emails/render';
import { Invitation } from '../../emails/Invitation';
import { formatWhen } from './when';

/**
 * Invitation to an early-access workspace.
 *
 * `businessKey` is the invitation id, so a retry after a timeout replays the first send instead of
 * mailing the person twice. The plain text is written by hand: it carries the URL, because a
 * plain-text client that cannot link still has to be able to copy.
 */
export async function invitationEmail(opts: {
  to: string;
  workspaceName?: string;
  subject?: string;
  acceptUrl: string;
  expiresAt: Date;
  invitationId: string;
}): Promise<EmailMessage> {
  const where = opts.workspaceName ? `${opts.workspaceName} on ORREI` : 'ORREI';

  return {
    to: opts.to,
    subject:
      opts.subject ??
      (opts.workspaceName ? `Your ORREI invitation to ${opts.workspaceName}` : 'Your ORREI invitation'),
    businessKey: `invite:${opts.invitationId}`,
    text: [
      `You have been invited to ${where}.`,
      '',
      'Set your password and open the workspace:',
      opts.acceptUrl,
      '',
      `The link expires ${formatWhen(opts.expiresAt)} and works once.`,
      '',
      'If you were not expecting this, ignore it and nothing happens.',
      '',
      'ORVN Labs · hello@orvnlabs.com',
    ].join('\n'),
    html: await renderEmail(
      <Invitation
        workspaceName={opts.workspaceName}
        acceptUrl={opts.acceptUrl}
        expiresAt={opts.expiresAt}
      />,
    ),
  };
}
