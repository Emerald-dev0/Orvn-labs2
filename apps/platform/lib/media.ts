import { and, eq } from 'drizzle-orm';
import { databaseConfigured, withPublicDb } from './db/tenant';
import { properties, propertyMedia } from '../db/schema';
import { filesReleased } from './publication/visibility';

/**
 * The file authorisation boundary.
 *
 * A document marked private must stay unreachable even to somebody who knows the exact object
 * key (F08, T15). Storage is private, and this function is the only gate in front of it: the
 * row must be public *and* its property must be published *and* the publication not withdrawn.
 * RLS enforces the same rule on larei_public, so a bug here still fails closed.
 */

export type MediaDecision =
  | { allowed: true; key: string; contentType: string }
  | { allowed: false; reason: 'not_found' | 'not_public' | 'unpublished' | 'storage_unavailable' };

/** Keys are opaque and workspace-scoped; anything else is rejected before a query runs. */
export function isWellFormedStorageKey(key: string): boolean {
  return /^w\/[0-9a-f-]{36}\/[0-9a-f-]{36}\/[a-z0-9._-]{1,80}$/.test(key);
}

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  pdf: 'application/pdf',
};

export function contentTypeFor(key: string): string | null {
  const ext = key.split('.').pop()?.toLowerCase() ?? '';
  return CONTENT_TYPES[ext] ?? null;
}

export async function authoriseMediaRequest(storageKey: string): Promise<MediaDecision> {
  if (!isWellFormedStorageKey(storageKey)) return { allowed: false, reason: 'not_found' };

  // No database means nothing is published, so nothing is served. A preview build must not
  // turn a storage misconfiguration into a public file host.
  if (!databaseConfigured) return { allowed: false, reason: 'storage_unavailable' };

  const rows = await withPublicDb(async (tx) =>
    tx
      .select({
        key: propertyMedia.storageKey,
        visibility: propertyMedia.visibility,
        status: properties.publicationStatus,
      })
      .from(propertyMedia)
      .innerJoin(properties, eq(properties.id, propertyMedia.propertyId))
      .where(eq(propertyMedia.storageKey, storageKey))
      .limit(1),
  );

  const row = rows[0];
  if (!row) return { allowed: false, reason: 'not_found' };
  // The page gate decides first: an unpublished property releases no files at all.
  if (!filesReleased({ publicationStatus: row.status, showOnPortfolio: true })) {
    return { allowed: false, reason: 'unpublished' };
  }
  if (row.visibility !== 'public') return { allowed: false, reason: 'not_public' };

  const contentType = contentTypeFor(row.key);
  if (!contentType) return { allowed: false, reason: 'not_found' };

  return { allowed: true, key: row.key, contentType };
}
