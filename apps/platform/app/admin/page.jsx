import Link from 'next/link';
import { requireAdmin } from '../../lib/admin-guard';
import { listApplications, statusCounts, APPLICATION_STATUSES } from '../../lib/data/admin';
import { missingProductionConfig, serverEnv } from '../../lib/env';
import { storageConfigured } from '../../lib/storage';

export const metadata = {
  title: 'Operator overview',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * The operator's front door: the two things an operator wants before anything else — is the
 * deployment healthy, and how many people are waiting on an answer — without tenant data and
 * without secrets. Counts are read fresh on every load; nothing is cached as "fine".
 */
export default async function AdminOverview() {
  await requireAdmin();

  const env = serverEnv();
  const checks = {
    database: Boolean(env.DATABASE_URL),
    authSecret: Boolean(env.BETTER_AUTH_SECRET && env.BETTER_AUTH_SECRET.length >= 32),
    authUrl: Boolean(env.BETTER_AUTH_URL),
    email: Boolean(env.CALDER_API_KEY),
    storage: storageConfigured(),
    analyticsSalt: Boolean(env.ANALYTICS_HASH_SALT && env.ANALYTICS_HASH_SALT.length >= 16),
  };
  const missing = missingProductionConfig(env);

  let applications = [];
  let readError = null;
  try {
    applications = await listApplications('all');
  } catch (cause) {
    readError = 'The database did not answer. Counts are not shown; reload when it is back.';
    console.error('[admin] overview counts failed', { message: cause.message });
  }
  const counts = applications.length ? statusCounts(applications) : null;

  const CHECK_LABELS = [
    ['database', 'Database'],
    ['authSecret', 'Sign-in secret'],
    ['authUrl', 'Sign-in URL'],
    ['email', 'Email delivery'],
    ['storage', 'File storage'],
    ['analyticsSalt', 'Analytics salt'],
  ];

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker">Operator</p>
          <h1>Overview</h1>
          <p className="adm-lede">
            Deployment posture and the waiting queue. Anything red here blocks a real invitation
            more reliably than any feature work — fix it before inviting anyone.
          </p>
        </div>
      </div>

      <section className="adm-answer" style={{ marginBottom: 18 }}>
        <span>Deployment posture</span>
        <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
          {CHECK_LABELS.map(([key, label]) => (
            <div
              key={key}
              style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13.5 }}
            >
              <span>{label}</span>
              <strong style={{ color: checks[key] ? 'inherit' : '#a33b2e' }}>
                {checks[key] ? 'ready' : 'missing'}
              </strong>
            </div>
          ))}
        </div>
        {missing.length > 0 ? (
          <p className="adm-muted" style={{ marginTop: 10 }}>
            Not production-ready: {missing.join(', ')}. See /api/health for the machine-readable
            version.
          </p>
        ) : (
          <p className="adm-muted" style={{ marginTop: 10 }}>
            All required values are set. Machine-readable version at /api/health.
          </p>
        )}
      </section>

      <section className="adm-answer" style={{ marginBottom: 18 }}>
        <span>Early-access queue</span>
        {readError ? (
          <p style={{ marginTop: 8 }}>{readError}</p>
        ) : (
          <>
            <p style={{ marginTop: 8, fontSize: 15 }}>
              <strong>{applications.length}</strong> total
              {APPLICATION_STATUSES.map((status) => (
                <span key={status} style={{ marginLeft: 12 }}>
                  {status}: <strong>{counts?.[status] ?? 0}</strong>
                </span>
              ))}
            </p>
            <p style={{ marginTop: 8 }}>
              <Link href="/admin/early-access">Open the queue →</Link>
            </p>
          </>
        )}
      </section>
    </>
  );
}
