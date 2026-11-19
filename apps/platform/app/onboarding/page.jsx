import '../../src/styles/app.css';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { getActiveWorkspace, getViewer } from '../../lib/access';
import { withUserDb } from '../../lib/db/tenant';
import { professionalProfiles } from '../../db/schema';
import OnboardingForm from '../../src/app/OnboardingForm';

export const metadata = {
  title: 'Set up your profile',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * First-run onboarding (AUTH-02). One screen, five answers, two buttons.
 *
 * Everything here is editable later from Professional profile, and skipping skips nothing that
 * cannot be fixed later. It happens once, because `onboarded_at` is written on either path; the
 * app itself never asks again after that.
 */
export default async function OnboardingPage() {
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in?next=/onboarding');

  const workspace = await getActiveWorkspace(viewer);
  if (!workspace) redirect('/no-workspace');

  const [profile] = await withUserDb(viewer.userId, async (tx) =>
    tx
      .select({
        displayName: professionalProfiles.displayName,
        role: professionalProfiles.role,
        markets: professionalProfiles.markets,
        contactEmail: professionalProfiles.contactEmail,
        contactPhone: professionalProfiles.contactPhone,
        onboardedAt: professionalProfiles.onboardedAt,
      })
      .from(professionalProfiles)
      .where(eq(professionalProfiles.workspaceId, workspace.id))
      .limit(1),
  );

  if (profile?.onboardedAt) redirect('/dashboard');

  return (
    <section className="shell" style={{ padding: '88px 0', maxWidth: 720, margin: '0 auto' }}>
      <span className="eyebrow">Welcome to ORREI</span>
      <h1 className="signin-title">The five answers a buyer looks for.</h1>
      <p className="lead">
        Your workspace is set up as <strong>{workspace.name}</strong>. Before you create your
        first property, tell buyers who they are dealing with. One minute, all optional to keep.
      </p>

      <OnboardingForm
        workspaceName={workspace.name}
        initials={{
          displayName: profile?.displayName ?? viewer.name,
          role: profile?.role ?? '',
          market: Array.isArray(profile?.markets) ? profile.markets[0] ?? '' : '',
          contactEmail: profile?.contactEmail ?? viewer.email,
          contactPhone: profile?.contactPhone ?? '',
        }}
      />

      <p className="signin-note" style={{ marginTop: 20 }}>
        This is your public profile — your name, your role, your market and how to reach you.
        You can change everything here any time in <Link href="/website">Professional profile</Link>.
      </p>
    </section>
  );
}
