import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { databaseConfigured, withPublicDb } from '../db/tenant';
import {
  properties,
  propertyPublications,
  professionalProfiles,
  workspaces,
} from '../../db/schema';
import type { PublicationSnapshot } from '../publication/snapshot';

/**
 * Read models for everything a visitor can see.
 *
 * These run as `larei_public`, a role that cannot read drafts, inquiries, unpublished files
 * or another workspace's rows even if this file is edited carelessly. The filters below are
 * therefore a second opinion, not the only one.
 */

export type PublicSite = {
  workspaceId: string;
  username: string;
  businessName: string;
  displayName: string | null;
  headline: string | null;
  bio: string | null;
  markets: string[];
  services: { title: string; body: string }[];
  contactEmail: string | null;
  contactPhone: string | null;
  accent: string | null;
  coverKey: string | null;
  logoKey: string | null;
  publishedAt: string | null;
};

export type PortfolioCard = {
  slug: string;
  title: string;
  priceLabel: string;
  availability: string;
  location: string;
  coverKey: string | null;
};

export async function getPublicSite(username: string): Promise<PublicSite | null> {
  if (!databaseConfigured) return null;

  return withPublicDb(async (tx) => {
    const rows = await tx
      .select({
        workspaceId: workspaces.id,
        username: workspaces.username,
        businessName: workspaces.name,
        displayName: professionalProfiles.displayName,
        headline: professionalProfiles.headline,
        bio: professionalProfiles.bio,
        markets: professionalProfiles.markets,
        services: professionalProfiles.services,
        contactEmail: professionalProfiles.contactEmail,
        contactPhone: professionalProfiles.contactPhone,
        showPhone: professionalProfiles.showPhone,
        accent: professionalProfiles.accent,
        coverKey: professionalProfiles.coverKey,
        logoKey: professionalProfiles.logoKey,
        publishedAt: professionalProfiles.publishedAt,
      })
      .from(workspaces)
      .innerJoin(professionalProfiles, eq(professionalProfiles.workspaceId, workspaces.id))
      .where(eq(workspaces.username, username.toLowerCase()))
      .limit(1);

    const row = rows[0];
    if (!row || !row.publishedAt) return null;

    return {
      workspaceId: row.workspaceId,
      username: row.username,
      businessName: row.businessName,
      displayName: row.displayName,
      headline: row.headline,
      bio: row.bio,
      markets: row.markets ?? [],
      services: row.services ?? [],
      contactEmail: row.contactEmail,
      contactPhone: row.showPhone ? row.contactPhone : null,
      accent: row.accent,
      coverKey: row.coverKey,
      logoKey: row.logoKey,
      publishedAt: row.publishedAt.toISOString(),
    } satisfies PublicSite;
  });
}

export async function getPublishedProperty(
  username: string,
  slug: string,
): Promise<{ snapshot: PublicationSnapshot; site: PublicSite; listed: boolean } | null> {
  const site = await getPublicSite(username);
  if (!site) return null;

  return withPublicDb(async (tx) => {
    const rows = await tx
      .select({ snapshot: propertyPublications.snapshot, listed: properties.showOnPortfolio })
      .from(properties)
      .innerJoin(propertyPublications, eq(propertyPublications.propertyId, properties.id))
      .where(
        and(
          eq(properties.workspaceId, site.workspaceId),
          eq(properties.slug, slug),
          eq(properties.publicationStatus, 'published'),
          isNull(propertyPublications.unpublishedAt),
        ),
      )
      .orderBy(desc(propertyPublications.version))
      .limit(1);

    const row = rows[0];
    const snapshot = row?.snapshot as unknown as PublicationSnapshot | undefined;
    if (!snapshot) return null;
    // A published page that is not on the portfolio is link-only: reachable, unlisted, and kept
    // out of search indexes. It is not confidential and must never be described as such.
    return { snapshot, site, listed: row.listed };
  });
}

export async function listPortfolio(workspaceId: string): Promise<PortfolioCard[]> {
  if (!databaseConfigured) return [];

  return withPublicDb(async (tx) => {
    const rows = await tx
      .select({
        slug: properties.slug,
        snapshot: propertyPublications.snapshot,
        publishedAt: propertyPublications.publishedAt,
      })
      .from(properties)
      .innerJoin(propertyPublications, eq(propertyPublications.propertyId, properties.id))
      .where(
        and(
          eq(properties.workspaceId, workspaceId),
          eq(properties.publicationStatus, 'published'),
          eq(properties.showOnPortfolio, true),
          isNull(propertyPublications.unpublishedAt),
        ),
      )
      .orderBy(desc(propertyPublications.publishedAt));

    const seen = new Set<string>();
    const cards: PortfolioCard[] = [];

    for (const row of rows) {
      if (seen.has(row.slug)) continue;
      seen.add(row.slug);
      const snapshot = row.snapshot as unknown as PublicationSnapshot;
      const place = [snapshot.place.city, snapshot.place.region].filter(Boolean).join(', ');
      cards.push({
        slug: snapshot.slug,
        title: snapshot.title,
        priceLabel:
          snapshot.price.visibility === 'public'
            ? `${snapshot.price.currency} ${snapshot.price.amount}`
            : snapshot.price.visibility === 'on_request'
              ? 'Price on request'
              : '',
        availability: snapshot.availability,
        location:
          snapshot.place.precision === 'approximate' && place ? `${place} · approximate` : place,
        coverKey: snapshot.media[0]?.key ?? null,
      });
    }

    return cards;
  });
}

/** True when a username is already taken. Case-insensitive, because URLs are. */
export async function usernameTaken(username: string): Promise<boolean> {
  const rows = await withPublicDb(async (tx) =>
    tx
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(sql`lower(${workspaces.username}) = ${username.toLowerCase()}`)
      .limit(1),
  );
  return rows.length > 0;
}
