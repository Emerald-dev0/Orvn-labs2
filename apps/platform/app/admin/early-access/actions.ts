'use server';

import { revalidatePath } from 'next/cache';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin } from '../../../lib/admin-guard';
import { adminDb } from '../../../lib/db/admin';
import { betaApplications, invitations } from '../../../db/schema';
import { createInvitation, InvitationError } from '../../../lib/invitations';
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

const inviteSchema = z.object({ id: z.string().uuid() });

/**
 * Sends the beta invitation from the queue. Same provisioning as `npm run invite`: a single-use
 * link bound to the applicant's address, expiring in seven days, stored as a hash only. The
 * invitation and the status change are separate writes, so the order matters: the invitation
 * is created and emailed first, and the status moves to `invited` only after that succeeds.
 * A failed send leaves the applicant where they were and can be retried.
 */
export async function inviteApplicant(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const viewer = await requireAdmin();

  const parsed = inviteSchema.safeParse({ id: String(formData.get('id') ?? '') });
  if (!parsed.success) return { status: 'error', message: 'That applicant was not found.' };

  const [applicant] = await adminDb
    .select({ id: betaApplications.id, email: betaApplications.email, status: betaApplications.status, name: betaApplications.name })
    .from(betaApplications)
    .where(eq(betaApplications.id, parsed.data.id))
    .limit(1);
  if (!applicant) return { status: 'error', message: 'That applicant was not found.' };
  if (applicant.status === 'declined') {
    return { status: 'error', message: 'This request was declined. Change its status first if you want to invite them.' };
  }
  if (applicant.status === 'invited') {
    return { status: 'error', message: 'An invitation was already sent. Use the status buttons to change it.' };
  }

  const [open] = await adminDb
    .select({ id: invitations.id })
    .from(invitations)
    .where(
      and(
        eq(invitations.email, applicant.email.trim().toLowerCase()),
        isNull(invitations.acceptedAt),
        isNull(invitations.revokedAt),
        gt(invitations.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(invitations.createdAt))
    .limit(1);
  if (open) {
    return {
      status: 'error',
      message: 'An open invitation already exists for this address. Wait for it to expire or ask the engineer to revoke it.',
    };
  }

  try {
    await createInvitation({
      email: applicant.email,
      role: 'owner',
      invitedBy: viewer.userId,
      note: `Early access request ${applicant.id}`,
    });
  } catch (error) {
    const message =
      error instanceof InvitationError ? error.message : 'The invitation could not be sent. Nothing changed; try again.';
    console.error('[admin] invitation failed', { applicant: applicant.id, message: (error as Error).message });
    return { status: 'error', message };
  }

  try {
    await adminDb
      .update(betaApplications)
      .set({ status: 'invited' })
      .where(eq(betaApplications.id, applicant.id));
  } catch (error) {
    console.error('[admin] invited status not saved', { applicant: applicant.id, message: (error as Error).message });
    return {
      status: 'error',
      message: 'The invitation was sent, but the status did not update. Set it to Invited by hand.',
    };
  }

  revalidatePath('/admin/early-access');
  return { status: 'ok', message: `Invitation sent to ${applicant.name}.` };
}
