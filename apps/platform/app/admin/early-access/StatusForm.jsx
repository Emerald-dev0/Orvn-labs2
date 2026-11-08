'use client';

import { useActionState, useState } from 'react';
import { setApplicationStatus } from './actions';

/**
 * Status is one of four fixed values, so it is four buttons rather than a free-text field.
 *
 * The invite itself is still a script: creating a workspace provisions rows, a role and a first
 * owner, and a mis-click on a queue card should not be able to do that. The command is shown next
 * to the button so the two steps stay visible.
 */
export default function StatusForm({ id, status, statuses, email }) {
  const [state, submit, pending] = useActionState(setApplicationStatus, { status: 'idle' });
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`npm run invite --email ${email}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="adm-actions">
      <form action={submit}>
        <input type="hidden" name="id" value={id} />
        {statuses.map((option) => (
          <button
            key={option}
            type="submit"
            name="status"
            value={option}
            className={`adm-btn ${status === option ? 'is-current' : ''}`}
            disabled={pending || status === option}
          >
            {pending ? 'Saving…' : option}
          </button>
        ))}
      </form>

      <button type="button" className="adm-btn is-quiet" onClick={copy}>
        {copied ? 'Command copied' : 'Copy invite command'}
      </button>

      {state.status === 'error' ? (
        <span className="adm-note is-warn" role="alert">{state.message}</span>
      ) : null}
      {state.status === 'ok' ? (
        <span className="adm-note" role="status">{state.message}</span>
      ) : null}
    </div>
  );
}
