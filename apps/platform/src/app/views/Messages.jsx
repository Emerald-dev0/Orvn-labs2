'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Icon } from '../icons';
import { PageHead, EmptyState, Avatar } from '../ui';
import { sendMessage } from '../../../lib/actions/network';

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

export default function Messages({ threads, active, thread, person, viewerId }) {
  const [state, action, pending] = useActionState(sendMessage, { status: 'idle' });

  return (
    <>
      <PageHead title="Messages" description="Private conversations inside ORREI. Only you and the other person can read them." />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 260px) 1fr',
          gap: 16,
          minHeight: 420,
        }}
      >
        <div className="ws-stack" style={{ display: 'grid', gap: 4, alignContent: 'start' }}>
          {threads.length === 0 ? null : (
            threads.map((t) => (
              <Link
                key={t.userId}
                href={`/messages?to=${t.userId}`}
                className={`ws-nav-item ${active === t.userId ? 'is-active' : ''}`}
                style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 12 }}
              >
                <Avatar initials={initials(t.name)} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {t.name}
                    {t.unread > 0 ? (
                      <span className="ws-nav-badge" style={{ marginLeft: 8 }}>
                        {t.unread}
                      </span>
                    ) : null}
                  </div>
                  <div
                    className="ws-small ws-muted"
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {t.lastBody}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div>
          {!active ? (
            <EmptyState
              icon="mail"
              title="No messages yet"
              body="When you connect with someone you can message them here, or start a conversation from a professional's profile in Discover."
              action={{ href: '/discover', label: 'Discover professionals' }}
            />
          ) : (
            <>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                <Avatar initials={initials(person?.name)} />
                <div>
                  <div style={{ fontWeight: 600 }}>{person?.name ?? 'ORREI member'}</div>
                  {person?.role ? <div className="ws-small ws-muted">{person.role}</div> : null}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginBottom: 16,
                  maxHeight: 360,
                  overflowY: 'auto',
                  padding: '2px 2px',
                }}
              >
                {thread.length === 0 ? (
                  <p className="ws-small ws-muted">No messages yet. Say hello.</p>
                ) : (
                  thread.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: m.mine ? 'flex-end' : 'flex-start',
                        maxWidth: '76%',
                        background: m.mine ? 'var(--ink)' : 'var(--bone)',
                        color: m.mine ? 'var(--bone)' : 'var(--ink)',
                        padding: '8px 12px',
                        borderRadius: 14,
                        fontSize: 14,
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {m.body}
                    </div>
                  ))
                )}
              </div>

              <form action={action} style={{ display: 'flex', gap: 8 }}>
                <input type="hidden" name="to" value={active} />
                <input
                  name="body"
                  placeholder="Write a message"
                  maxLength={2000}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 12,
                    border: '1px solid var(--line)',
                    padding: '0 12px',
                    fontSize: 14,
                    background: 'var(--bone)',
                    color: 'var(--ink)',
                  }}
                />
                <button className="ws-btn is-dark" disabled={pending} type="submit">
                  {pending ? 'Sending…' : 'Send'}
                </button>
              </form>
              {state.status === 'error' ? (
                <span className="field-error" style={{ marginTop: 8, display: 'inline-block' }}>
                  {state.message}
                </span>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}