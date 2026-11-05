'use client';

import { useActionState } from 'react';
import { Icon } from './icons';
import { publishPropertyAction, unpublishPropertyAction } from '../../lib/actions/properties';

/**
 * The one place a record goes public.
 *
 * Publishing is a deliberate two-step: if anything is missing, the action returns the list of
 * blockers and nothing is written. Unpublishing is immediate, because withdrawing is always
 * the safer direction.
 */
export default function PublishBar({ propertyId, status, blockers = [], publicPath }) {
  const [publishState, publish, publishing] = useActionState(publishPropertyAction, { status: 'idle' });
  const [unpublishState, unpublish, unpublishing] = useActionState(unpublishPropertyAction, {
    status: 'idle',
  });

  const isLive = status === 'published';
  const message = publishState.status !== 'idle' ? publishState : unpublishState;
  const blocked = message.status === 'error' && Array.isArray(message.blockers) ? message.blockers : [];

  return (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {publicPath ? (
          <a href={publicPath} target="_blank" rel="noreferrer" className="ws-btn is-quiet">
            <Icon name="view" size={16} />
            {isLive ? 'Open page' : 'Preview'}
          </a>
        ) : null}

        {isLive ? (
          <form action={unpublish}>
            <input type="hidden" name="propertyId" value={propertyId} />
            <button type="submit" className="ws-btn is-quiet" disabled={unpublishing}>
              <Icon name="eyeOff" size={16} />
              {unpublishing ? 'Withdrawing…' : 'Unpublish'}
            </button>
          </form>
        ) : (
          <form action={publish}>
            <input type="hidden" name="propertyId" value={propertyId} />
            <button type="submit" className="ws-btn is-dark" disabled={publishing}>
              <Icon name="upload" size={16} />
              {publishing ? 'Publishing…' : 'Publish'}
            </button>
          </form>
        )}
      </div>

      {message.status === 'error' ? (
        <div className="ws-callout is-warn" style={{ maxWidth: 420 }} role="alert">
          <Icon name="alert" size={16} />
          <div>
            <strong>{blocked.length > 0 ? 'Not published yet' : 'That did not work'}</strong>
            {blocked.length > 0 ? (
              <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
                {blocked.map((item) => (
                  <li key={item} className="ws-small">{item}</li>
                ))}
              </ul>
            ) : (
              <p>{message.message}</p>
            )}
          </div>
        </div>
      ) : null}

      {message.status === 'ok' ? (
        <div className="ws-callout is-ok" style={{ maxWidth: 420 }} role="status">
          <Icon name="checkCircle" size={16} />
          <div>
            <p>{message.message}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
