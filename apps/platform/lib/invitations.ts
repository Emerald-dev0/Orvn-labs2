import { and, eq, isNull, sql } from 'drizzle-orm';
import { adminDb } from './db/admin';
import { tenantDb } from './db/pool';
import { databaseConfigured } from './db/tenant';
import { invitations } from '../db/schema';
import { randomToken, sha256Hex } from './crypto';
import { normaliseEmail } from './validation/common';
import { sendEmail } from './email';
import { invitationEmail } from './emails/invitation';
import { serverEnv } from './env';

/**
 * Invitations are the only door into the beta.
 *
 * - The token is 256 bits of randomness; only its SHA-256 hash is stored, so a database
 *   read cannot be replayed as an invitation.
 * - It expires in seven days, is single-use, and is bound to one email address.
 * - Accepting it happens inside a SECURITY DEFINER function (see db/sql/policies.sql) that
 *   validates all of the above atomically. The application cannot skip the check by
 *   forgetting it.
 */

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type InvitationView = {
  valid: boolean;
  maskedEmail: string | null;
  workspaceId: string | null;
  workspaceName: string | null;
  role: 'owner' | 'editor' | 'viewer' | null;
  expiresAt: Date | null;
  /** True only when the signed-in address is the address the invitation was sent to. */
  emailMatches: boolean;
};

export class InvitationError extends Error {
  readonly code:
    | 'invalid'
    | 'expired'
    | 'used'
    | 'email_mismatch'
    | 'workspace_required'
    | 'delivery_failed';
  constructor(code: InvitationError['code'], message: string) {
    super(message);
    this.name = 'InvitationError';
    this.code = code;
  }
}

const MESSAGES: Record<InvitationError['code'], string> = {
  invalid: 'That invitation link is not valid.',
  expired: 'That invitation has expired. Ask for a new one.',
  used: 'That invitation has already been used.',
  email_mismatch: 'This invitation was sent to a different email address.',
  workspace_required: 'Choose a workspace name and address to continue.',
  delivery_failed: 'The invitation was created, but the email could not be sent. Retry the send.',
};

export async function inviteTokenHash(token: string): Promise<string> {
  return sha256Hex(token);
}

export async function createInvitation(opts: {
  email: string;
  workspaceId?: string | null;
  workspaceName?: string | null;
  role?: 'owner' | 'editor' | 'viewer';
  invitedBy?: string | null;
  note?: string | null;
}): Promise<{ id: string; token: string; expiresAt: Date }> {
  const email = normaliseEmail(opts.email);
  const token = randomToken(32);
  const tokenHash = await inviteTokenHash(token);
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);

  const [row] = await adminDb
    .insert(invitations)
    .values({
      email,
      workspaceId: opts.workspaceId ?? null,
      role: opts.role ?? 'owner',
      tokenHash,
      expiresAt,
      invitedBy: opts.invitedBy ?? null,
      note: opts.note ?? null,
    })
    .returning({ id: invitations.id });

  const baseUrl = serverEnv().BETTER_AUTH_URL ?? 'http://localhost:5174';
  const acceptUrl = `${baseUrl.replace(/\/$/, '')}/invite/${token}`;

  try {
    await sendEmail(
      invitationEmail({
        to: email,
        workspaceName: opts.workspaceName ?? undefined,
        acceptUrl,
        expiresAt,
        invitationId: row.id,
      }),
    );
  } catch (error) {
    console.error('[invitations] delivery failed', {
      invitationId: row.id,
      code: (error as { code?: string }).code,
    });
    throw new InvitationError('delivery_failed', MESSAGES.delivery_failed);
  }

  return { id: row.id, token, expiresAt };
}

/** Used by the sign-up gate: does this address hold a usable invitation right now? */
export async function findUsableInvitation(email: string) {
  const rows = await adminDb
    .select({ id: invitations.id, workspaceId: invitations.workspaceId, role: invitations.role })
    .from(invitations)
    .where(
      and(
        eq(invitations.email, normaliseEmail(email)),
        isNull(invitations.acceptedAt),
        isNull(invitations.revokedAt),
        sql`${invitations.expiresAt} > now()`,
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

const INVALID_VIEW: InvitationView = {
  valid: false,
  maskedEmail: null,
  workspaceId: null,
  workspaceName: null,
  role: null,
  expiresAt: null,
  emailMatches: false,
};

export async function inspectInvitation(token: string, viewerEmail?: string): Promise<InvitationView> {
  if (!databaseConfigured) return INVALID_VIEW;
  const hash = await inviteTokenHash(token);
  const result = await tenantDb.execute(
    sql`select * from app_inspect_invitation(${hash}, ${viewerEmail ?? null})`,
  );
  const row = (result.rows?.[0] ?? null) as
    | {
        valid: boolean;
        masked_email: string | null;
        workspace_id: string | null;
        workspace_name: string | null;
        role: 'owner' | 'editor' | 'viewer' | null;
        expires_at: string | null;
        email_matches: boolean | null;
      }
    | null;

  if (!row) {
    return {
      valid: false,
      maskedEmail: null,
      workspaceId: null,
      workspaceName: null,
      role: null,
      expiresAt: null,
      emailMatches: false,
    };
  }

  return {
    valid: Boolean(row.valid),
    maskedEmail: row.masked_email,
    workspaceId: row.workspace_id,
    workspaceName: row.workspace_name,
    role: row.role,
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    emailMatches: Boolean(row.email_matches),
  };
}

const PG_ERROR_MAP: Record<string, InvitationError['code']> = {
  invitation_invalid: 'invalid',
  invitation_expired: 'expired',
  invitation_already_used: 'used',
  invitation_email_mismatch: 'email_mismatch',
  invitation_has_no_workspace: 'workspace_required',
  workspace_details_required: 'workspace_required',
};

export async function acceptInvitation(opts: {
  token: string;
  userId: string;
  email: string;
  workspaceName?: string;
  username?: string;
}): Promise<{ workspaceId: string }> {
  const hash = await inviteTokenHash(opts.token);

  try {
    const result = await tenantDb.execute(
      sql`select app_accept_invitation(${hash}, ${opts.userId}, ${normaliseEmail(opts.email)},
            ${opts.workspaceName ?? null}, ${opts.username ?? null}) as workspace_id`,
    );
    const workspaceId = (result.rows?.[0] as { workspace_id?: string } | undefined)?.workspace_id;
    if (!workspaceId) throw new InvitationError('invalid', MESSAGES.invalid);
    return { workspaceId };
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const key = Object.keys(PG_ERROR_MAP).find((k) => message.includes(k));
    if (key) throw new InvitationError(PG_ERROR_MAP[key], MESSAGES[PG_ERROR_MAP[key]]);
    throw error;
  }
}
