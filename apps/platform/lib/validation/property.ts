import { z } from 'zod';
import { amountField, apnListField, currencyField, slugField } from './common';

export const PROPERTY_TYPES = ['vacant_land', 'residential', 'package', 'project'] as const;
export const LOCATION_PRECISION = ['exact', 'approximate', 'unknown'] as const;
export const PRICE_VISIBILITY = ['public', 'on_request', 'hidden'] as const;
export const AVAILABILITY = ['available', 'pending', 'sold', 'showcase'] as const;

export const propertyDraftSchema = z.object({
  title: z.string().trim().min(3, 'A title of at least 3 characters').max(160),
  slug: slugField.optional(),
  propertyType: z.enum(PROPERTY_TYPES),
  addressLine: z.string().trim().max(200).optional().or(z.literal('')),
  addressVisible: z.boolean().default(false),
  city: z.string().trim().max(120).optional().or(z.literal('')),
  region: z.string().trim().max(120).optional().or(z.literal('')),
  country: z.string().trim().max(120).optional().or(z.literal('')),
  locationPrecision: z.enum(LOCATION_PRECISION).default('unknown'),
  priceAmount: amountField.optional().or(z.literal('')),
  currency: currencyField.optional().or(z.literal('')),
  priceVisibility: z.enum(PRICE_VISIBILITY).default('on_request'),
  availabilityStatus: z.enum(AVAILABILITY).default('available'),
  showOnPortfolio: z.boolean().default(true),
  apns: apnListField.default([]),
});

export type PropertyDraftInput = z.infer<typeof propertyDraftSchema>;

/**
 * Publication prerequisites. These are the checks the spec calls "specific actionable
 * missing fields": each one names what to fix, and none of them blocks a draft.
 */
export function publicationBlockers(input: {
  title?: string | null;
  city?: string | null;
  region?: string | null;
  contactEmail?: string | null;
  rightsAttestedAt?: Date | null;
  publicMediaCount: number;
  locationPrecision?: string | null;
}): string[] {
  const blockers: string[] = [];
  if (!input.title || input.title.trim().length < 3) blockers.push('Add a title.');
  if (!input.city && !input.region) {
    blockers.push('Add a city or region so buyers know roughly where this is.');
  }
  if (input.locationPrecision === 'exact') {
    blockers.push('Confirm that the exact address may be shown, or mark the pin approximate.');
  }
  if (!input.contactEmail) blockers.push('Set a contact email for inquiries.');
  if (!input.rightsAttestedAt) {
    blockers.push('Confirm you have the right to publish this property and its photos.');
  }
  if (input.publicMediaCount === 0) {
    blockers.push('Mark at least one photo as public, or publish without photos.');
  }
  return blockers;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    .replace(/^-|-$/g, '');
}
