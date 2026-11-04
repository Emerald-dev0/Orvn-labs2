'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '../icons';
import { PageHead, Card } from '../ui';

const TYPES = [
  { id: 'residential', label: 'House or apartment' },
  { id: 'vacant_land', label: 'Vacant land' },
  { id: 'package', label: 'Multi-property package' },
  { id: 'project', label: 'Project or showcase' },
];

export default function NewProperty() {
  const [type, setType] = useState('residential');
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState(false);

  return (
    <>
      <Link href="/properties" className="ws-small ws-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Icon name="arrowLeft" size={14} />
        Properties
      </Link>

      <PageHead
        title="Create a property"
        description="Start from notes, a brochure, or the form. You approve every fact before anything is published."
      />

      <div className="ws-split">
        <div className="ws-stack">
          <Card>
            <div className="ws-section-head">
              <h2>What do you have?</h2>
            </div>

            <label className="ws-small ws-muted" htmlFor="np-notes">Notes, a listing blurb, or anything you would send a buyer</label>
            <textarea
              id="np-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={'e.g. Halden House, Harbour district. 4 bed, 3 bath, 620 sqm internal, walled garden. Asking 480k. Service charge 4,200 a year. Title documents on file.'}
              rows={7}
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

            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <button type="button" className="ws-btn is-quiet is-sm">
                <Icon name="upload" size={15} />
                Add files
              </button>
              <button type="button" className="ws-btn is-quiet is-sm">
                <Icon name="link" size={15} />
                Paste a link
              </button>
              <span className="ws-small ws-muted" style={{ alignSelf: 'center' }}>
                PDF, DOCX, text and images. 10 files, 20 MB each.
              </span>
            </div>
          </Card>

          <Card>
            <div className="ws-section-head">
              <h2>Property type</h2>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 14,
                    border: `1px solid ${type === t.id ? 'var(--ink)' : 'var(--line)'}`,
                    background: type === t.id ? 'var(--bone)' : 'var(--white)',
                    fontSize: 14,
                    textAlign: 'left',
                  }}
                >
                  {t.label}
                  {type === t.id ? <Icon name="checkCircle" size={17} /> : null}
                </button>
              ))}
            </div>
            <p className="ws-small ws-muted" style={{ marginTop: 12 }}>
              Specialised fields for other property kinds are labelled, never forced into one form.
            </p>
          </Card>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ws-btn is-dark"
              onClick={() => setNotice(true)}
            >
              Build record
              <Icon name="arrowRight" size={16} />
            </button>
            <Link href="/properties" className="ws-btn is-quiet">Cancel</Link>
          </div>

          {notice ? (
            <div className="ws-callout is-warn">
              <Icon name="info" size={16} />
              <div>
                <strong>Nothing was saved</strong>
                <p>
                  This build is the interface only. Saving, extraction and publishing arrive with the
                  database in the next milestone.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <Card>
          <div className="ws-section-head">
            <h2>What happens next</h2>
          </div>
          <div className="ws-stack" style={{ gap: 16 }}>
            {[
              ['Extraction', 'Values are pulled out with their source, so nothing appears without a trail.'],
              ['Review', 'Conflicts are shown side by side. You accept, replace or mark unknown.'],
              ['Publish', 'Only approved facts reach the page. Unapproved values stay private.'],
            ].map(([title, body], i) => (
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
                  {i + 1}
                </span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>
                  <div className="ws-small ws-muted" style={{ marginTop: 2 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
