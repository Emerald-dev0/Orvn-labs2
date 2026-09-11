import React from 'react';
import { motion } from 'framer-motion';
import { Eye, TrendingUp, CheckCircle2, AlertTriangle, Database, BarChart2 } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], delay },
});

const metrics = [
  { label: 'Calls handled', value: '184', sub: 'this week', tone: 'primary', icon: TrendingUp },
  { label: 'Qualified leads', value: '67', sub: '36% of inbound', tone: 'primary', icon: CheckCircle2 },
  { label: 'Appointments booked', value: '41', sub: 'across 9 agents', tone: 'ok', icon: CheckCircle2 },
  { label: 'After-hours captured', value: '24', sub: 'would have leaked', tone: 'primary', icon: Eye },
  { label: 'Qualified not booked', value: '12', sub: 'recoverable in 48h', tone: 'warn', icon: AlertTriangle },
  { label: 'First-Contact Lift', value: '+38%', sub: 'vs pre-PAS baseline', tone: 'ok', icon: BarChart2 },
];

const toneColors = {
  primary: { bg: 'var(--primary-pale)', border: 'rgba(91, 63, 212, 0.15)', color: 'var(--primary)', text: 'var(--primary)' },
  ok: { bg: '#ECFDF5', border: '#A7F3D0', color: 'var(--ok)', text: '#065F46' },
  warn: { bg: '#FFFBEB', border: '#FDE68A', color: 'var(--warn)', text: '#92400E' },
};

const intelligenceStream = [
  'Intent', 'Urgency', 'Budget', 'Timeline', 'Objection',
  'Routing outcome', 'Booking status', 'Final outcome',
];

const visibilityItems = [
  'When the lead arrived',
  'Whether a response was attempted, and how fast',
  'The conversation outcome',
  'The qualification result',
  'Who it was routed to',
  'Whether it was booked',
  'The follow-up state',
  'If it didn\'t convert — the reason it was lost, went cold, or stayed unresponsive',
];

export default function TheMemory() {
  return (
    <>
      {/* NOC Dashboard */}
      <section className="section-y" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <div className="container-page" style={{ maxWidth: 1100 }}>
          <div style={{ maxWidth: 720, marginBottom: 'clamp(40px, 6vw, 56px)' }}>
            <motion.div {...fadeUp(0)}>
              <span className="label-mono-primary" style={{ display: 'inline-block', marginBottom: 16 }}>
                PAS Control Room
              </span>
            </motion.div>
            <motion.h2
              {...fadeUp(0.06)}
              className="h-display-2"
              style={{ marginBottom: 20, lineHeight: 1.05 }}
            >
              The dashboard is the <span style={{ color: 'var(--primary)' }}>control room</span> — not another daily workload.
            </motion.h2>
            <motion.p
              {...fadeUp(0.12)}
              className="lead-2"
            >
              The dashboard is not the product. It shows what the infrastructure already controlled —
              where leads moved, where they stalled, where they died.
            </motion.p>
          </div>

          {/* Metrics Grid */}
          <motion.div
            {...fadeUp(0.18)}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 'clamp(32px, 5vw, 48px)',
            }}
          >
            {metrics.map((m, i) => {
              const c = toneColors[m.tone];
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.label}
                  {...fadeUp(0.05 * i)}
                  style={{
                    background: '#fff',
                    border: `1px solid ${c.border}`,
                    borderRadius: 16,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Icon size={18} style={{ color: c.color }} />
                    <span className="label-mono" style={{ color: c.color, background: c.bg, padding: '4px 10px', borderRadius: 100 }}>
                      {m.tone.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, lineHeight: 1, color: c.text }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-mid)', fontWeight: 500 }}>{m.sub}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-dim)', marginTop: 4 }}>{m.label}</div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Intelligence Stream */}
          <motion.div
            {...fadeUp(0.24)}
            style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 20,
              padding: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--ok)',
                    boxShadow: '0 0 8px var(--ok)',
                    animation: 'pulse-ring 2s ease-out infinite',
                  }}
                />
                <span className="label-mono">NOC · Operational Pulse</span>
              </div>
              <span className="label-mono">Example view · demo data</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {intelligenceStream.map((item) => (
                <span
                  key={item}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 100,
                    padding: '8px 16px',
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    color: 'var(--ink-mid)',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Operational Visibility */}
      <section className="section-y" style={{ background: '#fff', borderTop: '1px solid var(--line)' }}>
        <div className="container-page" style={{ maxWidth: 900 }}>
          <div style={{ maxWidth: 720, marginBottom: 'clamp(40px, 6vw, 56px)' }}>
            <motion.div {...fadeUp(0)}>
              <span className="label-mono-primary" style={{ display: 'inline-block', marginBottom: 16 }}>
                Operational visibility
              </span>
            </motion.div>
            <motion.h2
              {...fadeUp(0.06)}
              className="h-display-2"
              style={{ marginBottom: 20, lineHeight: 1.05 }}
            >
              Operational visibility is not a list of what people say they did.
            </motion.h2>
            <motion.p
              {...fadeUp(0.12)}
              className="lead-2"
            >
              Real visibility is being able to see what actually happened to every lead — not
              self-reported activity. For each inbound lead, PAS is built to show:
            </motion.p>
          </div>

          <motion.div
            {...fadeUp(0.18)}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            {visibilityItems.map((item, i) => (
              <motion.div
                key={item}
                {...fadeUp(0.04 * i)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 16,
                  padding: '20px 24px',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                }}
              >
                <Eye size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.55, fontWeight: 500 }}>
                  {item}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Memory statement */}
          <motion.div
            {...fadeUp(0.3)}
            style={{
              marginTop: 'clamp(32px, 5vw, 48px)',
              padding: 'clamp(32px, 5vw, 48px)',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 24,
              borderLeft: '4px solid var(--primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'var(--primary-pale)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Database size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="label-mono" style={{ color: 'var(--primary)', marginBottom: 8 }}>
                  Brokerage memory
                </div>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-mid)', fontWeight: 500 }}>
                  By default, what your brokerage knows lives in individual heads, inboxes, call logs,
                  and a CRM nobody fully updates. When someone leaves, that knowledge leaves with them —
                  and the operation resets.
                </p>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-mid)', fontWeight: 500, marginTop: 12 }}>
                  PAS preserves what happened across the first-contact layer: every lead, every response
                  attempt, every outcome — held in the operation, not in a person. When people leave, the
                  operational record stays.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}