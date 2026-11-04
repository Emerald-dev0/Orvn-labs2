import { sql } from 'drizzle-orm';
import { tenantDb, type TenantTx } from './pool';

/**
 * Every tenant query in the product goes through one of these two functions.
 *
 * They do three things in one transaction:
 *   1. declare who is asking (`app.user_id`), transaction-local;
 *   2. demote the connection to a role that RLS actually applies to;
 *   3. hand the caller a transaction and nothing else.
 *
 * Because the role is set with SET LOCAL ROLE, even a connection string belonging to the
 * database owner cannot read across workspaces from application code. The policies in
 * db/sql/policies.sql are the second check; the scoped repositories are the first.
 */

/** A deployment without a database is a preview: nothing is published, nothing is readable. */
export const databaseConfigured = Boolean(process.env.DATABASE_URL);

export const TENANT_ROLE = 'larei_app';
export const PUBLIC_ROLE = 'larei_public';

export async function withUserDb<T>(userId: string, fn: (tx: TenantTx) => Promise<T>): Promise<T> {
  if (!userId) throw new Error('withUserDb requires an authenticated user id');

  return tenantDb.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', ${userId}, true)`);
    await tx.execute(sql.raw(`set local role ${TENANT_ROLE}`));
    return fn(tx);
  });
}

/**
 * The public path: published projections only. This role cannot read a draft, an inquiry,
 * an unpublished file row or another workspace's record, whatever the query says.
 */
export async function withPublicDb<T>(fn: (tx: TenantTx) => Promise<T>): Promise<T> {
  return tenantDb.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', '', true)`);
    await tx.execute(sql.raw(`set local role ${PUBLIC_ROLE}`));
    return fn(tx);
  });
}

/** Reads the current role and RLS posture. Used by the health check and the security test. */
export async function databasePosture(): Promise<{
  currentUser: string;
  role: string;
  rlsTables: string[];
  tenantPolicies: number;
}> {
  const result = await tenantDb.execute(sql`
    select current_user as current_user,
           current_setting('role') as role,
           (select count(*) from pg_tables where schemaname = 'public' and rowsecurity) as rls_tables,
           (select count(*) from pg_policies where schemaname = 'public') as policies
  `);
  const row = (result.rows?.[0] ?? {}) as {
    current_user?: string;
    role?: string;
    rls_tables?: string | number;
    policies?: string | number;
  };
  return {
    currentUser: row.current_user ?? 'unknown',
    role: row.role ?? 'unknown',
    rlsTables: [String(row.rls_tables ?? 0)],
    tenantPolicies: Number(row.policies ?? 0),
  };
}
