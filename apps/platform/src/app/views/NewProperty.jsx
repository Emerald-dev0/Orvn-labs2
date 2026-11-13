'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Icon } from '../icons';
import { PageHead, Card } from '../ui';
import { createProperty } from '../../../lib/actions/properties';

// PRD D03: launch picker is vacant land and single-family only, US only.
const TYPES = [
  { id: 'residential_land', label: 'Vacant land' },
  { id: 'SFR', label: 'Single-family home' },
];

/**
 * Intake. In a preview build the button says plainly that nothing is saved; with a database the
 * same form creates the record and goes straight to it, so the next step is reviewing facts
 * rather than filling in a second form.
 */
export default function NewProperty({ live = false }) {
  const [type, setType] = useState('residential_land');
  const [notice, setNotice] = useState(false);
  const [state, formAction, pending] = useActionState(createProperty, { status: 'idle' });

  const body = (
    <>
      <div className="ws-split">
        <div className="ws-stack">
          <Card>
            <div className="ws-section-head">
              <h2>What do you have?</h2>
            </div>

            <label className="ws-small ws-muted" htmlFor="np-title">Property title</label>
            <input
              id="np-title"
              name="title"
              type="text"
              required={live}
              minLength={3}
              maxLength={160}
              placeholder="Halden House"
              style={{
                width: '100%',
                marginTop: 8,
                marginBottom: 14,
                height: 44,
                padding: '0 14px',
                borderRadius: 14,
                border: '1px solid var(--line)',
                background: 'var(--bone)',
                fontSize: 14.5,
                fontFamily: 'var(--font-body)',
                color: 'var(--ink)',
              }}
            />

            <div className="ws-grid is-2" style={{ gap: 10, marginBottom: 14 }}>
              <div>
                <label className="ws-small ws-muted" htmlFor="np-city">City or district</label>
                <input
                  id="np-city"
                  name="city"
                  type="text"
                  maxLength={120}
                  placeholder="Harbour district"
                  style={{
                    width: '100%',
                    marginTop: 6,
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 14,
                    border: '1px solid var(--line)',
                    background: 'var(--bone)',
                    fontSize: 14.5,
                    fontFamily: 'var(--font-body)',
                    color: 'var(--ink)',
                  }}
                />
              </div>
              <div>
                <label className="ws-small ws-muted" htmlFor="np-region">Region or state</label>
                <input
                  id="np-region"
                  name="region"
                  type="text"
                  maxLength={120}
                  placeholder="Northbank"
                  style={{
                    width: '100%',
                    marginTop: 6,
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 14,
                    border: '1px solid var(--line)',
                    background: 'var(--bone)',
                    fontSize: 14.5,
                    fontFamily: 'var(--font-body)',
                    color: 'var(--ink)',
                  }}
                />
              </div>
            </div>

            <label className="ws-small ws-muted" htmlFor="np-notes">Notes, a listing blurb, or anything you would send a buyer</label>
            <textarea
              id="np-notes"
              name="notes"
              rows={6}
              placeholder={'e.g. Halden House, Harbour district. 4 bed, 3 bath, 620 sqm internal, walled garden. Asking 480k. Service charge 4,200 a year. Title documents on file.'}
              style={{
                width: '100%',
                marginTop: 8,
                padding: 14,
                borderRadius: 14,
                border: '1px solid var(--line)',
                background: 'var(--bone)',
                fontSize: 14.5,
                lineHeight: 1.6,
                resize: 'vertical',
                fontFamily: 'var(--font-body)',
                color: 'var(--ink)',
              }}
            />

            <div style={{ marginTop: 12 }}>
              <label className="ws-small ws-muted" htmlFor="np-apns">Parcel numbers (optional)</label>
              <input
                id="np-apns"
                name="apns"
                type="text"
                placeholder="017-234-11, 0017"
                style={{
                  width: '100%',
                  marginTop: 6,
                  height: 44,
                  padding: '0 14px',
                  borderRadius: 14,
                  border: '1px solid var(--line)',
                  background: 'var(--bone)',
                  fontSize: 14.5,
                  fontFamily: 'var(--font-body)',
                  color: 'var(--ink)',
                }}
              />
              <span className="ws-small ws-muted" style={{ fontSize: 11.5 }}>
                Stored as text exactly as you type it, leading zeros included.
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <button type="button" className="ws-btn is-quiet is-sm" disabled>
                <Icon name="upload" size={15} />
                Add files
              </button>
              <span className="ws-small ws-muted" style={{ alignSelf: 'center' }}>
                Photos and documents are added from the property page once it exists.
              </span>
            </div>
          </Card>

          <Card>
            <div className="ws-section-head">
              <h2>Property type</h2>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {TYPES.map((option) => (
                <label
                  key={option.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 14,
                    border: `1px solid ${type === option.id ? 'var(--ink)' : 'var(--line)'}`,
                    background: type === option.id ? 'var(--bone)' : 'var(--white)',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="radio"
                      name="propertyType"
                      value={option.id}
                      checked={type === option.id}
                      onChange={() => setType(option.id)}
                      style={{ accentColor: 'var(--ink)' }}
                    />
                    {option.label}
                  </span>
                  {type === option.id ? <Icon name="checkCircle" size={17} /> : null}
                </label>
              ))}
            </div>
            <p className="ws-small ws-muted" style={{ marginTop: 12 }}>
              Duplex, multifamily and other kinds arrive as they pass QA — one category at a time (PRD D03).
            </p>
          </Card>

          {state.status === 'error' ? (
            <div className="ws-callout is-warn" role="alert">
              <Icon name="alert" size={16} />
              <div>
                <strong>Nothing was created</strong>
                <p>{state.message}</p>
              </div>
            </div>
          ) : null}

          {notice ? (
            <div className="ws-callout is-warn">
              <Icon name="info" size={16} />
              <div>
                <strong>Nothing was saved</strong>
                <p>
                  This build is the interface only. Connect a database and this button creates the
                  record and takes you to it.
                </p>
              </div>
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {live ? (
              <button type="submit" className="ws-btn is-dark" disabled={pending}>
                {pending ? 'Creating…' : 'Create property'}
                <Icon name="arrowRight" size={16} />
              </button>
            ) : (
              <button type="button" className="ws-btn is-dark" onClick={() => setNotice(true)}>
                Build record
                <Icon name="arrowRight" size={16} />
              </button>
            )}
            <Link href="/properties" className="ws-btn is-quiet">Cancel</Link>
          </div>
        </div>

        <Card>
          <div className="ws-section-head">
            <h2>What happens next</h2>
          </div>
          <div className="ws-stack" style={{ gap: 16 }}>
            {[
              ['Record', 'The property is created as a draft. Nothing is public.'],
              ['Facts', 'Add values with their source, then approve them one by one.'],
              ['Publish', 'Only approved, public values reach the page. Nothing else leaves.'],
            ].map(([title, description], index) => (
              <div key={title} style={{ display: 'flex', gap: 11 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    background: 'var(--lime)',
                    color: 'var(--lime-ink)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 11.5,
                    fontWeight: 700,
                    flex: 'none',
                  }}
                >
                  {index + 1}
                </span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>
                  <div className="ws-small ws-muted" style={{ marginTop: 2 }}>{description}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );

  return (
    <>
      <Link href="/properties" className="ws-small ws-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Icon name="arrowLeft" size={14} />
        Properties
      </Link>

      <PageHead
        title="Create a property"
        description="Start from notes or the form. You approve every fact before anything is published."
      />

      {live ? <form action={formAction}>{body}</form> : body}
    </>
  );
}
