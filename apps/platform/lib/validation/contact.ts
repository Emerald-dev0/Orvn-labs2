import { z } from 'zod';
import { emailField } from './common';

/**
 * The public contact form. Everything here is attacker-controlled, so the server never trusts the
 * client for the topic list, the consent flag or the honeypot.
 */

export const CONTACT_TOPICS = [
  'Beta access',
  'A property I want to publish',
  'Teams and agencies',
  'Something else',
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Your name, please').max(120),
  email: emailField,
  company: z.string().trim().max(160).optional().or(z.literal('')),
  /** Free text, not an enum: an older page may post a label we no longer render. */
  topic: z.string().trim().max(80).optional().or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(10, 'A sentence or two, please')
    .max(4000, 'Shorter, please — under 4000 characters'),
  /** Honeypot. Filled in, the answer looks normal and nothing is stored or sent. */
  company_url_confirm: z.string().max(0).optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;
