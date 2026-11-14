import { z } from 'zod';
import { amountField, apnListField, currencyField, slugField } from './common';

// PRD D03: canonical set is stored everywhere; only the first two are offered at launch
// (the picker in NewProperty is built from LAUNCH_PROPERTY_TYPES).
export const PROPERTY_TYPES = ['residential_land', 'SFR', 'duplex', 'multifamily', 'other'] as const;
export const LAUNCH_PROPERTY_TYPES = ['residential_land', 'SFR'] as const;
export const LOCATION_PRECISION = ['exact', 'approximate', 'unknown'] as const;
export const LOCATION_DISCLOSURE = ['exact', 'street', 'area'] as const;
export const PRICE_VISIBILITY = ['public', 'on_request', 'hidden'] as const;
export const AVAILABILITY = ['available', 'pending', 'sold', 'showcase'] as const;

export const propertyDraftSchema = z.object({
  title: z.string().trim().min(3, 'A title of at least 3 characters').max(160),
  slug: slugField.optional(),
  propertyType: z.enum(PROPERTY_TYPES),
  addressLine: z.string().trim().max(200).optional().or(z.literal('')),
  postalCode: z.string().trim().max(20).optional().or(z.literal('')),
  locationDisclosure: z.enum(LOCATION_DISCLOSURE).default('area'),
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
  locationDisclosure?: string | null;
  addressLine?: string | null;
  /** Public facts nobody has approved or rejected. A page must not carry an unreviewed claim. */
  unreviewedPublicFactCount?: number;
}): string[] {
  const blockers: string[] = [];
  if (!input.title || input.title.trim().length < 3) blockers.push('Add a title.');
  if (!input.city && !input.region) {
    blockers.push('Add a city or region so buyers know roughly where this is.');
  }
  if (input.locationDisclosure === 'exact' && input.locationPrecision !== 'exact') {
    blockers.push('Exact address is selected for public view, but the pin is not set to exact. Set the pin to exact, or choose Street-level / Area.');
  }
  if (input.locationDisclosure === 'exact' && !input.addressLine?.trim()) {
    blockers.push('Exact address is selected for public view, but the address line is empty.');
  }
  if (!input.contactEmail) blockers.push('Set a contact email for inquiries.');
  if (!input.rightsAttestedAt) {
    blockers.push('Confirm you have the right to publish this property and its photos.');
  }
  if (input.publicMediaCount === 0) {
    blockers.push('Mark at least one photo as public, or publish without photos.');
  }
  const pending = input.unreviewedPublicFactCount ?? 0;
  if (pending > 0) {
    blockers.push(
      `Approve or reject ${pending} public ${pending === 1 ? 'fact' : 'facts'} before publishing.`,
    );
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
