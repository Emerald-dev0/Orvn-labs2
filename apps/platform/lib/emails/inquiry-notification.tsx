import * as React from 'react';
import type { EmailMessage } from '../email';
import { renderEmail } from '../../emails/render';
import { InquiryNotification } from '../../emails/InquiryNotification';

/**
 * Tells the publisher once. It never claims the inquiry has been read, because nobody has read it
 * yet, and `replyTo` is the buyer so answering does not require copying an address.
 */
export async function inquiryNotificationEmail(opts: {
  to: string;
  inquirerName: string | null;
  inquirerEmail: string;
  message: string;
  propertyTitle: string;
  workspaceName: string;
  inboxUrl: string;
  inquiryId: string;
}): Promise<EmailMessage> {
  const from = opts.inquirerName ? `${opts.inquirerName} (${opts.inquirerEmail})` : opts.inquirerEmail;

  return {
    to: opts.to,
    subject: `New inquiry: ${opts.propertyTitle}`,
    businessKey: `inquiry:${opts.inquiryId}`,
    replyTo: opts.inquirerEmail,
    text: [
      `Someone asked about ${opts.propertyTitle}.`,
      '',
      `From: ${from}`,
      '',
      opts.message,
      '',
      `Open the inquiry in ${opts.workspaceName}: ${opts.inboxUrl}`,
      '',
      'Reply to this email to answer them directly.',
      '',
      'You are receiving this because inquiry notifications are on for this workspace.',
    ].join('\n'),
    html: await renderEmail(
      <InquiryNotification
        inquirerName={opts.inquirerName}
        inquirerEmail={opts.inquirerEmail}
        message={opts.message}
        propertyTitle={opts.propertyTitle}
        workspaceName={opts.workspaceName}
        inboxUrl={opts.inboxUrl}
      />,
    ),
  };
}
