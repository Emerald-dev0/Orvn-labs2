import { eq } from 'drizzle-orm';
import { adminDb } from './db/admin';
import { marketingSuppressions } from '../db/schema';
import { normaliseEmail } from './validation/common';

/**
 * Optional product/development updates are a separate stream from operational mail.
 * Anything that sends optional updates must check this list first; the operational
 * stream (invitations, sign-in links, security) must not.
 *
 * Fails closed for marketing (treats unknown as suppressed) so a database hiccup never
 * mails someone who asked to stop.
 */
export async function isSuppressed(email: string): Promise<boolean> {
  const target = normaliseEmail(email);
  if (!target) return true;
  try {
    const rows = await adminDb
      .select({ email: marketingSuppressions.email })
      .from(marketingSuppressions)
      .where(eq(marketingSuppressions.email, target));
    return rows.length > 0;
  } catch (error) {
    console.error('[marketing] suppression check failed', { message: (error as Error).message });
    return true;
  }
}

/** Idempotent: a second unsubscribe click is a no-op, not a 500. */
export async function suppressEmail(email: string, reason = 'unsubscribe'): Promise<void> {
  const target = normaliseEmail(email);
  if (!target) {
    throw new Error('Cannot suppress an empty address');
  }
  await adminDb
    .insert(marketingSuppressions)
    .values({ email: target, reason })
    .onConflictDoNothing({ target: marketingSuppressions.email });
}
