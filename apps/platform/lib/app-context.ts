import { redirect } from 'next/navigation';
import { getActiveWorkspace, getViewer, type ActiveWorkspace, type Viewer } from './access';
import { databaseConfigured } from './db/tenant';
import { countUnreadInquiries } from './data/workspace';

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
  | { demo: true; unread: 0; shell: ShellWorkspace }
  | { demo: false; unread: number; viewer: Viewer; workspace: ActiveWorkspace; shell: ShellWorkspace };

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
    return { demo: true, unread: 0, shell: demoShell() };
  }

  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in?next=/dashboard');

  const workspace = await getActiveWorkspace(viewer);
  if (!workspace) redirect('/invite/expired?reason=no-workspace');

  const unread = await countUnreadInquiries(viewer.userId, workspace.id);
  return { demo: false, unread, viewer, workspace, shell: shellFor(viewer, workspace) };
}
