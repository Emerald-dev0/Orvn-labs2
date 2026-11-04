import { z } from 'zod';
import { emailField, slugField, usernameField } from './common';

export const inviteCreateSchema = z.object({
  email: emailField,
  role: z.enum(['owner', 'editor', 'viewer']).default('editor'),
  note: z.string().trim().max(200).optional().or(z.literal('')),
});

export const inviteAcceptSchema = z.object({
  token: z.string().trim().min(20).max(200),
  workspaceName: z.string().trim().min(2).max(80).optional(),
  username: usernameField.optional(),
  displayName: z.string().trim().min(2).max(80).optional(),
});

export const betaApplySchema = z.object({
  name: z.string().trim().min(2, 'Tell us your name').max(120),
  email: emailField,
  company: z.string().trim().max(160).optional().or(z.literal('')),
  role: z.string().trim().max(80).optional().or(z.literal('')),
  markets: z.string().trim().max(200).optional().or(z.literal('')),
  volume: z.string().trim().max(40).optional().or(z.literal('')),
  currentTools: z.string().trim().max(1000).optional().or(z.literal('')),
  frustration: z.string().trim().max(1000).optional().or(z.literal('')),
  website: z.string().trim().max(200).optional().or(z.literal('')),
  /** Consent is a real checkbox, not a footnote. */
  consent: z.literal('on', { message: 'Please agree to be contacted about the beta' }),
  /** Honeypot. A person never sees this field. */
  company_url_confirm: z.literal('').optional(),
});

export const workspaceSlugSchema = slugField;
