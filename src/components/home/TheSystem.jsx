import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Eye, GitBranch, Zap, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], delay },
});

const steps = [
  { n: 1, label: 'Inquiry', body: 'Lead arrives — web form, phone call, listing inquiry, paid ad click.', phase: 'detect', color: '#5B3FD4' },
  { n: 2, label: 'Answer', body: 'PAS responds in seconds on the same channel — voice, SMS, or chat.', phase: 'detect', color: '#5B3FD4' },
  { n: 3, label: 'Qualify', body: 'Intent, urgency, budget, timeline, financing — captured in writing.', phase: 'decide', color: '#D97706' },
  { n: 4, label: 'Route', body: 'Best-fit agent by territory, price band, specialty, and capacity.', phase: 'decide', color: '#D97706' },
  { n: 5, label: 'Book', body: "Appointment on the agent's calendar with full context attached.", phase: 'act', color: '#0D9E6E' },
  { n: 6, label: 'Log', body: 'Status reflects what actually happened. CRM stays clean automatically.', phase: 'act', color: '#0D9E6E' },
];

const phaseLabels = {
  detect: { label: 'DETECT', color: '#5B3FD4', icon: Eye },
  decide: { label: 'DECIDE', color: '#D97706', icon: GitBranch },
  act: { label: 'ACT', color: '#0D9E6E', icon: Zap },
};

function StepCard({ step, index, isActive, isComplete }) {
  return (
    <div
      style={{
        minWidth: 'clamp(280px, 40vw, 380px)',
        maxWidth: 400,
        background: '#fff',
        border: isActive ? `2px solid ${step.color}` : '1px solid var(--line)',
        borderRadius: 20,
        padding: 28,
        boxShadow: isActive ? `0 0 0 4px ${step.color}15, var(--shadow-md)` : 'var(--shadow-sm)',
        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: isActive ? step.color : isComplete ? '#0D9E6E' : 'rgba(91, 63, 212, 0.1)',
          border: isActive ? 'none' : '2px solid',
          borderColor: isActive ? 'transparent' : isComplete ? '#0D9E6E' : step.color,
          color: isActive || isComplete ? '#fff' : step.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 20,
          fontWeight: 800,
          marginBottom: 20,
          boxShadow: isActive ? `0 8px 24px ${step.color}30` : 'var(--shadow-xs)',
          transition: 'all 0.3s ease',
        }}
      >
        {isComplete ? <CheckCircle2 size={24} /> : step.n}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 10, fontFamily: 'var(--font-display)' }}>
        {step.label}
      </div>
      <p style={{ fontSize: 14.5, color: 'var(--ink-mid)', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
        {step.body}
      </p>
    </div>
  );
}

function ProgressRails({ scrollYProgress }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {steps.map((s, i) => (
        <div
          key={s.n}
          style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--line)', overflow: 'hidden' }}
        >
          <motion.div
            style={{
              height: '100%',
              borderRadius: 2,
              background: s.color,
              scaleX: useTransform(scrollYProgress, [i / 6, (i + 1) / 6], [0, 1]),
              transformOrigin: 'left',
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Desktop: enforced horizontal scroll
function HorizontalSystem() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const cardWidth = 400;
  const gap = 24;
  const totalWidth = (cardWidth + gap) * 5;
  const x = useTransform(scrollYProgress, [0, 1], [0, -totalWidth]);

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section ref={containerRef} style={{ height: '400vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Header */}
        <div className="container-page" style={{ marginBottom: 40 }}>
          <motion.div {...fadeUp(0)}>
            <span className="label-mono-primary" style={{ display: 'inline-block', marginBottom: 16 }}>The system</span>
          </motion.div>
          <motion.h2 {...fadeUp(0.06)} className="h-display-2" style={{ marginBottom: 16, lineHeight: 1.05 }}>
            Six movements. <span style={{ color: 'var(--primary)' }}>One operating layer.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.12)} className="lead-2" style={{ maxWidth: 640 }}>
            Every inbound lead moves through the same six steps. PAS controls all of them — so the
            first conversation starts with structure, not guesswork.
          </motion.p>
        </div>

        {/* Phase rail */}
        <div className="container-page" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {Object.entries(phaseLabels).map(([key, phase], i) => (
              <React.Fragment key={key}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    background: activeIndex >= (i === 0 ? 0 : i === 1 ? 2 : 4) ? `${phase.color}15` : 'var(--surface)',
                    border: activeIndex >= (i === 0 ? 0 : i === 1 ? 2 : 4) ? `1.5px solid ${phase.color}` : '1px solid var(--line)',
                    borderRadius: 100,
                    color: activeIndex >= (i === 0 ? 0 : i === 1 ? 2 : 4) ? phase.color : 'var(--ink-dim)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <phase.icon size={12} />
                  {phase.label}
                </div>
                {i < 2 && (
                  <div style={{ width: 32, height: 1.5, background: activeIndex >= (i === 0 ? 2 : 4) ? phase.color : 'var(--line)', borderRadius: 2, transition: 'all 0.3s ease' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Horizontal track */}
        <motion.div
          style={{
            x,
            display: 'flex',
            gap: 24,
            paddingLeft: 'clamp(20px, 5vw, 64px)',
            paddingRight: 64,
          }}
        >
          {steps.map((s, i) => (
            <StepCard
              key={s.n}
              step={s}
              index={i}
              isActive={activeIndex === i}
              isComplete={i < activeIndex}
            />
          ))}
        </motion.div>

        {/* Progress + scroll hint */}
        <div className="container-page" style={{ marginTop: 32 }}>
          <ProgressRails scrollYProgress={scrollYProgress} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span className="label-mono">Scroll to explore</span>
            <span className="label-mono" style={{ color: 'var(--primary)' }}>← horizontal →</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Mobile: vertical grid
function VerticalSystem() {
  return (
    <section className="section-y" style={{ background: '#fff' }}>
      <div className="container-page" style={{ maxWidth: 1100 }}>
        <div style={{ maxWidth: 720, marginBottom: 48, textAlign: 'center' }}>
          <span className="label-mono-primary" style={{ display: 'inline-block', marginBottom: 16 }}>The system</span>
          <h2 className="h-display-2" style={{ marginBottom: 16, lineHeight: 1.05 }}>
            Six movements. <span style={{ color: 'var(--primary)' }}>One operating layer.</span>
          </h2>
          <p className="lead-2" style={{ maxWidth: 640, margin: '0 auto' }}>
            Every inbound lead moves through the same six steps. PAS controls all of them.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {steps.map((s, i) => (
            <motion.div key={s.n} {...fadeUp(0.05 * i)} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `${s.color}15`,
                  border: `2px solid ${s.color}`,
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                {s.n}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{s.label}</div>
                <p style={{ fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function TheSystem() {
  return (
    <>
      <div className="system-horizontal"><HorizontalSystem /></div>
      <div className="system-vertical"><VerticalSystem /></div>
      <style>{`
        @media (min-width: 860px) {
          .system-horizontal { display: block; }
          .system-vertical { display: none; }
        }
        @media (max-width: 859px) {
          .system-horizontal { display: none; }
          .system-vertical { display: block; }
        }
      `}</style>
    </>
  );
}
