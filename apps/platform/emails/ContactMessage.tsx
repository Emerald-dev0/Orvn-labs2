import * as React from 'react';
import { Action, Brand, Detail, Heading, Para, Quote, SmallPrint } from './components/Brand';

const WHEN = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
  timeZoneName: 'short',
});

/**
 * A message from the contact form, to the shared inbox.
 *
 * It is read on a phone, once, before anything else. Their words are kept as written; the only
 * thing added is the address to reply to, so answering does not require copying it out.
 */
export function ContactMessage({
  id,
  name,
  email,
  company,
  topic,
  message,
  receivedAt,
}: {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  topic?: string | null;
  message: string;
  receivedAt: Date;
}) {
  return (
    <Brand
      preview={`${name} wrote from the contact form.`}
      footnote="You are receiving this because it is the shared inbox for ORVN Labs."
    >
      <Heading>{name} sent a message</Heading>

      <Para muted>
        <a href={`mailto:${email}`} style={{ color: '#55605a', textDecoration: 'underline' }}>
          {email}
        </a>
      </Para>

      <div style={{ margin: '6px 0 4px' }}>
        <Detail label="Company" value={company} />
        <Detail label="About" value={topic} />
      </div>

      <Quote>{message}</Quote>

      <Action href={`mailto:${email}?subject=Re%3A%20your%20message%20to%20ORVN%20Labs`}>
        Reply to {name.split(' ')[0]}
      </Action>

      <SmallPrint>
        Received {WHEN.format(receivedAt)} · message {id}
      </SmallPrint>
    </Brand>
  );
}

export default ContactMessage;
