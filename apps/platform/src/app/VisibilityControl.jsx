'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Icon } from './icons';
import { setVisibilityAction } from '../../lib/actions/properties';
import { VISIBILITIES, visibilityCopy } from '../../lib/publication/visibility';

/**
 * The visibility control.
 *
 * Three states, one decision. Each option is a submit button in the same form, so the choice is a
 * real write rather than a toggle that has to be saved separately, and the copy next to each one
 * states its limit plainly — link-only is unlisted, not confidential.
 *
 * When a move needs a publication check and the check fails, the action returns the blockers and
 * the record stays exactly where it was. Nothing is shown as changed until the server agrees.
 */
export default function VisibilityControl({ propertyId, visibility, blockers = [], publicPath }) {
  const [state, submit, pending] = useActionState(setVisibilityAction, { status: 'idle' });
  const current = visibilityCopy(visibility);
  const failures = state.status === 'error' ? state.blockers ?? [] : [];

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="ws-section-head" style={{ marginBottom: 0 }}>
        <h2>Who can see this page</h2>
        {publicPath && visibility !== 'private' ? (
          <a href={publicPath} target="_blank" rel="noreferrer" className="ws-small">
            Open page
          </a>
        ) : null}
      </div>

      <p className="ws-small ws-muted" style={{ margin: 0 }}>
        Right now: <strong>{current.label.toLowerCase()}</strong>. {current.summary}.
      </p>

      <form action={submit} style={{ display: 'grid', gap: 8 }}>
        <input type="hidden" name="propertyId" value={propertyId} />
        {VISIBILITIES.slice()
          .reverse()
          .map((option) => {
            const copy = visibilityCopy(option);
            const selected = option === visibility;
            return (
              <button
                key={option}
                type="submit"
                name="visibility"
                value={option}
                disabled={pending || selected}
                aria-pressed={selected}
                className={'ws-visibility-option' + (selected ? ' is-current' : '')}
              >
                <span className="ws-visibility-head">
                  <span className="ws-visibility-dot" aria-hidden="true" />
                  <strong>{copy.label}</strong>
                  <span className="ws-small ws-muted">{copy.summary}</span>
                  {selected ? <span className="ws-visibility-tag">Current</span> : null}
                </span>
                <span className="ws-small ws-muted">{copy.detail}</span>
              </button>
            );
          })}
        {pending ? <p className="ws-small ws-muted" style={{ margin: 0 }}>Saving…</p> : null}
      </form>

      {state.status === 'error' ? (
        <div className="ws-callout is-warn" role="alert">
          <Icon name="alert" size={16} />
          <div>
            <strong>Not changed</strong>
            {failures.length > 0 ? (
              <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
                {failures.map((item) => (
                  <li key={item} className="ws-small">{item}</li>
                ))}
              </ul>
            ) : (
              <p>{state.message}</p>
            )}
          </div>
        </div>
      ) : null}

      {state.status === 'ok' ? (
        <div className="ws-callout is-ok" role="status">
          <Icon name="checkCircle" size={16} />
          <div>
            <p>{state.message}</p>
          </div>
        </div>
      ) : null}

      {blockers.length > 0 ? (
        <p className="ws-small ws-muted" style={{ margin: 0 }}>
          Still to do before this page can go live:{' '}
          {blockers.slice(0, 3).join(' ')}
          {blockers.length > 3 ? ` (+${blockers.length - 3} more)` : ''}
        </p>
      ) : null}

      <p className="ws-small ws-muted" style={{ margin: 0 }}>
        Withdrawing a link takes effect on the next request: the page returns not found and the
        photos and documents stop being released, including for anyone who already has the URL.{' '}
        <Link href="/faq#publishing" className="ws-small">
          How sharing works
        </Link>
      </p>
    </div>
  );
}
