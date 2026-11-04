import React from 'react';
import { Check, Minus, X } from 'lucide-react';
import ChapterHead from '../site/ChapterHead';
import { Reveal } from '../site/Reveal';

/* [capability, LAREI, Docs & spreadsheets, Website builders, General AI chat] */
const ROWS = [
  ['One record behind every output', 'yes', 'part', 'no', 'no'],
  ['Facts verified before publishing', 'yes', 'part', 'no', 'no'],
  ['Copy drafted in your own voice', 'yes', 'no', 'part', 'yes'],
  ['A page and URL per property', 'yes', 'no', 'yes', 'no'],
  ['Print-ready deal sheets', 'yes', 'part', 'no', 'part'],
  ['Publishing you explicitly approve', 'yes', 'yes', 'yes', 'no'],
  ['Engagement on observable behaviour', 'yes', 'no', 'yes', 'no'],
];

function Mark({ kind }) {
  if (kind === 'yes')
    return (
      <span className="cmp-mark yes">
        <Check size={14} strokeWidth={2.2} />
      </span>
    );
  if (kind === 'part')
    return (
      <span className="cmp-mark">
        <Minus size={14} strokeWidth={1.8} />
      </span>
    );
  return (
    <span className="cmp-mark" style={{ opacity: 0.4 }}>
      <X size={13} strokeWidth={1.6} />
    </span>
  );
}

const HEADERS = [
  { name: 'Docs & spreadsheets', note: 'Manual', extra: 'col-docs' },
  { name: 'Website builders', note: 'Templates', extra: 'col-web' },
  { name: 'General AI chat', note: 'Conversational', extra: 'col-ai' },
];

export default function Compare() {
  return (
    <section className="section-y compare" id="compare">
      <div className="shell">
        <ChapterHead
          index="06 / The honest comparison"
          label="Against the tools you already use"
          title={['The others build', <>a <span className="em">page.</span> We keep the record.</>]}
          note="Spreadsheets are honest. Page builders are fast. Chat is fluent. None of them hold one verifiable property record behind everything you send."
        />

        <Reveal>
          <div className="compare-table" role="table" aria-label="Capability comparison">
            <div className="cmp-cell head feature" role="columnheader">
              Capability
            </div>
            <div className="cmp-cell head is-larei" role="columnheader">
              <span className="cmp-head-name">LAREI</span>
              <span>Property record</span>
            </div>
            {HEADERS.map((h) => (
              <div key={h.name} className={`cmp-cell head ${h.extra}`} role="columnheader">
                <span className="cmp-head-name">{h.name}</span>
                <span>{h.note}</span>
              </div>
            ))}

            {ROWS.map(([label, larei, docs, web, ai]) => (
              <React.Fragment key={label}>
                <div className="cmp-cell feature" role="cell">
                  {label}
                </div>
                <div className="cmp-cell is-larei" role="cell">
                  <Mark kind={larei} />
                </div>
                <div className="cmp-cell col-docs" role="cell">
                  <Mark kind={docs} />
                </div>
                <div className="cmp-cell col-web" role="cell">
                  <Mark kind={web} />
                </div>
                <div className="cmp-cell col-ai" role="cell">
                  <Mark kind={ai} />
                </div>
              </React.Fragment>
            ))}
          </div>
        </Reveal>

        <p className="cmp-legend">
          <span>Native to the platform</span>
          <span>Possible by hand</span>
          <span>Not what it is built for</span>
        </p>
      </div>
    </section>
  );
}
