'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, sql } from 'drizzle-orm';
import { requireEditor, requireOwner, requireWorkspace } from '../access';
import { withUserDb } from '../db/tenant';
import { professionalProfiles } from '../../db/schema';
import { recordAudit } from '../audit';
import { createInvitation, InvitationError } from '../invitations';
import { checkbox, inviteMemberSchema, profileSchema, text } from '../validation/workspace';
import type { ActionState } from './types';

/**
 * The professional page. Publishing the site is separate from publishing a property: a site
 * with no properties is still a complete page (F02, T04), and a published property does not
 * automatically appear on the portfolio unless `showOnPortfolio` is on.
 */
export async function updateProfile(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();

  const parsed = profileSchema.safeParse({
    displayName: text(formData, 'displayName'),
    headline: text(formData, 'headline'),
    bio: text(formData, 'bio'),
    contactEmail: text(formData, 'contactEmail'),
    contactPhone: text(formData, 'contactPhone'),
    showPhone: checkbox(formData, 'showPhone'),
    markets: text(formData, 'markets')
      ? text(formData, 'markets')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
          .slice(0, 8)
      : [],
    publishSite: checkbox(formData, 'publishSite'),
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check the form.' };
  }

  const input = parsed.data;

  if (input.publishSite && !input.contactEmail) {
    return {
      status: 'error',
      message: 'A published page needs a contact email, otherwise the inquiry button goes nowhere.',
    };
  }

  await withUserDb(viewer.userId, async (tx) => {
    const now = new Date();
    await tx
      .update(professionalProfiles)
      .set({
        displayName: input.displayName,
        headline: input.headline || null,
        bio: input.bio || null,
        contactEmail: input.contactEmail || null,
        contactPhone: input.contactPhone || null,
        showPhone: input.showPhone,
        markets: input.markets,
        updatedAt: now,
        ...(input.publishSite ? { publishedAt: now } : {}),
      })
      .where(eq(professionalProfiles.workspaceId, workspace.id));

    await recordAudit(
      {
        workspaceId: workspace.id,
        actorId: viewer.userId,
        action: input.publishSite ? 'site.published' : 'site.updated',
        targetType: 'workspace',
        targetId: workspace.id,
      },
      tx,
    );
  });

  revalidatePath('/website');
  revalidatePath(`/w/${workspace.username}`);
  return { status: 'ok', message: input.publishSite ? 'Your page is live.' : 'Saved.' };
}

export async function unpublishSite(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();
  void formData;

  await withUserDb(viewer.userId, async (tx) => {
    await tx
      .update(professionalProfiles)
      .set({ publishedAt: null, updatedAt: new Date() })
      .where(eq(professionalProfiles.workspaceId, workspace.id));

    await recordAudit(
      {
        workspaceId: workspace.id,
        actorId: viewer.userId,
        action: 'site.unpublished',
        targetType: 'workspace',
        targetId: workspace.id,
      },
      tx,
    );
  });

  revalidatePath('/website');
  revalidatePath(`/w/${workspace.username}`);
  return { status: 'ok', message: 'Your page is no longer public.' };
}

export async function inviteMember(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireOwner();

  const parsed = inviteMemberSchema.safeParse({
    email: text(formData, 'email'),
    role: text(formData, 'role') || 'editor',
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check the address.' };
  }

  const alreadyMember = await withUserDb(viewer.userId, async (tx) => {
    const result = await tx.execute(sql`
      select 1 from memberships m
        join "user" u on u.id = m.user_id
       where m.workspace_id = ${workspace.id} and lower(u.email) = lower(${parsed.data.email})
       limit 1
    `);
    return (result.rows?.length ?? 0) > 0;
  });

  if (alreadyMember) {
    return { status: 'error', message: 'That person is already in this workspace.' };
  }

  try {
    await createInvitation({
      email: parsed.data.email,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      role: parsed.data.role,
      invitedBy: viewer.userId,
    });
  } catch (error) {
    if (error instanceof InvitationError) {
      return { status: 'error', message: error.message };
    }
    console.error('[invite] member invitation failed', { message: (error as Error).message });
    return { status: 'error', message: 'We could not send that invitation. Try again.' };
  }

  return { status: 'ok', message: `Invitation sent to ${parsed.data.email}.` };
}

export async function renameWorkspace(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireOwner();
  const name = (formData.get('name') as string | null)?.trim() ?? '';

  if (name.length < 2 || name.length > 80) {
    return { status: 'error', message: 'A workspace name of 2 to 80 characters.' };
  }

  await withUserDb(viewer.userId, async (tx) => {
    await tx.execute(sql`
      update workspaces set name = ${name}, updated_at = now() where id = ${workspace.id}
    `);
    await recordAudit(
      {
        workspaceId: workspace.id,
        actorId: viewer.userId,
        action: 'workspace.renamed',
        targetType: 'workspace',
        targetId: workspace.id,
        metadata: { detail: name },
      },
      tx,
    );
  });

  revalidatePath('/settings');
  return { status: 'ok', message: 'Workspace renamed.' };
}

export async function revokeMember(): Promise<ActionState> {
  const { workspace } = await requireWorkspace();
  void workspace;
  return { status: 'error', message: 'Removing a member arrives with the team screen.' };
}
