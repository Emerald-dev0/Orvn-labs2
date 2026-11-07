"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '../site/Reveal';

const FACTS = [
  {
    k: 'Company',
    v: 'ORVN Labs',
    d: 'Software for clearer real-estate presentation.',
  },
  {
    k: 'Status',
    v: 'In development',
    d: 'Early access by request. Nothing is on general sale.',
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
                A company for the work behind a property listing.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lead">
                ORVN Labs builds software for how real estate gets presented. The platform is one
                place for a property record, the presentation that comes out of it and the page you
                send to a buyer. It is in development, early access is by request, and nothing is
                on general sale.
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="company-note">
                Screens and listings on this site are illustrative. Features that are not built
                yet are labelled as planned rather than shown as if they work.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="company-actions">
                <Link href="/about" className="btn btn-lime btn-sm">
                  More about ORVN Labs
                  <ArrowUpRight strokeWidth={2} />
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
