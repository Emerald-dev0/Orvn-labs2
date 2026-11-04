import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Phone, MessagesSquare, Route, CalendarCheck, Database, Filter } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';
import { Reveal, MaskedLines, Counter } from '../components/site/Reveal';
import { PAS_LINKS } from '../lib/pas';

const MOVEMENTS = [
  { n: '01', t: 'Inquiry', d: 'A lead arrives — web form, phone call, listing inquiry, paid ad click.', icon: Phone },
  { n: '02', t: 'Answer', d: 'Responds in seconds on the same channel: voice, SMS or chat.', icon: MessagesSquare },
  { n: '03', t: 'Qualify', d: 'Intent, urgency, budget, timeline and financing, captured in writing.', icon: Filter },
  { n: '04', t: 'Route', d: 'Best-fit agent by territory, price band, specialty and capacity.', icon: Route },
  { n: '05', t: 'Book', d: 'An appointment on the agent’s calendar with the full context attached.', icon: CalendarCheck },
  { n: '06', t: 'Log', d: 'Status reflects what actually happened. The CRM stays clean.', icon: Database },
];

const SPECS = [
  ['Category', 'First-contact infrastructure'],
  ['Channels', 'Voice · SMS · web chat'],
  ['Deployment', 'Brokerage-level'],
  ['Record', 'Your CRM remains the system of record'],
  ['Hours', '24/7, including after-hours intent'],
];

const NOT = [
  ['Not a CRM', 'PAS sits before and around your CRM. It does not replace the system of record.'],
  ['Not an agent replacement', 'PAS protects intent before agents enter. Agents still close trust.'],
  ['Not a lead-gen promise', 'PAS answers what arrives. It does not manufacture demand.'],
];

export default function PAS() {
  useDocumentMeta({
    title: 'PAS — first-contact infrastructure for real estate',
    description:
      'PAS answers, qualifies, routes, books and logs inbound real-estate leads in the gap between inquiry and appointment. A second product from ORVN Labs.',
    path: '/pas',
  });

  return (
    <PageWrapper>
      <div className="pas">
        {/* Hero */}
        <section className="pas-hero">
          <div className="shell">
            <div className="pas-hero-grid">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <span className="label-mono" style={{ color: 'rgba(239,234,225,0.5)' }}>
                    ORVN Labs · Second product
                  </span>
                  <span className="hero-status" style={{ background: 'transparent', borderColor: 'rgba(239,234,225,0.24)', color: 'rgba(239,234,225,0.7)' }}>
                    <i />
                    Operating in production
                  </span>
                </div>
                <h1 className="pas-title">
                  The first reply
                  <br />
                  <span className="em" style={{ color: 'var(--ember-bright)' }}>wins.</span>
                </h1>
                <p className="pas-lede">
                  PAS is first-contact infrastructure for brokerages. It answers, qualifies, routes,
                  books and logs inbound leads inside the gap where most deals quietly die — the
                  minutes between an inquiry and a human response.
                </p>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 30 }}>
                  <a href={`mailto:hello@orvnlabs.com?subject=PAS%20deployment`} className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
                    Talk about deployment
                    <ArrowUpRight size={15} strokeWidth={1.6} />
                  </a>
                  <a
                    href={PAS_LINKS.login}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ color: 'var(--paper)', borderColor: 'rgba(239,234,225,0.32)' }}
                  >
                    Sign in to PAS
                  </a>
                </div>
              </div>

              <div className="pas-spec-card">
                <span className="label-mono" style={{ color: 'rgba(239,234,225,0.45)' }}>
                  System brief
                </span>
                <div className="pas-spec-list">
                  {SPECS.map(([k, v]) => (
                    <div key={k}>
                      <span>{k}</span>
                      <b>{v}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pas-stats">
              {[
                { v: 24, s: '/7', k: 'Coverage, including after hours' },
                { v: 6, s: '', k: 'Movements: inquiry to log' },
                { v: 0, s: '', k: 'Leads left unanswered by silence' },
              ].map((st) => (
                <div key={st.k}>
                  <span className="v">
                    <Counter to={st.v} duration={1.8} />
                    {st.s}
                  </span>
                  <span className="k">{st.k}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Movements */}
        <section className="pas-movements">
          <div className="shell">
            <div className="chapter-head on-dark">
              <div className="chapter-meta">
                <span className="chapter-index">
                  <i className="tick" style={{ background: 'var(--ember-bright)' }} />
                  Six movements
                </span>
                <span className="chapter-label">What happens between inquiry and appointment</span>
              </div>
              <MaskedLines
                as="h2"
                className="chapter-title on-dark"
                lines={['Detect. Decide. Act.', <>Nothing <span className="em" style={{ color: 'var(--ember-bright)' }}>unlogged.</span></>]}
              />
            </div>

            <div className="movement-list">
              {MOVEMENTS.map((m, i) => {
                const Icon = m.icon;
                return (
                  <Reveal key={m.n} delay={i * 0.04} className="movement">
                    <span className="mv-n">{m.n}</span>
                    <span className="mv-icon">
                      <Icon size={17} strokeWidth={1.5} />
                    </span>
                    <h3>{m.t}</h3>
                    <p>{m.d}</p>
                    <span className="mv-phase">{i < 2 ? 'Detect' : i < 4 ? 'Decide' : 'Act'}</span>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Not block */}
        <section className="pas-not">
          <div className="shell">
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.8fr) minmax(0,1.2fr)', gap: 'clamp(24px,5vw,80px)' }} className="faq-teaser-grid">
              <div>
                <span className="label-mono" style={{ color: 'rgba(239,234,225,0.45)' }}>
                  Boundaries
                </span>
                <h2 className="h-display-2" style={{ color: 'var(--paper)', marginTop: 16, maxWidth: '16ch' }}>
                  What PAS is <span className="em" style={{ color: 'var(--ember-bright)' }}>not.</span>
                </h2>
              </div>
              <div>
                {NOT.map(([h, p]) => (
                  <div key={h} className="pas-not-row">
                    <h3>{h}</h3>
                    <p>{p}</p>
                  </div>
                ))}
                <div style={{ marginTop: 26, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <Link to="/" className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
                    LAREI — the publishing platform
                    <ArrowRight size={15} strokeWidth={1.6} />
                  </Link>
                  <Link to="/contact" className="arrow-link" style={{ color: 'var(--paper)', borderColor: 'rgba(239,234,225,0.4)' }}>
                    Ask about PAS
                    <ArrowUpRight size={15} strokeWidth={1.6} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
