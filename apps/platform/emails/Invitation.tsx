import * as React from 'react';
import { Action, Brand, FallbackUrl, Heading, Para, SmallPrint } from './components/Brand';

const WHEN = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'America/New_York',
  timeZoneName: 'short',
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
      preview={`Open ${workspaceName ? workspaceName : 'your workspace'} on ORREI.`}
      footnote="You are receiving this because someone invited this address to a workspace. If that was not expected, ignore this email and nothing happens."
    >
      <Heading>You have been invited to {where}.</Heading>

      <Para>
        The link below opens the workspace. It works once.
      </Para>

      <Action href={acceptUrl} note={`The link expires ${WHEN.format(expiresAt)}.`}>
        Open the workspace
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
