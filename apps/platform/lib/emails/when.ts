/**
 * Times in email are shown in Lagos time, where the operator and most applicants are, and labelled
 * WAT. UTC is kept for logs and the database; a person reading "expires 18:03 UTC" at 19:00 local
 * time thinks the link is already dead.
 */
const LAGOS = 'Africa/Lagos';

export const whenFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: LAGOS,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** e.g. "9 Nov 2026, 18:03 WAT" */
export function formatWhen(date: Date): string {
  return `${whenFormat.format(date)} WAT`;
}
