import { describe, expect, it } from 'vitest';
import {
  buildSnapshot,
  formatPrice,
  isPublishableFact,
  locationLabel,
  resolvePrice,
  type SnapshotInput,
} from '../lib/publication/snapshot';

const baseProperty: SnapshotInput['property'] = {
  id: '11111111-1111-1111-1111-111111111111',
  workspaceId: '22222222-2222-2222-2222-222222222222',
  slug: 'halden-house',
  title: 'Halden House',
  description: 'A four-bedroom house with a walled garden.',
  propertyType: 'residential',
  availabilityStatus: 'available',
  addressLine: '14 Halden Road',
  addressVisible: false,
  city: 'Harbour district',
  region: 'Northbank',
  country: 'United Kingdom',
  locationPrecision: 'approximate',
  priceAmount: '480000.00',
  currency: 'GBP',
  priceVisibility: 'public',
  rightsAttestedAt: new Date('2026-11-01T10:00:00Z'),
};

const approvedPublic = {
  key: 'Bedrooms',
  value: '4',
  sourceType: 'manual',
  approvalState: 'approved',
  isPublic: true,
};

const input = (overrides: Partial<SnapshotInput> = {}): SnapshotInput => ({
  property: baseProperty,
  details: [approvedPublic],
  media: [
    {
      storageKey: 'w/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333/photo.jpg',
      kind: 'photo',
      isCover: false,
      visibility: 'public',
      sortOrder: 2,
      width: 1600,
      height: 1200,
    },
    {
      storageKey: 'w/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333/cover.jpg',
      kind: 'photo',
      isCover: true,
      visibility: 'public',
      sortOrder: 5,
      width: 1600,
      height: 1200,
    },
  ],
  contactEmail: 'hello@northaven.example',
  publishedAt: new Date('2026-11-02T09:00:00Z'),
  ...overrides,
});

describe('snapshot privacy boundary', () => {
  it('drops facts that are not approved, not public, or empty', () => {
    const snapshot = buildSnapshot(
      input({
        details: [
          approvedPublic,
          { key: 'Zoning', value: 'Residential', sourceType: 'manual', approvalState: 'unreviewed', isPublic: true },
          { key: 'Parcel ID', value: '017-234-11', sourceType: 'document', approvalState: 'approved', isPublic: false },
          { key: 'Flood zone', value: '   ', sourceType: 'manual', approvalState: 'approved', isPublic: true },
        ],
      }),
    );

    expect(snapshot.facts.map((f) => f.key)).toEqual(['Bedrooms']);
  });

  it('never renders an unknown field as a negative claim', () => {
    const snapshot = buildSnapshot(input({ details: [] }));
    expect(snapshot.facts).toHaveLength(0);
    // Nothing in the buyer-facing content claims a field is empty or negative.
    expect(JSON.stringify({ facts: snapshot.facts, description: snapshot.description })).not.toMatch(
      /flood|zon(e|ing)/i,
    );
  });

  it('keeps private media out of the snapshot entirely', () => {
    const snapshot = buildSnapshot(
      input({
        media: [
          {
            storageKey: 'w/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333/secret.pdf',
            kind: 'document',
            isCover: false,
            visibility: 'private',
            sortOrder: 1,
            width: null,
            height: null,
          },
        ],
      }),
    );
    expect(snapshot.media).toHaveLength(0);
  });

  it('puts the chosen cover first', () => {
    const snapshot = buildSnapshot(input());
    expect(snapshot.media[0].isCover).toBe(true);
  });

  it('hides a street address unless the owner allows it and the pin is exact', () => {
    expect(buildSnapshot(input()).place.addressLine).toBeNull();
    expect(
      buildSnapshot(
        input({ property: { ...baseProperty, addressVisible: true, locationPrecision: 'approximate' } }),
      ).place.addressLine,
    ).toBeNull();
    expect(
      buildSnapshot(
        input({ property: { ...baseProperty, addressVisible: true, locationPrecision: 'exact' } }),
      ).place.addressLine,
    ).toBe('14 Halden Road');
  });
});

describe('price handling', () => {
  it('never leaks an amount when the seller chose "on request"', () => {
    const snapshot = buildSnapshot(
      input({ property: { ...baseProperty, priceVisibility: 'on_request' } }),
    );
    expect(snapshot.price).toEqual({ visibility: 'on_request', amount: null, currency: null });
    expect(JSON.stringify(snapshot)).not.toContain('480000');
  });

  it('treats a public price with no amount as "on request", not zero', () => {
    const price = resolvePrice({ ...baseProperty, priceAmount: null });
    expect(price.visibility).toBe('on_request');
    expect(formatPrice(price)).toBe('Price on request');
  });

  it('groups thousands and keeps the currency', () => {
    const price = resolvePrice(baseProperty);
    expect(formatPrice(price, { GBP: '£' })).toBe('£480,000');
  });

  it('labels approximate locations in words', () => {
    const snapshot = buildSnapshot(input());
    expect(locationLabel(snapshot)).toBe('Harbour district, Northbank, United Kingdom · approximate location');
  });
});

describe('fact eligibility', () => {
  it('requires approval AND public AND a value', () => {
    expect(isPublishableFact(approvedPublic)).toBe(true);
    expect(isPublishableFact({ ...approvedPublic, approvalState: 'rejected' })).toBe(false);
    expect(isPublishableFact({ ...approvedPublic, isPublic: false })).toBe(false);
    expect(isPublishableFact({ ...approvedPublic, value: '' })).toBe(false);
  });

  it('preserves parcel numbers with leading zeros', () => {
    const snapshot = buildSnapshot(
      input({
        details: [
          { key: 'APN', value: '017-234-11', sourceType: 'manual', approvalState: 'approved', isPublic: true },
          { key: 'APN 2', value: '0017', sourceType: 'manual', approvalState: 'approved', isPublic: true },
        ],
      }),
    );
    expect(snapshot.facts.map((f) => f.value)).toEqual(['017-234-11', '0017']);
  });
});
