'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq, sql } from 'drizzle-orm';
import { requireEditor, requireOwner, requireWorkspace } from '../access';
import { parseOnboarding } from '../onboarding';
import { withUserDb } from '../db/tenant';
import { professionalProfiles } from '../../db/schema';
import { recordAudit } from '../audit';
import { createInvitation, InvitationError } from '../invitations';
import { checkbox, inviteMemberSchema, profileSchema, text } from '../validation/workspace';
import { putObject, deleteObject, storageKeyFor } from '../storage';
import { detectType, extensionFor, MAX_PHOTO_BYTES } from '../uploads';
import { renderImageRenditions } from '../image-encoder';
import { isImageKey, variantKeyFor, variantKeysFor } from '../images';
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
    role: text(formData, 'role'),
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
        ...(input.role ? { role: input.role } : {}),
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

const SITE_IMAGE_KINDS = new Set(['logo', 'cover']);

/**
 * Upload or replace the professional page's logo mark or hero cover. Renditions are made here
 * like property photos, and the old object (plus its renditions) is deleted after the swap so
 * storage does not accumulate orphans. The public route only serves these once the site is
 * published — an unpublished upload never leaves storage by any other door.
 */
export async function uploadSiteMedia(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();
  const kind = text(formData, 'kind');
  if (!SITE_IMAGE_KINDS.has(kind)) return { status: 'error', message: 'Unknown image slot.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { status: 'error', message: 'Choose an image first.' };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { status: 'error', message: 'That image is over 10 MB. Export a smaller one.' };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectType(bytes);
  if (type !== 'image/jpeg' && type !== 'image/png' && type !== 'image/webp') {
    return { status: 'error', message: 'Photos only: JPEG, PNG or WebP.' };
  }

  const key = storageKeyFor(workspace.id, `${kind}.${extensionFor(type)}`);
  const body = bytes.buffer as ArrayBuffer;
  const written = await putObject(key, body, type);
  if (!written) {
    return { status: 'error', message: 'Storage refused the upload. Nothing was changed.' };
  }

  if (isImageKey(key)) {
    const rendition = await renderImageRenditions(body);
    if (rendition) {
      await Promise.allSettled(
        rendition.variants.map((variant) =>
          putObject(variantKeyFor(key, variant.width), variant.body, 'image/webp'),
        ),
      );
    }
  }

  let replaced: string | null = null;
  await withUserDb(viewer.userId, async (tx) => {
    const [profile] = await tx
      .select({ logoKey: professionalProfiles.logoKey, coverKey: professionalProfiles.coverKey })
      .from(professionalProfiles)
      .where(eq(professionalProfiles.workspaceId, workspace.id))
      .limit(1);
    replaced = (kind === 'logo' ? profile?.logoKey : profile?.coverKey) ?? null;

    await tx
      .update(professionalProfiles)
      .set(
        kind === 'logo'
          ? { logoKey: key, updatedAt: new Date() }
          : { coverKey: key, updatedAt: new Date() },
      )
      .where(eq(professionalProfiles.workspaceId, workspace.id));

    await recordAudit(
      {
        workspaceId: workspace.id,
        actorId: viewer.userId,
        action: kind === 'logo' ? 'site.logo.uploaded' : 'site.cover.uploaded',
        targetType: 'workspace',
        targetId: workspace.id,
      },
      tx,
    );
  });

  if (replaced && replaced !== key) {
    void Promise.allSettled([replaced, ...variantKeysFor(replaced)].map((target) => deleteObject(target)));
  }

  revalidatePath('/website');
  revalidatePath(`/w/${workspace.username}`);
  return { status: 'ok', message: kind === 'logo' ? 'Logo uploaded.' : 'Cover image uploaded.' };
}

export async function removeSiteMedia(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();
  const kind = text(formData, 'kind');
  if (!SITE_IMAGE_KINDS.has(kind)) return { status: 'error', message: 'Unknown image slot.' };

  let removed: string | null = null;
  await withUserDb(viewer.userId, async (tx) => {
    const [profile] = await tx
      .select({ logoKey: professionalProfiles.logoKey, coverKey: professionalProfiles.coverKey })
      .from(professionalProfiles)
      .where(eq(professionalProfiles.workspaceId, workspace.id))
      .limit(1);
    removed = (kind === 'logo' ? profile?.logoKey : profile?.coverKey) ?? null;

    await tx
      .update(professionalProfiles)
      .set(
        kind === 'logo'
          ? { logoKey: null, updatedAt: new Date() }
          : { coverKey: null, updatedAt: new Date() },
      )
      .where(eq(professionalProfiles.workspaceId, workspace.id));

    await recordAudit(
      {
        workspaceId: workspace.id,
        actorId: viewer.userId,
        action: kind === 'logo' ? 'site.logo.removed' : 'site.cover.removed',
        targetType: 'workspace',
        targetId: workspace.id,
      },
      tx,
    );
  });

  if (removed) {
    void Promise.allSettled([removed, ...variantKeysFor(removed)].map((target) => deleteObject(target)));
  }

  revalidatePath('/website');
  revalidatePath(`/w/${workspace.username}`);
  return { status: 'ok', message: kind === 'logo' ? 'Logo removed.' : 'Cover image removed.' };
}

export type OnboardingState = { status: 'idle' } | { status: 'error'; message: string };

/**
 * AUTH-02: first-run onboarding. One screen, two buttons.
 *
 * `completeOnboarding` writes the five things a buyer sees on a public page — who you are, what
 * you do, where, and how to reach you. `skipOnboarding` records the date and leaves the profile
 * exactly as it is; it is not the same as never having asked. Both lead to creating the first
 * property, either way.
 */
export async function completeOnboarding(
  _previous: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const { viewer, workspace } = await requireEditor();

  const parsed = parseOnboarding({
    displayName: text(formData, 'displayName'),
    role: text(formData, 'role'),
    market: text(formData, 'market'),
    contactEmail: text(formData, 'contactEmail'),
    contactPhone: text(formData, 'contactPhone'),
  });
  if (parsed.ok === false) return { status: 'error', message: parsed.error };

  try {
    await withUserDb(viewer.userId, async (tx) => {
      await tx
        .update(professionalProfiles)
        .set({
          displayName: parsed.displayName,
          role: parsed.role,
          markets: [parsed.market],
          contactEmail: parsed.contactEmail,
          contactPhone: parsed.contactPhone,
          onboardedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(professionalProfiles.workspaceId, workspace.id));

      await recordAudit(
        {
          workspaceId: workspace.id,
          actorId: viewer.userId,
          action: 'site.onboarded',
          targetType: 'workspace',
          targetId: workspace.id,
          metadata: { role: parsed.role, market: parsed.market },
        },
        tx,
      );
    });
  } catch (error) {
    console.error('[onboarding] save failed', { message: (error as Error).message });
    return { status: 'error', message: 'That could not be saved just now. Nothing was changed.' };
  }

  revalidatePath('/');
  revalidatePath(`/w/${workspace.username}`);
  revalidatePath('/website');
  redirect('/properties/new');
}

/** Mark the onboarding step as seen without touching any field. */
export async function skipOnboarding(_previous: OnboardingState): Promise<OnboardingState> {
  const { viewer, workspace } = await requireEditor();

  try {
    await withUserDb(viewer.userId, async (tx) => {
      await tx
        .update(professionalProfiles)
        .set({ onboardedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(professionalProfiles.workspaceId, workspace.id)));

      await recordAudit(
        {
          workspaceId: workspace.id,
          actorId: viewer.userId,
          action: 'site.onboarding_skipped',
          targetType: 'workspace',
          targetId: workspace.id,
        },
        tx,
      );
    });
  } catch (error) {
    console.error('[onboarding] skip failed', { message: (error as Error).message });
    return { status: 'error', message: 'That could not be saved just now. Nothing was changed.' };
  }

  redirect('/properties/new');
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
