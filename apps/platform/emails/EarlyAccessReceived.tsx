import * as React from 'react';
import { Action, Brand, Detail, Heading, Para, Quote, SmallPrint } from './components/Brand';

const WHEN = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Lagos',
});

/**
 * The applicant's copy: the one email a stranger receives from us.
 *
 * It does three things and no more. It confirms the request arrived, it repeats back what they
 * told us so they can see it was read rather than filed, and it says what happens next without
 * inventing a date. No reply deadline, no place in a cohort, no feature that is not built.
 */
export function EarlyAccessReceived({
  name,
  email,
  company,
  role,
  markets,
  volume,
  frustration,
  receivedAt,
  productUrl,
}: {
  name: string;
  email: string;
  company?: string | null;
  role?: string | null;
  markets?: string | null;
  volume?: string | null;
  frustration?: string | null;
  receivedAt: Date;
  productUrl: string;
}) {
  const firstName = name.trim().split(' ')[0] || 'there';

  return (
    <Brand
      preview="We have your ORREI early-access request."
      footnote="You are receiving this because you asked for early access at orvnlabs.com."
    >
      <Heading>We have your request, {firstName}.</Heading>

      <Para>
        Thank you for asking about ORREI. Your request is with us — a person reads it, not a queue
        of alerts — and we will write back to <strong>{email}</strong> when there is a place for you.
      </Para>

      <Para muted>Why it is not immediate</Para>
      <Para>
        We invite people in small groups, so the workflow can still be changed by the people using
        it. That is slower than opening the doors, and it is the reason the tool fits the job it is
        meant for.
      </Para>

      <Para muted>What you told us</Para>
      <div style={{ margin: '6px 0 4px' }}>
        <Detail label="Company" value={company} />
        <Detail label="Role" value={role} />
        <Detail label="Market" value={markets} />
        <Detail label="Properties per month" value={volume} />
      </div>

      {frustration ? <Quote>{frustration}</Quote> : null}

      <Action
        href={productUrl}
        note="A short read on what ORREI does, and what it deliberately does not do yet."
      >
        See what ORREI does
      </Action>

      <Para>
        Oyegoke Daniel<br />
        Founder, ORVN Labs
      </Para>

      <SmallPrint>
        Received {WHEN.format(receivedAt)} WAT. Reply to this message if anything above is wrong, or if
        your situation has changed.
      </SmallPrint>
    </Brand>
  );
}

export default EarlyAccessReceived;
