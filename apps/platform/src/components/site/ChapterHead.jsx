"use client";

import React from 'react';
import { MaskedLines } from './Reveal';

/**
 * Section head — a label, a headline and an optional note.
 * No numbering, no rules. The page should read like a designed site,
 * not a technical document.
 */
export default function ChapterHead({ label, title, note, dark = false, titleMax, children }) {
  const lines = Array.isArray(title) ? title : [title];
  return (
    <div className={`chapter-head ${dark ? 'on-dark' : ''}`}>
      {label && (
        <span className="eyebrow" style={{ marginBottom: 18 }}>
          {label}
        </span>
      )}

      <div
        className="chapter-head-row"
        style={{
          gridTemplateColumns: note ? 'minmax(0, 1.5fr) minmax(0, 0.5fr)' : '1fr',
        }}
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
