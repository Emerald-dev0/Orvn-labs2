'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Icon } from '../icons';
import { PageHead, Card, EmptyState } from '../ui';
import { updateProfile, unpublishSite } from '../../../lib/actions/site';
import { workspace, properties } from '../data';

function Field({ label, name, value, hint, type = 'text', required = false, disabled = false }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span className="ws-small ws-muted">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={value ?? ''}
        required={required}
        disabled={disabled}
        style={{
          height: 40,
          borderRadius: 12,
          border: '1px solid var(--line)',
          background: 'var(--bone)',
          padding: '0 12px',
          fontSize: 14,
          color: 'var(--ink)',
        }}
      />
      {hint ? <span className="ws-small ws-muted" style={{ fontSize: 11.5 }}>{hint}</span> : null}
    </label>
  );
}

/** The sample build: real layout, demo values, nothing is saved. Behind the preview banner. */
function SampleView() {
  const published = properties.filter((p) => p.status === 'published').slice(0, 2);
  return (
    <>
      <PageHead
        title="Professional profile"
        description="Published at a stable address. Sections you leave empty do not render."
      />
      <div className="ws-split">
        <Card>
          <div className="ws-section-head">
            <h2>Business details</h2>
            <span className="ws-mono-note">Sample — nothing here is saved</span>
          </div>
          <div className="ws-grid is-2">
            <Field label="Business name" name="displayName" value={workspace.name} disabled />
            <Field label="Public address" name="publicUrl" value={workspace.publicUrl} disabled />
            <Field label="Headline" name="headline" value="Harbour district and Northbank" disabled />
            <Field label="Contact email" name="contactEmail" value="hello@example.com" disabled />
          </div>
          <div style={{ marginTop: 12, display: 'grid', gap: 6 }}>
            <span className="ws-small ws-muted">About</span>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>
              We prepare and present residential property across the Harbour district and
              Northbank. Sample profile — in a connected build this text is yours to edit.
            </p>
          </div>
          <div className="ws-divider" />
          <div className="ws-section-head">
            <h2>Portfolio</h2>
          </div>
          <p className="ws-small ws-muted">
            Only published properties with portfolio visibility appear here. {published.length} of{' '}
            {properties.length} qualify in the sample workspace.
          </p>
        </Card>
        <div className="ws-stack">
          <Card>
            <div className="ws-section-head"><h2>Publish</h2></div>
            <p className="ws-small ws-muted">
              In a connected build, saving publishes the page at /w/{workspace.handle}. Until then the
              preview banner at the top of the workspace says what is real.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function Website({ empty = false, data = null, sample = false }) {
  const [state, formAction, pending] = useActionState(updateProfile, { status: 'idle' });
  const [unpublishState, unpublishAction, unpublishPending] = useActionState(unpublishSite, { status: 'idle' });

  if (empty) {
    return (
      <>
        <PageHead
          title="Professional profile"
          description="The public page that carries your name, your markets and the properties you choose to show."
        />
        <EmptyState
          icon="website"
          title="Your profile starts with your details"
          body="Add your name, markets and a short description. ORREI drafts nothing without you — the profile is yours, published only when you choose."
          action={{ href: '/settings', label: 'Add business details' }}
        />
      </>
    );
  }

  if (sample || !data) {
    return <SampleView />;
  }

  const { profile, workspace: ws, publishedCount, totalCount } = data;
  const isLive = Boolean(profile?.publishedAt);

  return (
    <>
      <PageHead
        title="Professional profile"
        description="Published at a stable address. Sections you leave empty do not render."
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {isLive ? (
              <>
                <span className="ws-status is-live">Live</span>
                <Link className="ws-btn is-quiet" href={`/w/${ws.username}`} target="_blank" rel="noreferrer">
                  <Icon name="arrowUpRight" size={16} />
                  View public profile
                </Link>
              </>
            ) : (
              <span className="ws-status is-quiet">Not published</span>
            )}
          </div>
        }
      />

      <form action={formAction}>
        <div className="ws-split">
          <Card>
            <div className="ws-section-head">
              <h2>Business details</h2>
              <span className="ws-mono-note">{state.status === 'ok' ? state.message : 'Changes save when you press the button'}</span>
            </div>

            <div className="ws-grid is-2">
              <Field label="Public name" name="displayName" value={profile?.displayName ?? ws.name} required hint="The name buyers see on the page." />
              <Field label="Contact email" name="contactEmail" value={profile?.contactEmail ?? ''} type="email" hint="Inquiries go here. Required to publish." />
              <Field label="Headline" name="headline" value={profile?.headline ?? ''} hint="One line under your name." />
              <Field label="Markets" name="markets" value={(profile?.markets ?? []).join(', ')} hint="Comma-separated, up to 8." />
              <Field label="Contact phone" name="contactPhone" value={profile?.contactPhone ?? ''} hint="Shown only if you tick the box below." />
            </div>

            <div style={{ marginTop: 12, display: 'grid', gap: 6 }}>
              <span className="ws-small ws-muted">About</span>
              <textarea
                name="bio"
                defaultValue={profile?.bio ?? ''}
                rows={4}
                style={{
                  borderRadius: 14,
                  border: '1px solid var(--line)',
                  background: 'var(--bone)',
                  padding: 14,
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontFamily: 'var(--font-body)',
                  color: 'var(--ink)',
                }}
              />
            </div>

            <div className="ws-divider" />
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}>
              <input type="checkbox" name="showPhone" defaultChecked={profile?.showPhone ?? false} style={{ accentColor: 'var(--ink)' }} />
              Show my phone number on the public page
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, marginTop: 8 }}>
              <input type="checkbox" name="publishSite" defaultChecked={isLive} style={{ accentColor: 'var(--ink)' }} />
              Publish this profile publicly — saving while ticked makes it live at /w/{ws.username}
            </label>
            <p className="ws-small ws-muted" style={{ marginTop: 6 }}>
              Ticking this and saving publishes or re-publishes the page. To take it down, use
              Unpublish in the Portfolio card.
            </p>

            {state.status === 'error' ? (
              <p className="field-error" role="alert" style={{ marginTop: 12 }}>{state.message}</p>
            ) : null}

            <div style={{ marginTop: 14 }}>
              <button type="submit" className="ws-btn is-dark" disabled={pending}>
                {pending ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          </Card>

          <div className="ws-stack">
            <Card>
              <div className="ws-section-head">
                <h2>Portfolio</h2>
                <Link href="/properties">Manage</Link>
              </div>
              <p className="ws-small ws-muted">
                Only published properties with portfolio visibility appear here. {publishedCount} of{' '}
                {totalCount} qualify today.
              </p>
              <p className="ws-small ws-muted" style={{ marginTop: 8 }}>
                The public page lives at <code>/w/{ws.username}</code>. Unpublishing takes it offline
                immediately; previously downloaded files cannot be recalled.
              </p>
              {isLive ? (
                <div style={{ marginTop: 12 }}>
                  <button
                    type="submit"
                    className="ws-btn is-quiet is-sm"
                    formAction={unpublishAction}
                    disabled={unpublishPending}
                  >
                    {unpublishPending ? 'Unpublishing…' : 'Unpublish profile'}
                  </button>
                  {unpublishState.status === 'ok' ? (
                    <span className="ws-small ws-muted" style={{ marginLeft: 10 }}>{unpublishState.message}</span>
                  ) : null}
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      </form>
    </>
  );
}
