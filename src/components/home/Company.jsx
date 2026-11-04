import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '../site/Reveal';

const FACTS = [
  {
    k: 'Company',
    v: 'ORVN Labs',
    d: 'Software for clearer real-estate presentation.',
  },
  {
    k: 'Current product',
    v: 'LAREI',
    d: 'Private beta. Applications reviewed individually.',
  },
  {
    k: 'Earlier product',
    v: 'PAS',
    d: 'Archived, and kept online for old links.',
  },
  {
    k: 'Contact',
    v: 'hello@orvnlabs.com',
    d: 'One inbox, read by the people building it.',
  },
];

export default function Company() {
  return (
    <section className="company dark-band" id="company">
      <div className="shell">
        <div className="company-grid">
          <div className="company-copy">
            <Reveal>
              <span className="eyebrow">About ORVN Labs</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="company-title">
                LAREI is the product. ORVN Labs is the company building it.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lead">
                ORVN Labs builds software for how real estate gets presented. LAREI is our current
                product: one professional home for a brand, its property portfolio and the pages it
                sends to buyers. It is in private beta, and it is not on general sale.
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="company-note">
                PAS, our earlier product for first-contact response, is archived. Screens and
                listings on this site are illustrative, and anything still in development is
                labelled as such.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="company-actions">
                <Link to="/about" className="btn btn-lime btn-sm">
                  More about ORVN Labs
                  <ArrowUpRight strokeWidth={2} />
                </Link>
                <Link to="/pas" className="company-link">
                  PAS archive note
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="company-facts">
            {FACTS.map((f) => (
              <div className="company-fact" key={f.k}>
                <span className="company-fact-k">{f.k}</span>
                <strong>{f.v}</strong>
                <p>{f.d}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
