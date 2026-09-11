import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, BookOpen } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], delay },
});

export default function TheProof() {
  return (
    <section className="section-y" style={{ background: '#fff', borderTop: '1px solid var(--line)' }}>
      <div className="container-page" style={{ maxWidth: 900 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
          {/* Systems & Proof */}
          <motion.div
            {...fadeUp(0)}
            href="/pas"
            style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 24,
              padding: 'clamp(32px, 5vw, 48px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-pale)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={24} />
            </div>
            <div>
              <span className="label-mono-primary" style={{ display: 'block', marginBottom: 8 }}>Systems & Proof</span>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                Explore PAS in detail
              </h3>
              <p style={{ fontSize: 15, color: 'var(--ink-mid)', lineHeight: 1.6, margin: 0 }}>
                Workflows, capabilities, and open source proof. See the technical layer behind the staff.
              </p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Explore systems <ArrowRight size={14} />
            </span>
          </motion.div>

          {/* Thesis & Insights */}
          <motion.div
            {...fadeUp(0.1)}
            href="/blog"
            style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 24,
              padding: 'clamp(32px, 5vw, 48px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-pale)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <span className="label-mono-primary" style={{ display: 'block', marginBottom: 8 }}>Thesis & Insights</span>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                First-Contact Intelligence
              </h3>
              <p style={{ fontSize: 15, color: 'var(--ink-mid)', lineHeight: 1.6, margin: 0 }}>
                The philosophy, the founder's story, and field notes on lead conversion for operators.
              </p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Read thesis <ArrowRight size={14} />
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
