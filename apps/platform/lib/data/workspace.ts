import { and, asc, desc, eq, gte, ne, sql } from 'drizzle-orm';
import { withUserDb } from '../db/tenant';
import {
  analyticsEvents,
  auditEvents,
  inquiries,
  memberships,
  professionalProfiles,
  properties,
  propertyDetails,
  propertyMedia,
  propertyPublications,
  user,
  workspaces,
} from '../../db/schema';
import { priceLabel, recordCompleteness, timeAgo, typeLabel, placeLabel } from '../format';
import { publicationBlockers } from '../validation/property';

/**
 * Tenant read models.
 *
 * Every function takes the caller's user id and the workspace id that `requireWorkspace()`
 * resolved. Neither comes from a form, a URL or a cookie. The query runs inside `withUserDb`,
 * so Postgres checks the same membership again.
 *
 * These shapes are what the workspace screens render. They are deliberately narrow: the UI
 * never receives a row it has no use for, which keeps private columns from leaking into a
 * component by accident.
 */

export type FactView = {
  id: string;
  key: string;
  value: string;
  source: string;
  sourceType: string;
  state: 'approved' | 'unreviewed' | 'rejected' | 'unknown';
  public: boolean;
};

export type PropertyCard = {
  id: string;
  title: string;
  place: string;
  type: string;
  price: string;
  priceVisibility: string;
  status: string;
  availability: string;
  cover: string | null;
  views: number;
  inquiries: number;
  updated: string;
  updatedAt: string;
  completeness: number;
  nextAction: string;
  slug: string;
};

export type PropertyDetailView = PropertyCard & {
  description: string;
  addressLine: string;
  addressVisible: boolean;
  locationPrecision: string;
  city: string;
  region: string;
  country: string;
  priceAmount: string;
  currency: string;
  facts: FactView[];
  media: { id: string; key: string; kind: string; visibility: string; isCover: boolean }[];
  publication: { version: number; publishedAt: string; publicFacts: number } | null;
  rightsAttestedAt: string | null;
  showOnPortfolio: boolean;
  blockers: string[];
  slugPreview: string;
};

export type InquiryCard = {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string | null;
  property: string;
  message: string;
  when: string;
  status: string;
  createdAt: string;
};

export type ActivityItem = { id: string; text: string; detail: string; when: string };

export type Overview = {
  stats: { label: string; value: string; delta: string; trend: string; note: string }[];
  properties: PropertyCard[];
  inquiries: InquiryCard[];
  activity: ActivityItem[];
};

const approvedPublicFact = sql<number>`count(*) filter (where ${propertyDetails.approvalState} = 'approved' and ${propertyDetails.isPublic} = true and length(trim(coalesce(${propertyDetails.value}, ''))) > 0)`;
const publicMediaCount = sql<number>`count(*) filter (where ${propertyMedia.visibility} = 'public')`;

async function countsFor(
  tx: Parameters<Parameters<typeof withUserDb>[1]>[0],
  workspaceId: string,
): Promise<{
  views: Map<string, number>;
  inquiries: Map<string, number>;
  facts: Map<string, number>;
  media: Map<string, number>;
}> {
  const [viewRows, inquiryRows, factRows, mediaRows] = await Promise.all([
    tx
      .select({ propertyId: analyticsEvents.propertyId, total: sql<number>`count(*)::int` })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.workspaceId, workspaceId),
          eq(analyticsEvents.type, 'property_view'),
          eq(analyticsEvents.isBot, false),
        ),
      )
      .groupBy(analyticsEvents.propertyId),
    tx
      .select({ propertyId: inquiries.propertyId, total: sql<number>`count(*)::int` })
      .from(inquiries)
      .where(and(eq(inquiries.workspaceId, workspaceId), ne(inquiries.status, 'archived')))
      .groupBy(inquiries.propertyId),
    tx
      .select({ propertyId: propertyDetails.propertyId, total: approvedPublicFact })
      .from(propertyDetails)
      .groupBy(propertyDetails.propertyId),
    tx
      .select({ propertyId: propertyMedia.propertyId, total: publicMediaCount })
      .from(propertyMedia)
      .groupBy(propertyMedia.propertyId),
  ]);

  const toMap = (rows: { propertyId: string | null; total: number }[]) => {
    const map = new Map<string, number>();
    for (const row of rows) if (row.propertyId) map.set(row.propertyId, Number(row.total));
    return map;
  };

  return {
    views: toMap(viewRows),
    inquiries: toMap(inquiryRows as { propertyId: string | null; total: number }[]),
    facts: toMap(factRows as { propertyId: string | null; total: number }[]),
    media: toMap(mediaRows as { propertyId: string | null; total: number }[]),
  };
}

function buildCard(
  row: typeof properties.$inferSelect,
  extra: { views: number; inquiries: number; publicFacts: number; publicMedia: number; contactEmail: string | null },
): PropertyCard {
  const completeness = recordCompleteness({
    title: row.title,
    city: row.city,
    region: row.region,
    description: row.description,
    approvedPublicFacts: extra.publicFacts,
    publicMedia: extra.publicMedia,
    contactEmail: extra.contactEmail,
    rightsAttested: Boolean(row.rightsAttestedAt),
  });

  const blockers = publicationBlockers({
    title: row.title,
    city: row.city,
    region: row.region,
    contactEmail: extra.contactEmail,
    rightsAttestedAt: row.rightsAttestedAt,
    publicMediaCount: extra.publicMedia,
    locationPrecision: row.locationPrecision,
  });

  let nextAction = 'Nothing waiting.';
  if (blockers.length > 0) nextAction = blockers[0];
  else if (row.publicationStatus === 'draft') nextAction = 'Ready to publish when you are.';
  else if (row.publicationStatus === 'published') {
    nextAction = `Published ${timeAgo(row.publishedAt)}.`;
  }

  return {
    id: row.id,
    title: row.title,
    place: placeLabel({ city: row.city, region: row.region }),
    type: typeLabel(row.propertyType),
    price: priceLabel({
      priceAmount: row.priceAmount,
      currency: row.currency,
      priceVisibility: row.priceVisibility,
    }),
    priceVisibility: row.priceVisibility,
    status: row.publicationStatus,
    availability: row.availabilityStatus,
    cover: null,
    views: extra.views,
    inquiries: extra.inquiries,
    updated: timeAgo(row.updatedAt),
    updatedAt: row.updatedAt.toISOString(),
    completeness,
    nextAction,
    slug: row.slug,
  };
}

export async function listPropertyCards(userId: string, workspaceId: string): Promise<PropertyCard[]> {
  return withUserDb(userId, async (tx) => {
    const rows = await tx
      .select()
      .from(properties)
      .where(eq(properties.workspaceId, workspaceId))
      .orderBy(desc(properties.updatedAt));

    if (rows.length === 0) return [];

    const [counts, profile, covers] = await Promise.all([
      countsFor(tx, workspaceId),
      tx
        .select({ contactEmail: professionalProfiles.contactEmail })
        .from(professionalProfiles)
        .where(eq(professionalProfiles.workspaceId, workspaceId))
        .limit(1),
      tx
        .select({ propertyId: propertyMedia.propertyId, key: propertyMedia.storageKey })
        .from(propertyMedia)
        .where(eq(propertyMedia.isCover, true)),
    ]);

    const coverByProperty = new Map(covers.map((c) => [c.propertyId, c.key]));
    const contactEmail = profile[0]?.contactEmail ?? null;

    return rows.map((row) => ({
      ...buildCard(row, {
        views: counts.views.get(row.id) ?? 0,
        inquiries: counts.inquiries.get(row.id) ?? 0,
        publicFacts: counts.facts.get(row.id) ?? 0,
        publicMedia: counts.media.get(row.id) ?? 0,
        contactEmail,
      }),
      cover: coverByProperty.get(row.id) ?? null,
    }));
  });
}

export async function getPropertyDetail(
  userId: string,
  workspaceId: string,
  propertyId: string,
): Promise<PropertyDetailView | null> {
  return withUserDb(userId, async (tx) => {
    const [row] = await tx
      .select()
      .from(properties)
      .where(and(eq(properties.id, propertyId), eq(properties.workspaceId, workspaceId)))
      .limit(1);

    if (!row) return null;

    const [details, media, publication, profile, counts, workspaceRow] = await Promise.all([
      tx
        .select()
        .from(propertyDetails)
        .where(eq(propertyDetails.propertyId, propertyId))
        .orderBy(asc(propertyDetails.createdAt)),
      tx
        .select()
        .from(propertyMedia)
        .where(eq(propertyMedia.propertyId, propertyId))
        .orderBy(asc(propertyMedia.sortOrder)),
      tx
        .select({
          version: propertyPublications.version,
          publishedAt: propertyPublications.publishedAt,
          snapshot: propertyPublications.snapshot,
        })
        .from(propertyPublications)
        .where(eq(propertyPublications.propertyId, propertyId))
        .orderBy(desc(propertyPublications.version))
        .limit(1),
      tx
        .select({ contactEmail: professionalProfiles.contactEmail })
        .from(professionalProfiles)
        .where(eq(professionalProfiles.workspaceId, workspaceId))
        .limit(1),
      countsFor(tx, workspaceId),
      tx.select({ username: workspaces.username }).from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1),
    ]);

    const publicFacts = details.filter(
      (fact) => fact.approvalState === 'approved' && fact.isPublic && fact.value?.trim(),
    ).length;
    const visibleMedia = media.filter((item) => item.visibility === 'public');
    const contactEmail = profile[0]?.contactEmail ?? null;

    const card = buildCard(row, {
      views: counts.views.get(row.id) ?? 0,
      inquiries: counts.inquiries.get(row.id) ?? 0,
      publicFacts,
      publicMedia: visibleMedia.length,
      contactEmail,
    });

    const latest = publication[0];
    const snapshot = latest?.snapshot as { facts?: unknown[] } | undefined;

    return {
      ...card,
      description: row.description ?? '',
      addressLine: row.addressLine ?? '',
      addressVisible: row.addressVisible,
      locationPrecision: row.locationPrecision,
      city: row.city ?? '',
      region: row.region ?? '',
      country: row.country ?? '',
      priceAmount: row.priceAmount ?? '',
      currency: row.currency ?? '',
      facts: details.map((fact) => ({
        id: fact.id,
        key: fact.key,
        value: fact.value ?? '',
        source: fact.sourceReference || humanSource(fact.sourceType),
        sourceType: fact.sourceType,
        state: fact.approvalState as FactView['state'],
        public: fact.isPublic,
      })),
      media: media.map((item) => ({
        id: item.id,
        key: item.storageKey,
        kind: item.kind,
        visibility: item.visibility,
        isCover: item.isCover,
      })),
      publication: latest
        ? {
            version: latest.version,
            publishedAt: latest.publishedAt.toISOString(),
            publicFacts: Array.isArray(snapshot?.facts) ? snapshot!.facts!.length : 0,
          }
        : null,
      rightsAttestedAt: row.rightsAttestedAt ? row.rightsAttestedAt.toISOString() : null,
      showOnPortfolio: row.showOnPortfolio,
      blockers: publicationBlockers({
        title: row.title,
        city: row.city,
        region: row.region,
        contactEmail,
        rightsAttestedAt: row.rightsAttestedAt,
        publicMediaCount: visibleMedia.length,
        locationPrecision: row.locationPrecision,
      }),
      cover: media.find((item) => item.isCover)?.storageKey ?? media[0]?.storageKey ?? null,
      slugPreview: `${workspaceRow[0]?.username ?? ''}/${row.slug}`,
    };
  });
}

function humanSource(sourceType: string): string {
  const labels: Record<string, string> = {
    manual: 'You',
    document: 'Document',
    extraction: 'Extracted',
    import: 'Imported',
  };
  return labels[sourceType] ?? 'Source';
}

export async function listInquiryCards(userId: string, workspaceId: string): Promise<InquiryCard[]> {
  return withUserDb(userId, async (tx) => {
    const rows = await tx
      .select({
        id: inquiries.id,
        name: inquiries.name,
        email: inquiries.email,
        phone: inquiries.phone,
        propertyId: inquiries.propertyId,
        message: inquiries.message,
        status: inquiries.status,
        createdAt: inquiries.createdAt,
        propertyTitle: properties.title,
      })
      .from(inquiries)
      .leftJoin(properties, eq(properties.id, inquiries.propertyId))
      .where(eq(inquiries.workspaceId, workspaceId))
      .orderBy(desc(inquiries.createdAt))
      .limit(200);

    return rows.map((row) => ({
      id: row.id,
      name: row.name ?? 'Someone',
      email: row.email,
      phone: row.phone ?? '',
      propertyId: row.propertyId,
      property: row.propertyTitle ?? 'A property that has since been removed',
      message: row.message,
      when: timeAgo(row.createdAt),
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    }));
  });
}

export async function getOverview(userId: string, workspaceId: string): Promise<Overview> {
  const [cards, recentInquiries, activity] = await Promise.all([
    listPropertyCards(userId, workspaceId),
    listInquiryCards(userId, workspaceId),
    withUserDb(userId, async (tx) =>
      tx
        .select({
          id: auditEvents.id,
          action: auditEvents.action,
          createdAt: auditEvents.createdAt,
          metadata: auditEvents.metadata,
        })
        .from(auditEvents)
        .where(eq(auditEvents.workspaceId, workspaceId))
        .orderBy(desc(auditEvents.createdAt))
        .limit(6),
    ),
  ]);

  const views = cards.reduce((total, card) => total + card.views, 0);
  const published = cards.filter((card) => card.status === 'published').length;
  const openInquiries = recentInquiries.filter((item) => item.status !== 'archived').length;

  const stats = [
    { label: 'Property views', value: views.toLocaleString('en-GB'), delta: '', trend: 'flat', note: 'all time' },
    {
      label: 'Inquiries',
      value: String(openInquiries),
      delta: '',
      trend: 'flat',
      note: openInquiries === 1 ? 'one to answer' : 'in the inbox',
    },
    {
      label: 'Published',
      value: String(published),
      delta: `of ${cards.length}`,
      trend: 'flat',
      note: 'properties live',
    },
    {
      label: 'Needs review',
      value: String(cards.filter((card) => card.status === 'needs_review').length),
      delta: '',
      trend: 'flat',
      note: 'waiting on you',
    },
  ];

  return {
    stats,
    properties: cards,
    inquiries: recentInquiries.slice(0, 4),
    activity: activity.map((row) => ({
      id: row.id,
      text: activityText(row.action),
      detail: (row.metadata as { detail?: string } | null)?.detail ?? '',
      when: timeAgo(row.createdAt),
    })),
  };
}

function activityText(action: string): string {
  const labels: Record<string, string> = {
    'property.published': 'Property published',
    'property.unpublished': 'Property unpublished',
    'property.archived': 'Property archived',
    'property.created': 'Property created',
    'property.updated': 'Property updated',
    'inquiry.received': 'Inquiry received',
    'inquiry.read': 'Inquiry marked read',
    'invitation.accepted': 'Invitation accepted',
    'workspace.created': 'Workspace created',
    'site.published': 'Website published',
  };
  return labels[action] ?? action;
}

export type AnalyticsSummary = {
  totals: { views: number; inquiries: number; published: number };
  series: { day: string; property: number; site: number }[];
  byProperty: { id: string; title: string; views: number; inquiries: number; rate: string }[];
  sources: { label: string; percent: number }[];
};

export async function getAnalytics(userId: string, workspaceId: string, days = 30): Promise<AnalyticsSummary> {
  return withUserDb(userId, async (tx) => {
    const since = new Date(Date.now() - days * 86_400_000);

    const [eventRows, cards, countRows] = await Promise.all([
      tx
        .select({
          propertyId: analyticsEvents.propertyId,
          referrer: analyticsEvents.referrer,
          createdAt: analyticsEvents.createdAt,
        })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.workspaceId, workspaceId),
            eq(analyticsEvents.type, 'property_view'),
            eq(analyticsEvents.isBot, false),
            gte(analyticsEvents.createdAt, since),
          ),
        )
        .limit(5000),
      listPropertyCards(userId, workspaceId),
      tx
        .select({ total: sql<number>`count(*)::int` })
        .from(inquiries)
        .where(and(eq(inquiries.workspaceId, workspaceId), gte(inquiries.createdAt, since))),
    ]);

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const seriesMap = new Map<string, { day: string; property: number; site: number }>();
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(Date.now() - offset * 86_400_000);
      const label = dayLabels[date.getDay()];
      seriesMap.set(date.toISOString().slice(0, 10), { day: label, property: 0, site: 0 });
    }

    const byProperty = new Map<string, number>();
    const referrers = new Map<string, number>();

    for (const row of eventRows) {
      const key = row.createdAt.toISOString().slice(0, 10);
      const bucket = seriesMap.get(key);
      if (bucket) bucket.property += 1;
      if (row.propertyId) byProperty.set(row.propertyId, (byProperty.get(row.propertyId) ?? 0) + 1);

      const host = safeHost(row.referrer);
      referrers.set(host, (referrers.get(host) ?? 0) + 1);
    }

    const totalViews = eventRows.length;
    const sources = [...referrers.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, count]) => ({
        label,
        percent: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
      }));

    return {
      totals: {
        views: totalViews,
        inquiries: Number(countRows[0]?.total ?? 0),
        published: cards.filter((card) => card.status === 'published').length,
      },
      series: [...seriesMap.values()],
      byProperty: cards.slice(0, 6).map((card) => {
        const views = byProperty.get(card.id) ?? 0;
        const rate = views > 0 ? `${((card.inquiries / views) * 100).toFixed(1)}%` : '—';
        return { id: card.id, title: card.title, views, inquiries: card.inquiries, rate };
      }),
      sources: sources.length > 0 ? sources : [{ label: 'No referrer yet', percent: 0 }],
    };
  });
}

function safeHost(referrer: string | null): string {
  if (!referrer) return 'Direct';
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (!host) return 'Direct';
    return host === 'orvnlabs.com' ? 'Shared link' : host;
  } catch {
    return 'Unknown';
  }
}

export async function getProfile(userId: string, workspaceId: string) {
  return withUserDb(userId, async (tx) => {
    const [profile] = await tx
      .select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.workspaceId, workspaceId))
      .limit(1);
    const [workspaceRow] = await tx
      .select({ name: workspaces.name, username: workspaces.username })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);
    return { profile: profile ?? null, workspace: workspaceRow ?? null };
  });
}

export async function listMembers(userId: string, workspaceId: string) {
  return withUserDb(userId, async (tx) =>
    tx
      .select({
        id: memberships.id,
        role: memberships.role,
        name: user.name,
        email: user.email,
        joinedAt: memberships.createdAt,
      })
      .from(memberships)
      .innerJoin(user, eq(user.id, memberships.userId))
      .where(eq(memberships.workspaceId, workspaceId))
      .orderBy(asc(memberships.createdAt)),
  );
}

/** The badge in the sidebar: how many inquiries nobody has opened yet. */
export async function countUnreadInquiries(userId: string, workspaceId: string): Promise<number> {
  return withUserDb(userId, async (tx) => {
    const [row] = await tx
      .select({ total: sql<number>`count(*)::int` })
      .from(inquiries)
      .where(and(eq(inquiries.workspaceId, workspaceId), eq(inquiries.status, 'new')));
    return Number(row?.total ?? 0);
  });
}
