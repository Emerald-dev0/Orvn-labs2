/**
 * The publication snapshot is the contract between the private record and the public page.
 *
 * A published page renders from this object and never from live rows. That is what makes
 * "unpublish" meaningful: there is a stored, dated artefact of exactly what was public, and
 * editing a draft afterwards cannot change a page that a buyer already has open.
 *
 * Everything in here has already been filtered for visibility. The builder is pure, so the
 * filtering rules are unit-tested without a database.
 */

export const SNAPSHOT_VERSION = 1;

export const PUBLIC_DISCLAIMER =
  'Details supplied by the seller’s representative and not independently verified. ' +
  'Measurements, zoning and availability should be confirmed during due diligence.';

export type SnapshotFact = {
  key: string;
  value: string;
  /** Where the value came from: manual entry, a document, or an extraction run. */
  sourceType: string;
};

export type SnapshotMedia = {
  key: string;
  kind: string;
  isCover: boolean;
  width: number | null;
  height: number | null;
};

export type SnapshotPrice =
  | { visibility: 'public'; amount: string; currency: string }
  | { visibility: 'on_request'; amount: null; currency: null }
  | { visibility: 'hidden'; amount: null; currency: null };

export type PublicationSnapshot = {
  v: typeof SNAPSHOT_VERSION;
  propertyId: string;
  workspaceId: string;
  slug: string;
  title: string;
  description: string | null;
  propertyType: string;
  availability: string;
  place: {
    city: string | null;
    region: string | null;
    country: string | null;
    precision: 'exact' | 'approximate' | 'unknown';
    /** Only ever populated when the owner explicitly allows the street address. */
    addressLine: string | null;
  };
  price: SnapshotPrice;
  facts: SnapshotFact[];
  media: SnapshotMedia[];
  contactEmail: string | null;
  rightsAttestedAt: string | null;
  publishedAt: string;
  disclaimer: string;
};

type DetailRow = {
  key: string;
  value: string | null;
  sourceType: string;
  approvalState: string;
  isPublic: boolean;
};

type MediaRow = {
  storageKey: string;
  kind: string;
  isCover: boolean;
  visibility: string;
  sortOrder: number;
  width: number | null;
  height: number | null;
};

export type SnapshotInput = {
  property: {
    id: string;
    workspaceId: string;
    slug: string;
    title: string;
    description: string | null;
    propertyType: string;
    availabilityStatus: string;
    addressLine: string | null;
    addressVisible: boolean;
    city: string | null;
    region: string | null;
    country: string | null;
    locationPrecision: 'exact' | 'approximate' | 'unknown';
    priceAmount: string | null;
    currency: string | null;
    priceVisibility: 'public' | 'on_request' | 'hidden';
    rightsAttestedAt: Date | null;
  };
  details: DetailRow[];
  media: MediaRow[];
  contactEmail: string | null;
  publishedAt: Date;
};

/** A value only reaches a buyer when it was approved, marked public, and is actually there. */
export function isPublishableFact(row: DetailRow): boolean {
  return row.approvalState === 'approved' && row.isPublic === true && Boolean(row.value?.trim());
}

export function resolvePrice(property: SnapshotInput['property']): SnapshotPrice {
  if (property.priceVisibility === 'hidden') {
    return { visibility: 'hidden', amount: null, currency: null };
  }
  // "Price on request" is a decision, not a fallback for a missing number.
  if (property.priceVisibility === 'on_request') {
    return { visibility: 'on_request', amount: null, currency: null };
  }
  if (!property.priceAmount || !property.currency) {
    // A public price with no amount cannot be published as a price. Say "on request" rather
    // than rendering an empty figure that reads like zero.
    return { visibility: 'on_request', amount: null, currency: null };
  }
  return { visibility: 'public', amount: property.priceAmount, currency: property.currency };
}

export function buildSnapshot(input: SnapshotInput): PublicationSnapshot {
  const property = input.property;

  const facts = input.details
    .filter(isPublishableFact)
    .map((row) => ({ key: row.key, value: row.value!.trim(), sourceType: row.sourceType }));

  const media = input.media
    .filter((row) => row.visibility === 'public')
    .sort((a, b) => Number(b.isCover) - Number(a.isCover) || a.sortOrder - b.sortOrder)
    .map((row) => ({
      key: row.storageKey,
      kind: row.kind,
      isCover: row.isCover,
      width: row.width,
      height: row.height,
    }));

  const showAddress =
    property.addressVisible &&
    property.locationPrecision === 'exact' &&
    Boolean(property.addressLine?.trim());

  return {
    v: SNAPSHOT_VERSION,
    propertyId: property.id,
    workspaceId: property.workspaceId,
    slug: property.slug,
    title: property.title,
    description: property.description?.trim() || null,
    propertyType: property.propertyType,
    availability: property.availabilityStatus,
    place: {
      city: property.city,
      region: property.region,
      country: property.country,
      precision: property.locationPrecision,
      addressLine: showAddress ? property.addressLine!.trim() : null,
    },
    price: resolvePrice(property),
    facts,
    media,
    contactEmail: input.contactEmail,
    rightsAttestedAt: property.rightsAttestedAt ? property.rightsAttestedAt.toISOString() : null,
    publishedAt: input.publishedAt.toISOString(),
    disclaimer: PUBLIC_DISCLAIMER,
  };
}

/** "Approximate location" is a claim about the pin, and it is always stated in words. */
export function locationLabel(snapshot: PublicationSnapshot): string {
  const parts = [snapshot.place.city, snapshot.place.region, snapshot.place.country].filter(Boolean);
  const base = parts.join(', ') || 'Location on request';
  if (snapshot.place.precision === 'exact' && snapshot.place.addressLine) {
    return snapshot.place.addressLine;
  }
  return snapshot.place.precision === 'approximate' ? `${base} · approximate location` : base;
}

export function formatPrice(price: SnapshotPrice, currencySymbols: Record<string, string> = {}): string {
  if (price.visibility === 'hidden') return '';
  if (price.visibility === 'on_request') return 'Price on request';
  const symbol = currencySymbols[price.currency] ?? `${price.currency} `;
  const [whole, fraction = ''] = price.amount.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // 480000.00 reads as a spreadsheet. 480,000 reads as a price.
  const cents = fraction.replace(/0+$/, '');
  return `${symbol}${grouped}${cents ? `.${cents.padEnd(2, '0')}` : ''}`;
}
