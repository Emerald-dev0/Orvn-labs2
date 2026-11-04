import React from 'react';
import { Reveal, MaskedLines } from './Reveal';

/**
 * Chapter head — the recurring editorial marker for every section.
 * A rule, an index, a label, and a title. It is what makes the site feel
 * like one printed document rather than a stack of landing pages.
 */
export default function ChapterHead({ index, label, title, note, dark = false, titleMax, children }) {
  const lines = Array.isArray(title) ? title : [title];
  return (
    <div className={`chapter-head ${dark ? 'on-dark' : ''}`}>
      <div className="chapter-meta">
        <span className="chapter-index">
          <i className="tick" style={{ background: dark ? 'var(--ember-bright)' : 'var(--ember)' }} />
          {index}
        </span>
        <span className="chapter-label">{label}</span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: note ? 'minmax(0, 1.5fr) minmax(0, 0.5fr)' : '1fr',
          gap: 'clamp(16px, 3vw, 48px)',
          alignItems: 'end',
          marginTop: 'clamp(18px, 2.2vw, 30px)',
        }}
        className="chapter-head-row"
      >
        <MaskedLines
          as="h2"
          className="chapter-title"
          style={{ marginTop: 0, maxWidth: titleMax }}
          lines={lines}
        />
        {note && <p className="chapter-lede">{note}</p>}
      </div>
      {children}
    </div>
  );
}
