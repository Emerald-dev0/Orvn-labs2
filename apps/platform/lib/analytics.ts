import { and, eq } from 'drizzle-orm';
import { withPublicDb } from './db/tenant';
import { analyticsEvents, properties } from '../db/schema';
import { hashKey } from './crypto';
import { serverEnv } from './env';

/**
 * Product analytics: counts, not identities.
 *
 * - No IP is stored. A daily-salted HMAC of address + user agent is kept only so a reload is
 *   not counted as a new person; the salt rotates, so the hash is useless across days.
 * - Link-preview fetchers (WhatsApp, iMessage, Slack) are recorded as bots. Otherwise every
 *   shared link would look like a visit from a buyer who never saw the page.
 * - The RLS policy only permits inserts for a published property, so a view cannot be
 *   attached to a draft by a crafted request.
 */

const BOT_PATTERN =
  /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|slack|discord|linkedinbot|twitterbot|embedly|preview|headless|lighthouse|pingdom|uptime|monitor/i;

export function isLikelyBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  return BOT_PATTERN.test(userAgent);
}

export function dayBucket(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export async function visitorHash(
  ip: string | null,
  userAgent: string | null,
  now = new Date(),
): Promise<string | null> {
  if (!ip) return null;
  const salt = serverEnv().ANALYTICS_HASH_SALT ?? 'development-salt-not-for-production';
  return hashKey([ip, userAgent ?? '', dayBucket(now)], salt);
}

export async function recordPropertyView(input: {
  username: string;
  slug: string;
  visitorHash: string | null;
  referrer: string | null;
  isBot: boolean;
}): Promise<void> {
  await withPublicDb(async (tx) => {
    const rows = await tx
      .select({ id: properties.id, workspaceId: properties.workspaceId })
      .from(properties)
      .where(and(eq(properties.slug, input.slug), eq(properties.publicationStatus, 'published')))
      .limit(1);

    const property = rows[0];
    if (!property) return;

    await tx.insert(analyticsEvents).values({
      workspaceId: property.workspaceId,
      propertyId: property.id,
      type: 'property_view',
      visitorHash: input.visitorHash,
      referrer: input.referrer,
      isBot: input.isBot,
    });
  });
}
