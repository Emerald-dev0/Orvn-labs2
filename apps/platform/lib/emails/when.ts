/**
 * Times in email are shown in the reader's expected zone, labelled. Recipient-facing mail uses the
 * US-first launch locale (America/New_York, with the EST/EDT abbreviation from Intl); mail the
 * founder reads in Lagos keeps Lagos time. UTC is kept for logs and the database; a person reading
 * a bare UTC stamp mistimes the link, so every person-facing time carries its zone.
 */
const NEW_YORK = 'America/New_York';
const LAGOS = 'Africa/Lagos';

const USER = new Intl.DateTimeFormat('en-US', {
  timeZone: NEW_YORK,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZoneName: 'short',
});

const OPERATOR = new Intl.DateTimeFormat('en-GB', {
  timeZone: LAGOS,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** e.g. "Nov 9, 2026, 12:53 PM EST" — for mail a recipient reads. */
export function formatWhen(date: Date): string {
  return USER.format(date);
}

/** e.g. "9 Nov 2026, 18:03 WAT" — for mail the founder reads. */
export function formatWhenOperator(date: Date): string {
  return `${OPERATOR.format(date)} WAT`;
}
