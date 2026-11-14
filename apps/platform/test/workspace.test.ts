import { describe, expect, it } from 'vitest';
import { formatMoney, priceLabel, recordCompleteness, statusLabel, timeAgo, typeLabel } from '../lib/format';
import { createPropertySchema, inviteMemberSchema, updatePropertySchema } from '../lib/validation/workspace';

describe('money', () => {
  it('groups and keeps cents only when they mean something', () => {
    expect(formatMoney('480000.00', 'GBP')).toBe('£480,000');
    expect(formatMoney('480000.50', 'GBP')).toBe('£480,000.50');
    expect(formatMoney('1150000', 'USD')).toBe('$1,150,000');
  });

  it('falls back to a currency code rather than guessing a symbol', () => {
    expect(formatMoney('1000', 'SEK')).toBe('SEK 1,000');
  });

  it('never renders a hidden price, and says on request when asked to', () => {
    expect(priceLabel({ priceAmount: '1', currency: 'GBP', priceVisibility: 'hidden' })).toBe('');
    expect(priceLabel({ priceAmount: '1', currency: 'GBP', priceVisibility: 'on_request' })).toBe(
      'Price on request',
    );
  });

  it('does not turn a missing amount into zero', () => {
    expect(priceLabel({ priceAmount: null, currency: null, priceVisibility: 'public' })).toBe(
      'Price on request',
    );
  });
});

describe('relative time', () => {
  const now = new Date('2026-11-04T12:00:00Z');

  it('describes recent moments without false precision', () => {
    expect(timeAgo(new Date('2026-11-04T11:59:40Z'), now)).toBe('Just now');
    expect(timeAgo(new Date('2026-11-04T11:30:00Z'), now)).toBe('30 min ago');
    expect(timeAgo(new Date('2026-11-04T09:00:00Z'), now)).toBe('3 hours ago');
    expect(timeAgo(new Date('2026-11-03T12:00:00Z'), now)).toBe('Yesterday');
    expect(timeAgo(new Date('2026-10-01T12:00:00Z'), now)).toBe('A month ago');
  });

  it('handles a missing date without inventing one', () => {
    expect(timeAgo(null, now)).toBe('Never');
  });
});

describe('record completeness', () => {
  const complete = {
    title: 'Halden House',
    city: 'Harbour district',
    region: '',
    description: 'A four-bedroom house with a walled garden and a service charge.',
    approvedPublicFacts: 4,
    publicMedia: 3,
    contactEmail: 'hello@northaven.example',
    rightsAttested: true,
  };

  it('is a percentage of what a buyer page actually needs', () => {
    expect(recordCompleteness(complete)).toBe(100);
  });

  it('does not count an unapproved fact or a private photo', () => {
    expect(recordCompleteness({ ...complete, approvedPublicFacts: 0, publicMedia: 0 })).toBeLessThan(100);
  });

  it('starts low for a bare record', () => {
    expect(
      recordCompleteness({
        title: 'Elm Court',
        approvedPublicFacts: 0,
        publicMedia: 0,
        rightsAttested: false,
      }),
    ).toBeLessThan(30);
  });
});

describe('labels', () => {
  it('reads like a person wrote them', () => {
    expect(typeLabel('residential_land')).toBe('Vacant land');
    expect(typeLabel('SFR')).toBe('Single-family');
    expect(statusLabel('needs_review')).toBe('Needs review');
    expect(statusLabel('unpublished')).toBe('Unpublished');
  });
});

describe('property input', () => {
  const valid = {
    propertyId: '11111111-1111-4111-8111-111111111111',
    title: 'Halden House',
    slug: 'halden-house',
    description: 'Four bedrooms, walled garden.',
    propertyType: 'SFR',
    addressLine: '14 Halden Road',
    postalCode: '78701',
    locationDisclosure: 'area',
    city: 'Harbour district',
    region: 'Northbank',
    country: 'United Kingdom',
    locationPrecision: 'approximate',
    priceAmount: '480000.00',
    currency: 'gbp',
    priceVisibility: 'public',
    availabilityStatus: 'available',
    showOnPortfolio: true,
  };

  it('accepts a normal record and normalises currency', () => {
    const parsed = updatePropertySchema.parse(valid);
    expect(parsed.currency).toBe('GBP');
    expect(parsed.locationDisclosure).toBe('area');
  });

  it('rejects a non-uuid property id, so a guessed id cannot be shaped past validation', () => {
    expect(updatePropertySchema.safeParse({ ...valid, propertyId: 'halden-house' }).success).toBe(false);
  });

  it('rejects money with more than two decimals', () => {
    expect(updatePropertySchema.safeParse({ ...valid, priceAmount: '480000.999' }).success).toBe(false);
  });

  it('defaults an unstated location precision to unknown', () => {
    const parsed = updatePropertySchema.parse({ ...valid, locationPrecision: undefined });
    expect(parsed.locationPrecision).toBe('unknown');
  });
});

describe('creation input', () => {
  it('needs a title and a known type', () => {
    expect(createPropertySchema.safeParse({ title: 'Ha', propertyType: 'SFR' }).success).toBe(false);
    expect(
      createPropertySchema.safeParse({ title: 'Halden House', propertyType: 'castle' }).success,
    ).toBe(false);
  });

  it('keeps parcel numbers as typed', () => {
    const parsed = createPropertySchema.parse({
      title: 'Halden House',
      propertyType: 'SFR',
      apns: ['0017', '017-234-11'],
    });
    expect(parsed.apns).toEqual(['0017', '017-234-11']);
  });
});

describe('member invitations', () => {
  it('cannot invite someone as owner through the member form', () => {
    expect(inviteMemberSchema.safeParse({ email: 'a@b.co', role: 'owner' }).success).toBe(false);
    expect(inviteMemberSchema.safeParse({ email: 'a@b.co', role: 'editor' }).success).toBe(true);
  });
});
