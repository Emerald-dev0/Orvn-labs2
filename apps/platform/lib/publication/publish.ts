import { and, desc, eq, isNull } from 'drizzle-orm';
import { properties, propertyDetails, propertyMedia, propertyPublications } from '../../db/schema';
import { professionalProfiles } from '../../db/schema';
import type { TenantTx } from '../db/pool';
import { recordAudit } from '../audit';
import { buildSnapshot, type PublicationSnapshot } from './snapshot';
import { publicationBlockers } from '../validation/property';

/**
 * Publishing, unpublishing and archiving.
 *
 * Each function takes the transaction it must run in, so the status change, the snapshot and
 * the audit entry commit together or not at all.
 */

export class PublicationError extends Error {
  readonly blockers: string[];
  constructor(blockers: string[]) {
    super(blockers[0] ?? 'This property cannot be published yet.');
    this.name = 'PublicationError';
    this.blockers = blockers;
  }
}

export async function publishProperty(
  tx: TenantTx,
  opts: { propertyId: string; workspaceId: string; actorId: string; allowWithoutPhotos?: boolean },
): Promise<{ snapshot: PublicationSnapshot; version: number }> {
  const [property] = await tx
    .select()
    .from(properties)
    .where(and(eq(properties.id, opts.propertyId), eq(properties.workspaceId, opts.workspaceId)))
    .limit(1);

  if (!property) throw new PublicationError(['That property is not in this workspace.']);

  const [profile] = await tx
    .select({ contactEmail: professionalProfiles.contactEmail })
    .from(professionalProfiles)
    .where(eq(professionalProfiles.workspaceId, opts.workspaceId))
    .limit(1);

  const details = await tx
    .select({
      key: propertyDetails.key,
      value: propertyDetails.value,
      sourceType: propertyDetails.sourceType,
      approvalState: propertyDetails.approvalState,
      isPublic: propertyDetails.isPublic,
    })
    .from(propertyDetails)
    .where(eq(propertyDetails.propertyId, property.id));

  const media = await tx
    .select({
      storageKey: propertyMedia.storageKey,
      kind: propertyMedia.kind,
      isCover: propertyMedia.isCover,
      visibility: propertyMedia.visibility,
      sortOrder: propertyMedia.sortOrder,
      width: propertyMedia.width,
      height: propertyMedia.height,
    })
    .from(propertyMedia)
    .where(eq(propertyMedia.propertyId, property.id));

  const publicMediaCount = media.filter((m) => m.visibility === 'public').length;

  const blockers = publicationBlockers({
    title: property.title,
    city: property.city,
    region: property.region,
    contactEmail: profile?.contactEmail ?? null,
    rightsAttestedAt: property.rightsAttestedAt,
    publicMediaCount: opts.allowWithoutPhotos ? 1 : publicMediaCount,
    locationPrecision: property.locationPrecision,
    unreviewedPublicFactCount: details.filter(
      (detail) =>
        detail.isPublic &&
        detail.approvalState === 'unreviewed' &&
        (detail.value ?? '').trim().length > 0,
    ).length,
  });

  if (blockers.length) throw new PublicationError(blockers);

  const publishedAt = new Date();
  const snapshot = buildSnapshot({
    property: {
      id: property.id,
      workspaceId: property.workspaceId,
      slug: property.slug,
      title: property.title,
      description: property.description,
      propertyType: property.propertyType,
      availabilityStatus: property.availabilityStatus,
      addressLine: property.addressLine,
      addressVisible: property.addressVisible,
      city: property.city,
      region: property.region,
      country: property.country,
      locationPrecision: property.locationPrecision,
      priceAmount: property.priceAmount,
      currency: property.currency,
      priceVisibility: property.priceVisibility,
      rightsAttestedAt: property.rightsAttestedAt,
    },
    details,
    media,
    contactEmail: profile?.contactEmail ?? null,
    publishedAt,
  });

  const [latest] = await tx
    .select({ version: propertyPublications.version })
    .from(propertyPublications)
    .where(eq(propertyPublications.propertyId, property.id))
    .orderBy(desc(propertyPublications.version))
    .limit(1);

  const version = (latest?.version ?? 0) + 1;

  await tx.insert(propertyPublications).values({
    propertyId: property.id,
    version,
    snapshot: snapshot as unknown as Record<string, unknown>,
    publishedBy: opts.actorId,
    publishedAt,
  });

  await tx
    .update(properties)
    .set({ publicationStatus: 'published', publishedAt, updatedAt: publishedAt })
    .where(and(eq(properties.id, property.id), eq(properties.workspaceId, opts.workspaceId)));

  await recordAudit(
    {
      workspaceId: opts.workspaceId,
      actorId: opts.actorId,
      action: 'property.published',
      targetType: 'property',
      targetId: property.id,
      metadata: { version, publicFacts: snapshot.facts.length, publicMedia: snapshot.media.length },
    },
    tx,
  );

  return { snapshot, version };
}

export async function unpublishProperty(
  tx: TenantTx,
  opts: { propertyId: string; workspaceId: string; actorId: string; archive?: boolean },
): Promise<void> {
  const now = new Date();

  // Closing the publication is what stops the page; the status change alone would leave a
  // readable snapshot behind if anything queried it directly.
  await tx
    .update(propertyPublications)
    .set({ unpublishedAt: now })
    .where(
      and(
        eq(propertyPublications.propertyId, opts.propertyId),
        isNull(propertyPublications.unpublishedAt),
      ),
    );

  await tx
    .update(properties)
    .set({
      publicationStatus: opts.archive ? 'archived' : 'unpublished',
      updatedAt: now,
    })
    .where(and(eq(properties.id, opts.propertyId), eq(properties.workspaceId, opts.workspaceId)));

  await recordAudit(
    {
      workspaceId: opts.workspaceId,
      actorId: opts.actorId,
      action: opts.archive ? 'property.archived' : 'property.unpublished',
      targetType: 'property',
      targetId: opts.propertyId,
    },
    tx,
  );
}
