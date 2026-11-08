import * as React from 'react';
import { Action, Brand, FallbackUrl, Heading, Para, SmallPrint } from './components/Brand';

export function ResetPassword({ url }: { url: string }) {
  return (
    <Brand
      preview="Choose a new password for your ORREI account."
      footnote="You are receiving this because a password reset was requested for this address. If it was not you, nothing has changed and the link will expire on its own."
    >
      <Heading>Reset your password</Heading>

      <Para>
        Someone asked to reset the password for this ORREI account. If that was you, choose a new
        one below.
      </Para>

      <Action href={url} note="The link works once, then stops working.">
        Choose a new password
      </Action>

      <FallbackUrl url={url} />

      <Para muted>
        If this was not you, no action is needed. Nothing has changed, and the link expires without
        being used.
      </Para>

      <SmallPrint>
        A password reset never changes a property record, a published page or a file.
      </SmallPrint>
    </Brand>
  );
}

export default ResetPassword;
