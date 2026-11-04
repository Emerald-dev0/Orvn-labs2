import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ChapterHead from '../site/ChapterHead';
import { Reveal } from '../site/Reveal';

const PRINCIPLES = [
  {
    n: 'P.01',
    h: 'Nothing publishes itself.',
    p: 'Every public page, every deal sheet, every sentence that carries your name passes an approval you perform — not one the system assumes.',
  },
  {
    n: 'P.02',
    h: 'Unknowns stay unknown.',
    p: 'If two sources disagree, LAREI shows you both. It will not invent a valuation, a boundary or a yield to make a document look finished.',
  },
  {
    n: 'P.03',
    h: 'AI drafts. You decide.',
    p: 'Generated copy is a first draft in your voice — editable, replaceable and never published on its own initiative.',
  },
];

export default function Principles() {
  return (
    <section className="section-y" id="principles" style={{ background: 'var(--paper)' }}>
      <div className="shell">
        <ChapterHead
          index="07 / Principles"
          label="How we build the thing"
          title={['Restraint is', <>a <span className="em">feature.</span></>]}
          note="A tool that presents property for a living should be careful about what it claims. These are the rules the product is built on."
        />

        <div className="principles-grid">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.08} className="principle">
              <span className="pn">{p.n}</span>
              <h3>{p.h}</h3>
              <p>{p.p}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
            <Link to="/who-its-for" className="arrow-link">
              Who this is built for
              <ArrowRight size={15} strokeWidth={1.6} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
