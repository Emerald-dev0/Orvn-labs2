import { missingProductionConfig, serverEnv } from '@/lib/env';
import { storageConfigured } from '@/lib/storage';

/**
 * Deployment posture, without secrets.
 *
 * Answers one question: is this deployment configured well enough to be trusted with a
 * password, an invitation or somebody's buyer inquiry? It reports booleans only.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const env = serverEnv();
  const missing = missingProductionConfig(env);
  const isProduction = env.NODE_ENV === 'production';

  const checks = {
    database: Boolean(env.DATABASE_URL),
    authSecret: Boolean(env.BETTER_AUTH_SECRET && env.BETTER_AUTH_SECRET.length >= 32),
    authUrl: Boolean(env.BETTER_AUTH_URL),
    email: Boolean(env.CALDER_API_KEY),
    storage: storageConfigured(),
    analyticsSalt: Boolean(env.ANALYTICS_HASH_SALT && env.ANALYTICS_HASH_SALT.length >= 16),
  };

  const ok = missing.length === 0;

  return Response.json(
    {
      status: ok ? 'ready' : isProduction ? 'misconfigured' : 'incomplete',
      environment: env.NODE_ENV,
      checks,
      missing: isProduction ? missing : [],
    },
    {
      status: isProduction && !ok ? 503 : 200,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
