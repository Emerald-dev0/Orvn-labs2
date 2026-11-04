import { z } from 'zod';

/**
 * Shared field rules. Written as plain regexes so behaviour does not depend on zod's
 * convenience helpers changing between versions.
 */

export const emailField = z
  .string()
  .trim()
  .min(3)
  .max(254)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Enter an email address');

export const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and single hyphens only');

export const RESERVED_USERNAMES = new Set([
  'about', 'admin', 'analytics', 'api', 'app', 'blog', 'contact', 'dashboard', 'early-access',
  'faq', 'help', 'how-it-works', 'inquiries', 'invite', 'legal', 'login', 'pas', 'product',
  'properties', 'settings', 'sign-in', 'sign-up', 'support', 'w', 'website', 'who-its-for',
]);

export const usernameField = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'At least 3 characters')
  .max(30, 'At most 30 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and single hyphens only')
  .refine((value) => !RESERVED_USERNAMES.has(value), 'That address is reserved');

/** Money is stored as a decimal string, never a float: 480000.00 survives every round trip. */
export const amountField = z
  .string()
  .trim()
  .regex(/^\d{1,12}(\.\d{1,2})?$/, 'Enter an amount like 480000 or 480000.50');

export const currencyField = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'Three-letter currency code');

/**
 * Parcel numbers are strings. `017-234-11` and `0017` keep their leading zeros, because the
 * moment one is parsed as a number the record stops matching the county's record.
 */
export const apnField = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(/^[A-Za-z0-9][A-Za-z0-9\-./ ]*$/, 'Letters, numbers, dashes, dots and slashes only');

export const apnListField = z.array(apnField).max(40);

export const uuidField = z.string().uuid();

export const requestTokenField = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{16,64}$/, 'Invalid request token');

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}
