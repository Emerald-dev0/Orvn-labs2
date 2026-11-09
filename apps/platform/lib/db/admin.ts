import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../db/schema';

/**
 * Privileged connection, used only where the product has to act outside a workspace:
 * creating beta invitations, provisioning the first workspace, health checks, migrations.
 *
 * It is not a general-purpose escape hatch. Anything that touches tenant data belongs in
 * `withUserDb`, where Postgres can check the caller for itself.
 */
// `||`, not `??`: an empty DATABASE_URL_ADMIN is what a half-filled .env.local looks like, and
// it should fall through to the pooled string rather than become a connection attempt to "".
const connectionString =
  process.env.DATABASE_URL_ADMIN?.trim() ||
  process.env.DATABASE_URL?.trim() ||
  'postgresql://placeholder:placeholder@localhost:5432/placeholder';

export const adminDb = drizzle(neon(connectionString), { schema });
