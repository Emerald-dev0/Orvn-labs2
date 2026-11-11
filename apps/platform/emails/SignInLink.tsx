import * as React from 'react';
import { Action, Brand, FallbackUrl, Heading, Para, SmallPrint } from './components/Brand';

const WHEN = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Lagos',
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

      <Para muted>
        If you have a password you can still use it. This link is only for this device, and only
        this once.
      </Para>

      <SmallPrint>
        We will never ask you for this link, for your password, or for a code over email or phone.
      </SmallPrint>
    </Brand>
  );
}

export default SignInLink;
