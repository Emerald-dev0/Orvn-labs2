import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Gauge, Calculator, ArrowRight } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], delay },
});

const tools = [
  {
    key: 'leakage',
    icon: Gauge,
    title: 'Lead Leakage Scorecard',
    desc: 'Five-minute diagnostic of your first-contact layer. Sub-scores for response time, contact rate, qualification depth, appointment booking, and after-hours coverage. Identifies your primary bottleneck and the fix.',
    href: '/calculators/leakage',
    cta: 'Run scorecard',
    color: 'var(--primary)',
    bg: 'var(--primary-pale)',
    accent: 'var(--primary)',
  },
  {
    key: 'revenue',
    icon: Calculator,
    title: 'Revenue Recovery Calculator',
    desc: 'Model the annual revenue recoverable by lifting your close rate through faster, more consistent first contact. Includes database reactivation scenario and ISA cost comparison. Every formula shown step by step.',
    href: '/calculators/revenue',
    cta: 'Calculate recovery',
    color: 'var(--ok)',
    bg: '#ECFDF5',
    accent: 'var(--ok)',
  },
];

export default function TheTools() {
  return (
    <section className="section-y" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
      <div className="container-page" style={{ maxWidth: 1100 }}>
        <div style={{ maxWidth: 720, marginBottom: 'clamp(48px, 8vw, 80px)', textAlign: 'center' }}>
          <motion.div {...fadeUp(0)}>
            <span className="label-mono-primary" style={{ display: 'inline-block', marginBottom: 16 }}>
              Diagnostic tools
            </span>
          </motion.div>
          <motion.h2
            {...fadeUp(0.06)}
            className="h-display-2"
            style={{ marginBottom: 20, lineHeight: 1.05 }}
          >
            Run the numbers. <span style={{ color: 'var(--primary)' }}>See the leak.</span>
          </motion.h2>
          <motion.p
            {...fadeUp(0.12)}
            className="lead-2"
            style={{ maxWidth: 640, margin: '0 auto' }}
          >
            Both tools run locally in your browser — your inputs stay with you. No signup, no calendar booking, no sales follow-up.
          </motion.p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}
        >
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.article
                key={tool.key}
                {...fadeUp(0.1 * i)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                  padding: 32,
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: 24,
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = tool.accent;
                  e.currentTarget.style.boxShadow = `0 20px 40px -12px ${tool.accent}20`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--line)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Accent top bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: tool.accent }} />

                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: tool.bg,
                    color: tool.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={24} />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3
                    style={{
                      fontSize: 21,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      lineHeight: 1.3,
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {tool.title}
                  </h3>
                  <p style={{ fontSize: 14.5, color: 'var(--ink-mid)', lineHeight: 1.65, fontWeight: 400 }}>
                    {tool.desc}
                  </p>
                </div>

                <Link
                  to={tool.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: tool.color,
                    marginTop: 'auto',
                    paddingTop: 16,
                    borderTop: '1px solid var(--line)',
                  }}
                >
                  {tool.cta} <ArrowRight size={14} />
                </Link>
              </motion.article>
            );
          })}
        </div>

        {/* Note */}
        <motion.div
          {...fadeUp(0.3)}
          style={{
            marginTop: 'clamp(32px, 5vw, 48px)',
            padding: 'clamp(24px, 4vw, 32px)',
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: 16,
            borderLeft: '4px solid var(--primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--primary-pale)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Gauge size={20} />
            </div>
            <div>
              <div className="label-mono" style={{ color: 'var(--primary)', marginBottom: 6 }}>
                Conservative by design
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-mid)', fontWeight: 500 }}>
                Every assumption tilts low. The real opportunity is almost always higher.
                <br />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                  This is a floor, not a ceiling.
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
