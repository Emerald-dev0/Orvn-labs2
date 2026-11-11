'use server';

import { redirect } from 'next/navigation';
import { sql } from 'drizzle-orm';
import { getActiveWorkspace, requireUser } from '../access';
import { isAdminEmail } from '../admin';
import { withUserDb } from '../db/tenant';
import { isUsernameTaken, setupDecision, setupSchema } from '../workspace-setup';

/**
 * First-run workspace for an operator. Calls `app_create_workspace`, the database function that
 * creates the workspace, its owner membership, the professional profile and the audit entry in one
 * transaction. Runs as the tenant role, so row-level security still applies to everything it touches.
 *
 * The database function writes the 'workspace.created' audit entry, so this action adds none.
 *
 * On success it redirects to the dashboard. On a refusal it redirects back with a short reason in
 * the query string, so the form works without client JavaScript.
 */
export async function setUpOperatorWorkspace(formData: FormData): Promise<void> {
  const viewer = await requireUser('/no-workspace');
  const existing = await getActiveWorkspace(viewer);

  const decision = setupDecision({ isOperator: isAdminEmail(viewer.email), hasWorkspace: Boolean(existing) });
  if (decision === 'already-has-workspace') redirect('/dashboard');
  if (decision === 'not-an-operator') redirect('/no-workspace?error=not-an-operator');

  const parsed = setupSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    username: String(formData.get('username') ?? ''),
  });
  if (!parsed.success) {
    redirect(`/no-workspace?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Check the form.')}`);
  }

  let workspaceId: string | null = null;
  try {
    workspaceId = await withUserDb(viewer.userId, async (tx) => {
      const rows = await tx.execute<{ id: string }>(
        sql`select app_create_workspace(${parsed.data.name}, ${parsed.data.username}) as id`,
      );
      return rows[0]?.id ?? null;
    });
  } catch (error) {
    if (isUsernameTaken(error)) {
      redirect('/no-workspace?error=That+address+is+already+taken.+Choose+another.');
    }
    console.error('[workspace-setup] create failed', { code: (error as { code?: string }).code });
    redirect('/no-workspace?error=We+could+not+create+the+workspace.+Try+again.');
  }

  // app_create_workspace writes the 'workspace.created' audit entry itself.
  if (!workspaceId) redirect('/no-workspace?error=We+could+not+create+the+workspace.+Try+again.');
  redirect('/dashboard');
}
