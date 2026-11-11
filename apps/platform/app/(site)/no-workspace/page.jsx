import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getActiveWorkspace, getViewer } from '../../../lib/access';
import { isAdminEmail } from '../../../lib/admin';
import { setUpOperatorWorkspace } from '../../../lib/actions/workspace-setup';
import { setupDecision } from '../../../lib/workspace-setup';

export const metadata = {
  title: 'Set up your workspace',
  robots: { index: false, follow: false },
};

const REASONS = {
  'not-an-operator': 'This address is not set up as an operator. Use your invitation link, or request early access.',
};

/**
 * Signed in, but the account is not attached to a workspace.
 *
 * - An operator on ADMIN_EMAILS sets up their own workspace here, once. No invitation needed.
 * - Anyone else is told how to join: their invitation link, or early access. Nothing here says an
 *   invitation expired, because it did not come into it.
 */
export default async function Page({ searchParams }) {
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in?next=/dashboard');

  const workspace = await getActiveWorkspace(viewer);
  if (workspace) redirect('/dashboard');

  const params = (await searchParams) ?? {};
  const error = typeof params.error === 'string' ? params.error : '';
  const decision = setupDecision({ isOperator: isAdminEmail(viewer.email), hasWorkspace: false });

  if (decision === 'create') {
    return (
      <section className="shell" style={{ padding: '96px 0', maxWidth: 640 }}>
        <span className="eyebrow">Operator setup</span>
        <h1 className="signin-title">Name your workspace.</h1>
        <p className="lead">
          You are signed in as <strong>{viewer.email}</strong>. Choose the name your buyers will see and the
          address your public page will use. You can change the name later; the address is harder to change,
          so pick it carefully.
        </p>
        <form action={setUpOperatorWorkspace} style={{ marginTop: 24, display: 'grid', gap: 16 }}>
          <label className="field-label" htmlFor="ws-name">Workspace name</label>
          <input id="ws-name" name="name" className="input" required minLength={2} maxLength={80}
                 placeholder="Carter Property Group" autoComplete="organization" />
          <label className="field-label" htmlFor="ws-username">Public address</label>
          <input id="ws-username" name="username" className="input" required minLength={3} maxLength={30}
                 pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="carter-property" autoComplete="off" />
          <p className="signin-note">Lowercase letters, numbers and single hyphens. Your page will be at orvnlabs.com/w/your-address.</p>
          {error ? <p className="field-error" role="alert">{error}</p> : null}
          <button type="submit" className="btn btn-primary">Create my workspace</button>
        </form>
      </section>
    );
  }

  return (
    <section className="shell" style={{ padding: '96px 0', maxWidth: 640 }}>
      <span className="eyebrow">Almost there</span>
      <h1 className="signin-title">Your account has no workspace yet.</h1>
      <p className="lead">
        You are signed in as <strong>{viewer.email}</strong>, but this account is not attached to a workspace.
        A workspace is created when an invitation is accepted and you choose its name.
      </p>
      <p className="lead">
        If you were invited, open the invitation link from your email again. If neither applies, request early access.
      </p>
      {error && REASONS[error] ? <p className="field-error" role="alert">{REASONS[error]}</p> : null}
      <p style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link className="btn btn-primary" href="/early-access">Request early access</Link>
        <Link className="btn" href="/sign-in">Sign in with another address</Link>
      </p>
    </section>
  );
}
