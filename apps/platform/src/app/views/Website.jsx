'use client';

import Link from 'next/link';
import { Icon } from '../icons';
import { PageHead, Card, EmptyState } from '../ui';
import { workspace, properties } from '../data';

function Field({ label, value, hint }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span className="ws-small ws-muted">{label}</span>
      <input
        defaultValue={value}
        disabled
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

export default function Website({ empty = false }) {
  if (empty) {
    return (
      <>
        <PageHead
          title="My website"
          description="A permanent address for the business, not a folder of links."
        />
        <EmptyState
          icon="website"
          title="Your site starts with your details"
          body="Add your name, markets and a short description. LAREI drafts the first version from that, and you edit it through structured controls rather than prompts."
          action={{ href: '/settings', label: 'Add business details' }}
          secondary={{ href: '/product', label: 'See what the page includes' }}
        />
      </>
    );
  }

  const published = properties.filter((p) => p.status === 'published').slice(0, 2);

  return (
    <>
      <PageHead
        title="My website"
        description="Published at a stable address. Sections you leave empty do not render."
        actions={
          <>
            <button type="button" className="ws-btn is-quiet" disabled>
              <Icon name="view" size={16} />
              Preview
            </button>
            <button type="button" className="ws-btn is-dark" disabled>
              <Icon name="upload" size={16} />
              Publish site
            </button>
          </>
        }
      />

      <div className="ws-split">
        <Card>
          <div className="ws-section-head">
            <h2>Business details</h2>
            <span className="ws-mono-note">Editing arrives with the database</span>
          </div>

          <div className="ws-grid is-2">
            <Field label="Business name" value={workspace.name} />
            <Field label="Public address" value={workspace.publicUrl} hint="Username changes redirect old links." />
            <Field label="Headline" value="Property in the Harbour district and Northbank" />
            <Field label="Contact email" value="hello@northaven.example" />
          </div>

          <div style={{ marginTop: 12, display: 'grid', gap: 6 }}>
            <span className="ws-small ws-muted">About</span>
            <div
              style={{
                borderRadius: 14,
                border: '1px solid var(--line)',
                background: 'var(--bone)',
                padding: 14,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--muted)',
              }}
            >
              We buy, prepare and present residential property across the Harbour district and
              Northbank. Six people, one process, no listings we would not send to a friend.
            </div>
          </div>

          <div className="ws-divider" />
          <div className="ws-section-head">
            <h2>Portfolio</h2>
            <Link href="/properties">Manage</Link>
          </div>
          <p className="ws-small ws-muted">
            Only published properties with public visibility appear here. {published.length} of{' '}
            {properties.length} qualify today.
          </p>
        </Card>

        <div className="ws-preview">
          <div className="ws-preview-bar">
            <span style={{ width: 9, height: 9, borderRadius: 99, background: '#d9d2c6' }} />
            <span style={{ width: 9, height: 9, borderRadius: 99, background: '#d9d2c6' }} />
            <span className="ws-preview-url">{workspace.publicUrl}</span>
          </div>

          <div className="ws-preview-site">
            <div className="ws-preview-hero">
              <img src="/images/interior-1.jpg" alt="" />
              <div>
                <div className="ws-preview-name">{workspace.name}</div>
                <div className="ws-preview-meta">Harbour district · Northbank · 4 properties</div>
              </div>
            </div>

            <div className="ws-preview-cards">
              {published.map((p) => (
                <div className="ws-preview-card" key={p.id}>
                  <img src={p.cover} alt="" />
                  <div>
                    <strong>{p.title}</strong>
                    <span>{p.place} · {p.price}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <span className="ws-btn is-dark is-sm" style={{ pointerEvents: 'none' }}>Ask a question</span>
              <span className="ws-btn is-quiet is-sm" style={{ pointerEvents: 'none' }}>Call</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
