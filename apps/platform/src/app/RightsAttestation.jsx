'use client';

import { useActionState, useState } from 'react';
import { Icon } from './icons';
import { attestRights } from '../../lib/actions/properties';

/**
 * The rights attestation.
 *
 * Publishing is only allowed after the person marketing the property confirms they may do so.
 * The attestation is explicit — an unchecked box, not a pre-ticked condition — and it is recorded
 * with who attested and when, so the audit trail shows it.
 */
export default function RightsAttestation({ propertyId }) {
  const [state, submit, pending] = useActionState(attestRights, { status: 'idle' });
  const [checked, setChecked] = useState(false);

  if (state.status === 'ok') {
    return (
      <div className="ws-callout is-ok" role="status">
        <Icon name="checkCircle" size={16} />
        <div>
          <p>{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={submit} className="ws-callout is-warn" style={{ display: 'grid', gap: 10 }}>
      <Icon name="alert" size={16} style={{ display: 'none' }} />
      <input type="hidden" name="propertyId" value={propertyId} />
      <div>
        <strong>Before you publish</strong>
        <p className="ws-small ws-muted" style={{ marginTop: 4 }}>
          Confirm you have the authority to publish this property’s facts, photos and documents —
          as the owner, the listing authority, the holder of a contract, or the marketer the
          seller asked to find a buyer. Publishing something you are not authorised to publish is
          not something this button can fix afterwards.
        </p>
      </div>
      <label className="ws-small" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          style={{ marginTop: 3 }}
        />
        <span>I confirm I have the right to publish this property and its media.</span>
      </label>
      {state.status === 'error' ? (
        <p className="ws-small" role="alert" style={{ margin: 0 }}>{state.message}</p>
      ) : null}
      <div>
        <button type="submit" className="ws-btn is-dark is-sm" disabled={!checked || pending}>
          <Icon name="checkCircle" size={15} />
          {pending ? 'Recording…' : 'Confirm and record'}
        </button>
      </div>
    </form>
  );
}
