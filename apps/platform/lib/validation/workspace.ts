import { z } from 'zod';
import { amountField, apnListField, currencyField, emailField, slugField } from './common';
import { AVAILABILITY, LOCATION_PRECISION, PRICE_VISIBILITY, PROPERTY_TYPES } from './property';

/**
 * Input schemas for the workspace actions. The workspace id is never in here: it comes from
 * the session, resolved server-side, so a forged form field has nothing to overwrite.
 */

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

export const createPropertySchema = z.object({
  title: z.string().trim().min(3, 'Give the property a title of at least 3 characters').max(160),
  propertyType: z.enum(PROPERTY_TYPES),
  city: optionalText(120),
  region: optionalText(120),
  country: optionalText(120),
  apns: apnListField.default([]),
  notes: optionalText(4000),
});

export const updatePropertySchema = z.object({
  propertyId: z.string().uuid(),
  title: z.string().trim().min(3).max(160),
  slug: slugField,
  description: optionalText(4000),
  propertyType: z.enum(PROPERTY_TYPES),
  addressLine: optionalText(200),
  addressVisible: z.boolean().default(false),
  city: optionalText(120),
  region: optionalText(120),
  country: optionalText(120),
  locationPrecision: z.enum(LOCATION_PRECISION).default('unknown'),
  priceAmount: amountField.optional().or(z.literal('')),
  currency: currencyField.optional().or(z.literal('')),
  priceVisibility: z.enum(PRICE_VISIBILITY).default('on_request'),
  availabilityStatus: z.enum(AVAILABILITY).default('available'),
  showOnPortfolio: z.boolean().default(true),
});

export const factSchema = z.object({
  propertyId: z.string().uuid(),
  key: z.string().trim().min(1, 'Name the field').max(60),
  value: z.string().trim().max(400).optional().or(z.literal('')),
  isPublic: z.boolean().default(false),
  sourceType: z.enum(['manual', 'document', 'extraction', 'import']).default('manual'),
  sourceReference: optionalText(200),
});

export const factDecisionSchema = z.object({
  propertyId: z.string().uuid(),
  factId: z.string().uuid(),
  decision: z.enum(['approved', 'rejected', 'unknown', 'reset']),
});

export const propertyIdSchema = z.object({
  propertyId: z.string().uuid(),
});

export const inquiryStatusSchema = z.object({
  inquiryId: z.string().uuid(),
  status: z.enum(['new', 'read', 'archived']),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, 'Add a name buyers will recognise').max(80),
  headline: z.string().trim().max(140).optional().or(z.literal('')),
  bio: z.string().trim().max(1200).optional().or(z.literal('')),
  contactEmail: emailField.optional().or(z.literal('')),
  contactPhone: z.string().trim().max(40).optional().or(z.literal('')),
  showPhone: z.boolean().default(false),
  markets: z.array(z.string().trim().min(2).max(60)).max(8).default([]),
  publishSite: z.boolean().default(false),
});

export const inviteMemberSchema = z.object({
  email: emailField,
  role: z.enum(['editor', 'viewer']),
});

export function checkbox(formData: FormData, name: string): boolean {
  const value = formData.get(name);
  return value === 'on' || value === 'true' || value === '1';
}

export function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}
