import { describe, expect, it } from 'vitest';
import {
  escapeHtml,
  formatPriceForPrint,
  humaniseFactKey,
  renderBuyerSummary,
  renderDealSheet,
} from '../lib/print/sheet';
import type { PublicationSnapshot } from '../lib/publication/snapshot';

const site = {
  businessName: 'Northaven Property Group',
  username: 'northaven',
  contactEmail: 'hello@northaven.test',
};

function snapshot(overrides: Partial<PublicationSnapshot> = {}): PublicationSnapshot {
  return {
    v: 1,
    propertyId: 'p1',
    workspaceId: 'w1',
    slug: 'halden-house',
    title: 'Halden House',
    description: 'A four-bedroom detached house with title documents on file.',
    propertyType: 'House',
    availability: 'available',
    place: { city: 'Harbour district', region: null, country: null, precision: 'approximate', addressLine: null },
    price: { visibility: 'public', amount: '480000.00', currency: 'USD' },
    facts: [
      { key: 'bedrooms', value: '4', sourceType: 'manual' },
      { key: 'internal_area', value: '620 m²', sourceType: 'document' },
    ],
    media: [{ key: 'w1/p1/front.jpg', kind: 'photo', isCover: true, width: 1600, height: 1067 }],
    contactEmail: 'hello@northaven.test',
    rightsAttestedAt: '2026-11-01T00:00:00.000Z',
    publishedAt: '2026-11-04T10:00:00.000Z',
    disclaimer: 'Details supplied by the seller’s representative and not independently verified.',
    ...overrides,
  } as PublicationSnapshot;
}

const pageUrl = 'https://orvnlabs.com/w/northaven/p/halden-house';

describe('deal sheet', () => {
  it('renders only what the snapshot contains', () => {
    const html = renderDealSheet(snapshot(), site, pageUrl);

    expect(html).toContain('Halden House');
    expect(html).toContain('Harbour district');
    expect(html).toContain('480,000');
    expect(html).toContain('Internal Area');
    expect(html).toContain('Bedrooms');
    expect(html).toContain('Northaven Property Group');
    expect(html).toContain(pageUrl);
    expect(html).toContain('not independently verified');
  });

  it('escapes user supplied values instead of injecting them', () => {
    const html = renderDealSheet(
      snapshot({
        title: '<script>alert(1)</script>',
        facts: [{ key: 'note', value: 'a "quoted" & <b>bold</b> value', sourceType: 'manual' }],
      }),
      site,
      pageUrl,
    );

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&quot;quoted&quot; &amp; &lt;b&gt;bold&lt;/b&gt;');
  });

  it('keeps a hidden price off the sheet and says so when the price is on request', () => {
    expect(formatPriceForPrint(snapshot({ price: { visibility: 'hidden', amount: null, currency: null } }))).toBe('');
    const onRequest = renderDealSheet(
      snapshot({ price: { visibility: 'on_request', amount: null, currency: null } }),
      site,
      pageUrl,
    );
    expect(onRequest).toContain('Price on request');
  });

  it('is marked noindex and print-ready', () => {
    const html = renderDealSheet(snapshot(), site, pageUrl);
    expect(html).toContain('noindex');
    expect(html).toContain('@page');
    expect(html).toContain('Save as PDF');
  });

  it('leaves a missing photo as a stated gap rather than a broken image', () => {
    const html = renderDealSheet(snapshot({ media: [] }), site, pageUrl);
    expect(html).toContain('No photo published');
    expect(html).not.toContain('<img');
  });
});

describe('buyer summary', () => {
  it('is plain text with the link and the contact', () => {
    const text = renderBuyerSummary(snapshot(), site, pageUrl);
    expect(text).toContain('HALDEN HOUSE');
    expect(text).toContain('USD 480,000');
    expect(text).toContain('Bedrooms: 4');
    expect(text).toContain(pageUrl);
    expect(text).toContain('hello@northaven.test');
    expect(text).not.toMatch(/<[a-z/]/i);
  });

  it('never carries a hidden price', () => {
    const text = renderBuyerSummary(
      snapshot({ price: { visibility: 'hidden', amount: null, currency: null } }),
      site,
      pageUrl,
    );
    expect(text).not.toContain('480');
  });

  it('does not leave runs of blank lines when sections are missing', () => {
    const text = renderBuyerSummary(
      snapshot({ description: null, facts: [] }),
      site,
      pageUrl,
    );
    expect(text).not.toMatch(/\n{3,}/);
  });
});

describe('shared helpers', () => {
  it('humanises fact keys without mangling abbreviations', () => {
    expect(humaniseFactKey('internal_area')).toBe('Internal Area');
    expect(humaniseFactKey('apn')).toBe('APN');
    expect(humaniseFactKey('listing_url')).toBe('Listing URL');
  });

  it('escapes every character that can break out of an attribute or a tag', () => {
    expect(escapeHtml(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;');
  });
});
