'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { Icon } from './icons';
import { acceptExtractionAction, extractNotesAction } from '../../lib/actions/extraction';
import { extractionKeyLabel } from '../../lib/ai/extract';

/**
 * Extract from pasted notes — the reviewed path from unstructured text to record facts.
 *
 * Three visible guarantees, in the order a careful person checks them:
 * - the model is told the notes are content, not commands;
 * - every proposed fact shows the exact snippet it came from, and a candidate whose snippet is
 *   not in the notes never reaches this screen;
 * - nothing is written until you accept, conflicts need an explicit keep/change/unknown choice,
 *   and even then the facts land as unreviewed — approval is a separate act on this same tab.
 */
export default function ExtractPanel({ propertyId }) {
  const [state, extract, extracting] = useActionState(extractNotesAction, { status: 'idle' });
  const [acceptState, accept, accepting] = useActionState(acceptExtractionAction, { status: 'idle' });
  const [checked, setChecked] = useState({});
  const [decisions, setDecisions] = useState({});

  const candidates = state.status === 'ok' ? state.candidates ?? [] : [];
  const comparisons = state.status === 'ok' ? state.comparisons ?? [] : [];
  const notes = state.status === 'ok' ? state.notes ?? '' : '';

  // compareWithCurrent maps over the candidates in order, so comparison index === candidate index.
  const comparisonFor = (index) => comparisons[index] ?? null;

  const conflictIndices = useMemo(
    () => candidates.map((_, i) => i).filter((i) => comparisons[i]?.kind === 'conflict'),
    [candidates, comparisons],
  );

  useEffect(() => {
    const next = {};
    const nextDecisions = {};
    candidates.forEach((_, i) => {
      next[i] = true;
      nextDecisions[i] = 'keep';
    });
    setChecked(next);
    setDecisions(nextDecisions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates]);

  const toggle = (index) => setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  const setDecision = (index, value) => setDecisions((prev) => ({ ...prev, [index]: value }));

  const conflictsNeedingDecision = conflictIndices.filter((i) => checked[i] && !decisions[i]);
  const payload = JSON.stringify({
    accepted: candidates
      .map((candidate, index) => ({ candidate, index }))
      .filter(({ index }) => checked[index])
      .map(({ candidate, index }) => ({
        key: candidate.key,
        value: candidate.value,
        snippet: candidate.snippet,
        ...(conflictIndices.includes(index) ? { decision: decisions[index] } : {}),
      })),
  });

  return (
    <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
      <div className="ws-section-head" style={{ marginBottom: 0 }}>
        <h2>Extract from notes</h2>
        <span className="ws-small ws-muted">Paste first · documents next</span>
      </div>

      <p className="ws-small ws-muted" style={{ margin: 0 }}>
        Paste whatever you have — a seller text, a broker email, your own notes. The service proposes
        facts with the exact line each came from. It never follows instructions hidden in the notes,
        never fills in what is not stated, and saves nothing until you accept.
      </p>

      <form action={extract} style={{ display: 'grid', gap: 10 }}>
        <input type="hidden" name="propertyId" value={propertyId} />
        <textarea
          name="notes"
          required
          rows={5}
          maxLength={20000}
          className="ws-input"
          placeholder={'4 bed 3 bath, ~2,200 sq ft, lot 0.21 acres fee simple\nAsking $480,000, HOA $95/month\nSeller says roof 2019, AC unknown\nSource: call with Marcus, 12 Nov'}
          style={{ width: '100%', resize: 'vertical', lineHeight: 1.6 }}
          aria-label="Paste notes to extract facts from"
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="submit" className="ws-btn is-dark" disabled={extracting}>
            <Icon name="magic" size={15} />
            {extracting ? 'Extracting…' : 'Extract facts'}
          </button>
          <span className="ws-small ws-muted">Notes go to the drafting service; the record is untouched until you accept.</span>
        </div>
      </form>

      {state.status === 'error' ? (
        <div className="ws-callout is-warn" role="alert">
          <Icon name="alert" size={16} />
          <div>
            <strong>Nothing extracted</strong>
            <p>{state.message}</p>
          </div>
        </div>
      ) : null}

      {state.status === 'ok' && candidates.length > 0 ? (
        <form action={accept} style={{ display: 'grid', gap: 10 }}>
          <input type="hidden" name="propertyId" value={propertyId} />
          <input type="hidden" name="notes" value={notes} readOnly hidden />
          <input type="hidden" name="payload" value={payload} readOnly />

          {conflictIndices.length > 0 ? (
            <div className="ws-callout is-warn" role="status">
              <Icon name="alert" size={16} />
              <div>
                <strong>Two sources disagree. Choose which to use.</strong>
                <p>Your record keeps what you chose. Nothing is overwritten silently, and neither value is treated as verified.</p>
              </div>
            </div>
          ) : null}

          <div style={{ display: 'grid', gap: 8 }}>
            {candidates.map((candidate, index) => {
              const comparison = comparisonFor(index);
              const isConflict = comparison?.kind === 'conflict';
              return (
                <div
                  key={`${candidate.key}-${index}`}
                  style={{
                    display: 'grid',
                    gap: 6,
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: 14,
                    background: isConflict ? 'var(--bone)' : 'transparent',
                  }}
                >
                  <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(checked[index])}
                      onChange={() => toggle(index)}
                      style={{ marginTop: 3, accentColor: 'var(--ink)' }}
                    />
                    <span style={{ minWidth: 0 }}>
                      <span className="ws-small" style={{ fontWeight: 600 }}>
                        {extractionKeyLabel(candidate.key)}: {candidate.value}
                      </span>
                      <span className={'ws-mono-note'} style={{ display: 'block', marginTop: 2 }}>
                        {isConflict ? 'SOURCE CONFLICT' : 'SUPPLIED BY YOU'} · from your notes: “{candidate.snippet}”
                        {candidate.unitAmbiguous ? ' · unit not stated' : ''}
                      </span>
                    </span>
                  </label>

                  {isConflict && checked[index] ? (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingLeft: 26 }}>
                      <span className="ws-small ws-muted" style={{ alignSelf: 'center' }}>
                        On the record: “{comparison.conflict.current}”
                      </span>
                      {[
                        ['keep', 'Keep'],
                        ['change', 'Use the notes'],
                        ['unknown', 'Neither — unknown'],
                      ].map(([value, label]) => (
                        <label key={value} className="ws-small" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <input
                            type="radio"
                            name={`decision-${index}`}
                            checked={decisions[index] === value}
                            onChange={() => setDecision(index, value)}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button type="submit" className="ws-btn is-lime" disabled={accepting || conflictsNeedingDecision.length > 0}>
              <Icon name="checkCircle" size={15} />
              {accepting ? 'Saving…' : 'Add selected facts for review'}
            </button>
            <span className="ws-small ws-muted">They land as “Not reviewed” — approve them below before they can go public.</span>
          </div>
        </form>
      ) : null}

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
            {acceptState.blockers?.length ? (
              <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
                {acceptState.blockers.map((blocker) => <li key={blocker} className="ws-small">{blocker}</li>)}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
