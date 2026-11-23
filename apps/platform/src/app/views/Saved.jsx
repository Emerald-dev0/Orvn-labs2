'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Icon } from '../icons';
import { PageHead, Card, EmptyState, Avatar } from '../ui';
import { toggleSave } from '../../../lib/actions/network';

function initials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || '•'
  );
}

function RemoveButton({ profileId }) {
  const [, action, pending] = useActionState(toggleSave, { status: 'idle' });
  return (
    <form action={action}>
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="saved" value="0" />
      <button className="ws-btn is-quiet is-sm" disabled={pending} type="submit">
        Remove
      </button>
    </form>
  );
}

export default function Saved({ cards }) {
  return (
    <>
      <PageHead
        title="Saved"
        description="Professionals you bookmarked for later. Only you can see this list."
      />

      {cards.length === 0 ? (
        <EmptyState
          icon="check"
          title="Nothing saved yet"
          body="Save a professional from Discover to keep their profile here for later."
          action={{ href: '/discover', label: 'Discover professionals' }}
        />
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))' }}>
          {cards.map((c) => (
            <Card key={c.profileId}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Avatar initials={initials(c.name)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  {c.role ? <div className="ws-small ws-muted">{c.role}</div> : null}
                  {c.headline ? (
                    <p className="ws-small" style={{ margin: '6px 0 0', color: 'var(--muted)' }}>
                      {c.headline}
                    </p>
                  ) : null}
                  {c.markets?.length ? (
                    <div className="ws-small ws-muted" style={{ marginTop: 6 }}>
                      {c.markets.slice(0, 6).join(' · ')}
                    </div>
                  ) : null}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                {c.username ? (
                  <Link
                    className="ws-btn is-quiet is-sm"
                    href={`/w/${c.username}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View profile
                  </Link>
                ) : null}
                <RemoveButton profileId={c.profileId} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}