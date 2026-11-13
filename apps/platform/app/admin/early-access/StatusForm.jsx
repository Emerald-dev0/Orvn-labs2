'use client';

import { useActionState, useState } from 'react';
import { inviteApplicant, setApplicationStatus } from './actions';

const LABELS = {
  new: 'New',
  reviewing: 'Reviewing',
  invited: 'Invited',
  declined: 'Declined',
};

const HINTS = {
  new: 'Not looked at yet',
  reviewing: 'Under review',
  invited: 'Invitation sent',
  declined: 'Not taking part now',
};

/**
 * Two actions on one request:
 *  - Send invitation: creates a single-use link for this address and emails it. Asks for a second
 *    click first, because it gives someone access to the beta.
 *  - Status: a plain record of where the request is. It does not send anything.
 */
export default function StatusForm({ id, status, statuses, name, email }) {
  const [statusState, submitStatus, statusPending] = useActionState(setApplicationStatus, { status: 'idle' });
  const [inviteState, submitInvite, invitePending] = useActionState(inviteApplicant, { status: 'idle' });
  const [confirming, setConfirming] = useState(false);

  const canInvite = status !== 'invited' && status !== 'declined';
  const message = inviteState.status !== 'idle' ? inviteState : statusState;

  return (
    <div className="adm-actions">
      {canInvite ? (
        confirming ? (
          <form action={submitInvite} className="adm-confirm">
            <input type="hidden" name="id" value={id} />
            <span>Send the beta invitation to <strong>{email}</strong>?</span>
            <button type="submit" className="adm-btn is-primary" disabled={invitePending}>
              {invitePending ? 'Sending…' : `Yes, send to ${name.split(' ')[0]}`}
            </button>
            <button type="button" className="adm-btn is-quiet" onClick={() => setConfirming(false)} disabled={invitePending}>
              Cancel
            </button>
          </form>
        ) : (
          <button type="button" className="adm-btn is-primary" onClick={() => setConfirming(true)}>
            Send invitation
          </button>
        )
      ) : null}

      <form action={submitStatus} className="adm-status-form" aria-label="Change status">
        <input type="hidden" name="id" value={id} />
        {statuses.filter((option) => option !== 'invited').map((option) => (
          <button
            key={option}
            type="submit"
            name="status"
            value={option}
            className={`adm-btn ${status === option ? 'is-current' : ''}`}
            disabled={statusPending || status === option}
            title={HINTS[option]}
            aria-pressed={status === option}
          >
            {statusPending && status !== option ? 'Saving…' : LABELS[option]}
          </button>
        ))}
      </form>

      {status === 'invited' ? <span className="adm-note is-ok">Invitation sent to {email}</span> : null}

      {message.status === 'error' ? (
        <span className="adm-note is-warn" role="alert">{message.message}</span>
      ) : null}
      {message.status === 'ok' ? (
        <span className="adm-note is-ok" role="status">{message.message}</span>
      ) : null}
    </div>
  );
}
