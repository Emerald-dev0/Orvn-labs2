import Link from 'next/link';
import { requireAdmin } from '../../../lib/admin-guard';
import { APPLICATION_STATUSES, listApplications, statusCounts } from '../../../lib/data/admin';
import StatusForm from './StatusForm';
import { formatWhen } from '../../../lib/emails/when';

/** One labelled answer. Shown in full: an operator decides from the words the person used. */
function Answer({ label, text }) {
  return (
    <div className="adm-answer">
      <span>{label}</span>
      <p>{text}</p>
    </div>
  );
}

/** A field that may be empty. Empty is written out, so a blank does not look like a bug. */
function Field({ label, value, children }) {
  return (
    <div className="adm-field">
      <dt>{label}</dt>
      <dd>{children ?? (value ? value : <span className="adm-muted">Not given</span>)}</dd>
    </div>
  );
}

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
                    <a href={`mailto:${application.email}`}>{application.email}</a>
                    {application.company ? <> · {application.company}</> : null}
                  </p>
                </div>
                <span className={`adm-status is-${application.status}`}>{STATUS_LABEL[application.status] ?? application.status}</span>
              </div>

              <dl className="adm-fields">
                <Field label="Role" value={application.role} />
                <Field label="Primary market" value={application.markets} />
                <Field label="Properties per month" value={application.volume} />
                <Field label="Website or profile" value={application.website}>
                  {application.website ? (
                    <a href={/^https?:\/\//i.test(application.website) ? application.website : `https://${application.website}`} rel="noopener noreferrer nofollow" target="_blank">{application.website}</a>
                  ) : null}
                </Field>
                <Field label="Consent recorded">{application.consent ? 'Yes' : 'No'}</Field>
                <Field label="Received">{formatWhen(new Date(application.createdAt))}</Field>
              </dl>

              <div className="adm-answers">
                <Answer label="How they share properties today" text={application.currentTools || 'Not answered'} />
                <Answer label="The part that costs them time" text={application.frustration || 'Not answered'} />
              </div>

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
