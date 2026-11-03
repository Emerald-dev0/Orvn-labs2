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

export default function Contact() {
  useDocumentMeta({ title: 'Talk to ORVN Labs', description: 'Questions about LAREI, early access or a potential use case.', path: '/contact' });
  const [status, setStatus] = useState('idle');

  const onSubmit = (e) => {
    e.preventDefault();
    setStatus('sent');
  };

  return (
    <PageWrapper>
      <section className="section-y" style={{ background: 'var(--background)' }}>
        <div className="container-page">
          <motion.div {...fadeUp(0)} style={{ maxWidth: 760, marginBottom: 48 }}>
            <span className="eyebrow" style={{ marginBottom: 24 }}>CONTACT</span>
            <h1 className="h-display" style={{ fontSize: 'clamp(38px, 6vw, 68px)', marginBottom: 24 }}>Talk to ORVN Labs.</h1>
            <p className="lead">Questions about LAREI, early access or a potential use case? Tell us your role and what you\u2019re trying to accomplish.</p>
          </motion.div>

          {status === 'sent' ? (
            <p className="lead" style={{ color: 'var(--primary)', fontWeight: 600 }}>Message received. If a response is needed, we\u2019ll get back to you using the contact details provided.</p>
          ) : (
            <motion.form {...fadeUp(0.1)} onSubmit={onSubmit} style={{ maxWidth: 640, display: 'grid', gap: 20 }}>
              <input required aria-label="Name" placeholder="Name" style={inputStyle} />
              <input required type="email" aria-label="Work email" placeholder="Work email" style={inputStyle} />
              <select style={inputStyle} defaultValue="Beta access">
                <option>Beta access</option>
                <option>Product question</option>
                <option>Support</option>
                <option>Other</option>
              </select>
              <textarea required aria-label="Message" placeholder="Message" rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
              <button type="submit" className="btn-primary" style={{ justifySelf: 'start' }}>Send message</button>
            </motion.form>
          )}
          <p style={{ marginTop: 32, fontSize: 14, color: 'var(--ink-mid)' }}>Or email hello@orvnlabs.com</p>
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
