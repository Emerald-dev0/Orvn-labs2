import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Check } from 'lucide-react';
import { MaskedLines } from '../site/Reveal';

const LINKS = [
  { label: 'Product tour', to: '/product', meta: '04 min' },
  { label: 'How the record works', to: '/how-it-works', meta: '06 min' },
  { label: 'Talk to the team', to: '/contact', meta: 'Email' },
];

export default function ClosingCTA() {
  const [value, setValue] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!value.includes('@')) return;
    setDone(true);
  };

  return (
    <section className="cta" id="access">
      <div className="shell">
        <div style={{ marginBottom: 'clamp(28px,4vw,52px)' }}>
          <span className="label-mono" style={{ color: 'rgba(239,234,225,0.4)' }}>
            Private beta · 2026 · Applications reviewed individually
          </span>
        </div>

        <div className="cta-grid">
          <div>
            <MaskedLines
              as="h2"
              className="cta-title"
              lines={[<>Be seen</>, <><span style={{ fontStyle: 'italic', color: 'var(--ember-bright)' }}>properly.</span></>]}
            />
            <p className="cta-sub" style={{ marginTop: 'clamp(20px,2.6vw,32px)' }}>
              One professional home for your brand, your portfolio and every property you present.
            </p>

            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24, color: 'var(--paper)' }}
                >
                  <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: '50%', background: 'var(--ember)' }}>
                    <Check size={13} strokeWidth={2.4} />
                  </span>
                  <span style={{ fontSize: 14 }}>You’re on the list. We’ll write once.</span>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  className="cta-form"
                  onSubmit={submit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <input
                    type="email"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="you@yourbusiness.com"
                    aria-label="Email address"
                    required
                  />
                  <button type="submit" aria-label="Request access">
                    <ArrowRight size={17} strokeWidth={1.7} />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="cta-note">No newsletter. No sequence. One reply from a person.</p>
          </div>

          <div className="cta-links">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="cta-link">
                <span>{l.label}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span className="label-mono">{l.meta}</span>
                  <ArrowUpRight size={15} strokeWidth={1.6} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
