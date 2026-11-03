import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], delay },
});

export default function Product() {
  useDocumentMeta({
    title: 'LAREI by ORVN Labs | Professional Websites & Property Deal Pages',
    description: 'Explore LAREI, a real-estate platform in development for branded professional sites, property portfolios, AI-assisted deal packages and engagement insights.',
    path: '/product',
  });

  const sections = [
    { eyebrow: 'YOUR BUSINESS, PRESENTED CLEARLY', title: 'Establish your profile, company identity, markets, services and contact preferences.', body: 'Review an AI-assisted draft of your professional site, then publish when it is ready.' },
    { eyebrow: 'A PORTFOLIO CONNECTED TO REAL RECORDS', title: 'Your portfolio isn\u2019t a collection of manually updated website cards.', body: 'Select which approved properties appear on your public page; update the underlying record and keep the presentation aligned.' },
    { eyebrow: 'ONE PROPERTY RECORD, MULTIPLE USEFUL OUTPUTS', title: 'Start from notes, forms and supported files.', body: 'Check extracted facts, resolve inconsistencies and prepare property-page copy, a shareable summary and print-friendly deal sheet without entering the same details repeatedly.' },
    { eyebrow: 'CONTENT IN YOUR VOICE', title: 'Add writing samples or a business context summary.', body: 'Approve the information LAREI should reuse. Shape the tone of property descriptions, captions and buyer messages. You can edit the result before it goes public.' },
    { eyebrow: 'SIMPLE MAPS, ACCURATELY DESCRIBED', title: 'Give visitors a view of a property\u2019s general location.', body: 'The initial release does not claim surveyed boundaries or provide full GIS diligence.' },
    { eyebrow: 'INTEREST YOU CAN ACT ON', title: 'See which pages receive views, which links are clicked.', body: 'And which published properties generate inquiries. Analytics measure observable behavior, not anonymous visitor identity.' },
    { eyebrow: 'PUBLISHING STAYS DELIBERATE', title: 'Preview what buyers can see, hide sensitive information and control publication.', body: 'Private files remain private unless explicitly approved.' },
  ];

  return (
    <PageWrapper>
      <section className="section-y" style={{ background: 'var(--background)' }}>
        <div className="container-page">
          <motion.div {...fadeUp(0)} style={{ maxWidth: 820 }}>
            <span className="eyebrow" style={{ marginBottom: 24 }}>LAREI \u00b7 PRODUCT</span>
            <h1 className="h-display" style={{ fontSize: 'clamp(40px, 6vw, 72px)', marginBottom: 24 }}>
              One workspace for your professional presence and property presentations.
            </h1>
            <p className="lead" style={{ marginBottom: 36, maxWidth: 640 }}>
              Build a public destination that reflects your business. Keep each property organized behind the scenes, then choose what appears on its own shareable page. LAREI connects those steps instead of making you recreate the same information for every channel.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/early-access" className="btn-primary">Request early access</Link>
              <Link to="/how-it-works" className="btn-secondary">See how it works</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {sections.map((s, i) => (
        <section key={i} className="section-y" style={{ background: i % 2 ? 'var(--surface)' : 'var(--background)', borderTop: '1px solid var(--line)' }}>
          <div className="container-page">
            <motion.div {...fadeUp(0)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'start' }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: 16 }}>{s.eyebrow}</span>
                <h2 className="h-section" style={{ fontSize: 'clamp(26px, 3.2vw, 38px)' }}>{s.title}</h2>
              </div>
              <p className="lead" style={{ fontSize: 17 }}>{s.body}</p>
            </motion.div>
          </div>
        </section>
      ))}

      <section className="section-y" style={{ background: 'var(--ink)', color: '#fff' }}>
        <div className="container-page" style={{ textAlign: 'center' }}>
          <motion.div {...fadeUp(0)}>
            <h2 className="h-display" style={{ fontSize: 'clamp(30px, 4.5vw, 52px)', color: '#fff', marginBottom: 20 }}>
              Prepare deals with more consistency. Present your business with more clarity.
            </h2>
            <Link to="/early-access" className="btn-primary" style={{ background: '#fff', color: 'var(--ink)' }}>Request early access</Link>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
}
