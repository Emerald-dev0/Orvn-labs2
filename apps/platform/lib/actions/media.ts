'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, sql } from 'drizzle-orm';
import { requireEditor } from '../access';
import { withUserDb } from '../db/tenant';
import { properties, propertyMedia } from '../../db/schema';
import { recordAudit } from '../audit';
import { deleteObject, putObject, storageConfigured, storageKeyFor } from '../storage';
import { renderImageRenditions } from '../image-encoder';
import { isImageKey, variantKeyFor, variantKeysFor } from '../images';
import { uploadErrorMessage, validateUpload } from '../uploads';
import { checkbox, propertyIdSchema, text } from '../validation/workspace';
import type { ActionState } from './types';

const MAX_FILES_PER_SUBMISSION = 6;
const MAX_FILES_PER_PROPERTY = 60;

/**
 * Uploads.
 *
 * The sequence is deliberate: validate the bytes, write the object, then write the row. A row
 * without an object is a broken image; an object without a row is unreachable, which is the
 * safer failure. Every file is private until somebody marks it public.
 */
export async function uploadMedia(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();

  if (!storageConfigured()) {
    return {
      status: 'error',
      message: 'File storage is not configured on this deployment yet. Notes and facts still save.',
    };
  }

  const parsed = propertyIdSchema.safeParse({ propertyId: text(formData, 'propertyId') });
  if (!parsed.success) return { status: 'error', message: 'Unknown property.' };

  const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) return { status: 'error', message: 'Choose a file first.' };
  if (files.length > MAX_FILES_PER_SUBMISSION) {
    return { status: 'error', message: `Up to ${MAX_FILES_PER_SUBMISSION} files at a time.` };
  }

  const makePublic = checkbox(formData, 'makePublic');

  const existing = await withUserDb(viewer.userId, async (tx) => {
    const [property] = await tx
      .select({ id: properties.id })
      .from(properties)
      .where(and(eq(properties.id, parsed.data.propertyId), eq(properties.workspaceId, workspace.id)))
      .limit(1);
    if (!property) return null;

    const [countRow] = await tx
      .select({ total: sql<number>`count(*)::int` })
      .from(propertyMedia)
      .where(eq(propertyMedia.propertyId, parsed.data.propertyId));

    return { total: Number(countRow?.total ?? 0) };
  });

  if (!existing) return { status: 'error', message: 'That property is not in this workspace.' };
  if (existing.total + files.length > MAX_FILES_PER_PROPERTY) {
    return { status: 'error', message: 'This property has reached its file limit.' };
  }

  const failures: string[] = [];
  const stored: {
    key: string;
    visibility: 'public' | 'private';
    width: number | null;
    height: number | null;
  }[] = [];

  for (const file of files) {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const check = validateUpload({
      filename: file.name,
      declaredType: file.type,
      bytes: buffer,
    });

    if (!check.ok || !check.type || !check.filename) {
      failures.push(`${file.name}: ${uploadErrorMessage(check.reason ?? 'unsupported_type')}`);
      continue;
    }

    const key = storageKeyFor(workspace.id, check.filename);
    const body = buffer.buffer as ArrayBuffer;
    const written = await putObject(key, body, check.type);
    if (!written) {
      failures.push(`${file.name}: storage refused the upload.`);
      continue;
    }

    // Renditions are made here, once, and stored beside the original. A failure costs the
    // upload nothing: the original still serves, just at full weight.
    let width: number | null = null;
    let height: number | null = null;
    if (isImageKey(key)) {
      const rendition = await renderImageRenditions(body);
      if (rendition) {
        width = rendition.width;
        height = rendition.height;
        for (const variant of rendition.variants) {
          const variantKey = variantKeyFor(key, variant.width);
          const ok = await putObject(variantKey, variant.body, 'image/webp');
          if (!ok) {
            console.warn('[media] rendition not stored', { variantKey });
          }
        }
      }
    }

    stored.push({ key, visibility: makePublic ? 'public' : 'private', width, height });
  }

  if (stored.length > 0) {
    await withUserDb(viewer.userId, async (tx) => {
      const [orderRow] = await tx
        .select({ max: sql<number>`coalesce(max(${propertyMedia.sortOrder}), 0)::int` })
        .from(propertyMedia)
        .where(eq(propertyMedia.propertyId, parsed.data.propertyId));

      let order = Number(orderRow?.max ?? 0);

      for (const item of stored) {
        order += 1;
        await tx.insert(propertyMedia).values({
          propertyId: parsed.data.propertyId,
          storageKey: item.key,
          kind: item.key.endsWith('.pdf') ? 'document' : 'photo',
          sortOrder: order,
          isCover: false,
          visibility: item.visibility,
          width: item.width,
          height: item.height,
        });
      }

      await tx
        .update(properties)
        .set({ updatedAt: new Date() })
        .where(eq(properties.id, parsed.data.propertyId));

      await recordAudit(
        {
          workspaceId: workspace.id,
          actorId: viewer.userId,
          action: 'property.media.uploaded',
          targetType: 'property',
          targetId: parsed.data.propertyId,
          metadata: { count: stored.length, visibility: makePublic ? 'public' : 'private' },
        },
        tx,
      );
    });
  }

  revalidatePath(`/properties/${parsed.data.propertyId}`);

  if (stored.length === 0) {
    return { status: 'error', message: failures[0] ?? 'Nothing was uploaded.' };
  }

  return {
    status: 'ok',
    message:
      failures.length > 0
        ? `${stored.length} uploaded, ${failures.length} refused. ${failures[0]}`
        : `${stored.length} uploaded as ${makePublic ? 'public' : 'private'}.`,
  };
}

export async function setMediaVisibility(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();
  const mediaId = text(formData, 'mediaId');
  const propertyId = text(formData, 'propertyId');
  const makePublic = checkbox(formData, 'isPublic');

  if (!mediaId || !propertyId) return { status: 'error', message: 'Unknown file.' };

  await withUserDb(viewer.userId, async (tx) => {
    await tx
      .update(propertyMedia)
      .set({ visibility: makePublic ? 'public' : 'private' })
      .where(eq(propertyMedia.id, mediaId));

    await recordAudit(
      {
        workspaceId: workspace.id,
        actorId: viewer.userId,
        action: 'property.media.visibility',
        targetType: 'property',
        targetId: propertyId,
        metadata: { visibility: makePublic ? 'public' : 'private' },
      },
      tx,
    );
  });

  revalidatePath(`/properties/${propertyId}`);
  return { status: 'ok', message: makePublic ? 'Now public.' : 'Now private.' };
}

export async function setCoverMedia(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();
  const mediaId = text(formData, 'mediaId');
  const propertyId = text(formData, 'propertyId');

  if (!mediaId || !propertyId) return { status: 'error', message: 'Unknown file.' };

  await withUserDb(viewer.userId, async (tx) => {
    await tx
      .update(propertyMedia)
      .set({ isCover: false })
      .where(eq(propertyMedia.propertyId, propertyId));
    await tx.update(propertyMedia).set({ isCover: true }).where(eq(propertyMedia.id, mediaId));

    await recordAudit(
      {
        workspaceId: workspace.id,
        actorId: viewer.userId,
        action: 'property.media.cover',
        targetType: 'property',
        targetId: propertyId,
      },
      tx,
    );
  });

  revalidatePath(`/properties/${propertyId}`);
  return { status: 'ok', message: 'Cover updated.' };
}

export async function removeMedia(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();
  const mediaId = text(formData, 'mediaId');
  const propertyId = text(formData, 'propertyId');

  if (!mediaId || !propertyId) return { status: 'error', message: 'Unknown file.' };

  const key = await withUserDb(viewer.userId, async (tx) => {
    const [row] = await tx
      .select({ key: propertyMedia.storageKey })
      .from(propertyMedia)
      .where(and(eq(propertyMedia.id, mediaId), eq(propertyMedia.propertyId, propertyId)))
      .limit(1);

    if (!row) return null;

    // Row first: once the row is gone the media route 404s immediately, even if the object
    // deletion below fails and is retried later.
    await tx.delete(propertyMedia).where(eq(propertyMedia.id, mediaId));

    await recordAudit(
      {
        workspaceId: workspace.id,
        actorId: viewer.userId,
        action: 'property.media.removed',
        targetType: 'property',
        targetId: propertyId,
      },
      tx,
    );

    return row.key;
  });

  if (!key) return { status: 'error', message: 'That file is already gone.' };

  // The row is gone, so the route already refuses these: cleanup is housekeeping, not a
  // security step, which is why it is not awaited.
  void Promise.allSettled([key, ...variantKeysFor(key)].map((target) => deleteObject(target)));

  revalidatePath(`/properties/${propertyId}`);
  return { status: 'ok', message: 'Removed. The page can no longer serve it.' };
}
