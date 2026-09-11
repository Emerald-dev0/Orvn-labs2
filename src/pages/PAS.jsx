import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Phone,
  Compass,
  Activity,
  ShieldCheck,
  Calendar,
  Clock,
  ListChecks,
  GitBranch,
  Bell,
  BarChart3,
  Eye,
  Zap,
  Github,
  CheckCircle2,
  Image as ImageIcon,
  Building2,
  Sparkles,
  Layers,
  Database,
  FileSearch,
  Users,
  ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import PageWrapper from '../components/PageWrapper';
import Section from '../components/ui/Section';
import Eyebrow from '../components/ui/Eyebrow';
import { useDocumentMeta } from '../lib/seo';
import { PAS_LINKS } from '../lib/pas';

import PasHeroIllustration from '../components/home/PasHeroIllustration';
import NocDashboardIllustration from '../components/home/NocDashboardIllustration';
import EngineArchitectureIllustration from '../components/home/EngineArchitectureIllustration';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], delay },
});

const steps = [
  { n: 1, label: 'Inquiry', body: 'Lead arrives — web, phone, listing, paid ad.' },
  { n: 2, label: 'Answer', body: 'PAS responds in seconds, on the same channel.' },
  { n: 3, label: 'Qualify', body: 'Intent, urgency, budget, timeline, financing.' },
  { n: 4, label: 'Route', body: 'Best-fit agent by territory, price band, specialty.' },
  { n: 5, label: 'Book', body: 'Appointment on the agent\'s calendar, full context attached.' },
  { n: 6, label: 'Log', body: 'Status reflects what actually happened. CRM stays clean.' },
];

const stages = [
  {
    key: 'detect',
    n: 1,
    icon: Eye,
    title: 'Detect',
    body: 'Captures intent, budget, timeline, objections, and callback requests as the call happens.',
  },
  {
    key: 'decide',
    n: 2,
    icon: GitBranch,
    title: 'Decide',
    body: 'Determines the right next step in real time: booking, callback, follow-up, or hand-off.',
  },
  {
    key: 'act',
    n: 3,
    icon: Zap,
    title: 'Act',
    body: 'Books on the calendar, schedules the callback, logs the workflow, and reports outcomes.',
  },
];

const caps = [
  { icon: Phone, label: 'Answers inbound calls', sub: 'Picks up every call, day or night.' },
  { icon: Compass, label: 'Qualifies buy / sell / rent', sub: 'Identifies what the lead actually wants.' },
  { icon: Activity, label: 'Captures intent, budget, timeline', sub: 'In writing, on the lead record. Not in someone\'s head.' },
  { icon: ShieldCheck, label: 'Handles objections', sub: '"Just looking", "not pre-approved", "send links over email".' },
  { icon: Calendar, label: 'Books appointments', sub: 'Direct to the agent calendar, with full context attached.' },
  { icon: Clock, label: 'Schedules callbacks', sub: 'When booking isn\'t the right next step, the callback gets scheduled — not forgotten.' },
  { icon: ListChecks, label: 'Logs every call', sub: 'Outcome and transcript saved. Nothing lives in someone\'s memory.' },
  { icon: GitBranch, label: 'Creates workflow timelines', sub: 'Each call becomes a record of what PAS detected, decided, and did.' },
  { icon: Bell, label: 'Sends Slack and email reports', sub: 'Outcomes show up where the team already works. No portal babysitting.' },
  { icon: BarChart3, label: 'Operational visibility', sub: 'Brokerages can see what happened, when, and why — without chasing it.' },
];

const cases = [
  { icon: Phone, title: 'After-hours capture', body: 'Inbound between 7pm–9am gets a real conversation, not voicemail.' },
  { icon: Users, title: 'ISA support / replacement', body: 'Cover first-touch volume without growing headcount.' },
  { icon: Compass, title: 'Lead qualification', body: 'Agents inherit intent, budget, and timeline — not just a name.' },
  { icon: Activity, title: 'Handoff visibility', body: 'Who responded, when, what was said, what was booked.' },
  { icon: Database, title: 'CRM hygiene', body: 'Status tied to events, not subjective tags. Reports stop lying.' },
  { icon: FileSearch, title: 'Weekly intelligence', body: 'Top objections, where leads stall, what to do about it.' },
];

const intel = ['Intent', 'Urgency', 'Budget', 'Timeline', 'Objection', 'Routing outcome', 'Booking status', 'Final outcome'];

const nockCards = [
  { label: 'Calls handled', value: '184', tone: 'primary', sub: 'this week' },
  { label: 'Qualified leads', value: '67', tone: 'primary', sub: '36% of inbound' },
  { label: 'Appointments booked', value: '41', tone: 'ok', sub: 'across 9 agents' },
  { label: 'After-hours captured', value: '24', tone: 'primary', sub: 'would have leaked' },
  { label: 'Qualified but not booked', value: '12', tone: 'warn', sub: 'recoverable in 48h' },
  { label: 'First-Contact Lift', value: '+38%', tone: 'ok', sub: 'vs pre-PAS baseline' },
];

const toneColor = (t) =>
  t === 'ok' ? '#10B981' : t === 'warn' ? '#F59E0B' : '#A78BFA';

function Screenshot({ src, title, caption, delay }) {
  const [errored, setErrored] = useState(false);
  return (
    <motion.figure
      {...fadeUp(delay)}
      style={{
        background: '#fff',
        border: '1.5px solid var(--line)',
        borderRadius: 24,
        padding: 12,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 16,
          aspectRatio: '16 / 10',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid var(--line)',
        }}
      >
        {errored ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              color: 'var(--ink-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            <ImageIcon size={24} />
            <span>{src}</span>
          </div>
        ) : (
          <img
            src={src}
            alt={title}
            loading="lazy"
            onError={() => setErrored(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>
      <figcaption style={{ padding: '0 12px 12px' }}>
        <div style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.5, fontWeight: 500 }}>{caption}</div>
      </figcaption>
    </motion.figure>
  );
}

function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        paddingTop: 'clamp(100px, 14vw, 180px)',
        paddingBottom: 'clamp(80px, 12vw, 140px)',
        background: '#fff',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90vw',
          height: '700px',
          background: 'radial-gradient(ellipse at center, rgba(91, 63, 212, 0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div className="hero-grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none', zIndex: 0 }} />

      <div className="container-page" style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid-responsive-2" style={{ gap: 'clamp(48px, 8vw, 96px)', alignItems: 'center' }}>
          <div>
            <motion.div {...fadeUp(0)}>
              <span className="pill" style={{ marginBottom: 28 }}>
                <span className="animate-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', display: 'inline-block' }} />
                PAS — Performative AI Superstaff
              </span>
            </motion.div>

            <motion.h1 {...fadeUp(0.05)} className="h-display-2" style={{ marginBottom: 24, fontSize: 'clamp(40px, 5.5vw, 72px)' }}>
              The first-contact<br />infrastructure layer.
            </motion.h1>

            <motion.p {...fadeUp(0.12)} className="lead-2" style={{ maxWidth: 520, marginBottom: 40 }}>
              PAS answers, qualifies, routes, and books every inbound lead — so the first conversation starts with structure, not guesswork.
            </motion.p>

            <motion.div {...fadeUp(0.18)} style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a href={PAS_LINKS.app} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Open PAS <ArrowRight size={18} />
              </a>
              <Link to="/#pricing" className="btn-secondary">
                View pricing
              </Link>
            </motion.div>
          </div>

          <motion.div
            {...fadeUp(0.22)}
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: 24,
              border: '1.5px solid var(--line)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <PasHeroIllustration />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function BrandHierarchy() {
  const tiers = [
    {
      icon: Building2,
      label: 'ORVN Labs',
      role: 'Parent infrastructure company',
      desc: 'Builds brokerage intelligence infrastructure for real estate.',
      tone: 'neutral',
    },
    {
      icon: Sparkles,
      label: 'PAS',
      role: 'Flagship product · Performative AI Superstaff',
      desc: 'The first ORVN system. Controls the first-contact layer.',
      tone: 'primary',
    },
    {
      icon: Layers,
      label: 'First-contact infrastructure',
      role: 'Category',
      desc: 'The operating layer between inquiry and qualified appointment.',
      tone: 'ok',
    },
  ];

  const map = (t) =>
    t === 'primary'
      ? { bg: 'linear-gradient(135deg, #5B3FD4 0%, #4A30C0 100%)', border: '#5B3FD4', iconColor: '#5B3FD4', iconBg: '#FFF', label: '#fff', sub: 'rgba(255, 255, 255, 0.75)', descColor: '#fff', shadow: '0 20px 40px rgba(91, 63, 212, 0.15)' }
      : t === 'ok'
      ? { bg: '#FFF', border: 'var(--line)', iconColor: 'var(--ok)', iconBg: '#ECFDF5', label: 'var(--ink)', sub: 'var(--ok)', descColor: 'var(--ink-mid)', shadow: 'var(--shadow-md)' }
      : { bg: '#FFF', border: 'var(--line)', iconColor: 'var(--ink-mid)', iconBg: 'var(--surface)', label: 'var(--ink)', sub: 'var(--ink-dim)', descColor: 'var(--ink-mid)', shadow: 'var(--shadow-md)' };

  return (
    <Section borderTop background="surface">
      <div style={{ maxWidth: 840, marginBottom: 64 }}>
        <motion.div {...fadeUp(0)}><Eyebrow>Brand hierarchy</Eyebrow></motion.div>
        <motion.h2 {...fadeUp(0.05)} className="h-section-2" style={{ margin: '18px 0 20px' }}>
          One company. One flagship system. One category.
        </motion.h2>
      </div>

      <div className="grid-responsive-2" style={{ gap: 32, alignItems: 'start' }}>
        {tiers.map((t, i) => {
          const c = map(t.tone);
          const Icon = t.icon;
          return (
            <motion.div
              key={t.label}
              {...fadeUp(0.05 + i * 0.1)}
              style={{
                background: c.bg,
                border: `1.5px solid ${c.border}`,
                borderRadius: 24,
                padding: 'clamp(28px, 4vw, 36px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                boxShadow: c.shadow,
                transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: c.iconBg,
                    color: c.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <Icon size={22} />
                </span>
                <span className="label-mono" style={{ color: t.tone === 'primary' ? 'rgba(255,255,255,0.6)' : undefined }}>
                  0{i + 1}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: c.label, marginBottom: 6 }}>{t.label}</div>
                <div className="label-mono" style={{ fontSize: 13.5, marginBottom: 16, color: c.sub }}>{t.role}</div>
                <p style={{ fontSize: 15, color: c.descColor, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{t.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

function PipelineCard({ step, index }) {
  return (
    <motion.div
      style={{
        minWidth: 340,
        maxWidth: 400,
        width: 'clamp(300px, 30vw, 400px)',
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 24,
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        boxShadow: 'var(--shadow-md)',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="pipeline-node__badge" style={{ width: 56, height: 56, fontSize: 20 }}>
          {step.n}
        </div>
        <span className="label-mono">{String(step.n).padStart(2, '0')} / 06</span>
      </div>
      <div>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 12, fontFamily: 'var(--font-display)' }}>
          {step.label}
        </h3>
        <p style={{ fontSize: 15, color: 'var(--ink-mid)', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
          {step.body}
        </p>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--line)' }}>
        <span className="label-mono" style={{ color: 'var(--primary)' }}>
          Movement {step.n}
        </span>
      </div>
    </motion.div>
  );
}

function PipelineProgress({ scrollYProgress }) {
  return (
    <div className="container-page" style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {steps.map((s, i) => (
          <div
            key={s.n}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: 'var(--line)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{
                height: '100%',
                borderRadius: 2,
                background: 'var(--primary)',
                scaleX: useTransform(
                  scrollYProgress,
                  [i / 6, (i + 1) / 6],
                  [0, 1]
                ),
                transformOrigin: 'left',
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span className="label-mono">Scroll to explore</span>
        <span className="label-mono" style={{ color: 'var(--primary)' }}>
          ← horizontal →
        </span>
      </div>
    </div>
  );
}

function Pipeline() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const cardWidth = 400;
  const gap = 32;
  const totalWidth = (cardWidth + gap) * 5;
  const x = useTransform(scrollYProgress, [0, 1], [0, -totalWidth]);

  return (
    <>
      {/* Desktop: horizontal scroll pipeline */}
      <section
        ref={containerRef}
        className="pipeline-horizontal"
        style={{ height: '400vh', position: 'relative' }}
      >
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="container-page" style={{ marginBottom: 48 }}>
            <motion.div {...fadeUp(0)}><Eyebrow>The process</Eyebrow></motion.div>
            <motion.h2 {...fadeUp(0.05)} className="h-section-2" style={{ margin: '18px 0 20px' }}>
              Six movements. One operating layer.
            </motion.h2>
            <motion.p {...fadeUp(0.1)} className="lead-2" style={{ maxWidth: 520 }}>
              Every inbound lead moves through the same six steps. PAS controls all of them.
            </motion.p>
          </div>

          <motion.div style={{ x, display: 'flex', gap: 32, paddingLeft: 'clamp(20px, 5vw, 64px)', paddingRight: 64 }}>
            {steps.map((s, i) => (
              <PipelineCard key={s.n} step={s} index={i} />
            ))}
          </motion.div>

          <PipelineProgress scrollYProgress={scrollYProgress} />
        </div>
      </section>

      {/* Mobile: normal vertical stack */}
      <Section borderTop className="pipeline-vertical" style={{ display: 'none' }}>
        <div style={{ maxWidth: 840, marginBottom: 64 }}>
          <motion.div {...fadeUp(0)}><Eyebrow>The process</Eyebrow></motion.div>
          <motion.h2 {...fadeUp(0.05)} className="h-section-2" style={{ margin: '18px 0 20px' }}>
            Six movements. One operating layer.
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="lead-2">
            Every inbound lead moves through the same six steps. PAS controls all of them — so the
            first conversation starts with structure, not guesswork.
          </motion.p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {steps.map((s, i) => (
            <motion.div key={s.n} {...fadeUp(0.1 + i * 0.05)} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="pipeline-node__badge">{s.n}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>{s.label}</div>
                <p style={{ fontSize: 14.5, color: 'var(--ink-mid)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      <style>{`
        @media (min-width: 860px) {
          .pipeline-horizontal { display: block !important; }
          .pipeline-vertical { display: none !important; }
        }
        @media (max-width: 859px) {
          .pipeline-horizontal { display: none !important; }
          .pipeline-vertical { display: block !important; }
        }
      `}</style>
    </>
  );
}

function EngineArchitecture() {
  return (
    <Section borderTop background="surface">
      <div style={{ maxWidth: 840, marginBottom: 56 }}>
        <motion.div {...fadeUp(0)}><Eyebrow>How PAS works</Eyebrow></motion.div>
        <motion.h2 {...fadeUp(0.05)} className="h-section-2" style={{ margin: '18px 0 20px' }}>
          PAS detects what happened, decides the next step, and acts.
        </motion.h2>
        <motion.p {...fadeUp(0.1)} className="lead-2">
          Three movements per inbound lead. PAS owns all three so the next step doesn't depend on
          someone remembering to follow up.
        </motion.p>
      </div>

      <div className="grid-responsive-2" style={{ gap: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {stages.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.key} {...fadeUp(0.1 * i)} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="tool-preview__icon" style={{ color: s.key === 'detect' ? 'var(--state-detect)' : s.key === 'decide' ? 'var(--state-decide)' : 'var(--state-act)' }}>
                  <Icon size={24} />
                </div>
                <span className="label-mono">Stage 0{s.n}</span>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>{s.title}</div>
                <p style={{ fontSize: 15, color: 'var(--ink-mid)', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>{s.body}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

function CapabilitiesSection() {
  return (
    <Section borderTop>
      <div className="grid-responsive-2" style={{ alignItems: 'start', gap: 'clamp(32px, 5vw, 64px)' }}>
        <div style={{ position: 'sticky', top: 120, zIndex: 10 }} className="mb-mobile-32">
          <motion.div {...fadeUp(0)}><Eyebrow>Capabilities</Eyebrow></motion.div>
          <motion.h2 {...fadeUp(0.05)} className="h-section-2" style={{ margin: '18px 0 20px' }}>
            What PAS does on every inbound lead.
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="lead-2" style={{ fontSize: 16.5 }}>
            A complete first-contact loop — from the moment the call comes in to the moment the
            team has the next step in Slack or email.
          </motion.p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {caps.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.label}
                {...fadeUp(0.05 * i)}
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--line)',
                  borderRadius: 20,
                  padding: 24,
                  display: 'flex',
                  gap: 20,
                  alignItems: 'flex-start',
                }}
              >
                <div className="tool-preview__icon" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: '#fff', border: '1px solid var(--line)' }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{c.label}</div>
                  <p style={{ fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>{c.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

function ProductProof() {
  const screenshots = [
    {
      key: 'workflow',
      src: '/pas/workflow.png',
      title: 'Live workflow timeline',
      caption: 'PAS turns each call into an explicit detect → decide → act trail.',
    },
    {
      key: 'event-timeline',
      src: '/pas/event-timeline.png',
      title: 'Per-call event timeline',
      caption: 'Every state transition, objection, booking, and callback — auditable.',
    },
  ];

  return (
    <Section borderTop background="surface">
      <div style={{ maxWidth: 840, marginBottom: 56 }}>
        <motion.div {...fadeUp(0)}><Eyebrow>Product proof</Eyebrow></motion.div>
        <motion.h2 {...fadeUp(0.05)} className="h-section-2" style={{ margin: '18px 0 20px' }}>
          PAS is real, in code, and shippable.
        </motion.h2>
        <motion.p {...fadeUp(0.1)} className="lead-2">
          No vapor, no slides. The product is the codebase, featuring deterministic state transition layers and quality assurance checks.
        </motion.p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, marginBottom: 40 }}>
        {screenshots.map((s, i) => (
          <Screenshot key={s.key} src={s.src} title={s.title} caption={s.caption} delay={i * 0.1} />
        ))}
      </div>

      <motion.div {...fadeUp(0.15)} className="card" style={{ padding: 'clamp(24px, 5vw, 40px)', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: 'var(--ink)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Engine Architecture Core</div>
          <p style={{ color: 'var(--ink-mid)', fontSize: 15.5, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            Inspect the high-fidelity state tracking sequence built into the PAS operating layer.
          </p>
        </div>
        <div style={{ width: '100%' }}>
          <EngineArchitectureIllustration />
        </div>
      </motion.div>
    </Section>
  );
}

function BrokerageMemory() {
  return (
    <Section borderTop>
      <div className="grid-responsive-2" style={{ alignItems: 'start', gap: 'clamp(32px, 5vw, 56px)' }}>
        <div>
          <motion.div {...fadeUp(0)}><Eyebrow>Brokerage memory · PAS Brain</Eyebrow></motion.div>
          <motion.h2 {...fadeUp(0.05)} className="h-section-2" style={{ margin: '18px 0 0' }}>
            Your brokerage doesn't have a memory. It has a dozen people who can leave.
          </motion.h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <motion.div
            {...fadeUp(0.05)}
            style={{ background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: 20, padding: 24, display: 'flex', gap: 20, alignItems: 'flex-start' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FEF2F2', color: 'var(--risk)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-xs)' }}>
              <Users size={20} />
            </div>
            <p style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
              By default, what your brokerage knows lives in individual heads, inboxes, call logs,
              and a CRM nobody fully updates. When someone leaves, that knowledge leaves with them —
              and the operation resets.
            </p>
          </motion.div>
          <motion.div
            {...fadeUp(0.1)}
            style={{ background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: 20, padding: 24, display: 'flex', gap: 20, alignItems: 'flex-start' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--primary-pale)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-xs)' }}>
              <Database size={20} />
            </div>
            <p style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
              PAS preserves what happened across the first-contact layer: every lead, every response
              attempt, every outcome — held in the operation, not in a person. When people leave, the
              operational record stays.
            </p>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

function ControlRoom() {
  return (
    <Section borderTop background="surface">
      <div className="grid-responsive-2" style={{ alignItems: 'center', marginBottom: 56 }}>
        <div>
          <motion.div {...fadeUp(0)}><Eyebrow>PAS Control Room</Eyebrow></motion.div>
          <motion.h2 {...fadeUp(0.05)} className="h-section-2" style={{ margin: '18px 0 20px' }}>
            The dashboard is the control room — not another daily workload.
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="lead-2">
            The dashboard is not the product. It shows what the infrastructure already controlled —
            where leads moved, where they stalled, where they died.
          </motion.p>
        </div>

        <motion.div {...fadeUp(0.12)} style={{ background: '#1E293B', borderRadius: 24, padding: 16, boxShadow: 'var(--shadow-xl)' }}>
          <NocDashboardIllustration />
        </motion.div>
      </div>

      <motion.div
        {...fadeUp(0.15)}
        style={{
          background: 'var(--ink)',
          borderRadius: 24,
          overflow: 'hidden',
          border: '1px solid #1E293B',
          boxShadow: '0 40px 80px -20px rgba(15, 23, 42, 0.4)',
        }}
      >
        <div
          style={{
            background: '#1E293B',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1px solid #334155',
          }}
        >
          <div className="animate-blink" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
          <span className="label-mono" style={{ color: '#94A3B8' }}>NOC · Operational Pulse</span>
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#475569',
              fontWeight: 600,
            }}
          >
            Example view · demo data
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', background: '#1E293B', gap: 1 }}>
          {nockCards.map((c) => (
            <div key={c.label} style={{ background: 'var(--ink)', padding: 32 }}>
              <div className="label-mono" style={{ color: '#475569', fontSize: 12 }}>{c.label}</div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: toneColor(c.tone),
                  margin: '12px 0',
                }}
              >
                {c.value}
              </div>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: 32, background: 'var(--ink)', borderTop: '1px solid #1E293B' }}>
          <div className="label-mono" style={{ color: '#475569', marginBottom: 20 }}>Structured Intelligence Stream</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {intel.map((it) => (
              <span
                key={it}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 100,
                  padding: '8px 16px',
                  fontSize: 12,
                  color: '#94A3B8',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                }}
              >
                {it}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

function OperationalVisibility() {
  const items = [
    'When the lead arrived',
    'Whether a response was attempted, and how fast',
    'The conversation outcome',
    'The qualification result',
    'Who it was routed to',
    'Whether it was booked',
    'The follow-up state',
    'If it didn\'t convert, the reason it was lost, went cold, or stayed unresponsive',
  ];
  return (
    <Section borderTop>
      <div style={{ maxWidth: 840, marginBottom: 40 }}>
        <motion.div {...fadeUp(0)}><Eyebrow>Operational visibility</Eyebrow></motion.div>
        <motion.h2 {...fadeUp(0.05)} className="h-section-2" style={{ margin: '18px 0 20px' }}>
          Operational visibility is not a list of what people say they did.
        </motion.h2>
        <motion.p {...fadeUp(0.1)} className="lead-2">
          Real visibility is being able to see what actually happened to every lead — not
          self-reported activity. For each inbound lead, PAS is built to show:
        </motion.p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {items.map((it, i) => (
          <motion.div
            key={it}
            {...fadeUp(0.04 * i)}
            style={{ background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: 20, padding: 20, display: 'flex', gap: 14, alignItems: 'flex-start' }}
          >
            <Eye size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.55, fontWeight: 500 }}>{it}</span>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function UseCases() {
  return (
    <Section borderTop>
      <div style={{ maxWidth: 840, marginBottom: 56 }}>
        <motion.div {...fadeUp(0)}><Eyebrow>Use cases</Eyebrow></motion.div>
        <motion.h2 {...fadeUp(0.05)} className="h-section-2" style={{ margin: '18px 0 20px' }}>
          What PAS controls, in operator terms.
        </motion.h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
        {cases.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.title} {...fadeUp(0.05 * i)} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="tool-preview__icon" style={{ width: 44, height: 44, borderRadius: 12 }}>
                <Icon size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: '0 0 10px' }}>{c.title}</h3>
                <p style={{ fontSize: 15, color: 'var(--ink-mid)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{c.body}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div {...fadeUp(0.1)} style={{ marginTop: 64, textAlign: 'center' }}>
        <Link to="/#pricing" className="btn-primary" style={{ padding: '16px 32px', borderRadius: 100 }}>
          View tailored pricing <ArrowRight size={20} />
        </Link>
      </motion.div>
    </Section>
  );
}

function ForumSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const submit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'product_forum' }),
      });
      if (!res.ok) throw new Error('Failed to join forum');
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <Section background="surface" borderTop>
        <div
          style={{
            background: '#ECFDF5',
            border: '1.5px solid #A7F3D0',
            borderRadius: 24,
            padding: '48px 24px',
            textAlign: 'center',
            maxWidth: 800,
            margin: '0 auto',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 100,
              background: '#D1FAE5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <CheckCircle2 size={28} color="var(--ok)" />
          </div>
          <h3 style={{ color: '#065F46', fontSize: 24, fontWeight: 700 }}>Welcome to the forum.</h3>
          <p style={{ color: '#065F46', fontSize: 16, margin: '8px 0 0', fontWeight: 500 }}>
            We'll notify you as soon as a slot opens for your brokerage.<br />
            <span style={{ opacity: 0.8, fontSize: 13 }}>Check your spam folder if you don't see our welcome email in 5 minutes.</span>
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section background="surface" borderTop>
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          textAlign: 'center',
          background: '#fff',
          padding: 'clamp(48px, 10vw, 80px) clamp(24px, 5vw, 48px)',
          borderRadius: 32,
          border: '1.5px solid var(--line)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <motion.div {...fadeUp(0)}><Eyebrow>Join the forum</Eyebrow></motion.div>
        <motion.h2 {...fadeUp(0.05)} className="h-display-2" style={{ margin: '18px 0 20px' }}>
          Early access is limited.
        </motion.h2>
        <motion.p {...fadeUp(0.1)} className="lead-2" style={{ marginBottom: 40, maxWidth: 640, margin: '0 auto 40px' }}>
          We are currently onboarding brokerages in cohorts to ensure high-touch implementation.
          Join the forum to secure your spot.
        </motion.p>

        <motion.form
          {...fadeUp(0.15)}
          onSubmit={submit}
          style={{
            display: 'flex',
            gap: 12,
            maxWidth: 540,
            margin: '0 auto',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <input
            type="email"
            required
            placeholder="your@brokerage.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: '1 1 300px',
              background: 'var(--surface)',
              border: '1.5px solid var(--line)',
              borderRadius: 100,
              padding: '16px 28px',
              fontSize: 15.5,
              color: 'var(--ink)',
              outline: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-primary"
            style={{ padding: '16px 32px', fontSize: 15.5, borderRadius: 100 }}
          >
            {status === 'loading' ? 'Joining...' : 'Join the forum'} <ArrowRight size={18} />
          </button>
        </motion.form>
        {status === 'error' && (
          <p style={{ color: 'var(--risk)', fontSize: 14, marginTop: 16, fontWeight: 600 }}>
            Something went wrong. Please try again or email hello@orvnlabs.com.
          </p>
        )}
        <p style={{ color: 'var(--ink-dim)', fontSize: 13, marginTop: 24, fontWeight: 500 }}>
          Check your spam folder if you don't see our welcome email in 5 minutes.
        </p>
      </div>
    </Section>
  );
}

export default function PAS() {
  useDocumentMeta({
    title: 'PAS — Performative AI Superstaff for Real Estate Brokerages',
    description: 'Explore PAS, the operating layer that controls the gap between inquiry and qualified appointment. Automate lead qualification, routing, and booking with high-fidelity state tracking.',
    path: '/pas',
    schema: {
      '@type': 'Service',
      'name': 'Performative AI Superstaff (PAS)',
      'serviceType': 'Real Estate Lead Management Infrastructure',
      'provider': { '@type': 'Organization', 'name': 'ORVN Labs' },
      'description': 'AI infrastructure that answers, qualifies, routes, and books inbound leads for real estate brokerages.',
    },
  });

  return (
    <PageWrapper>
      <Hero />
      <BrandHierarchy />
      <Pipeline />
      <EngineArchitecture />
      <CapabilitiesSection />
      <ProductProof />
      <BrokerageMemory />
      <ControlRoom />
      <OperationalVisibility />
      <UseCases />
      <ForumSignup />
    </PageWrapper>
  );
}
