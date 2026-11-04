'use client';

import Link from 'next/link';
import { Icon } from '../icons';
import { PageHead, Card, StatCard, StatusPill, EmptyState } from '../ui';
import { properties, stats, activity, inquiries } from '../data';

function CreateButton() {
  return (
    <Link href="/properties/new" className="ws-btn is-lime">
      <Icon name="add" size={16} strokeWidth={2.2} />
      Create property
    </Link>
  );
}

export default function Dashboard({ empty = false }) {
  const waiting = properties.filter((p) => p.status === 'needs_review' || p.status === 'draft');

  if (empty) {
    return (
      <>
        <PageHead
          title="Overview"
          description="Your workspace is ready. Nothing is published yet, and nothing is shared until you say so."
          actions={<CreateButton />}
        />
        <EmptyState
          icon="properties"
          title="Start with one property"
          body="Paste your notes, drop a brochure, or fill the form by hand. LAREI builds the record first, then the page, and waits for you to approve the facts."
          action={{ href: '/properties/new', label: 'Create your first property' }}
          secondary={{ href: '/how-it-works', label: 'See how it works' }}
        />
      </>
    );
  }

  return (
    <>
      <PageHead
        title="Overview"
        description="What is published, what is waiting, and who got in touch."
        actions={<CreateButton />}
      />

      <div className="ws-grid is-4" style={{ marginBottom: 14 }}>
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="ws-split">
        <Card>
          <div className="ws-section-head">
            <h2>Properties</h2>
            <Link href="/properties">View all</Link>
          </div>

          <div className="ws-list">
            {properties.slice(0, 3).map((p) => (
              <Link key={p.id} href={`/properties/${p.id}`} className="ws-row" style={{ textDecoration: 'none' }}>
                <img src={p.cover} alt="" className="ws-row-thumb" />
                <div>
                  <div className="ws-row-title">{p.title}</div>
                  <div className="ws-row-sub">{p.place} · {p.type}</div>
                </div>
                <div className="ws-row-cell is-price"><strong>{p.price}</strong></div>
                <div className="ws-row-cell"><StatusPill status={p.status} /></div>
                <div className="ws-row-cell is-updated">{p.views ? `${p.views} views` : 'No views yet'}</div>
                <Icon name="arrowRight" size={16} className="ws-row-arrow" />
              </Link>
            ))}
          </div>
        </Card>

        <div className="ws-stack">
          {waiting.length ? (
            <Card>
              <div className="ws-section-head">
                <h2>Needs your attention</h2>
                <span className="ws-small ws-muted">{waiting.length}</span>
              </div>
              <div className="ws-stack" style={{ gap: 8 }}>
                {waiting.map((p) => (
                  <Link
                    key={p.id}
                    href={`/properties/${p.id}`}
                    className="ws-callout is-warn"
                    style={{ textDecoration: 'none', display: 'flex' }}
                  >
                    <Icon name="alert" size={16} />
                    <div>
                      <strong>{p.title}</strong>
                      <p>{p.nextAction}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}

          <Card>
            <div className="ws-section-head">
              <h2>Recent activity</h2>
            </div>
            <div className="ws-stack" style={{ gap: 11 }}>
              {activity.slice(0, 4).map((a) => (
                <div key={a.id} style={{ display: 'flex', gap: 10 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: 'var(--lime-2)',
                      marginTop: 6,
                      flex: 'none',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{a.text}</div>
                    <div className="ws-small ws-muted">{a.detail} · {a.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="ws-section-head">
              <h2>Inquiries</h2>
              <Link href="/inquiries">Open</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: '-0.03em' }}>
                {inquiries.filter((i) => i.status === 'new').length}
              </strong>
              <span className="ws-small ws-muted">unread · {inquiries.length} total</span>
            </div>
            <p className="ws-small ws-muted" style={{ marginTop: 6 }}>
              Anonymous visitors stay anonymous. An inquiry is the only place a buyer identifies themselves.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
