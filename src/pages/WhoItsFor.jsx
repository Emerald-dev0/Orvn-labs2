import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';
import ChapterHead from '../components/site/ChapterHead';
import { Reveal, MaskedLines } from '../components/site/Reveal';

const ROLES = [
  {
    n: '01',
    title: 'Wholesalers',
    body: 'Move beyond scattered texts, documents and photo links. Present the approved facts, terms, media and location context on one property page connected to your professional profile.',
    tags: ['Speed of preparation', 'Consistency', 'Discretion'],
  },
  {
    n: '02',
    title: 'Agents',
    body: 'Make your professional identity and your listings work together. Introduce your market focus and services, then display only the listings you are authorised to market.',
    tags: ['Brand', 'Disclosure', 'Permissions'],
  },
  {
    n: '03',
    title: 'Investors',
    body: 'Show the projects and opportunities behind your work. Organise assets and completed projects with the details you choose to make public — from structured records, not rewritten showcases.',
    tags: ['Trustworthy facts', 'Asset status', 'Privacy'],
  },
  {
    n: '04',
    title: 'Acquisitions & dispositions',
    body: 'Give the team one consistent profile, one approved version of each property and standard shareable outputs. Keep publication deliberate and follow-through visible.',
    tags: ['Consistency', 'Access', 'Measurable interest'],
  },
];

const FIT = [
  ['You present property to other people regularly', true],
  ['You can point to the source of the facts you present', true],
  ['You want one approved version of the truth', true],
  ['You need a full CRM, contract or commission system', false],
  ['You want an unrestricted website builder', false],
  ['You want a tool that invents valuations', false],
];

export default function WhoItsFor() {
  useDocumentMeta({
    title: 'Who it’s for — wholesalers, agents, investors, operators',
    description:
      'LAREI is shaped around one shared task: help people understand the professional behind an opportunity and the property being presented.',
    path: '/who-its-for',
  });

  return (
    <PageWrapper>
      <section className="page-hero">
        <div className="shell">
          <div className="page-hero-grid">
            <div>
              <span className="eyebrow">LAREI · Who it’s for</span>
              <h1 className="page-title">
                Different roles. The same need for a better <span className="em">presentation.</span>
              </h1>
            </div>
            <div>
              <p className="page-lede">
                LAREI is shaped around a shared task: help people understand the professional behind
                an opportunity, and the property being presented — without forcing every role into
                one generic template.
              </p>
              <div style={{ marginTop: 22 }}>
                <Link to="/early-access" className="arrow-link">
                  Apply for early access
                  <ArrowUpRight size={15} strokeWidth={1.6} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 'clamp(40px,5vw,72px)' }}>
        <div className="shell">
          <div className="role-grid">
            {ROLES.map((r, i) => (
              <Reveal key={r.title} delay={i * 0.05} className="role">
                <div className="role-top">
                  <span className="label-mono">{r.n}</span>
                  <ArrowUpRight size={16} strokeWidth={1.4} color="var(--ink-dim)" />
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,2.2vw,30px)', lineHeight: 1.05, letterSpacing: '-0.025em' }}>
                  {r.title}
                </h2>
                <p>{r.body}</p>
                <div className="role-tags">
                  {r.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y" style={{ background: 'var(--paper-deep)' }}>
        <div className="shell">
          <ChapterHead
            index="Fit"
            label="Be honest with yourself"
            title={['A good fit,', <>and <span className="em">not.</span></>]}
            note="Applying costs nothing and takes four minutes. Approval is not guaranteed, and a poor fit is better discovered before the beta than during it."
          />

          <div className="fit-grid">
            <div>
              <span className="label-mono-primary" style={{ display: 'block', marginBottom: 12 }}>
                LAREI is for you if
              </span>
              <ul className="fit-list">
                {FIT.filter((f) => f[1]).map(([t]) => (
                  <li key={t}>
                    <span className="fit-mark yes">Yes</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="label-mono" style={{ display: 'block', marginBottom: 12 }}>
                Probably not, if
              </span>
              <ul className="fit-list">
                {FIT.filter((f) => !f[1]).map(([t]) => (
                  <li key={t}>
                    <span className="fit-mark no">No</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Reveal delay={0.1}>
            <div className="pull-quote" style={{ marginTop: 'clamp(36px,4vw,60px)' }}>
              “Make the presentation as careful as the deal behind it.”
            </div>
          </Reveal>
        </div>
      </section>

      <section style={{ background: 'var(--paper)', paddingBlock: 'clamp(48px,6vw,88px)' }}>
        <div className="shell">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <MaskedLines
              as="h2"
              className="h-display-2"
              lines={['If that reads like', <>your <span className="em">week,</span> apply.</>]}
              style={{ maxWidth: '20ch' }}
            />
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/early-access" className="btn-primary">
                Request early access
                <ArrowUpRight size={15} strokeWidth={1.6} />
              </Link>
              <Link to="/product" className="arrow-link">
                What you get
                <ArrowRight size={15} strokeWidth={1.6} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
