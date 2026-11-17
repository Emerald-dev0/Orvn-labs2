'use client';

import { useActionState, useState } from 'react';
import { Icon } from './icons';
import { decideFact, removeFact, saveFact, setFactPublic, updateFact } from '../../lib/actions/properties';

/**
 * Manual fact management for the Details tab — the person, not the model, owns what goes public.
 *
 * Every control is a form posting to a server action: nothing flips until the server agrees.
 * An edit to an approved fact drops it back to unreviewed and private, because what was approved
 * was the old value. Approval is what makes a fact eligible to be public; visibility is a second,
 * deliberate choice per fact.
 */

function FactActions({ fact, propertyId }) {
  const [decideState, decide, deciding] = useActionState(decideFact, { status: 'idle' });
  const [publicState, setPublic, publicPending] = useActionState(setFactPublic, { status: 'idle' });
  const [removeState, remove, removing] = useActionState(removeFact, { status: 'idle' });
  const [confirming, setConfirming] = useState(false);

  const error = [decideState, publicState, removeState].find((s) => s.status === 'error');
  const busy = deciding || publicPending || removing;

  return (
    <div className="ws-fact-live-actions">
      <form action={decide} style={{ display: 'flex', gap: 6 }}>
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="hidden" name="factId" value={fact.id} />
        <button type="submit" name="decision" value="approved" className="ws-btn is-quiet is-sm" disabled={busy || fact.state === 'approved'}>
          Approve
        </button>
        <button type="submit" name="decision" value="rejected" className="ws-btn is-quiet is-sm" disabled={busy || fact.state === 'rejected'}>
          Reject
        </button>
        <button type="submit" name="decision" value="reset" className="ws-btn is-quiet is-sm" disabled={busy || fact.state === 'unreviewed'}>
          Reset
        </button>
      </form>

      <form action={setPublic}>
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="hidden" name="factId" value={fact.id} />
        {fact.public ? null : <input type="hidden" name="isPublic" value="true" />}
        <button
          type="submit"
          className="ws-btn is-quiet is-sm"
          disabled={busy || (!fact.public && fact.state !== 'approved')}
          title={!fact.public && fact.state !== 'approved' ? 'Approve this fact before making it public' : undefined}
        >
          {fact.public ? 'Make private' : 'Make public'}
        </button>
      </form>

      {confirming ? (
        <>
          <form action={remove}>
            <input type="hidden" name="propertyId" value={propertyId} />
            <input type="hidden" name="factId" value={fact.id} />
            <button type="submit" className="ws-btn is-quiet is-sm ws-danger-btn" disabled={busy}>
              {removing ? 'Removing…' : 'Confirm remove'}
            </button>
          </form>
          <button type="button" className="ws-btn is-quiet is-sm" onClick={() => setConfirming(false)}>
            Keep
          </button>
        </>
      ) : (
        <button type="button" className="ws-btn is-quiet is-sm ws-danger-btn" disabled={busy} onClick={() => setConfirming(true)}>
          <Icon name="trash" size={13} />
          Remove
        </button>
      )}

      {error ? (
        <p className="ws-small" role="alert" style={{ margin: 0, flexBasis: '100%' }}>{error.message}</p>
      ) : null}
    </div>
  );
}

function FactRow({ fact, propertyId }) {
  const [editState, edit, editing] = useActionState(updateFact, { status: 'idle' });

  return (
    <div className="ws-fact-live">
      <div className="ws-fact-live-head">
        <span className="ws-fact-key">
          {fact.key}
          {fact.public ? <span className="ws-fact-public">public</span> : null}
        </span>
        <span className="ws-fact-source">From {fact.source}</span>
      </div>
      <form action={edit} className="ws-fact-live-edit">
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="hidden" name="factId" value={fact.id} />
        <input name="value" defaultValue={fact.value} placeholder="Blank stays blank" aria-label={`Value for ${fact.key}`} />
        <button type="submit" className="ws-btn is-quiet is-sm" disabled={editing}>
          {editing ? 'Saving…' : 'Save'}
        </button>
      </form>
      <FactActions fact={fact} propertyId={propertyId} />
      {editState.status === 'ok' ? (
        <p className="ws-small ws-muted" role="status" style={{ margin: 0 }}>{editState.message}</p>
      ) : null}
      {editState.status === 'error' ? (
        <p className="ws-small" role="alert" style={{ margin: 0 }}>{editState.message}</p>
      ) : null}
    </div>
  );
}

export default function FactControls({ propertyId, facts }) {
  const [addState, add, adding] = useActionState(saveFact, { status: 'idle' });

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <form action={add} className="ws-fact-live-add">
        <input type="hidden" name="propertyId" value={propertyId} />
        <input name="key" required maxLength={60} placeholder="Field, e.g. zoning" aria-label="Field name" />
        <input name="value" maxLength={400} placeholder="Value (blank to record as not supplied)" aria-label="Value" />
        <label className="ws-small ws-muted" style={{ display: 'flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap' }}>
          <input type="checkbox" name="isPublic" />
          Make it public once approved
        </label>
        <button type="submit" className="ws-btn is-quiet is-sm" disabled={adding}>
          <Icon name="add" size={14} />
          Add field
        </button>
      </form>
      {addState.status !== 'idle' ? (
        <p className="ws-small ws-muted" role={addState.status === 'ok' ? 'status' : 'alert'} style={{ margin: 0 }}>
          {addState.message}
        </p>
      ) : null}

      {facts.length === 0 ? (
        <p className="ws-small ws-muted" style={{ margin: 0 }}>
          Nothing recorded yet. Add a field above, or extract from notes and a PDF below.
        </p>
      ) : (
        <div className="ws-fact-live-list">
          {facts.map((fact) => (
            <FactRow key={fact.id} fact={fact} propertyId={propertyId} />
          ))}
        </div>
      )}
    </div>
  );
}
