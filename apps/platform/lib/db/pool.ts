import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../../db/schema';

/**
 * Transactional connection pool.
 *
 * `lib/db.ts` uses Neon's HTTP driver, which cannot hold a transaction open — fine for
 * Better Auth, useless for RLS, because `set_config(..., true)` is transaction-local.
 * Tenant queries therefore go through this pool, which speaks WebSocket.
 */
const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

if (typeof globalThis.WebSocket === 'undefined') {
  // Node runtime (local dev, tests, `next start`). In Workers the native binding exists.
  const { default: WebSocket } = await import('ws');
  neonConfig.webSocketConstructor = WebSocket as unknown as typeof globalThis.WebSocket;
}

export const pool = new Pool({ connectionString, max: 5 });
export const tenantDb = drizzle(pool, { schema });

export type TenantDb = typeof tenantDb;
export type TenantTx = Parameters<Parameters<TenantDb['transaction']>[0]>[0];
