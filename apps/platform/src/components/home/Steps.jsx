"use client";

import React from 'react';
import { Reveal } from '../site/Reveal';

const STEPS = [
  {
    n: '01',
    title: 'Add the property',
    body: 'Paste notes, type the details or attach a brochure. Each fact keeps the source it came from, and gaps are shown as gaps.',
  },
  {
    n: '02',
    title: 'Prepare the presentation',
    body: 'The draft description and deal sheet are generated from that record. You edit the wording; you approve every fact.',
  },
  {
    n: '03',
    title: 'Review',
    body: 'Nothing publishes while a fact is unapproved or two sources disagree. You see the conflict, not a silent guess.',
  },
  {
    n: '04',
    title: 'Publish and share',
    body: 'Publish the property page against your profile, then copy a link that opens without an account.',
  },
];

export default function Steps() {
  return (
    <section className="steps">
      <div className="shell">
        <div className="steps-head">
          <Reveal>
            <span className="eyebrow">How it works</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="steps-title">Four steps from a property file to a link you can send.</h2>
          </Reveal>
        </div>

        <div className="steps-grid is-four">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={0.05 * i} className="step-card">
              <span className="step-number">{step.n}</span>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-body">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
