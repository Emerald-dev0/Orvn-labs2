import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';
import ChapterHead from '../components/site/ChapterHead';
import { Reveal, MaskedLines } from '../components/site/Reveal';
import FaqAccordion from '../components/site/FaqAccordion';

const STEPS = [
  {
    n: '01',
    title: 'Introduce the business.',
    body: 'Tell us your role, your markets, your audience and the voice you want to be read in. Choose what belongs on your public professional page. Nothing here is guesswork — you supply it, you approve it.',
    out: 'Profile draft',
  },
  {
    n: '02',
    title: 'Review the draft.',
    body: 'LAREI prepares an editable first version of your public page. Check names, qualifications, contact details and the projects you want shown before publishing. Edit anything that sounds unlike you.',
    out: 'Public profile',
  },
  {
    n: '03',
    title: 'Bring in a property.',
    body: 'Paste notes, fill in fields, or attach supported documents and photographs. AI organises the supported facts into a reviewable record — with the source of each fact kept alongside it.',
    out: 'Property record',
  },
  {
    n: '04',
    title: 'Verify and prepare.',
    body: 'Correct conflicts between sources, mark unknowns as unknown, and choose what is safe to share. Then generate the deal sheet and marketing description from the approved information only.',
    out: 'Deal sheet',
  },
  {
    n: '05',
    title: 'Publish the right pages.',
    body: 'Give each approved property a dedicated URL. Decide whether it appears in your public portfolio. Share one property, or the broader professional site — both work without a login wall for the buyer.',
    out: 'Property page',
  },
  {
    n: '06',
    title: 'Learn from engagement.',
    body: 'See page activity, tracked link clicks and inquiries. Update the presentation while the underlying record stays intact. What was observed is what gets reported — anonymous visitors stay anonymous.',
    out: 'Insight',
  },
];

const RESPONSIBILITY = [
  ['You', ['Hold authority to market the property', 'Check facts before approving', 'Choose what is public', 'Decide the price you present']],
  ['LAREI', ['Organise supported facts', 'Surface conflicts and unknowns', 'Draft copy in your voice', 'Publish only what you approved']],
];

export default function HowItWorks() {
  useDocumentMeta({
    title: 'How it works — from notes to a published property',
    description:
      'How LAREI connects a professional profile, a verified property record, published property pages, deal sheets and engagement — without re-typing the same facts.',
    path: '/how-it-works',
  });

  return (
    <PageWrapper>
      <section className="page-hero">
        <div className="shell">
          <div className="page-hero-grid">
            <div>
              <span className="eyebrow">LAREI · Workflow</span>
              <h1 className="page-title">
                From a set of notes to a published property.
              </h1>
            </div>
            <div>
              <p className="page-lede">
                Six steps, one record. The work you do at step three is never repeated at step five,
                six or ten.
              </p>
              <div style={{ marginTop: 22 }}>
                <Link to="/early-access" className="arrow-link">
                  Apply for the beta
                  <ArrowUpRight size={15} strokeWidth={1.6} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 'clamp(40px,5vw,72px)' }}>
        <div className="shell">
          <div className="steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.03}>
                <div className="step">
                  <span className="step-n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <div>
                    <p>{s.body}</p>
                    <span className="step-out">
                      Produces <b>{s.out}</b>
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="dark-band">
        <div className="shell">
          <div className="chapter-head on-dark" style={{ marginBottom: 0 }}>
            <div className="chapter-meta">
              <span className="chapter-index">
                <i className="tick" style={{ background: 'var(--ember-bright)' }} />
                Division of labour
              </span>
              <span className="chapter-label">Who does what</span>
            </div>
          </div>
          <div className="resp-grid">
            {RESPONSIBILITY.map(([who, items], i) => (
              <div key={who} className="resp-col">
                <h3 className={i === 0 ? '' : 'is-larei'}>{who}</h3>
                <ul>
                  {items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="label-mono" style={{ color: 'rgba(239,234,225,0.4)', marginTop: 24, maxWidth: '62ch' }}>
            LAREI does not establish authority to market a property, and does not replace professional
            verification of any material fact.
          </p>
        </div>
      </section>

      <section className="section-y" style={{ background: 'var(--paper)' }}>
        <div className="shell">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.8fr) minmax(0,1.2fr)', gap: 'clamp(24px,5vw,80px)' }} className="faq-teaser-grid">
            <div>
              <ChapterHead
                index="Questions"
                label="Before you apply"
                title={['The workflow,', <>honestly <span className="em">described.</span></>]}
              />
              <Link to="/faq" className="arrow-link">
                All questions
                <ArrowRight size={15} strokeWidth={1.6} />
              </Link>
            </div>
            <FaqAccordion
              initial={null}
              items={[
                {
                  q: 'How long does a property take to prepare?',
                  a: 'It depends on how much source material you have and how many conflicts need resolving. The first property is always the slowest; later properties reuse your profile, voice preferences and output formats.',
                },
                {
                  q: 'What file types can I start from?',
                  a: 'Notes, form fields, photographs and supported documents. The exact list of supported uploads will be confirmed with beta users before the first release.',
                },
                {
                  q: 'Can I edit what the AI writes?',
                  a: 'Yes. Generated descriptions, captions and messages are drafts in your voice. You edit them, and you choose whether they are published.',
                },
                {
                  q: 'What happens to a published property after it closes?',
                  a: 'You can retire it from the public portfolio without deleting the record — the history and the documents stay in your workspace.',
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--paper-deep)', paddingBlock: 'clamp(40px,5vw,72px)' }}>
        <div className="shell">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <MaskedLines
              as="h2"
              className="h-display-2"
              lines={['Step one is', <>an <span className="em">application.</span></>]}
              style={{ maxWidth: '18ch' }}
            />
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/early-access" className="btn-primary">
                Request early access
                <ArrowUpRight size={15} strokeWidth={1.6} />
              </Link>
              <Link to="/product" className="btn-secondary">
                Product overview
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
