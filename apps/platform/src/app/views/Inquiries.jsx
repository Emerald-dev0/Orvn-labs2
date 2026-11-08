'use client';

import { useState } from 'react';
import { Icon } from '../icons';
import { PageHead, Card, EmptyState } from '../ui';
import { inquiries } from '../data';

export default function Inquiries({ empty = false, items: provided = inquiries }) {
  const [selectedId, setSelectedId] = useState(provided[0]?.id);
  const items = empty ? [] : provided;
  const selected = items.find((i) => i.id === selectedId) ?? items[0];

  if (empty) {
    return (
      <>
        <PageHead
          title="Inquiries"
          description="People who wrote to you from a published page. Nothing here is a lead score."
        />
        <EmptyState
          icon="inquiries"
          title="No inquiries yet"
          body="When someone sends a question from a property page, it lands here with the property attached. Visitors who only look around stay anonymous."
          action={{ href: '/website', label: 'Check your site is published' }}
          secondary={{ href: '/analytics', label: 'See page views' }}
        />
      </>
    );
  }

  return (
    <>
      <PageHead
        title="Inquiries"
        description={`${items.filter((i) => i.status === 'new').length} unread · ${items.length} total`}
      />

      <div className="ws-inbox">
        <Card style={{ padding: 8 }}>
          <div className="ws-list" style={{ gap: 2 }}>
            {items.map((i) => (
              <button
                key={i.id}
                type="button"
                className={`ws-inq-item ${selected?.id === i.id ? 'is-active' : ''}`}
                onClick={() => setSelectedId(i.id)}
              >
                <div className="ws-inq-top">
                  <span className="ws-inq-name">{i.name}</span>
                  <span className="ws-inq-when">{i.when}</span>
                </div>
                <div className="ws-inq-property">{i.property}</div>
                <p className="ws-inq-preview">{i.message}</p>
              </button>
            ))}
          </div>
        </Card>

        {selected ? (
          <Card>
            <div className="ws-section-head">
              <h2>{selected.property}</h2>
              <span className={`ws-status ${selected.status === 'new' ? 'is-live' : 'is-muted'}`}>
                <span className="ws-status-dot" />
                {selected.status === 'new' ? 'New' : 'Read'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span
                className="ws-avatar"
                style={{ width: 40, height: 40, fontSize: 14, background: 'var(--bone-2)', color: 'var(--ink)' }}
              >
                {selected.name.split(' ').map((n) => n[0]).join('')}
              </span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{selected.name}</div>
                <a href={`mailto:${selected.email}`} className="ws-small ws-muted">{selected.email}</a>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 14,
                background: 'var(--bone)',
                fontSize: 14.5,
                lineHeight: 1.65,
                color: 'var(--ink-2)',
              }}
            >
              {selected.message}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <a href={`mailto:${selected.email}`} className="ws-btn is-dark">
                <Icon name="mail" size={16} />
                Reply by email
              </a>
              <button type="button" className="ws-btn is-quiet">Mark as read</button>
              <button type="button" className="ws-btn is-quiet">Archive</button>
            </div>

            <p className="ws-small ws-muted" style={{ marginTop: 14 }}>
              Replies go from your own inbox. The platform does not send anything on your behalf.
            </p>
          </Card>
        ) : null}
      </div>
    </>
  );
}
