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

export default function SignIn() {
  useDocumentMeta({ title: 'Sign in to LAREI', description: 'Access your workspace, public site drafts and property records.', path: '/sign-in' });
  return (
    <PageWrapper>
      <section className="section-y" style={{ background: 'var(--background)' }}>
        <div className="container-page">
          <motion.div {...fadeUp(0)} style={{ maxWidth: 480 }}>
            <span className="eyebrow" style={{ marginBottom: 24 }}>LAREI \u00b7 SIGN IN</span>
            <h1 className="h-display" style={{ fontSize: 'clamp(34px, 5vw, 52px)', marginBottom: 12 }}>Welcome back to LAREI.</h1>
            <p className="lead" style={{ marginBottom: 32 }}>Access your workspace, public site drafts and property records.</p>
            <form style={{ display: 'grid', gap: 16 }}>
              <input type="email" aria-label="Email address" placeholder="Email address" style={inputStyle} />
              <input type="password" aria-label="Password" placeholder="Password" style={inputStyle} />
              <button type="submit" className="btn-primary">Sign in</button>
            </form>
            <p style={{ marginTop: 20, fontSize: 14, color: 'var(--ink-mid)' }}>
              <Link to="/early-access" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
            </p>
            <p style={{ marginTop: 12, fontSize: 14, color: 'var(--ink-mid)' }}>
              Don\u2019t have access? <Link to="/early-access" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Request early access.</Link>
            </p>
            <p className="label-mono" style={{ marginTop: 28, color: 'var(--ink-dim)' }}>LAREI is currently available by invitation. You can request access below.</p>
          </motion.div>
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
