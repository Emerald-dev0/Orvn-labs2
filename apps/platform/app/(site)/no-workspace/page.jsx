import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getViewer } from '../../../lib/access';

export const metadata = {
  title: 'No workspace yet',
  robots: { index: false, follow: false },
};

/**
 * Signed in, but the account is not attached to a workspace. That happens when an address is on
 * ADMIN_EMAILS or was created by the gate without an invitation: the account exists, the workspace
 * does not. This page says that plainly. It must not say the invitation expired, because nothing
 * expired.
 */
export default async function Page() {
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in?next=/dashboard');

  return (
    <section className="shell" style={{ padding: '96px 0', maxWidth: 640 }}>
      <span className="eyebrow">Almost there</span>
      <h1 className="signin-title">Your account has no workspace yet.</h1>
      <p className="lead">
        You are signed in as <strong>{viewer.email}</strong>, but this account is not attached to a
        workspace. A workspace is created when an invitation is accepted and you choose its name.
      </p>
      <p className="lead">
        If you were invited, open the invitation link from your email again. If you are an operator,
        ask for an invitation to be issued to this address. If neither applies, request early access.
      </p>
      <p style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link className="btn btn-primary" href="/early-access">Request early access</Link>
        <Link className="btn" href="/sign-in">Sign in with another address</Link>
      </p>
    </section>
  );
}
