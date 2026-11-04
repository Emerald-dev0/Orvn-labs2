import { db } from './db';
import { auditEvents } from '../db/schema';
import type { TenantTx } from './db/pool';

/**
 * Append-only record of consequential actions. The database refuses UPDATE and DELETE on
 * this table for both application roles, so an audit entry cannot be edited away by the same
 * code path that writes one.
 */
export type AuditEvent = {
  workspaceId?: string | null;
  actorId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function recordAudit(event: AuditEvent, tx?: TenantTx): Promise<void> {
  const writer = tx ?? db;
  await writer.insert(auditEvents).values({
    workspaceId: event.workspaceId ?? null,
    actorId: event.actorId ?? null,
    action: event.action,
    targetType: event.targetType ?? null,
    targetId: event.targetId ?? null,
    metadata: event.metadata ?? null,
  });
}
