import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Minus } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';
import ChapterHead from '../components/site/ChapterHead';
import { Reveal, MaskedLines } from '../components/site/Reveal';
import FaqAccordion from '../components/site/FaqAccordion';

const CHAPTERS = [
  {
    n: '01',
    title: 'The professional behind the property.',
    body: [
      'Start with your role, markets, services, credentials and contact preferences. LAREI prepares an editable draft of your public profile — you check names, qualifications and contact details before anything is published.',
      'The profile is not a template you fight with. It is a short, honest statement of what you do and where you do it, connected to everything else you publish.',
    ],
    points: ['Markets and territories', 'Services and specialisms', 'Contact and disclosure preferences', 'Review before publishing'],
  },
  {
    n: '02',
    title: 'A portfolio, not a pile of links.',
    body: [
      'Your portfolio is a selection of approved records, not a set of manually updated website cards. Choose which properties appear publicly; update the underlying record and the presentation stays aligned.',
    ],
    points: ['Select what is public', 'Retire a listing without deleting it', 'One visual language across every property'],
  },
  {
    n: '03',
    title: 'One record, four useful outputs.',
    body: [
      'Bring in notes, forms or supported files. LAREI organises the facts it can support into a record you review: address, tenure, size, price, bedrooms, documents, sources.',
      'From that record you generate a property page, a print-ready deal sheet, a short buyer summary and a print sheet — without entering the same details four times.',
    ],
    points: ['Source-aware fields', 'Conflicts surfaced, not smoothed', 'Unknowns marked as unknown', 'Outputs regenerate from the same facts'],
  },
  {
    n: '04',
    title: 'Copy that sounds like you.',
    body: [
      'Add writing samples or a business context summary. Choose the tone you want. LAREI drafts descriptions, captions and buyer messages using approved information — every sentence editable before it goes public.',
    ],
    points: ['Saved voice preferences', 'Editable drafts', 'Private to your workspace'],
  },
  {
    n: '05',
    title: 'Location, described honestly.',
    body: [
      'Give visitors a general view of where a property sits, with a map or a map link. The first release does not claim surveyed boundaries or provide full GIS diligence.',
    ],
    points: ['General location context', 'No implied parcel survey', 'Clear language about precision'],
  },
  {
    n: '06',
    title: 'Interest you can act on.',
    body: [
      'See which pages are viewed, which links are clicked and which published properties generate inquiries. Analytics measure observable behaviour — not the identity of anonymous visitors.',
    ],
    points: ['Page activity', 'Tracked link clicks', 'Inquiry routes', 'No visitor de-anonymisation'],
  },
  {
    n: '07',
    title: 'Publication stays deliberate.',
    body: [
      'Preview exactly what buyers will see. Hide sensitive information. Separate private documents from public claims. Nothing leaves your workspace without an approval you performed.',
    ],
    points: ['Preview before publish', 'Private files stay private', 'Per-property publication control'],
  },
];

const NOT = [
  ['No appraisal or ARV', 'No authoritative valuation, automated underwriting or verified ARV is produced.'],
  ['No parcel boundaries', 'Maps are location context, not surveyed or legal boundaries.'],
  ['Not a CRM', 'LAREI presents and publishes. It does not manage pipelines, contracts or commissions.'],
  ['No buyer-finding guarantee', 'No mass distribution and no promise of a buyer. A shareable page, not a campaign engine.'],
];

const OUTPUTS_FAQ = [
  {
    q: 'Do I need design software to use the outputs?',
    a: 'No. Property pages, deal sheets, buyer summaries and print sheets are generated from the same approved record. You can regenerate any of them after a fact changes.',
  },
  {
    q: 'Can I edit generated copy?',
    a: 'Yes. Every generated description, caption and message is editable before publication, and you choose whether it becomes public.',
  },
  {
    q: 'What happens when a fact changes?',
    a: 'You update the record and approve the change. Outputs generated afterwards use the approved figure; previously exported documents can be regenerated.',
  },
  {
    q: 'Can I keep some documents private?',
    a: 'Yes. Private files remain private unless explicitly approved for a public page or a shared summary.',
  },
];

export default function Product() {
  useDocumentMeta({
    title: 'Product — one record behind every property page',
    description:
      'Explore LAREI: professional profiles, property records, verified facts, shareable property pages, print-ready deal sheets and engagement insight in one workspace.',
    path: '/product',
  });

  return (
    <PageWrapper>
      <section className="page-hero">
        <div className="shell">
          <div className="page-hero-grid">
            <div>
              <span className="eyebrow">LAREI · Product</span>
              <h1 className="page-title">
                One workspace for your presence
                <br />
                and your <span className="em">properties.</span>
              </h1>
            </div>
            <div>
              <p className="page-lede">
                Build a public destination that reflects the business behind it, keep each property
                organised behind the scenes, and choose what appears on its own shareable page.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 24 }}>
                <Link to="/early-access" className="btn-primary">
                  Request early access
                  <ArrowUpRight size={15} strokeWidth={1.6} />
                </Link>
                <Link to="/how-it-works" className="arrow-link">
                  See how it works
                  <ArrowRight size={15} strokeWidth={1.6} />
                </Link>
              </div>
            </div>
          </div>

          <Reveal delay={0.15}>
            <div className="page-hero-meta">
              <div>
                <strong>One record</strong>
                <span>Per property</span>
              </div>
              <div>
                <strong>Four outputs</strong>
                <span>Page · sheet · summary · print</span>
              </div>
              <div>
                <strong>You approve</strong>
                <span>Before anything is public</span>
              </div>
              <div>
                <strong>Private beta</strong>
                <span>Applications reviewed</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Chapters */}
      <section style={{ paddingBottom: 'clamp(24px,3vw,40px)' }}>
        <div className="shell">
          {CHAPTERS.map((c) => (
            <Reveal key={c.n} delay={0.02}>
              <article className="ed-block">
                <div className="ed-aside">
                  <span className="ed-index">CHAPTER {c.n}</span>
                  <h2 className="ed-title">{c.title}</h2>
                </div>
                <div className="ed-body">
                  {c.body.map((p, pi) => (
                    <p key={pi}>{p}</p>
                  ))}
                  <ul className="ed-points">
                    {c.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Outputs band */}
      <section className="dark-band">
        <div className="shell">
          <div className="chapter-head on-dark" style={{ marginBottom: 0 }}>
            <div className="chapter-meta">
              <span className="chapter-index">
                <i className="tick" style={{ background: 'var(--ember-bright)' }} />
                Outputs
              </span>
              <span className="chapter-label">What leaves the workspace</span>
            </div>
          </div>
          <div className="outputs-strip">
            {[
              ['Property page', 'Public URL · inquiry route'],
              ['Deal sheet', 'A4 · print-ready'],
              ['Buyer summary', 'Message-length text'],
              ['Print sheet', 'A4 · viewing pack'],
            ].map(([t, s], i) => (
              <div key={t} className="output-tile">
                <span className="label-mono" style={{ color: 'rgba(239,234,225,0.4)' }}>
                  0{i + 1}
                </span>
                <strong>{t}</strong>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honesty block */}
      <section className="section-y" style={{ background: 'var(--paper)' }}>
        <div className="shell">
          <ChapterHead
            index="What it is not"
            label="Scope, stated plainly"
            title={['Careful about', <>what it <span className="em">claims.</span></>]}
            note="A product that presents property for a living should be precise about its own limits. Here is ours."
          />
          <div className="not-grid">
            {NOT.map(([h, p], i) => (
              <Reveal key={h} delay={i * 0.06} className="not-item">
                <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                  <Minus size={13} strokeWidth={1.8} color="var(--ember)" style={{ flexShrink: 0, transform: 'translateY(2px)' }} />
                  <h3>{h}</h3>
                </div>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y-sm" style={{ background: 'var(--paper-deep)' }}>
        <div className="shell">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.8fr) minmax(0,1.2fr)', gap: 'clamp(24px,5vw,80px)' }} className="faq-teaser-grid">
            <div>
              <span className="eyebrow" style={{ marginBottom: 16 }}>Product questions</span>
              <MaskedLines
                as="h2"
                className="h-display-2"
                lines={['The practical', <>details.</>]}
              />
              <div style={{ marginTop: 22 }}>
                <Link to="/faq" className="arrow-link">
                  Everything else
                  <ArrowRight size={15} strokeWidth={1.6} />
                </Link>
              </div>
            </div>
            <FaqAccordion items={OUTPUTS_FAQ} initial={null} />
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--paper)', paddingBlock: 'clamp(48px,6vw,88px)' }}>
        <div className="shell">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
              borderTop: '1px solid var(--ink)',
              paddingTop: 24,
            }}
          >
            <h2 className="h-display-2" style={{ maxWidth: '20ch' }}>
              Ready to present property <span className="em">properly?</span>
            </h2>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/early-access" className="btn-primary">
                Request early access
                <ArrowUpRight size={15} strokeWidth={1.6} />
              </Link>
              <Link to="/who-its-for" className="btn-secondary">
                Who it’s for
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
