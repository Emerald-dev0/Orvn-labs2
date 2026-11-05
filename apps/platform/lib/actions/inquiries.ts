'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { requireWorkspace } from '../access';
import { withUserDb } from '../db/tenant';
import { inquiries } from '../../db/schema';
import { recordAudit } from '../audit';
import { inquiryStatusSchema, text } from '../validation/workspace';
import type { ActionState } from './types';

/**
 * Inquiry status only: new, read, archived.
 *
 * There is deliberately no "replied", "qualified" or "won". The spec is explicit that this is
 * a mailbox, not a pipeline, and inventing stages would imply a sales truth we cannot observe.
 */
export async function setInquiryStatus(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireWorkspace();

  const parsed = inquiryStatusSchema.safeParse({
    inquiryId: text(formData, 'inquiryId'),
    status: text(formData, 'status'),
  });

  if (!parsed.success) return { status: 'error', message: 'Unknown inquiry.' };

  await withUserDb(viewer.userId, async (tx) => {
    const updated = await tx
      .update(inquiries)
      .set({ status: parsed.data.status })
      .where(and(eq(inquiries.id, parsed.data.inquiryId), eq(inquiries.workspaceId, workspace.id)))
      .returning({ id: inquiries.id });

    if (updated[0]) {
      await recordAudit(
        {
          workspaceId: workspace.id,
          actorId: viewer.userId,
          action: `inquiry.${parsed.data.status}`,
          targetType: 'inquiry',
          targetId: parsed.data.inquiryId,
        },
        tx,
      );
    }
  });

  revalidatePath('/inquiries');
  revalidatePath('/dashboard');
  return {
    status: 'ok',
    message: parsed.data.status === 'read' ? 'Marked as read.' : 'Archived.',
  };
}
