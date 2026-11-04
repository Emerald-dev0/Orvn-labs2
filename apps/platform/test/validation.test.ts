import { describe, expect, it } from 'vitest';
import { inquirySchema } from '../lib/validation/inquiry';
import { propertyDraftSchema, slugify } from '../lib/validation/property';
import { usernameField, RESERVED_USERNAMES } from '../lib/validation/common';

const validInquiry = {
  propertySlug: 'halden-house',
  name: 'Ada',
  email: 'ada@example.com',
  phone: '',
  message: 'Is the garden included in the title?',
  consent: 'on',
  requestToken: 'abcdefghijklmnop1234',
  website: '',
};

describe('inquiry form', () => {
  it('accepts a well-formed, consented question', () => {
    expect(inquirySchema.safeParse(validInquiry).success).toBe(true);
  });

  it('requires explicit consent', () => {
    const { consent, ...withoutConsent } = validInquiry;
    expect(inquirySchema.safeParse(withoutConsent).success).toBe(false);
  });

  it('rejects a message that is only a few characters', () => {
    expect(inquirySchema.safeParse({ ...validInquiry, message: 'hi' }).success).toBe(false);
  });

  it('rejects a request token that could be a URL or injection attempt', () => {
    expect(
      inquirySchema.safeParse({ ...validInquiry, requestToken: '../../etc/passwd' }).success,
    ).toBe(false);
  });

  it('accepts international phone formatting and an empty phone', () => {
    expect(inquirySchema.safeParse({ ...validInquiry, phone: '+44 20 7946 0123' }).success).toBe(true);
    expect(inquirySchema.safeParse({ ...validInquiry, phone: '' }).success).toBe(true);
  });
});

describe('property draft', () => {
  it('keeps parcel numbers as strings, leading zeros intact', () => {
    const parsed = propertyDraftSchema.parse({
      title: 'Halden House',
      propertyType: 'residential',
      apns: ['0017', '017-234-11'],
    });
    expect(parsed.apns).toEqual(['0017', '017-234-11']);
    expect(typeof parsed.apns[0]).toBe('string');
  });

  it('defaults location precision to unknown rather than guessing', () => {
    const parsed = propertyDraftSchema.parse({ title: 'Halden House', propertyType: 'residential' });
    expect(parsed.locationPrecision).toBe('unknown');
  });

  it('rejects a float-like amount with more than two decimals', () => {
    expect(
      propertyDraftSchema.safeParse({
        title: 'Halden House',
        propertyType: 'residential',
        priceAmount: '480000.999',
      }).success,
    ).toBe(false);
  });

  it('slugifies a title predictably', () => {
    expect(slugify('Halden House — 4 bed, Harbour')).toBe('halden-house-4-bed-harbour');
  });
});

describe('usernames', () => {
  it('rejects reserved routes so a workspace cannot shadow the product', () => {
    for (const reserved of ['dashboard', 'api', 'w', 'settings']) {
      expect(usernameField.safeParse(reserved).success).toBe(false);
    }
  });

  it('accepts a normal handle', () => {
    expect(usernameField.safeParse('northaven').success).toBe(true);
    expect(usernameField.safeParse('north-aven-2').success).toBe(true);
  });

  it('covers the routes the app actually serves', () => {
    for (const route of ['dashboard', 'properties', 'website', 'inquiries', 'analytics', 'settings']) {
      expect(RESERVED_USERNAMES.has(route)).toBe(true);
    }
  });
});
