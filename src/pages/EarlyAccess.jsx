import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], delay },
});

const roles = ['Wholesaler', 'Agent', 'Investor', 'Acquisitions / dispositions', 'Other'];
const volumes = ['0\u20132', '3\u201310', '11\u201330', '31+', 'Prefer not to say'];

export default function EarlyAccess() {
  useDocumentMeta({
    title: 'Request LAREI Early Access | ORVN Labs',
    description: 'Help shape a better way to present real-estate deals.',
    path: '/early-access',
  });
  const [status, setStatus] = useState('idle');

  const onSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('success'), 700);
  };

  return (
    <PageWrapper>
      <section className="section-y" style={{ background: 'var(--background)' }}>
        <div className="container-page">
          <motion.div {...fadeUp(0)} style={{ maxWidth: 760, marginBottom: 48 }}>
            <span className="eyebrow" style={{ marginBottom: 24 }}>LAREI \u00b7 EARLY ACCESS</span>
            <h1 className="h-display" style={{ fontSize: 'clamp(36px, 5.5vw, 60px)', marginBottom: 16 }}>Help shape a better way to present real-estate deals.</h1>
            <p className="lead">LAREI is in development and onboarding is controlled. We\u2019re inviting professionals who actively package, present or market real-estate opportunities to test the workflow and tell us where it needs to improve. A request is not a guaranteed invitation.</p>
          </motion.div>

          {status === 'success' ? (
            <motion.div {...fadeUp(0)} style={{ maxWidth: 640 }}>
              <h2 className="h-section" style={{ fontSize: 26, marginBottom: 12 }}>Your request has been received.</h2>
              <p className="lead" style={{ fontSize: 16 }}>Thanks for your interest in LAREI. We\u2019ll review the information you submitted. If there\u2019s a suitable beta opening, we\u2019ll contact you by email.</p>
            </motion.div>
          ) : (
            <motion.form {...fadeUp(0.1)} onSubmit={onSubmit} style={{ maxWidth: 640, display: 'grid', gap: 18 }}>
              <input required aria-label="Full name" placeholder="Full name *" style={inputStyle} />
              <input required type="email" aria-label="Work email" placeholder="Work email *" style={inputStyle} />
              <input aria-label="Company or business name" placeholder="Company / business name" style={inputStyle} />
              <select required style={inputStyle} defaultValue="">
                <option value="" disabled>Role *</option>
                {roles.map((r) => <option key={r}>{r}</option>)}
              </select>
              <input required aria-label="Primary markets" placeholder="Primary market(s) *" style={inputStyle} />
              <select style={inputStyle} defaultValue="">
                <option value="" disabled>How many opportunities do you present in a typical month?</option>
                {volumes.map((v) => <option key={v}>{v}</option>)}
              </select>
              <textarea required placeholder="How do you currently share properties? *" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              <textarea required placeholder="What\u2019s the most frustrating part of that process? *" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              <input aria-label="Website or professional profile" placeholder="Website / professional profile" style={inputStyle} />
              <p style={{ fontSize: 12.5, color: 'var(--ink-dim)', margin: 0 }}>By sending this request, you agree that ORVN Labs may contact you about LAREI early access and evaluate your request. See our Privacy Policy.</p>
              <button type="submit" className="btn-primary" style={{ justifySelf: 'start' }} disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending request\u2026' : 'Request early access'}
              </button>
            </motion.form>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--line)',
  background: '#fff',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: 'var(--ink)',
  outline: 'none',
};
