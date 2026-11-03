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

const steps = [
  { n: '01', title: 'Introduce your business.', body: 'Tell us your role, markets, audience and preferred voice. Choose what belongs on your public professional page.' },
  { n: '02', title: 'Review your website draft.', body: 'LAREI prepares an editable first version. Check names, qualifications, contact details and the projects you want shown before publishing.' },
  { n: '03', title: 'Bring in a property.', body: 'Paste notes, fill in fields or attach supported documents and photographs. AI organizes supported facts into a reviewable record.' },
  { n: '04', title: 'Verify and prepare.', body: 'Correct source conflicts, mark unknowns and choose what is safe to share. Generate a deal sheet and editable marketing description using that approved information.' },
  { n: '05', title: 'Publish the right pages.', body: 'Give each approved property a dedicated URL and choose whether it appears in your public portfolio. Share one property or your broader professional site.' },
  { n: '06', title: 'Learn from engagement.', body: 'See page activity and contact inquiries, then update the presentation while retaining control of the underlying record.' },
];

export default function HowItWorks() {
  useDocumentMeta({
    title: 'How LAREI Works | From Business Profile to Published Property',
    description: 'How LAREI connects professional identity, property information, publishing and engagement in one workflow.',
    path: '/how-it-works',
  });

  return (
    <PageWrapper>
      <section className="section-y" style={{ background: 'var(--background)' }}>
        <div className="container-page">
          <motion.div {...fadeUp(0)} style={{ maxWidth: 760 }}>
            <span className="eyebrow" style={{ marginBottom: 24 }}>LAREI \u00b7 HOW IT WORKS</span>
            <h1 className="h-display" style={{ fontSize: 'clamp(38px, 6vw, 68px)', marginBottom: 24 }}>
              From fragmented information to a place people can actually review.
            </h1>
            <p className="lead" style={{ maxWidth: 620 }}>
              LAREI connects your professional identity, property information, publishing and engagement in one workflow.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-y" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <div className="container-page">
          <div style={{ display: 'grid', gap: 28 }}>
            {steps.map((st, i) => (
              <motion.div key={st.n} {...fadeUp(i * 0.05)} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 24, alignItems: 'start', padding: '28px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.08em' }}>{st.n}</span>
                <div>
                  <h3 className="h-section" style={{ fontSize: 22, marginBottom: 8 }}>{st.title}</h3>
                  <p className="lead" style={{ fontSize: 16 }}>{st.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y" style={{ background: 'var(--background)', borderTop: '1px solid var(--line)' }}>
        <div className="container-page">
          <motion.div {...fadeUp(0)} style={{ maxWidth: 720 }}>
            <p className="lead" style={{ fontSize: 16, color: 'var(--ink-mid)' }}>
              A generated description is not a property appraisal, title opinion, license verification or legal disclosure. The professional remains responsible for their representations.
            </p>
            <div style={{ marginTop: 32 }}>
              <Link to="/early-access" className="btn-primary">Request early access</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
}
