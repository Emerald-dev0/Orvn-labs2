import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getActiveWorkspace, getViewer, type ActiveWorkspace, type Viewer } from './access';
import { databaseConfigured, withUserDb } from './db/tenant';
import { professionalProfiles } from '../db/schema';
import { countUnreadInquiries } from './data/workspace';
import { networkCounts, type NetworkCounts } from './data/network';
import { needsOnboarding } from './onboarding';

/**
 * One place that decides whether the product screens are looking at a database or at the
 * built-in sample workspace.
 *
 * "No database configured" is a preview build, not a failure: the screens render sample data
 * behind a visible banner. A configured-but-unreachable database is a failure and is not
 * papered over with pretend numbers.
 */

export type ShellWorkspace = {
  id: string;
  name: string;
  handle: string;
  plan: string;
  publicUrl: string;
  owner: { name: string; email: string; initials: string };
};

export type AppContext =
  | { demo: true; unread: 0; network: NetworkCounts; shell: ShellWorkspace }
  | {
      demo: false;
      unread: number;
      network: NetworkCounts;
      viewer: Viewer;
      workspace: ActiveWorkspace;
      shell: ShellWorkspace;
    };

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '•'
  );
}

export function demoShell(): ShellWorkspace {
  return {
    id: 'demo',
    name: 'Northaven Property Group',
    handle: 'northaven',
    plan: 'Preview · sample data',
    publicUrl: '/w/northaven',
    owner: { name: 'Ada Bello', email: 'ada@northaven.example', initials: 'AB' },
  };
}

export function shellFor(viewer: Viewer, workspace: ActiveWorkspace): ShellWorkspace {
  return {
    id: workspace.id,
    name: workspace.name,
    handle: workspace.username,
    plan: workspace.profilePublishedAt ? 'Early access · profile live' : 'Early access',
    publicUrl: `/w/${workspace.username}`,
    owner: { name: viewer.name, email: viewer.email, initials: initials(viewer.name) },
  };
}

export async function loadAppContext(): Promise<AppContext> {
  if (!databaseConfigured) {
    const empty: NetworkCounts = { messagesUnread: 0, connectionsPending: 0 };
    return { demo: true, unread: 0, network: empty, shell: demoShell() };
  }

  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in?next=/dashboard');

  const workspace = await getActiveWorkspace(viewer);
  if (!workspace) redirect('/no-workspace');

  // First-run gate: a fresh workspace sends everyone through the onboarding step until it is
  // done or skipped. Existing accounts see it once after this ships; /onboarding itself never
  // goes through this gate.
  const onboarded = await withUserDb(viewer.userId, async (tx) => {
    const [profile] = await tx
      .select({ onboardedAt: professionalProfiles.onboardedAt })
      .from(professionalProfiles)
      .where(eq(professionalProfiles.workspaceId, workspace.id))
      .limit(1);
    return profile?.onboardedAt ?? null;
  });
  if (needsOnboarding({ onboardedAt: onboarded })) redirect('/onboarding');

  const [unread, network] = await Promise.all([
    countUnreadInquiries(viewer.userId, workspace.id),
    networkCounts(viewer.userId),
  ]);
  return { demo: false, unread, network, viewer, workspace, shell: shellFor(viewer, workspace) };
}
