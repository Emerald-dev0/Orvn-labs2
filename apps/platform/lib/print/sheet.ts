/**
 * Print documents built from a publication snapshot.
 *
 * The sheet is plain HTML with its own CSS, served from the property's own route so it is subject
 * to exactly the same release check as the page: unpublished, archived or withdrawn properties do
 * not have a sheet either. Nothing here reads the live draft.
 *
 * Everything is a pure function of the snapshot, which is what makes it testable without a
 * browser and impossible to drift from the page it belongs to.
 */

import { locationLabel, type PublicationSnapshot } from '../publication/snapshot';

export type SheetSite = {
  businessName: string;
  username: string;
  contactEmail?: string | null;
  tagline?: string | null;
};

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Values come from user input, so they are escaped once, here, and never concatenated raw. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ESCAPES[character] ?? character);
}

export function humaniseFactKey(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .replace(/\bApn\b/, 'APN')
    .replace(/\bUrl\b/, 'URL');
}

export function formatPriceForPrint(snapshot: PublicationSnapshot): string {
  const price = snapshot.price;
  if (price.visibility === 'hidden') return '';
  if (price.visibility === 'on_request') return 'Price on request';
  const grouped = price.amount.split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${price.currency} ${grouped}`;
}

export function publishedDate(snapshot: PublicationSnapshot): string {
  const date = new Date(snapshot.publishedAt);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const BASE_CSS = `
  @page { size: A4; margin: 14mm 14mm 12mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body {
    font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    color: #101613;
    font-size: 10.5pt;
    line-height: 1.45;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  a { color: inherit; text-decoration: none; }
  .sheet { max-width: 182mm; margin: 0 auto; }
  .head {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 12mm;
    padding-bottom: 4mm; border-bottom: 0.6pt solid #101613;
  }
  .brand { font-size: 9pt; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700; }
  .brand span { display: block; margin-top: 1.5mm; font-size: 8.5pt; letter-spacing: 0; text-transform: none; font-weight: 400; color: #55605a; }
  .head-meta { text-align: right; font-size: 8.5pt; color: #55605a; line-height: 1.6; }
  .title-block { margin-top: 6mm; }
  h1 { margin: 0; font-size: 21pt; line-height: 1.1; letter-spacing: -0.02em; }
  .place { margin-top: 2mm; font-size: 9.5pt; color: #55605a; }
  .price { margin-top: 3mm; font-size: 15pt; font-weight: 700; letter-spacing: -0.01em; }
  .body { display: grid; grid-template-columns: 1fr 62mm; gap: 8mm; margin-top: 6mm; }
  .cover { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 2mm; background: #f1ede3; }
  .cover-empty {
    width: 100%; aspect-ratio: 4 / 3; border: 0.5pt dashed #b9b2a2; border-radius: 2mm;
    display: flex; align-items: center; justify-content: center; font-size: 8.5pt; color: #7d8781;
  }
  h2 { margin: 0 0 2.5mm; font-size: 8pt; letter-spacing: 0.12em; text-transform: uppercase; color: #55605a; font-weight: 700; }
  .lede { margin-top: 6mm; font-size: 10.5pt; line-height: 1.6; }
  .facts { width: 100%; border-collapse: collapse; }
  .facts th { text-align: left; font-weight: 400; color: #55605a; padding: 1.6mm 3mm 1.6mm 0; vertical-align: top; width: 42%; border-bottom: 0.4pt solid #e3ddd0; }
  .facts td { padding: 1.6mm 0; font-weight: 600; border-bottom: 0.4pt solid #e3ddd0; }
  .contact { margin-top: 6mm; font-size: 9pt; }
  .contact a { text-decoration: underline; }
  .foot {
    margin-top: 8mm; padding-top: 3mm; border-top: 0.6pt solid #101613;
    display: flex; justify-content: space-between; gap: 8mm; font-size: 7.6pt; color: #55605a; line-height: 1.5;
  }
  .foot p { margin: 0; max-width: 108mm; }
  .mono { font-variant-numeric: tabular-nums; }
  @media print {
    .screen-only { display: none !important; }
  }
  .screen-only {
    max-width: 182mm; margin: 0 auto 6mm; padding: 4mm 5mm; border-radius: 3mm;
    background: #f0fbd8; color: #22380c; font-size: 9pt; display: flex; justify-content: space-between; gap: 6mm;
  }
`;

function sheetHead(snapshot: PublicationSnapshot, site: SheetSite, label: string): string {
  const email = site.contactEmail ? `<a href="mailto:${escapeHtml(site.contactEmail)}">${escapeHtml(site.contactEmail)}</a>` : '';
  return `<header class="head">
    <div class="brand">${escapeHtml(site.businessName)}<span>${escapeHtml(label)}</span></div>
    <div class="head-meta">
      Prepared ${escapeHtml(publishedDate(snapshot))}<br />
      ${email}
    </div>
  </header>`;
}

/**
 * The deal sheet: one A4 page, the facts that were approved for publication, and the same
 * disclaimer the page carries. Nothing that is not in the snapshot can appear on it.
 */
export function renderDealSheet(snapshot: PublicationSnapshot, site: SheetSite, pageUrl: string): string {
  const price = formatPriceForPrint(snapshot);
  const cover = snapshot.media[0];
  const facts = snapshot.facts
    .map(
      (fact) =>
        `<tr><th>${escapeHtml(humaniseFactKey(fact.key))}</th><td>${escapeHtml(fact.value)}</td></tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${escapeHtml(snapshot.title)} · deal sheet · ${escapeHtml(site.businessName)}</title>
<style>${BASE_CSS}</style>
</head>
<body>
  <div class="screen-only">
    <span>Print-ready. Use your browser's print dialog and choose “Save as PDF”.</span>
    <span>${escapeHtml(pageUrl)}</span>
  </div>

  <div class="sheet">
    ${sheetHead(snapshot, site, 'Deal sheet')}

    <div class="title-block">
      <h1>${escapeHtml(snapshot.title)}</h1>
      <p class="place">${escapeHtml(locationLabel(snapshot))}</p>
      ${price ? `<p class="price mono">${escapeHtml(price)}</p>` : ''}
    </div>

    <div class="body">
      <div>
        ${snapshot.description ? `<p class="lede">${escapeHtml(snapshot.description)}</p>` : ''}
        ${facts ? `<h2 style="margin-top:7mm">Property facts</h2><table class="facts">${facts}</table>` : ''}
        ${
          site.contactEmail
            ? `<p class="contact">Enquiries: <a href="mailto:${escapeHtml(site.contactEmail)}">${escapeHtml(site.contactEmail)}</a></p>`
            : ''
        }
      </div>
      <div>
        ${
          cover
            ? `<img class="cover" src="/api/media/${encodeURI(cover.key)}?w=960" alt="" />`
            : '<div class="cover-empty">No photo published</div>'
        }
      </div>
    </div>

    <footer class="foot">
      <p>${escapeHtml(snapshot.disclaimer)}</p>
      <p style="text-align:right">${escapeHtml(pageUrl)}</p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * The buyer summary is deliberately plain text: it is built to be pasted into a message, not
 * printed, so it carries no markup and no formatting that a messaging app will mangle.
 */
export function renderBuyerSummary(snapshot: PublicationSnapshot, site: SheetSite, pageUrl: string): string {
  const price = formatPriceForPrint(snapshot);
  const lines = [
    snapshot.title.toUpperCase(),
    locationLabel(snapshot),
    price,
    '',
  ];

  if (snapshot.description) {
    lines.push(snapshot.description, '');
  }

  if (snapshot.facts.length > 0) {
    lines.push('FACTS');
    for (const fact of snapshot.facts) {
      lines.push(`${humaniseFactKey(fact.key)}: ${fact.value}`);
    }
    lines.push('');
  }

  lines.push(`Full details and photos: ${pageUrl}`);
  if (site.contactEmail) lines.push(`Enquiries: ${site.contactEmail}`);
  lines.push('', `${site.businessName}`, snapshot.disclaimer);

  return lines.filter((line, index, all) => !(line === '' && all[index - 1] === '')).join('\n');
}
