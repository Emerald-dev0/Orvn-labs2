import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ChapterHead from '../site/ChapterHead';
import FaqAccordion from '../site/FaqAccordion';
import { Reveal } from '../site/Reveal';

const HOME_FAQS = [
  {
    q: 'What is LAREI, exactly?',
    a: 'LAREI is a workspace for real-estate professionals. It connects your professional profile, your property portfolio, the underlying property records and the things you publish — pages, deal sheets and summaries — from one approved version of the facts.',
  },
  {
    q: 'Do I get my own website?',
    a: 'A professional public page built from your approved business profile is part of the planned beta. The supported URL format will be confirmed with beta users. Custom domains are being evaluated for a later phase and should not be assumed in the first release.',
  },
  {
    q: 'Does AI build the entire site for me?',
    a: 'No. LAREI drafts copy and arranges a focused professional page using information you approved. You review facts, choose public sections and publish deliberately. It is not an unrestricted website builder.',
  },
  {
    q: 'Does LAREI verify property values or create an ARV?',
    a: 'No. No authoritative appraisal, automated underwriting or independently verified ARV is included. LAREI surfaces where sources disagree; professionals remain responsible for every material assumption.',
  },
  {
    q: 'Is it available now?',
    a: 'LAREI is in development for a controlled private beta. Public sign-up is not open. You can request early access; a request is not a guaranteed invitation.',
  },
];

export default function FaqTeaser() {
  return (
    <section className="section-y" id="faq" style={{ background: 'var(--paper)' }}>
      <div className="shell">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.8fr) minmax(0, 1.2fr)', gap: 'clamp(28px,5vw,88px)', alignItems: 'start' }} className="faq-teaser-grid">
          <div>
            <ChapterHead
              index="09 / Questions"
              label="Asked plainly, answered plainly"
              title={['The things', <>people <span className="em">ask first.</span></>]}
            />
            <Reveal delay={0.1}>
              <Link to="/faq" className="arrow-link">
                All questions
                <ArrowRight size={15} strokeWidth={1.6} />
              </Link>
            </Reveal>
          </div>

          <div>
            <FaqAccordion items={HOME_FAQS} initial={null} />
          </div>
        </div>
      </div>
    </section>
  );
}
