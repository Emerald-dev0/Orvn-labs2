import { z } from 'zod';

/**
 * One place where environment configuration is parsed and typed.
 *
 * Rules:
 * - Nothing here is imported by client code. `serverEnv()` is server-only.
 * - Development tolerates missing optional integrations; production requires the ones a
 *   feature cannot work without, and fails closed rather than pretending.
 * - Parsing is lazy and cached, so `next build` can compile without a database.
 */

const optionalString = z.string().trim().min(1).optional();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Data
  DATABASE_URL: optionalString,

  // Auth
  BETTER_AUTH_SECRET: optionalString,
  BETTER_AUTH_URL: optionalString,
  ADMIN_EMAILS: optionalString,

  // Mail
  CALDER_API_KEY: optionalString,
  CALDER_API_URL: optionalString,
  MAIL_FROM: optionalString,

  // Object storage
  R2_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET: optionalString,

  // Analytics
  ANALYTICS_HASH_SALT: optionalString,
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (!cached) {
    cached = schema.parse(process.env);
  }
  return cached;
}

export function isProduction(): boolean {
  return serverEnv().NODE_ENV === 'production';
}

/** Missing keys that a production deployment must have before it may serve traffic. */
export function missingProductionConfig(env: ServerEnv = serverEnv()): string[] {
  const missing: string[] = [];
  if (!env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) missing.push('BETTER_AUTH_SECRET');
  if (!env.BETTER_AUTH_URL) missing.push('BETTER_AUTH_URL');
  if (!env.CALDER_API_KEY) missing.push('CALDER_API_KEY');
  if (!env.ANALYTICS_HASH_SALT || env.ANALYTICS_HASH_SALT.length < 16) missing.push('ANALYTICS_HASH_SALT');
  return missing;
}

export class ConfigurationError extends Error {
  readonly missing: string[];
  constructor(missing: string[]) {
    super(`Missing or invalid configuration: ${missing.join(', ')}`);
    this.name = 'ConfigurationError';
    this.missing = missing;
  }
}

/** Throws a readable error instead of letting a request fail three layers deeper. */
export function requireConfig(...keys: (keyof ServerEnv)[]): void {
  const env = serverEnv();
  const missing = keys.filter((k) => !env[k]);
  if (missing.length) throw new ConfigurationError(missing as string[]);
}
