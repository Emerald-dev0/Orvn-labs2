'use server';

import { headers } from 'next/headers';
import { adminDb } from '../../../lib/db/admin';
import { contactMessages } from '../../../db/schema';
import { contactSchema } from '../../../lib/validation/contact';
import { firstIssue } from '../../../lib/validation/inquiry';
import { normaliseEmail } from '../../../lib/validation/common';
import { consumeRateLimit, RULES, rateLimitIdentity } from '../../../lib/rate-limit';
import { sendEmail } from '../../../lib/email';
import { contactMessageEmail } from '../../../lib/emails/contact-message';
import { serverEnv } from '../../../lib/env';

export type ContactState =
  | { status: 'idle' }
  | { status: 'sent' }
  | { status: 'error'; message: string };

/** One inbox. Every form on the site writes to the same place. */
const INBOX = () => serverEnv().EARLY_ACCESS_INBOX ?? 'hello@orvnlabs.com';

/**
 * The contact form.
 *
 * Same order as early access: validate, store, then notify. The row is the record and the email
 * is the nudge, so a failure to send never loses the message — and the sender is told which of
 * the two happened rather than a generic "something went wrong".
 */
export async function sendContactMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const value = (name: string) => {
    const entry = formData.get(name);
    return typeof entry === 'string' ? entry : '';
  };

  const parsed = contactSchema.safeParse({
    name: value('name'),
    email: value('email'),
    company: value('company'),
    topic: value('topic'),
    message: value('message'),
    company_url_confirm: value('company_url_confirm'),
  });

  if (!parsed.success) {
    return { status: 'error', message: firstIssue(parsed.error) };
  }

  const input = parsed.data;

  // Honeypot: filled in, the answer is normal and nothing is stored or sent.
  if (input.company_url_confirm) return { status: 'sent' };

  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for') ?? '';
  const ip = headerList.get('cf-connecting-ip') ?? forwarded.split(',')[0]?.trim() ?? '';

  try {
    const identity = await rateLimitIdentity(['contact', ip || 'unknown', normaliseEmail(input.email)]);
    const decision = await consumeRateLimit({ ...RULES.contactMessage, identity });
    if (!decision.allowed) {
      return {
        status: 'error',
        message: 'That is several messages in a short time. Try again in an hour.',
      };
    }
  } catch (error) {
    console.error('[contact] rate limiter unavailable', { message: (error as Error).message });
    return { status: 'error', message: 'We could not take that message just now. Please retry.' };
  }

  const email = normaliseEmail(input.email);
  const receivedAt = new Date();
  let messageId: string | null = null;
  let stored = true;

  try {
    const inserted = await adminDb
      .insert(contactMessages)
      .values({
        name: input.name,
        email,
        company: input.company || null,
        topic: input.topic || null,
        message: input.message,
        source: 'contact',
        ipHash: await rateLimitIdentity(['ip', ip || 'unknown']),
      })
      .returning({ id: contactMessages.id });

    messageId = inserted[0]?.id ?? null;
  } catch (error) {
    stored = false;
    console.error('[contact] insert failed', { message: (error as Error).message });
  }

  try {
    const message = await contactMessageEmail({
      to: INBOX(),
      id: messageId ?? 'unstored',
      name: input.name,
      email,
      company: input.company,
      topic: input.topic,
      message: input.message,
      receivedAt,
    });

    await sendEmail({
      ...message,
      subject: stored ? message.subject : `${message.subject} (not stored — database unavailable)`,
    });
  } catch (error) {
    console.error('[contact] notification failed', {
      code: (error as { code?: string }).code,
      messageId,
    });
    return {
      status: 'error',
      message: stored
        ? 'We saved your message but could not email the team. Try again, or write to hello@orvnlabs.com.'
        : 'We could not take that message just now. Nothing was submitted; please retry.',
    };
  }

  return { status: 'sent' };
}
