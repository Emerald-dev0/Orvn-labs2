import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { auth } from './auth';
import { withUserDb } from './db/tenant';
import { memberships, workspaces, professionalProfiles } from '../db/schema';

/**
 * Authorisation helpers. Every authenticated page and server action starts here.
 *
 * The pattern is deliberate: a session is not permission. `requireUser` proves who is
 * asking; `requireWorkspace` proves which workspace they may act in and with what role.
 * Nothing downstream takes a workspace id from a form field.
 */

export type Role = 'owner' | 'editor' | 'viewer';

export type ActiveWorkspace = {
  id: string;
  name: string;
  username: string;
  role: Role;
  profilePublishedAt: Date | null;
};

export type Viewer = {
  userId: string;
  email: string;
  name: string;
};

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getViewer(): Promise<Viewer | null> {
  const session = await getSession();
  if (!session?.user) return null;
  return { userId: session.user.id, email: session.user.email, name: session.user.name };
}

/** Redirects to sign-in with a return path. The path is validated before it is used. */
export async function requireUser(nextPath = '/dashboard'): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) {
    const safeNext = nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/dashboard';
    redirect(`/sign-in?next=${encodeURIComponent(safeNext)}`);
  }
  return viewer;
}

/**
 * The workspace a user is currently in. One membership per workspace; multi-workspace
 * switching is a matter of reading the same row with a different id, not of trusting a cookie.
 */
export async function getActiveWorkspace(viewer: Viewer): Promise<ActiveWorkspace | null> {
  return withUserDb(viewer.userId, async (tx) => {
    const rows = await tx
      .select({
        id: workspaces.id,
        name: workspaces.name,
        username: workspaces.username,
        role: memberships.role,
        profilePublishedAt: professionalProfiles.publishedAt,
      })
      .from(memberships)
      .innerJoin(workspaces, eq(workspaces.id, memberships.workspaceId))
      .leftJoin(professionalProfiles, eq(professionalProfiles.workspaceId, workspaces.id))
      .where(eq(memberships.userId, viewer.userId))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      username: row.username,
      role: row.role as Role,
      profilePublishedAt: row.profilePublishedAt ?? null,
    };
  });
}

export async function requireWorkspace(
  allowed: Role[] = ['owner', 'editor', 'viewer'],
): Promise<{ viewer: Viewer; workspace: ActiveWorkspace }> {
  const viewer = await requireUser();
  const workspace = await getActiveWorkspace(viewer);
  if (!workspace) redirect('/invite/expired?reason=no-workspace');
  if (!allowed.includes(workspace.role)) redirect('/dashboard?denied=1');
  return { viewer, workspace };
}

/** Write access is a narrower question than membership. */
export async function requireEditor(): Promise<{ viewer: Viewer; workspace: ActiveWorkspace }> {
  return requireWorkspace(['owner', 'editor']);
}

export async function requireOwner(): Promise<{ viewer: Viewer; workspace: ActiveWorkspace }> {
  return requireWorkspace(['owner']);
}

export async function isMember(userId: string, workspaceId: string): Promise<boolean> {
  return withUserDb(userId, async (tx) => {
    const rows = await tx
      .select({ id: memberships.id })
      .from(memberships)
      .where(and(eq(memberships.userId, userId), eq(memberships.workspaceId, workspaceId)))
      .limit(1);
    return rows.length > 0;
  });
}
