import React from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../site/Reveal';
import { ArrowUpRight, CircleSlash, ShieldCheck } from 'lucide-react';

const LIMITS = [
  'No automated valuation or ARV estimate.',
  'No parcel boundaries or legal title opinion.',
  'No buyer guarantees, no invented demand.',
  'No private data sold to anybody.',
];

export default function Verify() {
  return (
    <section className="verify">
      <div className="shell">
        <div className="verify-card">
          <div className="verify-copy">
            <Reveal>
              <span className="eyebrow">Where we stop</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="verify-title">Facts you can stand behind.</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lead">
                A property record is only useful if you trust it. LAREI keeps a source next to every
                figure and refuses to guess. That means it will not do a few things other tools are
                happy to invent.
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <Link to="/legal/ai-disclosure" className="arrow-link">
                Read the AI disclosure
                <ArrowUpRight strokeWidth={2} />
              </Link>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="verify-list">
            <div className="verify-list-head">
              <ShieldCheck size={18} strokeWidth={2} />
              <span>What LAREI will not do</span>
            </div>
            {LIMITS.map((limit) => (
              <div className="verify-row" key={limit}>
                <CircleSlash size={16} strokeWidth={2} className="verify-row-icon" />
                <span>{limit}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
