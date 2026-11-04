'use client';

import { useActionState } from 'react';
import { acceptInvite } from './actions';

export default function InviteForm({ token, needsWorkspace, workspaceName, role }) {
  const [state, formAction, pending] = useActionState(acceptInvite, { status: 'idle' });

  return (
    <form action={formAction} className="invite-form">
      <input type="hidden" name="token" value={token} />

      {needsWorkspace ? (
        <>
          <div className="invite-field">
            <label htmlFor="workspaceName">Business name</label>
            <input
              id="workspaceName"
              name="workspaceName"
              type="text"
              required
              minLength={2}
              maxLength={80}
              placeholder="Northaven Property Group"
              autoComplete="organization"
            />
          </div>
          <div className="invite-field">
            <label htmlFor="username">Public address</label>
            <div className="invite-prefix">
              <span>orvnlabs.com/w/</span>
              <input
                id="username"
                name="username"
                type="text"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                minLength={3}
                maxLength={30}
                placeholder="northaven"
                autoCapitalize="none"
                autoComplete="off"
              />
            </div>
            <span className="invite-hint">
              Lowercase letters, numbers and single hyphens. This becomes your public link.
            </span>
          </div>
        </>
      ) : (
        <div className="invite-summary">
          <div>
            <span className="invite-summary-label">Workspace</span>
            <strong>{workspaceName}</strong>
          </div>
          <div>
            <span className="invite-summary-label">Your role</span>
            <strong style={{ textTransform: 'capitalize' }}>{role ?? 'editor'}</strong>
          </div>
        </div>
      )}

      {state.status === 'error' ? (
        <p className="invite-error" role="alert">{state.message}</p>
      ) : null}

      <button type="submit" className="pub-btn is-dark" disabled={pending}>
        {pending ? 'Opening your workspace…' : needsWorkspace ? 'Create workspace' : 'Accept invitation'}
      </button>
    </form>
  );
}
