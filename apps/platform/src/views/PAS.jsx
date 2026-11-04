"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Archive, Mail } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import PageHero from '../components/site/PageHero';
import { Reveal } from '../components/site/Reveal';
import { useDocumentMeta } from '../lib/seo';

const DID = [
  'Answered property enquiries when they first arrived.',
  'Asked qualifying questions before a viewing was offered.',
  'Passed the conversation to a person with the property attached.',
];

export default function PAS() {
  useDocumentMeta({
    title: 'PAS (archived)',
    description:
      'PAS was an earlier ORVN Labs product for first-contact response. It is no longer actively developed. LAREI is the current product.',
    path: '/pas',
  });

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Archive"
        title={<>PAS has been archived.</>}
        lede="PAS was an earlier ORVN Labs product for first-contact response in brokerages. It is no longer actively developed and it is not part of the LAREI beta. This page stays online so old links and references lead somewhere honest."
      />

      <section className="archive">
        <div className="shell">
          <Reveal className="archive-card">
            <div className="archive-head">
              <span className="archive-icon"><Archive size={20} strokeWidth={1.9} /></span>
              <div>
                <h2>PAS · first-contact response</h2>
                <p>Offered by ORVN Labs before LAREI. Archived, not erased.</p>
              </div>
            </div>

            <div className="archive-grid">
              <div>
                <h3>What it did</h3>
                <ul className="archive-list">
                  {DID.map((item) => (
                    <li key={item}><span aria-hidden="true">·</span>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Why it is archived</h3>
                <p className="archive-body">
                  Our attention moved to LAREI, the platform for professional websites, property
                  portfolios and published property pages. PAS is not receiving updates, and we are
                  not selling new deployments of it.
                </p>
                <p className="archive-body">
                  If you arrived from an old link or you were using PAS, write to us and we will
                  point you somewhere useful.
                </p>
              </div>
            </div>

            <div className="archive-actions">
              <Link href="/product" className="btn btn-primary">
                See the current product
                <ArrowRight strokeWidth={2.2} />
              </Link>
              <a href="mailto:hello@orvnlabs.com" className="arrow-link">
                <Mail size={15} strokeWidth={2} />
                hello@orvnlabs.com
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="archive-next">
            <div>
              <span className="eyebrow">Current work</span>
              <h2>LAREI is the product now.</h2>
              <p className="lead">
                One professional home for your brand, your property portfolio and the materials you
                send to buyers.
              </p>
            </div>
            <Link href="/how-it-works" className="arrow-link">
              How it works
              <ArrowUpRight strokeWidth={2} />
            </Link>
          </Reveal>
        </div>
      </section>
    </PageWrapper>
  );
}
