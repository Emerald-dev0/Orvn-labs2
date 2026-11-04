import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';

/**
 * Neon over HTTP. One connection string, pooled by Neon; nothing to keep alive in a Worker.
 *
 * The fallback exists so schema tooling and `next build` can import this module without a
 * database. Any real query without DATABASE_URL fails loudly at request time, not silently.
 */
const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

export const hasDatabase = Boolean(process.env.DATABASE_URL);

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
