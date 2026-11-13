import Link from 'next/link';
import { requireAdmin } from '../../../lib/admin-guard';
import { APPLICATION_STATUSES, listApplications, statusCounts } from '../../../lib/data/admin';
import StatusForm from './StatusForm';
import { formatWhen } from '../../../lib/emails/when';

/** Long answers fold away so each card stays scannable; the full text is one click away. */
const FOLD_AT = 180;

function Answer({ label, text }) {
  const long = text.length > FOLD_AT;
  if (!long) {
    return (
      <div className="adm-answer">
        <span>{label}</span>
        <p>{text}</p>
      </div>
    );
  }
  return (
    <details className="adm-answer adm-fold">
      <summary>
        <span>{label}</span>
        <p>{text.slice(0, FOLD_AT).trimEnd()}…</p>
        <em>Show full answer</em>
      </summary>
      <p className="adm-full">{text}</p>
    </details>
  );
}

export const metadata = {
  title: 'Early access',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'invited', label: 'Invited' },
  { id: 'declined', label: 'Declined' },
];

export default async function EarlyAccessQueue({ searchParams }) {
  await requireAdmin();

  const query = await searchParams;
  const status = typeof query?.status === 'string' ? query.status : 'all';

  let applications = [];
  let error = null;
  try {
    applications = await listApplications(status);
  } catch (cause) {
    error = 'The database did not answer. Nothing is lost; reload when it is back.';
    console.error('[admin] queue read failed', { message: cause.message });
  }

  const counts = statusCounts(applications);
  const validStatus = FILTERS.some((filter) => filter.id === status);
  const active = validStatus ? status : 'all';

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker">Requests</p>
          <h1>Early access</h1>
          <p className="adm-lede">
            Everyone who asked for access, newest first. Requests are in the database first and
            emailed second, so a mail failure never loses an application.
          </p>
        </div>
        <div className="adm-count">
          <strong>{counts.all ?? 0}</strong>
          <span>total</span>
        </div>
      </div>

      <div className="adm-filters">
        {FILTERS.map((filter) => (
          <Link
            key={filter.id}
            href={filter.id === 'all' ? '/admin/early-access' : `/admin/early-access?status=${filter.id}`}
            className={`adm-chip ${active === filter.id ? 'is-active' : ''}`}
          >
            {filter.label}
            <span>{counts[filter.id] ?? 0}</span>
          </Link>
        ))}
      </div>

      {error ? (
        <div className="adm-empty">
          <strong>{error}</strong>
        </div>
      ) : applications.length === 0 ? (
        <div className="adm-empty">
          <strong>Nothing here yet.</strong>
          <p>
            {active === 'all'
              ? 'No request has been submitted. The form is at /early-access.'
              : `No application is marked ${active}.`}
          </p>
        </div>
      ) : (
        <ul className="adm-list">
          {applications.map((application) => (
            <li key={application.id} className="adm-card" id={application.id}>
              <div className="adm-card-head">
                <div>
                  <h2>{application.name}</h2>
                  <p className="adm-sub">
                    {application.company ? `${application.company} · ` : ''}
                    <a href={`mailto:${application.email}`}>{application.email}</a>
                  </p>
                </div>
                <span className={`adm-status is-${application.status}`}>{application.status}</span>
              </div>

              <dl className="adm-facts">
                {application.role ? (
                  <>
                    <dt>Role</dt>
                    <dd>{application.role}</dd>
                  </>
                ) : null}
                {application.markets ? (
                  <>
                    <dt>Market</dt>
                    <dd>{application.markets}</dd>
                  </>
                ) : null}
                {application.volume ? (
                  <>
                    <dt>Per month</dt>
                    <dd>{application.volume}</dd>
                  </>
                ) : null}
                {application.website ? (
                  <>
                    <dt>Website</dt>
                    <dd>{application.website}</dd>
                  </>
                ) : null}
                <dt>Received</dt>
                <dd>{formatWhen(new Date(application.createdAt))}</dd>
              </dl>

              {application.currentTools ? (
                <Answer label="Shares properties today with" text={application.currentTools} />
              ) : null}

              {application.frustration ? (
                <Answer label="The part that costs them time" text={application.frustration} />
              ) : null}

              <StatusForm
                id={application.id}
                status={application.status}
                statuses={APPLICATION_STATUSES}
                name={application.name}
                email={application.email}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
