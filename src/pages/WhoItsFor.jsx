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

const roles = [
  { eyebrow: 'FOR WHOLESALERS', title: 'Give every deal a clear destination.', body: 'Move beyond scattered texts, documents and photo links. Present the opportunity\u2019s approved facts, terms, media and location context on one property page. Connect it to your professional profile and provide buyers an inquiry path.', matters: 'Speed of preparation, consistency, discretion, no misleading economics.' },
  { eyebrow: 'FOR REAL-ESTATE AGENTS', title: 'Make your professional identity and listings work together.', body: 'Introduce your market focus and services, then display listings and projects you are authorized to market. Give clients a coherent professional site rather than a list of unrelated links.', matters: 'Branding, correct brokerage/license disclosures where required, permissions to market.' },
  { eyebrow: 'FOR INVESTORS', title: 'Show the projects and opportunities behind your work.', body: 'Organize and present assets, selected investment opportunities or completed projects with the details you choose to make public. Use structured records rather than rewriting each showcase from scratch.', matters: 'Trustworthy facts, asset status, privacy and professional credibility.' },
  { eyebrow: 'FOR ACQUISITIONS & DISPOSITION OPERATORS', title: 'Make the presentation process repeatable.', body: 'Give the team a consistent profile, approved property information and standardized shareable outputs. Keep publication deliberate and engagement visible.', matters: 'Operational consistency, access permissions, quality and measurable follow-through.' },
];

export default function WhoItsFor() {
  useDocumentMeta({
    title: 'Who LAREI Is For | Wholesalers, Agents, Investors & Operators',
    description: 'LAREI is being shaped around a shared task: help people understand the professional behind an opportunity and the property being presented.',
    path: '/who-its-for',
  });

  return (
    <PageWrapper>
      <section className="section-y" style={{ background: 'var(--background)' }}>
        <div className="container-page">
          <motion.div {...fadeUp(0)} style={{ maxWidth: 760 }}>
            <span className="eyebrow" style={{ marginBottom: 24 }}>LAREI \u00b7 WHO IT\u2019S FOR</span>
            <h1 className="h-display" style={{ fontSize: 'clamp(38px, 6vw, 68px)', marginBottom: 24 }}>
              Different real-estate roles. One need for a better presentation.
            </h1>
            <p className="lead" style={{ maxWidth: 620 }}>
              LAREI is being shaped around a shared task: help people understand the professional behind an opportunity and the property being presented, without forcing each role into a generic template.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-y" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <div className="container-page">
          <div style={{ display: 'grid', gap: 0 }}>
            {roles.map((r, i) => (
              <motion.div key={r.eyebrow} {...fadeUp(i * 0.05)} style={{ padding: '40px 0', borderBottom: '1px solid var(--line)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
                <div>
                  <span className="eyebrow" style={{ marginBottom: 14 }}>{r.eyebrow}</span>
                  <h2 className="h-section" style={{ fontSize: 'clamp(24px, 3vw, 34px)', marginBottom: 12 }}>{r.title}</h2>
                </div>
                <div>
                  <p className="lead" style={{ fontSize: 16, marginBottom: 16 }}>{r.body}</p>
                  <p className="label-mono" style={{ color: 'var(--ink-mid)' }}>What matters: {r.matters}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{ marginTop: 40 }}>
            <Link to="/early-access" className="btn-primary">Request access for your role</Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
