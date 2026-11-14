/**
 * Presentation helpers. Pure functions, so the awkward cases are unit-tested rather than
 * discovered in a screenshot.
 */

const SYMBOLS: Record<string, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
  NGN: '₦',
  ZAR: 'R',
  KES: 'KSh',
  GHS: 'GH₵',
};

/** Money is a decimal string end to end; the only place it becomes a float is never. */
export function formatMoney(amount: string | null, currency: string | null): string {
  if (!amount || !currency) return '';
  const [whole, fraction = ''] = amount.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const cents = fraction.replace(/0+$/, '');
  const symbol = SYMBOLS[currency.toUpperCase()] ?? `${currency.toUpperCase()} `;
  return `${symbol}${grouped}${cents ? `.${cents.padEnd(2, '0')}` : ''}`;
}

export function priceLabel(input: {
  priceAmount: string | null;
  currency: string | null;
  priceVisibility: 'public' | 'on_request' | 'hidden';
}): string {
  if (input.priceVisibility === 'hidden') return '';
  if (input.priceVisibility === 'on_request') return 'Price on request';
  const money = formatMoney(input.priceAmount, input.currency);
  return money || 'Price on request';
}

/** Relative time, coarse on purpose: "2 hours ago" is enough, precision is not the point. */
export function timeAgo(date: Date | string | null, now = new Date()): string {
  if (!date) return 'Never';
  const then = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 1000));

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? 'An hour ago' : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? 'A month ago' : `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? 'A year ago' : `${years} years ago`;
}

const TYPE_LABELS: Record<string, string> = {
  residential_land: 'Vacant land',
  SFR: 'Single-family',
  duplex: 'Duplex',
  multifamily: 'Multifamily',
  other: 'Other',
};

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? humaniseKey(type);
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    needs_review: 'Needs review',
    published: 'Published',
    unpublished: 'Unpublished',
    archived: 'Archived',
  };
  return labels[status] ?? humaniseKey(status);
}

export function humaniseKey(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\bapn\b/gi, 'APN')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/**
 * Record completeness: what a buyer-facing page needs, weighted equally. It is a progress
 * indicator, not a score, and it never counts an unapproved fact as done.
 */
export function recordCompleteness(input: {
  title?: string | null;
  city?: string | null;
  region?: string | null;
  description?: string | null;
  approvedPublicFacts: number;
  publicMedia: number;
  contactEmail?: string | null;
  rightsAttested: boolean;
}): number {
  const checks = [
    Boolean(input.title && input.title.trim().length >= 3),
    Boolean(input.city || input.region),
    Boolean(input.description && input.description.trim().length > 20),
    input.approvedPublicFacts >= 1,
    input.publicMedia >= 1,
    Boolean(input.contactEmail),
    input.rightsAttested,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

/** "3 days ago" for a published record, but silence is better than a wrong date. */
export function placeLabel(input: { city?: string | null; region?: string | null }): string {
  return [input.city, input.region].filter(Boolean).join(', ');
}

export function daysBetween(from: Date, to = new Date()): number {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86_400_000));
}
