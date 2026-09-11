import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import PageWrapper from '../components/PageWrapper';
import Section from '../components/ui/Section';
import Eyebrow from '../components/ui/Eyebrow';
import FlowDiagram from '../components/FlowDiagram';
import Newsletter from '../components/Newsletter';
import { useDocumentMeta } from '../lib/seo';
import { getRecentPosts } from '../lib/blog';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: 'easeOut', delay },
});

function subhead() {
  return {
    fontSize: 19,
    fontWeight: 600,
    color: '#0F172A',
    fontFamily: "'Inter', sans-serif",
    margin: '20px 0 10px',
  };
}

function para() {
  return {
    fontSize: 17,
    lineHeight: 1.75,
    color: '#0F172A',
    margin: '0 0 16px',
  };
}

// ─── FOUNDER THESIS ─────────────────────────────────────────────────────────
function FounderThesis() {
  const timeline = [
    { label: 'More leads', tone: 'neutral' },
    { label: 'Scattered follow-up', tone: 'risk' },
    { label: 'Missed first contact', tone: 'risk' },
    { label: 'Structured response', tone: 'ok' },
    { label: 'PAS', tone: 'primary' },
  ];

  const messy = [
    'A lead comes in while you are busy.',
    'Another one comes in after hours.',
    'Someone asks for details and disappears.',
    'Someone needs to be qualified but never gets asked the right questions.',
    'Someone should have been booked immediately, but instead gets left inside a CRM note.',
  ];

  return (
    <Section>
      <div style={{ maxWidth: 760, marginBottom: 32 }}>
        <motion.div {...fadeUp(0)}><Eyebrow>Founder thesis</Eyebrow></motion.div>
        <motion.h2
          {...fadeUp(0.05)}
          className="h-section"
          style={{ fontSize: 'clamp(30px, 4.5vw, 52px)', margin: '14px 0 0' }}
        >
          I didn’t start with AI. I started with missed leads.
        </motion.h2>
        <motion.p
          {...fadeUp(0.08)}
          style={{ fontSize: 14, color: '#64748B', fontWeight: 600, margin: '14px 0 0' }}
        >
          Daniel Oyegoke, founder of ORVN Labs
        </motion.p>
      </div>

      <motion.div {...fadeUp(0.05)} style={{ marginBottom: 36 }}>
        <FlowDiagram label="The path that became ORVN" steps={timeline} />
      </motion.div>

      <div style={{ maxWidth: 720 }}>
        <motion.h3 {...fadeUp(0.05)} style={subhead()}>The problem started with me.</motion.h3>
        <motion.p {...fadeUp(0.07)} style={para()}>
          When I started as a realtor, I thought the problem was simple: get more leads. So I
          chased leads. I used tools. I tested sources. On paper, I had activity.
        </motion.p>
        <motion.p {...fadeUp(0.09)} style={para()}>
          But at the end of the week I would look back and see 30, 40, sometimes 50+ leads sitting
          across calls, messages, forms, and follow-ups. The painful part was not that the leads
          didn’t exist — the painful part was realizing I had only spoken properly to a fraction
          of them.
        </motion.p>

        <motion.h3 {...fadeUp(0.11)} style={subhead()}>Real estate first contact is messy.</motion.h3>
        <motion.p {...fadeUp(0.13)} style={para()}>
          Not because I did not care. Because the operating layer had no shape:
        </motion.p>
        <motion.ul
          {...fadeUp(0.15)}
          style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          {messy.map((m) => (
            <li
              key={m}
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderLeft: '3px solid #DC2626',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 15,
                color: '#0F172A',
                lineHeight: 1.55,
              }}
            >
              {m}
            </li>
          ))}
        </motion.ul>

        <motion.h3 {...fadeUp(0.05)} style={subhead()}>Then I saw it inside teams. Then inside brokerages.</motion.h3>
        <motion.p {...fadeUp(0.07)} style={para()}>
          The pattern was the same. The brokerage did not always need more leads. It needed a
          faster, cleaner, more structured way to handle the first few minutes after a lead showed
          intent. That became the original thesis behind ORVN.
        </motion.p>

        <motion.div
          {...fadeUp(0.1)}
          style={{
            background: '#F7F8FB',
            border: '1px solid #E5E8F0',
            borderLeft: '3px solid #5B3FD4',
            borderRadius: 12,
            padding: '20px 24px',
            margin: '8px 0 28px',
          }}
        >
          <p
            style={{
              fontSize: 22,
              lineHeight: 1.5,
              color: '#0F172A',
              margin: 0,
              fontWeight: 600,
            }}
          >
            Lead generation without first-contact infrastructure creates a bigger graveyard.
          </p>
        </motion.div>

        <motion.p {...fadeUp(0.12)} style={para()}>
          PAS is the productized version of that lesson.{' '}
          <strong style={{ color: '#0F172A' }}>PAS — Performative AI Superstaff</strong> is built
          to answer, qualify, route, book, and log inbound leads before delay kills conversion.
          Not because brokerages need another dashboard. Not because agents need more software.
          But because the gap between inquiry and qualified appointment is too expensive to leave
          to chance.
        </motion.p>
      </div>
    </Section>
  );
}

// ─── INTELLIGENCE HUB ────────────────────────────────────────────────────────
function IntelligenceHub() {
  const posts = getRecentPosts(10); // Show more here since it's the main page
  return (
    <Section borderTop background="surface">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div>
          <Eyebrow>First-Contact Intelligence</Eyebrow>
          <h2 className="h-section" style={{ fontSize: 'clamp(28px, 3.8vw, 42px)', margin: '14px 0 6px' }}>
            Operator-grade writing on lead conversion.
          </h2>
          <p style={{ color: '#475569', fontSize: 14.5, margin: 0, maxWidth: 560 }}>
            Field notes from inside brokerages — not generic AI marketing.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {posts.map((p, i) => (
          <motion.article
            key={p.slug}
            {...fadeUp(0.04 * i)}
            className="card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column' }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#5B3FD4',
                marginBottom: 10,
              }}
            >
              {p.category}
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Inter', sans-serif", color: '#0F172A', margin: '0 0 10px', lineHeight: 1.35 }}>
              <Link to={`/blog/${p.slug}`} style={{ color: '#0F172A' }}>{p.title}</Link>
            </h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 14px', flex: 1 }}>
              {p.excerpt}
            </p>
            <Link
              to={`/blog/${p.slug}`}
              style={{ fontSize: 13, fontWeight: 600, color: '#5B3FD4', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              Read post <ArrowRight size={14} />
            </Link>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}

// ─── NEWSLETTER ─────────────────────────────────────────────────────────────
function NewsletterSection() {
  return (
    <Section borderTop>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'clamp(28px, 5vw, 64px)',
          alignItems: 'center',
        }}
      >
        <div>
          <Eyebrow>Newsletter</Eyebrow>
          <h2 className="h-section" style={{ fontSize: 'clamp(28px, 3.8vw, 44px)', margin: '14px 0 14px' }}>
            Get First-Contact Intelligence.
          </h2>
          <p className="lead">
            Weekly field notes on speed-to-lead, ISA failure, CRM graveyards, agent handoffs, and
            after-hours leads.
          </p>
        </div>
        <Newsletter source="thesis" />
      </div>
    </Section>
  );
}

export default function Thesis() {
  useDocumentMeta({
    title: 'Thesis & Insights — ORVN Labs',
    description: 'The philosophy and operator-grade writing behind first-contact infrastructure.',
    path: '/thesis',
  });

  return (
    <PageWrapper>
      <Section style={{ paddingTop: 'clamp(64px, 9vw, 112px)', paddingBottom: 0 }}>
        <div className="container-page">
          <motion.div {...fadeUp(0)}>
            <Eyebrow>Thesis & Insights</Eyebrow>
          </motion.div>
          <h1 className="h-display" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', marginBottom: 22 }}>
            Infrastructure for the <span style={{ color: '#5B3FD4' }}>operator.</span>
          </h1>
          <p className="lead" style={{ maxWidth: 720 }}>
            Why we build, what we measure, and how we fix the gap between inquiry and qualified
            appointment.
          </p>
        </div>
      </Section>
      <FounderThesis />
      <IntelligenceHub />
      <NewsletterSection />
    </PageWrapper>
  );
}
