import * as React from 'react';
import type { EmailMessage } from '../email';
import { renderEmail } from '../../emails/render';
import { ContactMessage } from '../../emails/ContactMessage';

/**
 * The contact notification. `replyTo` is the sender, so answering is one button rather than a
 * copy-and-paste, and the subject already reads like a thread.
 */
export async function contactMessageEmail(opts: {
  to: string;
  id: string;
  name: string;
  email: string;
  company?: string | null;
  topic?: string | null;
  message: string;
  receivedAt: Date;
}): Promise<EmailMessage> {
  const who = opts.name ? `${opts.name} (${opts.email})` : opts.email;
  const about = opts.topic ? ` about ${opts.topic.toLowerCase()}` : '';

  return {
    to: opts.to,
    subject: `Contact: ${opts.name || opts.email}${about}`,
    businessKey: `contact:${opts.id}`,
    replyTo: opts.email,
    text: [
      `${who} wrote from the contact form${about}.`,
      '',
      opts.company ? `Company: ${opts.company}` : '',
      opts.topic ? `About: ${opts.topic}` : '',
      opts.company || opts.topic ? '' : '',
      opts.message,
      '',
      'Reply to this email to answer them directly.',
      '',
      `Received ${opts.receivedAt.toISOString()} · message ${opts.id}`,
    ]
      .filter((line) => line !== '')
      .join('\n'),
    html: await renderEmail(
      <ContactMessage
        id={opts.id}
        name={opts.name}
        email={opts.email}
        company={opts.company}
        topic={opts.topic}
        message={opts.message}
        receivedAt={opts.receivedAt}
      />,
    ),
  };
}
