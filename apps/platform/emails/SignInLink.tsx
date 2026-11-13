import * as React from 'react';
import { Action, Brand, FallbackUrl, Heading, Para, SmallPrint } from './components/Brand';

const WHEN = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'America/New_York',
  timeZoneName: 'short',
});

export function SignInLink({ url, expiresAt }: { url: string; expiresAt: Date }) {
  return (
    <Brand
      preview="Your ORREI sign-in link. It works once."
      footnote="You are receiving this because a sign-in link was requested for this address. If you did not ask for it, ignore this email; the link will not be used."
    >
      <Heading>Sign in to ORREI</Heading>

      <Para>Use the link below to open your workspace. No password needed.</Para>

      <Action href={url} note={`Works once, expires at ${WHEN.format(expiresAt)}.`}>
        Open ORREI
      </Action>

      <FallbackUrl url={url} />

      <SmallPrint>
        We will never ask you for this link, or for a code, over email or phone.
      </SmallPrint>
    </Brand>
  );
}

export default SignInLink;
