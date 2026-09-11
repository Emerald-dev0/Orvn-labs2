import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, CheckCircle2, TrendingUp, XCircle } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], delay },
});

const measured = ['Lead volume', 'Lead spend', 'Closed deals', 'Agent count'];
const ignored = ['Time to first response', 'Actual contact rate', 'Qualification rate', 'Routing quality', 'Booking rate'];
const blame = [
  { blame: 'Bad leads', cause: 'Delayed first response' },
  { blame: 'Lazy agents', cause: 'Generic follow-up' },
  { blame: 'Weak CRM', cause: 'No qualification' },
  { blame: 'Bad ad source', cause: 'No booked next step' },
  { blame: 'Rough market', cause: 'After-hours leakage' },
];

export default function TheLeak() {
  return (
    <section className="section-y" style={{ background: 'var(--surface)' }}>
      <div className="container-page">
        {/* Header */}
        <div style={{ maxWidth: 720, marginBottom: 'clamp(48px, 8vw, 80px)' }}>
          <motion.div {...fadeUp(0)}>
            <span className="label-mono" style={{ color: 'var(--primary)', display: 'inline-block', marginBottom: 16 }}>
              The problem
            </span>
          </motion.div>
          <motion.h2 {...fadeUp(0.06)} className="h-section-2" style={{ marginBottom: 20 }}>
            Most brokerages are measuring the <span style={{ color: 'var(--risk)' }}>wrong failure</span>.
          </motion.h2>
          <motion.p {...fadeUp(0.12)} className="lead-2" style={{ maxWidth: 600 }}>
            The gap between inquiry and qualified appointment is usually where money dies — and it
            rarely shows up in the report you're looking at.
          </motion.p>
        </div>

        {/* Three-column data grid */}
        <motion.div
          {...fadeUp(0.18)}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            marginBottom: 'clamp(32px, 5vw, 48px)',
          }}
        >
          {/* What gets measured */}
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 20,
              padding: 28,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--ok)' }} />
            <div className="label-mono" style={{ marginBottom: 20, color: 'var(--ok)' }}>
              What gets measured
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {measured.map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircle2 size={16} color="var(--ok)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What gets ignored */}
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 20,
              padding: 28,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--risk)' }} />
            <div className="label-mono" style={{ marginBottom: 20, color: 'var(--risk)' }}>
              What gets ignored
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {ignored.map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <AlertTriangle size={16} color="var(--risk)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--risk)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What brokerages blame */}
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 20,
              padding: 28,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--warn)' }} />
            <div className="label-mono" style={{ marginBottom: 20, color: 'var(--warn)' }}>
              What brokerages blame → What actually killed conversion
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {blame.map((item) => (
                <li key={item.blame} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 13, color: 'var(--ink-dim)', textDecoration: 'line-through' }}>{item.blame}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{item.cause}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* CRM vs PAS comparison */}
        <motion.div
          {...fadeUp(0.3)}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            marginBottom: 'clamp(24px, 3vw, 32px)',
          }}
        >
          {/* Dark card — CRM */}
          <div
            style={{
              background: 'var(--ink)',
              borderRadius: 20,
              padding: 'clamp(28px, 4vw, 40px)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(220, 38, 38, 0.15)' }} />
            <div className="label-mono" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16, position: 'relative' }}>Your CRM</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4, position: 'relative' }}>LEADS STORED</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 48px)', color: 'var(--risk)', position: 'relative', lineHeight: 1 }}>
              CRM <span style={{ opacity: 0.6 }}>% LOST</span>
              <div style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, marginTop: 4 }}>80</div>
            </div>
          </div>

          {/* Green card — PAS */}
          <div
            style={{
              background: 'var(--ok)',
              borderRadius: 20,
              padding: 'clamp(28px, 4vw, 40px)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div className="label-mono" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 16, position: 'relative' }}>Booked PAS ROUTE ✓</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, flexWrap: 'wrap', position: 'relative' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>42m avg</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(20px, 2.5vw, 28px)', opacity: 0.6, textDecoration: 'line-through' }}>TOO SLOW</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>&lt; 30s</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(20px, 2.5vw, 28px)' }}>INSTANT</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom statement */}
        <motion.div
          {...fadeUp(0.36)}
          style={{
            textAlign: 'center',
            padding: 'clamp(20px, 3vw, 32px)',
            background: 'var(--risk)',
            borderRadius: 16,
          }}
        >
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            color: '#fff',
            letterSpacing: '-0.01em',
          }}>
            Delayed response kills conversion
          </span>
        </motion.div>
      </div>
    </section>
  );
}
