import React from 'react';
import { Reveal } from '../site/Reveal';
import { ClipboardCheck, PenLine, ScanEye } from 'lucide-react';

const STEPS = [
  {
    icon: PenLine,
    title: 'Put the property in',
    body: 'Add the address, the price, the figures and your photographs. Import from a portal if you already have a listing there, or start from a blank record.',
  },
  {
    icon: ScanEye,
    title: 'Check it once',
    body: 'LAREI shows you where the numbers disagree across your sources and asks you to confirm each one. Nothing is published while a conflict is open.',
  },
  {
    icon: ClipboardCheck,
    title: 'Publish what you need',
    body: 'Send the page, sheet, summary or printout. Each one is generated from the same record, so they never drift apart.',
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
            <h2 className="steps-title">From a set of notes to a published property.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead">
              About twenty minutes for a property you already know, and less the second time.
            </p>
          </Reveal>
        </div>

        <div className="steps-grid">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={0.07 * i} className="step-card">
                <span className="step-icon">
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-body">{step.body}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
