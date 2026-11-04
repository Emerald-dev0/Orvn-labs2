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
const connectionString =
  process.env.DATABASE_URL_ADMIN ??
  process.env.DATABASE_URL ??
  'postgresql://placeholder:placeholder@localhost:5432/placeholder';

export const adminDb = drizzle(neon(connectionString), { schema });
