import { desc, eq } from 'drizzle-orm';
import { adminDb } from '../db/admin';
import { betaApplications } from '../../db/schema';

/**
 * The early-access queue, read through the privileged connection because applications belong to
 * nobody until an invitation is issued. No tenant table is touched here.
 */

export const APPLICATION_STATUSES = ['new', 'reviewing', 'invited', 'declined'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type Application = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  markets: string | null;
  volume: string | null;
  currentTools: string | null;
  frustration: string | null;
  website: string | null;
  status: string;
  source: string | null;
  createdAt: string;
};

export async function listApplications(status?: string): Promise<Application[]> {
  const rows = await adminDb
    .select()
    .from(betaApplications)
    .orderBy(desc(betaApplications.createdAt))
    .limit(200);

  const mapped = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    role: row.role,
    markets: row.markets,
    volume: row.volume,
    currentTools: row.currentTools,
    frustration: row.frustration,
    website: row.website,
    status: row.status,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
  }));

  return status && status !== 'all' ? mapped.filter((row) => row.status === status) : mapped;
}

export async function getApplication(id: string): Promise<Application | null> {
  const rows = await adminDb
    .select()
    .from(betaApplications)
    .where(eq(betaApplications.id, id))
    .limit(1);
  return rows[0] ? { ...rows[0], createdAt: rows[0].createdAt.toISOString() } as Application : null;
}

export function statusCounts(applications: Application[]): Record<string, number> {
  const counts: Record<string, number> = { all: applications.length };
  for (const status of APPLICATION_STATUSES) {
    counts[status] = applications.filter((row) => row.status === status).length;
  }
  return counts;
}
