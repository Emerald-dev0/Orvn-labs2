import * as React from 'react';
import { Action, Brand, FallbackUrl, Heading, Para, SmallPrint } from './components/Brand';

const WHEN = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Lagos',
});

export function Invitation({
  workspaceName,
  acceptUrl,
  expiresAt,
}: {
  workspaceName?: string | null;
  acceptUrl: string;
  expiresAt: Date;
}) {
  const where = workspaceName ? `${workspaceName} on ORREI` : 'ORREI';

  return (
    <Brand
      preview={`Set your password and open ${workspaceName ? workspaceName : 'your workspace'}.`}
      footnote="You are receiving this because someone invited this address to a workspace. If that was not expected, ignore this email and nothing happens."
    >
      <Heading>You have been invited to {where}.</Heading>

      <Para>
        The link below sets your password and opens the workspace. It works once.
      </Para>

      <Action href={acceptUrl} note={`The link expires ${WHEN.format(expiresAt)} WAT.`}>
        Set your password
      </Action>

      <FallbackUrl url={acceptUrl} />

      <Para muted>
        Early access is invitation only, and each invitation belongs to one named business. If the
        link has expired, ask the person who invited you for a fresh one.
      </Para>

      <SmallPrint>
        Your workspace is private until you publish something. Drafts, files and facts stay inside
        the workspace.
      </SmallPrint>
    </Brand>
  );
}

export default Invitation;
