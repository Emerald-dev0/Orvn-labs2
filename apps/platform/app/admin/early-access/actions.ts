'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin } from '../../../lib/admin-guard';
import { adminDb } from '../../../lib/db/admin';
import { betaApplications } from '../../../db/schema';
import { APPLICATION_STATUSES } from '../../../lib/data/admin';
import type { ActionState } from '../../../lib/actions/types';

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(APPLICATION_STATUSES),
});

/**
 * Moving an application through the queue.
 *
 * The status lives on the row, not in somebody's memory or an email thread: two people looking at
 * the same applicant see the same state. Invitations are still issued with the existing script,
 * because creating a workspace is a provisioning step, not a button press.
 */
export async function setApplicationStatus(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = schema.safeParse({
    id: String(formData.get('id') ?? ''),
    status: String(formData.get('status') ?? ''),
  });
  if (!parsed.success) return { status: 'error', message: 'That change was not understood.' };

  try {
    await adminDb
      .update(betaApplications)
      .set({ status: parsed.data.status })
      .where(eq(betaApplications.id, parsed.data.id));
  } catch (error) {
    console.error('[admin] status update failed', { message: (error as Error).message });
    return { status: 'error', message: 'That did not save. The application is unchanged.' };
  }

  revalidatePath('/admin/early-access');
  return { status: 'ok', message: `Marked ${parsed.data.status}.` };
}
