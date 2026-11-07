'use client';

import { useActionState, useEffect, useState } from 'react';
import { Icon } from './icons';
import { acceptDraftAction, draftDescriptionAction } from '../../lib/actions/drafting';
import { decideFact } from '../../lib/actions/properties';
import { draftableFacts, unreviewedPublicFacts, wordDiff } from '../../lib/ai/draft';

const STATE_LABEL = {
  approved: 'Approved',
  unreviewed: 'Not reviewed',
  rejected: 'Rejected',
  unknown: 'Unknown',
};

/**
 * Drafting, with the review in the same place as the result.
 *
 * The order matters and is visible on screen: the facts the model may use are listed first, the
 * draft sits under them with the difference from the current description marked, and the only two
 * actions are accept (writes `description`) or discard (writes nothing). An unaccepted draft lives
 * in this component and nowhere else, so it can never reach the published page.
 */
export default function DraftPanel({ propertyId, description, facts = [] }) {
  const [draftState, draft, drafting] = useActionState(draftDescriptionAction, { status: 'idle' });
  const [acceptState, accept, accepting] = useActionState(acceptDraftAction, { status: 'idle' });
  const [text, setText] = useState('');

  useEffect(() => {
    if (draftState.status === 'ok' && draftState.draft) setText(draftState.draft);
  }, [draftState]);

  const usable = draftableFacts(facts);
  const pending = unreviewedPublicFacts(facts);
  const warnings = draftState.status === 'ok' ? draftState.warnings ?? [] : [];
  const hasDraft = text.trim().length > 0;
  const blocked = usable.length === 0 || pending.length > 0;
  const diff = hasDraft ? wordDiff(description || '', text) : [];

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="ws-section-head" style={{ marginBottom: 0 }}>
        <h2>Drafting</h2>
        <span className="ws-small ws-muted">
          {usable.length} approved {usable.length === 1 ? 'fact' : 'facts'} available
        </span>
      </div>

      <p className="ws-small ws-muted" style={{ margin: 0 }}>
        The draft is written from approved, public facts only. It cannot change a price, a number or
        a status, and it is not saved anywhere until you accept it.
      </p>

      <form
        action={draft}
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}
      >
        <input type="hidden" name="propertyId" value={propertyId} />
        <button type="submit" className="ws-btn is-dark" disabled={drafting || blocked}>
          <Icon name="refresh" size={15} />
          {drafting ? 'Drafting…' : hasDraft ? 'Draft again' : 'Draft a description'}
        </button>
        {hasDraft ? (
          <button type="button" className="ws-btn is-quiet" onClick={() => setText('')}>
            Discard draft
          </button>
        ) : null}
      </form>

      {blocked ? (
        <div className="ws-callout is-warn" role="status">
          <Icon name="alert" size={16} />
          <div>
            <strong>Drafting is blocked</strong>
            <p>
              {usable.length === 0
                ? 'No fact is approved and public yet, and drafting is not allowed to invent one.'
                : `${pending.length} public ${
                    pending.length === 1 ? 'fact has' : 'facts have'
                  } not been reviewed. Approve or reject them below.`}
            </p>
          </div>
        </div>
      ) : null}

      {draftState.status === 'error' ? (
        <div className="ws-callout is-warn" role="alert">
          <Icon name="alert" size={16} />
          <div>
            <strong>{drafting ? 'Drafting' : 'No draft'}</strong>
            <p>{draftState.message}</p>
          </div>
        </div>
      ) : null}

      {hasDraft ? (
        <div style={{ display: 'grid', gap: 10 }}>
          <div className="ws-section-head" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: 15 }}>Compared with the current description</h3>
            <span className="ws-small ws-muted">{text.trim().split(/\s+/).length} words</span>
          </div>

          <div className="ws-diff" aria-label="Draft compared with current description">
            {diff.map((token, index) => (
              <span key={index} className={'ws-diff-token is-' + token.kind}>
                {token.text}
                {index < diff.length - 1 ? ' ' : ''}
              </span>
            ))}
          </div>

          <label className="ws-small ws-muted" htmlFor="draft-text">
            Edit before accepting — every number still has to match a fact
          </label>
          <textarea
            id="draft-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={6}
            className="ws-input"
            style={{ width: '100%', resize: 'vertical', lineHeight: 1.6 }}
          />

          {warnings.length > 0 ? (
            <div className="ws-callout is-warn" role="alert">
              <Icon name="alert" size={16} />
              <div>
                <strong>Check this before accepting</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
                  {warnings.map((warning) => (
                    <li key={warning} className="ws-small">{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          <form action={accept} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input type="hidden" name="propertyId" value={propertyId} />
            <input type="hidden" name="draft" value={text} />
            <button
              type="submit"
              className="ws-btn is-lime"
              disabled={accepting || warnings.length > 0 || !text.trim()}
            >
              <Icon name="checkCircle" size={15} />
              {accepting ? 'Saving…' : 'Accept and replace the description'}
            </button>
          </form>

          {acceptState.status === 'ok' ? (
            <div className="ws-callout is-ok" role="status">
              <Icon name="checkCircle" size={16} />
              <div><p>{acceptState.message}</p></div>
            </div>
          ) : null}

          {acceptState.status === 'error' ? (
            <div className="ws-callout is-warn" role="alert">
              <Icon name="alert" size={16} />
              <div>
                <strong>Not saved</strong>
                <p>{acceptState.message}</p>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={{ display: 'grid', gap: 8 }}>
        <div className="ws-section-head" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: 15 }}>Facts the draft may use</h3>
          <span className="ws-small ws-muted">{facts.length} on this property</span>
        </div>
        {facts.length === 0 ? (
          <p className="ws-small ws-muted" style={{ margin: 0 }}>
            No facts recorded yet. Add facts on the Details tab before drafting.
          </p>
        ) : (
          facts.map((fact) => <FactReview key={fact.id} propertyId={propertyId} fact={fact} />)
        )}
      </div>
    </div>
  );
}

function FactReview({ propertyId, fact }) {
  const [state, decide, deciding] = useActionState(decideFact, { status: 'idle' });
  const used = fact.state === 'approved' && fact.public;

  return (
    <div className={'ws-fact-review' + (used ? ' is-used' : '')}>
      <div style={{ minWidth: 0 }}>
        <strong className="ws-small">{fact.key}</strong>
        <p className="ws-small ws-muted" style={{ margin: '2px 0 0' }}>
          {fact.value || 'No value'} · {STATE_LABEL[fact.state] ?? fact.state}
          {fact.public ? ' · public' : ' · not public'}
          {fact.source ? ` · ${fact.source}` : ''}
        </p>
        {state.status === 'error' ? (
          <p className="ws-small ws-muted" role="alert" style={{ margin: '4px 0 0' }}>
            {state.message}
          </p>
        ) : null}
      </div>
      <form action={decide} style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="hidden" name="factId" value={fact.id} />
        <button
          type="submit"
          name="decision"
          value="approved"
          className="ws-btn is-quiet"
          disabled={deciding || fact.state === 'approved'}
        >
          Approve
        </button>
        <button
          type="submit"
          name="decision"
          value="rejected"
          className="ws-btn is-quiet"
          disabled={deciding || fact.state === 'rejected'}
        >
          Reject
        </button>
      </form>
    </div>
  );
}
