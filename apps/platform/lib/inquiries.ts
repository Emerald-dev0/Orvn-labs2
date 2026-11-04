import { and, eq, sql } from 'drizzle-orm';
import { withPublicDb } from './db/tenant';
import { inquiries, properties } from '../db/schema';
import { sendEmail } from './email';
import { inquiryNotificationEmail } from './emails/inquiry-notification';
import { adminDb } from './db/admin';

/**
 * Public inquiry submission.
 *
 * Three guarantees the spec asks for, and where each one comes from:
 * - "lands in the correct workspace exactly once" — the workspace is derived from the
 *   published property, never sent by the client, and `inquiries_dedupe_key` is a unique
 *   index. A retried submit returns the same result instead of a second row.
 * - "does not claim the owner has read it" — the row starts as `new`; the confirmation copy
 *   in the UI never says "the owner has seen this".
 * - "no inquiry without consent" — the insert policy requires consent = true.
 */

export type InquiryResult = { id: string; duplicate: boolean };

export async function createInquiry(input: {
  propertySlug: string;
  username: string;
  name?: string;
  email: string;
  phone?: string;
  message: string;
  consent: boolean;
  source?: string;
  dedupeKey: string;
  ipHash?: string;
}): Promise<InquiryResult> {
  const result = await withPublicDb(async (tx) => {
    const rows = await tx
      .select({ id: properties.id, workspaceId: properties.workspaceId })
      .from(properties)
      .where(and(eq(properties.slug, input.propertySlug), eq(properties.publicationStatus, 'published')))
      .limit(1);

    const property = rows[0];
    if (!property) return null;

    const inserted = await tx
      .insert(inquiries)
      .values({
        workspaceId: property.workspaceId,
        propertyId: property.id,
        name: input.name || null,
        email: input.email,
        phone: input.phone || null,
        message: input.message,
        consent: input.consent,
        source: input.source ?? null,
        dedupeKey: input.dedupeKey,
        ipHash: input.ipHash ?? null,
      })
      .onConflictDoNothing({ target: inquiries.dedupeKey })
      .returning({ id: inquiries.id, workspaceId: inquiries.workspaceId, propertyId: inquiries.propertyId });

    if (inserted[0]) return { ...inserted[0], duplicate: false };

    // The unique index rejected it: this is a retry of a submission that already landed.
    const existing = await tx
      .select({ id: inquiries.id, workspaceId: inquiries.workspaceId, propertyId: inquiries.propertyId })
      .from(inquiries)
      .where(eq(inquiries.dedupeKey, input.dedupeKey))
      .limit(1);

    return existing[0] ? { ...existing[0], duplicate: true } : null;
  });

  if (!result) throw new Error('property_not_published');

  if (!result.duplicate) {
    void notifyOwner(result.id).catch((error) => {
      console.error('[inquiry] notification failed', { code: (error as { code?: string }).code });
    });
  }

  return { id: result.id, duplicate: result.duplicate };
}

/**
 * The owner is told once. Delivery failure does not affect the inquiry: the row is already
 * in the workspace, and the app is the source of truth, not the inbox.
 */
async function notifyOwner(inquiryId: string) {
  const rows = await adminDb.execute(sql`
    select i.email, i.name, i.message, i.created_at, p.title, w.name as workspace_name,
           pr.contact_email
      from inquiries i
      join properties p on p.id = i.property_id
      join workspaces w on w.id = i.workspace_id
      left join professional_profiles pr on pr.workspace_id = i.workspace_id
     where i.id = ${inquiryId}
     limit 1
  `);

  const row = rows.rows?.[0] as
    | {
        email: string;
        name: string | null;
        message: string;
        created_at: string;
        title: string;
        workspace_name: string;
        contact_email: string | null;
      }
    | undefined;

  if (!row?.contact_email) return;

  const baseUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:5174';
  await sendEmail(
    inquiryNotificationEmail({
      to: row.contact_email,
      inquirerName: row.name,
      inquirerEmail: row.email,
      message: row.message,
      propertyTitle: row.title,
      workspaceName: row.workspace_name,
      inboxUrl: `${baseUrl}/inquiries`,
      inquiryId,
    }),
  );
}
