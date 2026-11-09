'use server';

import { headers } from 'next/headers';
import { adminDb } from '../../../lib/db/admin';
import { betaApplications } from '../../../db/schema';
import { betaApplySchema } from '../../../lib/validation/invite';
import { firstIssue } from '../../../lib/validation/inquiry';
import { normaliseEmail } from '../../../lib/validation/common';
import { consumeRateLimit, RULES, rateLimitIdentity } from '../../../lib/rate-limit';
import { sendEmail } from '../../../lib/email';
import { betaApplicationEmail } from '../../../lib/emails/beta-application';
import { serverEnv } from '../../../lib/env';

export type BetaApplyState =
  | { status: 'idle' }
  | { status: 'sent' }
  | { status: 'error'; message: string };

/**
 * Where the notification lands: `hello@orvnlabs.com`, the same address the site publishes.
 *
 * There is one inbox. Operators share it, Cloudflare Email Routing forwards it to whoever reads it,
 * and every submission — early access, contact, inquiry — arrives in the same place rather than
 * being scattered across addresses somebody has to remember.
 */
const INBOX = () => serverEnv().EARLY_ACCESS_INBOX ?? 'hello@orvnlabs.com';

/** The record in the admin queue, so the email is a notification and not the archive. */
const QUEUE_URL = (id: string) =>
  `${serverEnv().BETTER_AUTH_URL ?? 'https://orvnlabs.com'}/admin/early-access#${id}`;

/**
 * Early-access requests.
 *
 * Three things matter here:
 * - the request reaches a person even if the database is unavailable, so the email is sent
 *   after a successful insert but a failed insert does not silently swallow the lead;
 * - the applicant's details are stored once per address, and a repeat submission is accepted
 *   without telling the sender whether they had applied before;
 * - the confirmation never promises a reply time or a place in the cohort.
 */
export async function requestEarlyAccess(
  _previous: BetaApplyState,
  formData: FormData,
): Promise<BetaApplyState> {
  const value = (name: string) => {
    const entry = formData.get(name);
    return typeof entry === 'string' ? entry : '';
  };

  const parsed = betaApplySchema.safeParse({
    name: value('name'),
    email: value('email'),
    company: value('company'),
    role: value('role'),
    markets: value('markets'),
    volume: value('volume'),
    currentTools: value('current'),
    frustration: value('frustration'),
    website: value('site'),
    consent: value('consent'),
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
    const identity = await rateLimitIdentity(['beta', ip || 'unknown', normaliseEmail(input.email)]);
    const decision = await consumeRateLimit({ ...RULES.betaApply, identity });
    if (!decision.allowed) {
      return {
        status: 'error',
        message: 'That is several requests in a short time. Try again in an hour.',
      };
    }
  } catch (error) {
    console.error('[early-access] rate limiter unavailable', { message: (error as Error).message });
    return { status: 'error', message: 'We could not take that request just now. Please retry.' };
  }

  const email = normaliseEmail(input.email);
  const receivedAt = new Date();
  let applicationId: string | null = null;
  let stored = true;
  let alreadyApplied = false;

  try {
    const inserted = await adminDb
      .insert(betaApplications)
      .values({
        name: input.name,
        email,
        company: input.company || null,
        role: input.role || null,
        markets: input.markets || null,
        volume: input.volume || null,
        currentTools: input.currentTools || null,
        frustration: input.frustration || null,
        website: input.website || null,
        consent: true,
        source: 'early-access',
        ipHash: await rateLimitIdentity(['ip', ip || 'unknown']),
      })
      .onConflictDoNothing({ target: betaApplications.email })
      .returning({ id: betaApplications.id });

    applicationId = inserted[0]?.id ?? null;
    alreadyApplied = !applicationId;
  } catch (error) {
    // The lead matters more than the row. If storage is down the request is still emailed,
    // with the failure stated, rather than dropped behind a generic error.
    stored = false;
    console.error('[early-access] insert failed', { message: (error as Error).message });
  }

  // A new application rings the inbox once. A resubmission does not.
  if (applicationId || !stored) {
    try {
      const message = await betaApplicationEmail({
        id: applicationId ?? 'unstored',
        name: input.name,
        email,
        company: input.company,
        role: input.role,
        markets: input.markets,
        volume: input.volume,
        currentTools: input.currentTools,
        frustration: input.frustration,
        website: input.website,
        receivedAt,
        adminUrl: QUEUE_URL(applicationId ?? ''),
      });

      await sendEmail({
        ...message,
        to: INBOX(),
        subject: stored ? message.subject : `${message.subject} (not stored — database unavailable)`,
      });
    } catch (error) {
      // The request is stored; the operator can still see it. Say so plainly rather than
      // claiming an email went out.
      console.error('[early-access] notification failed', {
        code: (error as { code?: string }).code,
        applicationId,
      });
      return {
        status: 'error',
        message: stored
          ? 'We saved your request but could not email the team. Try again, or write to hello@orvnlabs.com.'
          : 'We could not take that request just now. Nothing was submitted; please retry.',
      };
    }
  }

  if (!applicationId && stored && !alreadyApplied) {
    return {
      status: 'error',
      message: 'We could not take that request just now. Nothing was submitted; please retry.',
    };
  }

  return { status: 'sent' };
}
