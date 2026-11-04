'use server';

import { redirect } from 'next/navigation';
import { requireUser } from '../../../lib/access';
import { acceptInvitation, InvitationError } from '../../../lib/invitations';
import { inviteAcceptSchema } from '../../../lib/validation/invite';

export type AcceptState = { status: 'idle' } | { status: 'error'; message: string };

/**
 * Accepting an invitation.
 *
 * The signed-in address is taken from the session, never from the form, so a valid link
 * forwarded to somebody else cannot be redeemed by them. Everything else — expiry, single
 * use, workspace creation — is enforced inside the database function.
 */
export async function acceptInvite(
  _previous: AcceptState,
  formData: FormData,
): Promise<AcceptState> {
  const viewer = await requireUser();
  const token = String(formData.get('token') ?? '');

  const parsed = inviteAcceptSchema.safeParse({
    token,
    workspaceName: formData.get('workspaceName') || undefined,
    username: formData.get('username') || undefined,
    displayName: formData.get('displayName') || undefined,
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check the details above.' };
  }

  try {
    await acceptInvitation({
      token: parsed.data.token,
      userId: viewer.userId,
      email: viewer.email,
      workspaceName: parsed.data.workspaceName,
      username: parsed.data.username,
    });
  } catch (error) {
    if (error instanceof InvitationError) {
      return { status: 'error', message: error.message };
    }
    const message = error instanceof Error ? error.message : '';
    if (message.includes('workspaces_username_key')) {
      return { status: 'error', message: 'That public address is taken. Try another.' };
    }
    console.error('[invite] accept failed', { message });
    return { status: 'error', message: 'We could not open your workspace just now. Try again.' };
  }

  redirect('/dashboard');
}
