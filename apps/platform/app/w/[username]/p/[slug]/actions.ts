'use server';

import { headers } from 'next/headers';
import { inquirySchema, firstIssue } from '../../../../../lib/validation/inquiry';
import { createInquiry } from '../../../../../lib/inquiries';
import { consumeRateLimit, RULES, rateLimitIdentity } from '../../../../../lib/rate-limit';
import { sha256Hex } from '../../../../../lib/crypto';
import { recordAudit } from '../../../../../lib/audit';
import { normaliseEmail } from '../../../../../lib/validation/common';

export type InquiryState =
  | { status: 'idle' }
  | { status: 'sent'; email: string }
  | { status: 'error'; message: string };

/**
 * The only public write in the product.
 *
 * Order matters: parse, rate limit, then insert. A validation failure costs nothing; a
 * valid-looking flood costs one counter increment; only a well-formed, consented, properly
 * tokenised submission reaches the database.
 */
export async function submitInquiry(
  _previous: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const parsed = inquirySchema.safeParse({
    propertySlug: formData.get('propertySlug'),
    name: formData.get('name') ?? '',
    email: formData.get('email'),
    phone: formData.get('phone') ?? '',
    message: formData.get('message'),
    consent: formData.get('consent'),
    requestToken: formData.get('requestToken'),
    website: formData.get('website') ?? '',
    source: formData.get('source') ?? undefined,
  });

  if (!parsed.success) {
    return { status: 'error', message: firstIssue(parsed.error) };
  }

  const data = parsed.data;

  // Honeypot: a bot fills the hidden field. Answer as if it worked, store nothing.
  if (data.website) {
    return { status: 'sent', email: data.email };
  }

  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for') ?? '';
  const ip = headerList.get('cf-connecting-ip') ?? forwarded.split(',')[0]?.trim() ?? '';
  const userAgent = headerList.get('user-agent') ?? '';

  try {
    const identity = await rateLimitIdentity([ip || 'unknown', userAgent]);
    const perVisitor = await consumeRateLimit({ ...RULES.inquirySubmit, identity });
    if (!perVisitor.allowed) {
      return {
        status: 'error',
        message: 'That is a lot of questions in a short time. Try again in a few minutes.',
      };
    }

    const perProperty = await consumeRateLimit({
      ...RULES.inquiryPerProperty,
      identity: await rateLimitIdentity(['property', data.propertySlug, ip || 'unknown']),
    });
    if (!perProperty.allowed) {
      return {
        status: 'error',
        message: 'This property has received several inquiries from you recently. Try again later.',
      };
    }
  } catch (error) {
    // Fail closed: if the limiter is unavailable we do not accept anonymous writes.
    console.error('[inquiry] rate limiter unavailable', { message: (error as Error).message });
    return {
      status: 'error',
      message: 'We could not send your inquiry just now. Nothing was submitted; please retry.',
    };
  }

  const dedupeKey = await sha256Hex(`inquiry:${data.propertySlug}:${data.requestToken}`);

  try {
    const result = await createInquiry({
      propertySlug: data.propertySlug,
      username: String(formData.get('username') ?? ''),
      name: data.name || undefined,
      email: normaliseEmail(data.email),
      phone: data.phone || undefined,
      message: data.message,
      consent: true,
      source: data.source,
      dedupeKey,
      ipHash: await rateLimitIdentity(['ip', ip || 'unknown']),
    });

    await recordAudit({
      action: 'inquiry.received',
      targetType: 'inquiry',
      targetId: result.id,
      metadata: { propertySlug: data.propertySlug, duplicate: result.duplicate },
    });

    return { status: 'sent', email: data.email };
  } catch (error) {
    console.error('[inquiry] insert failed', { message: (error as Error).message });
    return {
      status: 'error',
      message: 'We could not send your inquiry just now. Nothing was submitted; please retry.',
    };
  }
}
