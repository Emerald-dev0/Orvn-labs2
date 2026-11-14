import * as React from 'react';
import type { EmailMessage } from '../email';
import { renderEmail } from '../../emails/render';
import { BetaApplication } from '../../emails/BetaApplication';
import { formatWhenOperator } from './when';

/**
 * An early-access request, delivered to the operator inbox.
 *
 * `replyTo` is the applicant, so answering is one click. The subject stays short because it is
 * read on a lock screen.
 */
export async function betaApplicationEmail(opts: {
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
  adminUrl?: string;
}): Promise<EmailMessage> {
  const facts = [
    opts.company ? `Company: ${opts.company}` : null,
    opts.role ? `Role: ${opts.role}` : null,
    opts.markets ? `Market: ${opts.markets}` : null,
    opts.volume ? `Properties per month: ${opts.volume}` : null,
    opts.website ? `Website: ${opts.website}` : null,
  ].filter((line): line is string => Boolean(line));

  return {
    to: '',
    subject: `Early access: ${opts.name}${opts.company ? ` (${opts.company})` : ''}`,
    businessKey: `beta:${opts.id}`,
    replyTo: opts.email,
    text: [
      `${opts.name} (${opts.email}) asked for early access.`,
      '',
      ...facts,
      '',
      opts.currentTools ? `Shares properties today with:\n${opts.currentTools}` : null,
      opts.frustration ? `\nMost frustrating part:\n${opts.frustration}` : null,
      '',
      `Received ${formatWhenOperator(opts.receivedAt)} · application ${opts.id}`,
      opts.adminUrl ? `Open in the queue: ${opts.adminUrl}` : null,
      '',
      'Reply to this email to answer them directly. To invite them, open the queue and press Send invitation.',
      '',
      'ORVN Labs · ORREI early access',
    ]
      .filter((line): line is string => line !== null)
      .join('\n'),
    html: await renderEmail(<BetaApplication {...opts} />),
  };
}
