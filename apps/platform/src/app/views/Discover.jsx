'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Icon } from '../icons';
import { PageHead, Card, EmptyState, Avatar } from '../ui';
import { requestConnection, toggleSave } from '../../../lib/actions/network';

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

function ConnectButton({ card, state }) {
  const [res, action, pending] = useActionState(requestConnection, { status: 'idle' });
  const status = state?.status;
  const direction = state?.direction;

  if (status === 'accepted') {
    return (
      <Link className="ws-btn is-quiet is-sm" href={`/messages?to=${card.userId}`}>
        <Icon name="mail" size={15} /> Message
      </Link>
    );
  }
  if (status === 'pending' && direction === 'out') {
    return <span className="ws-status is-quiet">Request sent</span>;
  }
  if (status === 'pending' && direction === 'in') {
    return (
      <Link className="ws-btn is-quiet is-sm" href="/network">
        Respond in Network
      </Link>
    );
  }
  if (status === 'blocked') {
    return <span className="ws-status is-quiet">Unavailable</span>;
  }
  return (
    <form action={action}>
      <input type="hidden" name="userId" value={card.userId} />
      <button className="ws-btn is-dark is-sm" disabled={pending} type="submit">
        {pending ? 'Sending…' : 'Connect'}
      </button>
      {res.status === 'error' ? (
        <span className="field-error" style={{ marginLeft: 8 }}>
          {res.message}
        </span>
      ) : null}
    </form>
  );
}

function SaveButton({ card, saved }) {
  const [, action, pending] = useActionState(toggleSave, { status: 'idle' });
  return (
    <form action={action}>
      <input type="hidden" name="profileId" value={card.profileId} />
      <input type="hidden" name="saved" value={saved ? '0' : '1'} />
      <button className="ws-btn is-quiet is-sm" disabled={pending} type="submit" aria-pressed={saved}>
        <Icon name="check" size={15} /> {saved ? 'Saved' : 'Save'}
      </button>
    </form>
  );
}

export default function Discover({ cards, states, savedIds, q = '', role = '' }) {
  const saved = new Set(savedIds);

  return (
    <>
      <PageHead
        title="Discover"
        description="Find real-estate professionals by what they do and where they work. Only published profiles appear here."
      />

      <form action="/discover" method="get" className="ws-search" style={{ marginBottom: 18, maxWidth: 460 }}>
        <Icon name="search" size={17} strokeWidth={1.8} />
        <input name="q" defaultValue={q} placeholder="Name, market or role" aria-label="Search professionals" />
        {role ? <input type="hidden" name="role" value={role} /> : null}
        <button className="ws-btn is-sm" type="submit">
          Search
        </button>
      </form>

      {cards.length === 0 ? (
        q || role ? (
          <EmptyState
            icon="search"
            title="No matches"
            body="Try a different name, market or role."
            action={{ href: '/discover', label: 'Clear search' }}
          />
        ) : (
          <EmptyState
            icon="search"
            title="No professionals here yet"
            body="Professionals appear here once they publish their profile. Publish yours so others can find you."
            action={{ href: '/website', label: 'Complete your profile' }}
          />
        )
      ) : (
        <div
          style={{
            display: 'grid',
            gap: 14,
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          }}
        >
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

              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <ConnectButton card={c} state={states[c.userId]} />
                <SaveButton card={c} saved={saved.has(c.profileId)} />
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
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}