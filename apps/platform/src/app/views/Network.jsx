'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Icon } from '../icons';
import { PageHead, Card, EmptyState, Avatar } from '../ui';
import { respondConnection, cancelConnection } from '../../../lib/actions/network';

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

function Person({ info, subtitle }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Avatar initials={initials(info?.name)} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600 }}>{info?.name ?? 'ORREI member'}</div>
        {subtitle ?? (info?.role ? <div className="ws-small ws-muted">{info.role}</div> : null)}
      </div>
    </div>
  );
}

function RequestActions({ id }) {
  const [, action, pending] = useActionState(respondConnection, { status: 'idle' });
  return (
    <form action={action} style={{ display: 'flex', gap: 8 }}>
      <input type="hidden" name="id" value={id} />
      <button name="decision" value="accept" className="ws-btn is-dark is-sm" disabled={pending} type="submit">
        Accept
      </button>
      <button name="decision" value="decline" className="ws-btn is-quiet is-sm" disabled={pending} type="submit">
        Decline
      </button>
    </form>
  );
}

function Withdraw({ id }) {
  const [, action, pending] = useActionState(cancelConnection, { status: 'idle' });
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button className="ws-btn is-quiet is-sm" disabled={pending} type="submit">
        Withdraw
      </button>
    </form>
  );
}

export default function Network({ incoming, accepted, sent }) {
  const empty = incoming.length === 0 && accepted.length === 0 && sent.length === 0;

  return (
    <>
      <PageHead
        title="Network"
        description="Requests you have received, the people you are connected to, and the requests you have sent."
      />

      {empty ? (
        <EmptyState
          icon="user"
          title="No network activity yet"
          body="Discover professionals and send a connection request. When someone accepts, they appear here and you can message them."
          action={{ href: '/discover', label: 'Discover professionals' }}
        />
      ) : (
        <div className="ws-stack" style={{ display: 'grid', gap: 16 }}>
          {incoming.length > 0 ? (
            <Card>
              <div className="ws-section-head">
                <h2>Requests received</h2>
              </div>
              {incoming.map((c) => (
                <div
                  key={c.id}
                  style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}
                >
                  <Person info={c.info} />
                  <RequestActions id={c.id} />
                </div>
              ))}
            </Card>
          ) : null}

          {accepted.length > 0 ? (
            <Card>
              <div className="ws-section-head">
                <h2>Connected</h2>
              </div>
              {accepted.map((c) => (
                <div
                  key={c.id}
                  style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}
                >
                  <Person info={c.info} />
                  <Link className="ws-btn is-dark is-sm" href={`/messages?to=${c.other}`}>
                    <Icon name="mail" size={15} /> Message
                  </Link>
                </div>
              ))}
            </Card>
          ) : null}

          {sent.length > 0 ? (
            <Card>
              <div className="ws-section-head">
                <h2>Requests sent</h2>
              </div>
              {sent.map((c) => (
                <div
                  key={c.id}
                  style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}
                >
                  <Person info={c.info} subtitle={<span className="ws-small ws-muted">Pending</span>} />
                  <Withdraw id={c.id} />
                </div>
              ))}
            </Card>
          ) : null}
        </div>
      )}
    </>
  );
}