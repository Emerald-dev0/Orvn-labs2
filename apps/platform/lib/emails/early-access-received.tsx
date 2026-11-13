import * as React from 'react';
import type { EmailMessage } from '../email';
import { renderEmail } from '../../emails/render';
import { EarlyAccessReceived } from '../../emails/EarlyAccessReceived';

/**
 * The confirmation the applicant receives. `replyTo` is the shared inbox, so answering it is the
 * same as writing to a person — which is what the message promises.
 */
export async function earlyAccessReceivedEmail(opts: {
  to: string;
  name: string;
  company?: string | null;
  role?: string | null;
  markets?: string | null;
  volume?: string | null;
  frustration?: string | null;
  receivedAt: Date;
  productUrl: string;
}): Promise<EmailMessage> {
  const facts = [
    opts.company ? `Company: ${opts.company}` : '',
    opts.role ? `Role: ${opts.role}` : '',
    opts.markets ? `Market: ${opts.markets}` : '',
    opts.volume ? `Properties per month: ${opts.volume}` : '',
  ].filter(Boolean);

  return {
    to: opts.to,
    subject: 'We have your ORREI early-access request',
    // One confirmation per request, not one per click.
    businessKey: `early-access-received:${opts.to.toLowerCase()}:${opts.receivedAt.toISOString().slice(0, 10)}`,
    replyTo: 'hello@orvnlabs.com',
    text: [
      `We have your request, ${opts.name.trim().split(' ')[0] || 'there'}.`,
      '',
      // Sentences are kept whole: a mail client may re-wrap, but nobody should read
      // "we will / write back" as two lines by our own hand.
      `Thank you for asking about ORREI. Your request is with us — a person reads it — and we will write back to ${opts.to} when there is a place for you.`,
      '',
      'Why it is not immediate: we invite people in small groups, so the workflow can still be changed by the people using it.',
      '',
      ...(facts.length ? ['What you told us', ...facts, ''] : []),
      ...(opts.frustration ? [`"${opts.frustration}"`, ''] : []),
      `What ORREI does: ${opts.productUrl}`,
      '',
      'Reply to this message if anything above is wrong, or if your situation has changed.',
      '',
      `Received ${opts.receivedAt.toISOString()}`,
      '',
      'Oyegoke Daniel — Founder, ORVN Labs · hello@orvnlabs.com',
    ].join('\n'),
    html: await renderEmail(
      <EarlyAccessReceived
        name={opts.name}
        email={opts.to}
        company={opts.company}
        role={opts.role}
        markets={opts.markets}
        volume={opts.volume}
        frustration={opts.frustration}
        receivedAt={opts.receivedAt}
        productUrl={opts.productUrl}
      />,
    ),
  };
}
