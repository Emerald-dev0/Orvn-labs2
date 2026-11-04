import Link from 'next/link';
import { getViewer } from '../../../lib/access';
import { inspectInvitation } from '../../../lib/invitations';
import InviteForm from './InviteForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Your invitation',
  robots: { index: false, follow: false },
};

async function loadInvitation(token, viewer) {
  try {
    return await inspectInvitation(token, viewer?.email);
  } catch (error) {
    console.error('[invite] could not inspect token', { message: error.message });
    return null;
  }
}

export default async function InvitePage({ params }) {
  const { token } = await params;
  const viewer = await getViewer();
  const invitation = await loadInvitation(token, viewer);

  const shell = (children) => (
    <div className="invite">
      <header className="invite-bar">
        <Link href="/" className="invite-brand">
          <span className="invite-mark" aria-hidden="true">L</span>
          LAREI
        </Link>
        <span className="invite-tag">Private beta</span>
      </header>
      <main id="main" className="invite-main">
        <div className="invite-card">{children}</div>
      </main>
    </div>
  );

  if (!invitation) {
    return shell(
      <>
        <h1 className="invite-title">We could not read that invitation</h1>
        <p className="invite-lede">
          Invitations expire after seven days and work once. Ask the person who invited you for a
          fresh link, or request access again.
        </p>
        <div className="invite-actions">
          <Link className="pub-btn is-dark" href="/early-access">Request access</Link>
          <Link className="pub-btn" href="/">Back to the site</Link>
        </div>
      </>,
    );
  }

  if (!invitation.valid) {
    return shell(
      <>
        <h1 className="invite-title">This invitation is no longer usable</h1>
        <p className="invite-lede">
          It may have expired, been used already, or been withdrawn.{' '}
          {invitation.maskedEmail ? `It was issued for ${invitation.maskedEmail}.` : ''}
        </p>
        <div className="invite-actions">
          <Link className="pub-btn is-dark" href="/sign-in">Sign in instead</Link>
          <Link className="pub-btn" href="/early-access">Request a new invitation</Link>
        </div>
      </>,
    );
  }

  if (!viewer) {
    return shell(
      <>
        <span className="invite-eyebrow">Invitation</span>
        <h1 className="invite-title">You are invited to LAREI</h1>
        <p className="invite-lede">
          This link was issued to <strong>{invitation.maskedEmail}</strong>. Sign in with that
          address to open{' '}
          {invitation.workspaceName ? `“${invitation.workspaceName}”` : 'your workspace'}.
        </p>
        <div className="invite-actions">
          <Link
            className="pub-btn is-dark"
            href={`/sign-in?next=${encodeURIComponent(`/invite/${token}`)}`}
          >
            Continue to sign in
          </Link>
        </div>
        <p className="invite-note">
          No password needed: we email you a link, and it proves the address before anything is
          created.
        </p>
      </>,
    );
  }

  if (!invitation.emailMatches) {
    return shell(
      <>
        <h1 className="invite-title">This invitation is for a different address</h1>
        <p className="invite-lede">
          You are signed in as <strong>{viewer.email}</strong>, but this link was issued to{' '}
          <strong>{invitation.maskedEmail}</strong>. Invitations cannot be transferred, so the
          link will not work from this account.
        </p>
        <div className="invite-actions">
          <Link className="pub-btn is-dark" href={`/sign-in?next=${encodeURIComponent(`/invite/${token}`)}`}>
            Sign in with the invited address
          </Link>
          <Link className="pub-btn" href="/">Back to the site</Link>
        </div>
      </>,
    );
  }

  return shell(
    <>
      <span className="invite-eyebrow">Ready when you are</span>
      <h1 className="invite-title">
        {invitation.workspaceName
          ? `Join ${invitation.workspaceName}`
          : 'Set up your workspace'}
      </h1>
      <p className="invite-lede">
        Signed in as <strong>{viewer.email}</strong>.{' '}
        {invitation.workspaceName
          ? 'Accepting adds you to this workspace with the role you were invited for.'
          : 'Choose the name and public address for the business. You can change the name later; changing the address moves your links.'}
      </p>

      <InviteForm
        token={token}
        needsWorkspace={!invitation.workspaceName}
        workspaceName={invitation.workspaceName}
        role={invitation.role}
      />

      <p className="invite-note">
        Accepting records the action in the workspace audit log. Nothing becomes public until you
        publish it yourself.
      </p>
    </>,
  );
}
