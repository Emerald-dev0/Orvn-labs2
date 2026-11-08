import Link from 'next/link';
import { requireAdmin } from '../../../lib/admin-guard';
import { APPLICATION_STATUSES, listApplications, statusCounts } from '../../../lib/data/admin';
import StatusForm from './StatusForm';

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

const WHEN = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
  timeZoneName: 'short',
});

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
                <dd>{WHEN.format(new Date(application.createdAt))}</dd>
              </dl>

              {application.currentTools ? (
                <div className="adm-answer">
                  <span>Shares properties today with</span>
                  <p>{application.currentTools}</p>
                </div>
              ) : null}

              {application.frustration ? (
                <div className="adm-answer">
                  <span>The part that costs them time</span>
                  <p>{application.frustration}</p>
                </div>
              ) : null}

              <StatusForm
                id={application.id}
                status={application.status}
                statuses={APPLICATION_STATUSES}
                email={application.email}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
