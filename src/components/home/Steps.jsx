import React from 'react';
import { Reveal } from '../site/Reveal';

const STEPS = [
  {
    n: '01',
    title: 'Establish your presence',
    body: 'Tell LAREI about your role, market, business and style; review a draft of your public website.',
  },
  {
    n: '02',
    title: 'Bring in the property',
    body: 'Paste notes, enter details and upload supported files. Review the structured record and resolve missing information.',
  },
  {
    n: '03',
    title: 'Prepare the presentation',
    body: 'Edit generated descriptions, deal-sheet content and the individual property page.',
  },
  {
    n: '04',
    title: 'Publish with control',
    body: 'Decide what is public, publish your site and property pages, then copy a link people can open without an account.',
  },
  {
    n: '05',
    title: 'Follow the interest',
    body: 'Read buyer inquiries and examine measured page activity; revise and republish as needed.',
  },
];

export default function Steps() {
  return (
    <section className="steps">
      <div className="shell">
        <div className="steps-head">
          <Reveal>
            <span className="eyebrow">How the system works</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="steps-title">From a working file to a professional place to share it.</h2>
          </Reveal>
        </div>

        <div className="steps-grid is-five">
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
