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
  name: z.string().trim().min(2).max(120),
  email: emailField,
  website: z.string().trim().max(200).optional().or(z.literal('')),
  markets: z.string().trim().max(200).optional().or(z.literal('')),
  role: z.string().trim().max(80).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  /** Honeypot. */
  company_url_confirm: z.literal('').optional(),
});

export const workspaceSlugSchema = slugField;
