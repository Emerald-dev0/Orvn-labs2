'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, isNull, or } from 'drizzle-orm';
import { requireUser } from '../access';
import { withUserDb } from '../db/tenant';
import { connections, messages, savedProfiles } from '../../db/schema';
import type { ActionState } from './types';

/**
 * Professional network mutations.
 *
 * Every action re-proves who is asking through `requireUser` and then writes through
 * `withUserDb`, so RLS (keyed on app_uid()) is the second check on top of the explicit
 * predicates here. A caller can never name another user's row and have the write land:
 * the where clause is always scoped to the viewer's own side.
 */

const PROFILE_PATH = '/saved';
const NETWORK_PATH = '/network';
const MESSAGES_PATH = '/messages';

export async function requestConnection(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const viewer = await requireUser();
  const targetId = String(formData.get('userId') ?? '').trim();
  if (!targetId) return { status: 'error', message: 'Choose a person to connect with.' };
  if (targetId === viewer.userId) return { status: 'error', message: 'That is your own profile.' };

  const existing = await withUserDb(viewer.userId, async (tx) =>
    tx
      .select({ id: connections.id, status: connections.status, requesterId: connections.requesterId })
      .from(connections)
      .where(
        or(
          and(eq(connections.requesterId, viewer.userId), eq(connections.recipientId, targetId)),
          and(eq(connections.requesterId, targetId), eq(connections.recipientId, viewer.userId)),
        ),
      )
      .limit(1),
  );

  const row = existing[0];
  if (row) {
    if (row.status === 'accepted') return { status: 'ok', message: 'You are already connected.' };
    if (row.requesterId === viewer.userId) {
      return { status: 'ok', message: 'You already sent a request.' };
    }
    return { status: 'ok', message: 'This person already sent you a request — accept it in Network.' };
  }

  try {
    await withUserDb(viewer.userId, async (tx) => {
      await tx
        .insert(connections)
        .values({ requesterId: viewer.userId, recipientId: targetId, status: 'pending' })
        .onConflictDoNothing();
    });
  } catch (error) {
    console.error('[network] connection request failed', { message: (error as Error).message });
    return { status: 'error', message: 'The request did not save. Try again.' };
  }

  revalidatePath(NETWORK_PATH);
  return { status: 'ok', message: 'Connection request sent.' };
}

export async function respondConnection(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const viewer = await requireUser();
  const id = String(formData.get('id') ?? '').trim();
  const decision = String(formData.get('decision') ?? '');
  if (!id || (decision !== 'accept' && decision !== 'decline')) {
    return { status: 'error', message: 'That change was not understood.' };
  }

  const status = decision === 'accept' ? 'accepted' : 'declined';
  const changed = await withUserDb(viewer.userId, async (tx) =>
    tx
      .update(connections)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(connections.id, id), eq(connections.recipientId, viewer.userId)))
      .returning({ id: connections.id }),
  );

  if (changed.length === 0) return { status: 'error', message: 'That request was not found.' };
  revalidatePath(NETWORK_PATH);
  return { status: 'ok', message: status === 'accepted' ? 'Connected.' : 'Request declined.' };
}

export async function cancelConnection(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const viewer = await requireUser();
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return { status: 'error', message: 'That request was not found.' };

  const removed = await withUserDb(viewer.userId, async (tx) =>
    tx
      .delete(connections)
      .where(and(eq(connections.id, id), eq(connections.requesterId, viewer.userId)))
      .returning({ id: connections.id }),
  );
  if (removed.length === 0) return { status: 'error', message: 'That request was not found.' };
  revalidatePath(NETWORK_PATH);
  return { status: 'ok', message: 'Request withdrawn.' };
}

const MAX_MESSAGE = 2000;

export async function sendMessage(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await requireUser();
  const to = String(formData.get('to') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();

  if (!to) return { status: 'error', message: 'Choose who to message.' };
  if (to === viewer.userId) return { status: 'error', message: 'You cannot message yourself.' };
  if (!body) return { status: 'error', message: 'Write a message first.' };
  if (body.length > MAX_MESSAGE) {
    return { status: 'error', message: `Keep messages under ${MAX_MESSAGE} characters.` };
  }

  try {
    await withUserDb(viewer.userId, async (tx) => {
      await tx.insert(messages).values({ senderId: viewer.userId, recipientId: to, body });
    });
  } catch (error) {
    console.error('[network] send message failed', { message: (error as Error).message });
    return { status: 'error', message: 'The message did not send. Try again.' };
  }

  revalidatePath(MESSAGES_PATH, 'page');
  return { status: 'ok', message: 'Sent.' };
}

export async function markRead(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await requireUser();
  const otherId = String(formData.get('otherId') ?? '').trim();
  if (!otherId) return { status: 'idle' };

  await withUserDb(viewer.userId, async (tx) => {
    await tx
      .update(messages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(messages.recipientId, viewer.userId),
          eq(messages.senderId, otherId),
          isNull(messages.readAt),
        ),
      );
  });
  revalidatePath(MESSAGES_PATH, 'page');
  return { status: 'ok' };
}

export async function toggleSave(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await requireUser();
  const profileId = String(formData.get('profileId') ?? '').trim();
  const save = String(formData.get('saved') ?? '') === '1';
  if (!profileId) return { status: 'error', message: 'That profile was not found.' };

  try {
    await withUserDb(viewer.userId, async (tx) => {
      if (save) {
        await tx
          .insert(savedProfiles)
          .values({ userId: viewer.userId, profileId })
          .onConflictDoNothing();
      } else {
        await tx
          .delete(savedProfiles)
          .where(and(eq(savedProfiles.userId, viewer.userId), eq(savedProfiles.profileId, profileId)));
      }
    });
  } catch (error) {
    console.error('[network] save toggle failed', { message: (error as Error).message });
    return { status: 'error', message: 'That did not save. Try again.' };
  }

  revalidatePath(PROFILE_PATH);
  return { status: 'ok', message: save ? 'Saved.' : 'Removed from saved.' };
}