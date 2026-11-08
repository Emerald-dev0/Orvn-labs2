import { notFound, redirect } from 'next/navigation';
import { getViewer, type Viewer } from './access';
import { isAdminEmail } from './admin';

/**
 * The server-side gate for the operator surface.
 *
 * A visitor without a session is sent to sign in and returned to the queue afterwards. A visitor
 * with a session but no membership in `ADMIN_EMAILS` gets the same 404 as a URL that never existed.
 *
 * This widens nobody's access to tenant data: the queue reads `beta_applications`, which belongs to
 * no workspace. Property records still go through `withUserDb` and RLS.
 */
export async function requireAdmin(next = '/admin/early-access'): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  if (!isAdminEmail(viewer.email)) notFound();
  return viewer;
}
