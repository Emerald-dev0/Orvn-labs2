'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq, sql } from 'drizzle-orm';
import { requireEditor, requireOwner, requireWorkspace } from '../access';
import { withUserDb } from '../db/tenant';
import { properties, propertyDetails } from '../../db/schema';
import { recordAudit } from '../audit';
import { slugify } from '../validation/property';
import {
  checkbox,
  createPropertySchema,
  factDecisionSchema,
  factSchema,
  locationSchema,
  propertyIdSchema,
  text,
  updatePropertySchema,
  visibilitySchema,
} from '../validation/workspace';
import { PublicationError, publishProperty, unpublishProperty } from '../publication/publish';
import { targetFor, visibilityCopy, visibilityOf, type Visibility } from '../publication/visibility';
import type { ActionState } from './types';

/**
 * Property and publication actions.
 *
 * Every one of them:
 *   1. resolves the workspace and the caller's role from the session;
 *   2. validates with a schema that has no workspace field in it;
 *   3. writes inside `withUserDb`, so RLS sees the same caller;
 *   4. records an audit entry;
 *   5. revalidates the app and the public page.
 */

const slugFrom = (title: string, fallback = 'property') => slugify(title) || fallback;

async function uniqueSlug(
  tx: Parameters<Parameters<typeof withUserDb>[1]>[0],
  workspaceId: string,
  base: string,
): Promise<string> {
  const rows = await tx
    .select({ slug: properties.slug })
    .from(properties)
    .where(eq(properties.workspaceId, workspaceId));
  const taken = new Set(rows.map((row) => row.slug));
  if (!taken.has(base)) return base;

  for (let suffix = 2; suffix < 100; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function createProperty(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();

  const parsed = createPropertySchema.safeParse({
    title: text(formData, 'title'),
    propertyType: text(formData, 'propertyType') || 'residential_land',
    city: text(formData, 'city'),
    region: text(formData, 'region'),
    postalCode: text(formData, 'postalCode'),
    country: text(formData, 'country'),
    apns: text(formData, 'apns')
      ? text(formData, 'apns')
          .split(/[\n,]/)
          .map((value) => value.trim())
          .filter(Boolean)
      : [],
    notes: text(formData, 'notes'),
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check the form.' };
  }

  const input = parsed.data;
  let newId = '';

  await withUserDb(viewer.userId, async (tx) => {
    const slug = await uniqueSlug(tx, workspace.id, slugFrom(input.title));

    const [created] = await tx
      .insert(properties)
      .values({
        workspaceId: workspace.id,
        title: input.title,
        slug,
        description: input.notes || null,
        propertyType: input.propertyType,
        city: input.city || null,
        region: input.region || null,
        postalCode: input.postalCode || null,
        country: input.country || null,
        createdBy: viewer.userId,
      })
      .returning({ id: properties.id });

    newId = created.id;

    // Parcel numbers arrive as strings and stay strings; a leading zero is part of the ID.
    for (const apn of input.apns) {
      await tx.insert(propertyDetails).values({
        propertyId: newId,
        key: input.apns.length > 1 ? 'APN' : 'APN',
        value: apn,
        sourceType: 'manual',
        sourceReference: 'You',
        approvalState: 'approved',
        isPublic: false,
      });
    }

    await recordAudit(
      {
        workspaceId: workspace.id,
        actorId: viewer.userId,
        action: 'property.created',
        targetType: 'property',
        targetId: newId,
        metadata: { detail: input.title },
      },
      tx,
    );
  });

  revalidatePath('/properties');
  revalidatePath('/dashboard');
  redirect(`/properties/${newId}`);
}

export async function updateProperty(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();

  const parsed = updatePropertySchema.safeParse({
    propertyId: text(formData, 'propertyId'),
    title: text(formData, 'title'),
    slug: text(formData, 'slug'),
    description: text(formData, 'description'),
    propertyType: text(formData, 'propertyType') || 'residential_land',
    addressLine: text(formData, 'addressLine'),
    postalCode: text(formData, 'postalCode'),
    locationDisclosure: text(formData, 'locationDisclosure') || 'area',
    city: text(formData, 'city'),
    region: text(formData, 'region'),
    country: text(formData, 'country'),
    locationPrecision: text(formData, 'locationPrecision') || 'unknown',
    priceAmount: text(formData, 'priceAmount'),
    currency: text(formData, 'currency'),
    priceVisibility: text(formData, 'priceVisibility') || 'on_request',
    availabilityStatus: text(formData, 'availabilityStatus') || 'available',
    showOnPortfolio: checkbox(formData, 'showOnPortfolio'),
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check the form.' };
  }

  const input = parsed.data;

  try {
    await withUserDb(viewer.userId, async (tx) => {
      await tx
        .update(properties)
        .set({
          title: input.title,
          slug: input.slug,
          description: input.description || null,
          propertyType: input.propertyType,
          addressLine: input.addressLine || null,
          postalCode: input.postalCode || null,
          locationDisclosure: input.locationDisclosure,
          city: input.city || null,
          region: input.region || null,
          country: input.country || null,
          locationPrecision: input.locationPrecision,
          priceAmount: input.priceAmount || null,
          currency: input.currency || null,
          priceVisibility: input.priceVisibility,
          availabilityStatus: input.availabilityStatus,
          showOnPortfolio: input.showOnPortfolio,
          updatedAt: new Date(),
        })
        .where(and(eq(properties.id, input.propertyId), eq(properties.workspaceId, workspace.id)));

      await recordAudit(
        {
          workspaceId: workspace.id,
          actorId: viewer.userId,
          action: 'property.updated',
          targetType: 'property',
          targetId: input.propertyId,
          metadata: { detail: input.title },
        },
        tx,
      );
    });
  } catch (error) {
    if (String((error as Error).message).includes('properties_workspace_slug_key')) {
      return { status: 'error', message: 'That address is already used by another property.' };
    }
    console.error('[property] update failed', { message: (error as Error).message });
    return { status: 'error', message: 'We could not save that just now. Nothing was changed.' };
  }

  revalidatePath(`/properties/${input.propertyId}`);
  revalidatePath('/properties');
  revalidatePath(`/w/${workspace.username}`);
  return { status: 'ok', message: 'Saved.' };
}

/**
 * The D07 disclosure control. Edits only what buyers may find: the address block and
 * how much of it the public page reveals. `locationDisclosure` is the single switch that
 * decides what leaves the building; the pin precision is stored alongside it so an
 * Exact setting without a real pin can be blocked at publish time.
 */
export async function updateLocation(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();

  const parsed = locationSchema.safeParse({
    propertyId: text(formData, 'propertyId'),
    addressLine: text(formData, 'addressLine'),
    postalCode: text(formData, 'postalCode'),
    city: text(formData, 'city'),
    region: text(formData, 'region'),
    country: text(formData, 'country'),
    locationPrecision: text(formData, 'locationPrecision') || 'unknown',
    locationDisclosure: text(formData, 'locationDisclosure') || 'area',
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check the address fields.' };
  }

  const input = parsed.data;

  let slug: string | null = null;
  await withUserDb(viewer.userId, async (tx) => {
    const updated = await tx
      .update(properties)
      .set({
        addressLine: input.addressLine || null,
        postalCode: input.postalCode || null,
        city: input.city || null,
        region: input.region || null,
        country: input.country || null,
        locationPrecision: input.locationPrecision,
        locationDisclosure: input.locationDisclosure,
        updatedAt: new Date(),
      })
      .where(and(eq(properties.id, input.propertyId), eq(properties.workspaceId, workspace.id)))
      .returning({ slug: properties.slug });
    slug = updated[0]?.slug ?? null;

    await recordAudit(
      {
        workspaceId: workspace.id,
        actorId: viewer.userId,
        action: 'property.location.updated',
        targetType: 'property',
        targetId: input.propertyId,
        metadata: { detail: input.locationDisclosure },
      },
      tx,
    );
  });

  revalidatePath(`/properties/${input.propertyId}`);
  revalidatePath('/properties');
  revalidatePath(`/w/${workspace.username}`);
  if (slug) revalidatePath(`/w/${workspace.username}/p/${slug}`);
  return { status: 'ok', message: 'Address and disclosure saved.' };
}

export async function saveFact(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();

  const parsed = factSchema.safeParse({
    propertyId: text(formData, 'propertyId'),
    key: text(formData, 'key'),
    value: text(formData, 'value'),
    isPublic: checkbox(formData, 'isPublic'),
    sourceType: 'manual',
    sourceReference: text(formData, 'sourceReference') || 'You',
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check the field.' };
  }

  const input = parsed.data;

  await withUserDb(viewer.userId, async (tx) => {
    // A fact with no value is not a fact. It is stored as unknown, never as a negative.
    await tx.insert(propertyDetails).values({
      propertyId: input.propertyId,
      key: input.key,
      value: input.value || null,
      sourceType: input.sourceType,
      sourceReference: input.sourceReference ?? 'You',
      approvalState: input.value ? 'approved' : 'unknown',
      isPublic: Boolean(input.value) && input.isPublic,
    });

    await tx
      .update(properties)
      .set({ updatedAt: new Date() })
      .where(and(eq(properties.id, input.propertyId), eq(properties.workspaceId, workspace.id)));

    await recordAudit(
      {
        workspaceId: workspace.id,
        actorId: viewer.userId,
        action: 'property.fact.added',
        targetType: 'property',
        targetId: input.propertyId,
        metadata: { detail: input.key },
      },
      tx,
    );
  });

  revalidatePath(`/properties/${input.propertyId}`);
  return { status: 'ok', message: 'Field saved.' };
}

export async function decideFact(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();

  const parsed = factDecisionSchema.safeParse({
    propertyId: text(formData, 'propertyId'),
    factId: text(formData, 'factId'),
    decision: text(formData, 'decision'),
  });

  if (!parsed.success) return { status: 'error', message: 'That decision was not understood.' };

  const { propertyId, factId, decision } = parsed.data;

  await withUserDb(viewer.userId, async (tx) => {
    const next =
      decision === 'reset'
        ? { approvalState: 'unreviewed' as const, isPublic: false }
        : {
            approvalState: decision,
            // Approving does not publish. Public visibility is a separate, deliberate choice.
            isPublic: decision === 'approved' ? undefined : false,
          };

    await tx
      .update(propertyDetails)
      .set({
        approvalState: next.approvalState,
        ...(next.isPublic === undefined ? {} : { isPublic: next.isPublic }),
        updatedAt: new Date(),
      })
      .where(eq(propertyDetails.id, factId));

    await recordAudit(
      {
        workspaceId: workspace.id,
        actorId: viewer.userId,
        action: `property.fact.${decision}`,
        targetType: 'property',
        targetId: propertyId,
      },
      tx,
    );
  });

  revalidatePath(`/properties/${propertyId}`);
  return { status: 'ok', message: 'Decision recorded.' };
}

export async function attestRights(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();
  const parsed = propertyIdSchema.safeParse({ propertyId: text(formData, 'propertyId') });
  if (!parsed.success) return { status: 'error', message: 'Unknown property.' };

  await withUserDb(viewer.userId, async (tx) => {
    await tx
      .update(properties)
      .set({ rightsAttestedAt: new Date(), rightsAttestedBy: viewer.userId, updatedAt: new Date() })
      .where(and(eq(properties.id, parsed.data.propertyId), eq(properties.workspaceId, workspace.id)));

    await recordAudit(
      {
        workspaceId: workspace.id,
        actorId: viewer.userId,
        action: 'property.rights.attested',
        targetType: 'property',
        targetId: parsed.data.propertyId,
      },
      tx,
    );
  });

  revalidatePath(`/properties/${parsed.data.propertyId}`);
  return { status: 'ok', message: 'Recorded. You can publish now.' };
}

export async function publishPropertyAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();
  const parsed = propertyIdSchema.safeParse({ propertyId: text(formData, 'propertyId') });
  if (!parsed.success) return { status: 'error', message: 'Unknown property.' };

  try {
    await withUserDb(viewer.userId, async (tx) => {
      await publishProperty(tx, {
        propertyId: parsed.data.propertyId,
        workspaceId: workspace.id,
        actorId: viewer.userId,
      });
    });
  } catch (error) {
    if (error instanceof PublicationError) {
      return { status: 'error', message: error.message, blockers: error.blockers };
    }
    console.error('[publish] failed', { message: (error as Error).message });
    return { status: 'error', message: 'Publishing failed. The record is unchanged.' };
  }

  revalidatePath(`/properties/${parsed.data.propertyId}`);
  revalidatePath('/properties');
  revalidatePath(`/w/${workspace.username}`);
  return { status: 'ok', message: 'Published.' };
}

export async function unpublishPropertyAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();
  const parsed = propertyIdSchema.safeParse({ propertyId: text(formData, 'propertyId') });
  if (!parsed.success) return { status: 'error', message: 'Unknown property.' };

  await withUserDb(viewer.userId, async (tx) => {
    await unpublishProperty(tx, {
      propertyId: parsed.data.propertyId,
      workspaceId: workspace.id,
      actorId: viewer.userId,
    });
  });

  revalidatePath(`/properties/${parsed.data.propertyId}`);
  revalidatePath('/properties');
  revalidatePath(`/w/${workspace.username}`);
  return { status: 'ok', message: 'Unpublished. The page and its files are no longer public.' };
}

/**
 * The visibility control.
 *
 * One action for the three states, because the states are one decision, not three buttons that
 * can contradict each other. It writes the publication (open, rewrite or close) and the portfolio
 * flag in the same transaction, so a page can never end up published-but-marked-private.
 *
 * A move to link-only or public runs the full publication check. If a prerequisite is missing the
 * action returns the blockers and nothing is written: the state does not drift halfway.
 */
export async function setVisibilityAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();
  const parsed = visibilitySchema.safeParse({
    propertyId: text(formData, 'propertyId'),
    visibility: text(formData, 'visibility'),
  });
  if (!parsed.success) return { status: 'error', message: 'Unknown property or visibility.' };

  const requested = parsed.data.visibility as Visibility;
  const target = targetFor(requested);

  try {
    await withUserDb(viewer.userId, async (tx) => {
      const [row] = await tx
        .select({
          publicationStatus: properties.publicationStatus,
          showOnPortfolio: properties.showOnPortfolio,
        })
        .from(properties)
        .where(and(eq(properties.id, parsed.data.propertyId), eq(properties.workspaceId, workspace.id)))
        .limit(1);

      if (!row) throw new PublicationError(['That property is not in this workspace.']);

      const before = visibilityOf(row);

      if (target.publish) {
        // Re-publishing rewrites the snapshot, which is the point: a link-only page must carry the
        // approved facts as they are now, not the ones that were approved last time.
        if (row.publicationStatus !== 'published') {
          await publishProperty(tx, {
            propertyId: parsed.data.propertyId,
            workspaceId: workspace.id,
            actorId: viewer.userId,
          });
        }
        await tx
          .update(properties)
          .set({ showOnPortfolio: target.showOnPortfolio, updatedAt: new Date() })
          .where(and(eq(properties.id, parsed.data.propertyId), eq(properties.workspaceId, workspace.id)));
      } else if (row.publicationStatus === 'published') {
        await unpublishProperty(tx, {
          propertyId: parsed.data.propertyId,
          workspaceId: workspace.id,
          actorId: viewer.userId,
        });
      }

      if (before !== requested) {
        await recordAudit(
          {
            workspaceId: workspace.id,
            actorId: viewer.userId,
            action: 'property.visibility.changed',
            targetType: 'property',
            targetId: parsed.data.propertyId,
            metadata: { from: before, to: requested },
          },
          tx,
        );
      }
    });
  } catch (error) {
    if (error instanceof PublicationError) {
      return { status: 'error', message: error.message, blockers: error.blockers };
    }
    console.error('[visibility] failed', { message: (error as Error).message });
    return { status: 'error', message: 'That change did not save. The property is unchanged.' };
  }

  revalidatePath(`/properties/${parsed.data.propertyId}`);
  revalidatePath('/properties');
  revalidatePath(`/w/${workspace.username}`);
  revalidatePath(`/w/${workspace.username}/p`);

  const copy = visibilityCopy(requested);
  return { status: 'ok', message: `Now ${copy.label.toLowerCase()}: ${copy.summary.toLowerCase()}.` };
}

export async function archivePropertyAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { viewer, workspace } = await requireOwner();
  const parsed = propertyIdSchema.safeParse({ propertyId: text(formData, 'propertyId') });
  if (!parsed.success) return { status: 'error', message: 'Unknown property.' };

  await withUserDb(viewer.userId, async (tx) => {
    await unpublishProperty(tx, {
      propertyId: parsed.data.propertyId,
      workspaceId: workspace.id,
      actorId: viewer.userId,
      archive: true,
    });
  });

  revalidatePath('/properties');
  return { status: 'ok', message: 'Archived. History and analytics are kept.' };
}

/** Used by the list screen's quick publish, where there is no form state to return. */
export async function quickPublish(propertyId: string): Promise<void> {
  const { viewer, workspace } = await requireWorkspace();
  if (workspace.role === 'viewer') return;

  await withUserDb(viewer.userId, async (tx) => {
    await publishProperty(tx, { propertyId, workspaceId: workspace.id, actorId: viewer.userId });
  });

  revalidatePath('/properties');
  revalidatePath(`/w/${workspace.username}`);
}
