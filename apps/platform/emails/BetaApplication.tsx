import * as React from 'react';
import { Action, Brand, Detail, Heading, Para, Quote, SmallPrint } from './components/Brand';

const WHEN = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Lagos',
});

/**
 * An early-access request, to the operator inbox.
 *
 * It is read on a phone, once, before anything else, so every answered field appears in the order
 * the applicant was asked, and their own words are kept rather than summarised.
 */
export function BetaApplication({
  id,
  name,
  email,
  company,
  role,
  markets,
  volume,
  currentTools,
  frustration,
  website,
  receivedAt,
  adminUrl,
}: {
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
  /** Deep link to the record in the queue. Absent only if the deployment has no base URL. */
  adminUrl?: string;
}) {
  return (
    <Brand
      preview={`${name} asked for early access.`}
      footnote="You are receiving this because it is the operator inbox for ORVN Labs early access."
    >
      <Heading>{name} asked for early access</Heading>

      <Para muted>
        <a href={`mailto:${email}`} style={{ color: '#55605a', textDecoration: 'underline' }}>
          {email}
        </a>
      </Para>

      <div style={{ margin: '6px 0 4px' }}>
        <Detail label="Company" value={company} />
        <Detail label="Role" value={role} />
        <Detail label="Market" value={markets} />
        <Detail label="Properties per month" value={volume} />
        <Detail label="Website" value={website} />
      </div>

      {currentTools ? (
        <>
          <Para muted>Shares properties today with</Para>
          <Quote>{currentTools}</Quote>
        </>
      ) : null}

      {frustration ? (
        <>
          <Para muted>The part that costs them time</Para>
          <Quote>{frustration}</Quote>
        </>
      ) : null}

      {adminUrl ? (
        <Action href={adminUrl} note="The record is in the queue, with the status and the invite step.">
          Open in the queue
        </Action>
      ) : null}

      <Action href={`mailto:${email}?subject=Your%20ORREI%20early%20access`}>
        Reply to {name.split(' ')[0]}
      </Action>

      <SmallPrint>
        Received {WHEN.format(receivedAt)} WAT · application {id}. Invite with{' '}
        <code style={{ fontSize: 11.5 }}>npm run invite --email {email}</code>
      </SmallPrint>
    </Brand>
  );
}

export default BetaApplication;
