import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';
import FaqAccordion from '../components/site/FaqAccordion';
import { Reveal } from '../components/site/Reveal';

const GROUPS = [
  {
    id: 'access',
    label: 'Access & beta',
    items: [
      {
        q: 'What is ORVN Labs?',
        a: 'ORVN Labs is a real-estate technology business developing LAREI, a platform for professional websites, property presentations and the work required to prepare and publish them.',
      },
      {
        q: 'Is it available now?',
        a: 'LAREI is being developed for a controlled private beta. Public sign-up may not yet be available. Interested professionals can request early access; approval is not guaranteed.',
      },
      {
        q: 'Do I get my own website?',
        a: 'That is part of the planned beta experience. Approved users will be able to prepare a professional public page using their business profile and selected portfolio content. The supported URL format will be confirmed during the beta.',
      },
      {
        q: 'Can I use my own domain?',
        a: 'Custom-domain support is being evaluated for a later phase and should not be assumed in the first private beta.',
      },
    ],
  },
  {
    id: 'product',
    label: 'The product',
    items: [
      {
        q: 'What is LAREI?',
        a: 'LAREI is the provisional name of our product for real-estate professionals. It is being designed to connect a branded public profile, selected property portfolio, AI-assisted property records, shareable property pages and engagement insights.',
      },
      {
        q: 'Who is LAREI for?',
        a: 'The initial focus is on wholesalers, real-estate agents, investors and acquisitions/dispositions operators who regularly present property or business information to others.',
      },
      {
        q: 'Can every deal have its own page?',
        a: 'The planned core workflow provides an individual published property page connected to the user’s professional identity. Each page has its own shareable URL and an inquiry route.',
      },
      {
        q: 'Does AI build the entire website for me?',
        a: 'LAREI is designed to draft copy and arrange a focused professional page using approved information. Users review the facts, control public sections and publish intentionally. It is not intended to be an unrestricted website builder.',
      },
      {
        q: 'Can I import my ChatGPT information?',
        a: 'The intended first approach is to paste relevant context or upload a prepared business summary or writing samples. Automatic access to an external AI account is not part of the confirmed initial scope.',
      },
      {
        q: 'Will the AI learn how I write?',
        a: 'Users are intended to be able to save reviewed style preferences and business context for more consistent generated writing. Those preferences should remain visible, editable and private to the relevant workspace.',
      },
      {
        q: 'Can I use LAREI if I’m not a wholesaler?',
        a: 'Yes. The proposed workflow is designed to adapt core presentation features for agents, investors and real-estate operators, with appropriate content choices and disclosures.',
      },
    ],
  },
  {
    id: 'accuracy',
    label: 'Facts & accuracy',
    items: [
      {
        q: 'Does LAREI verify property values or create an ARV?',
        a: 'No authoritative appraisal, automated underwriting or independently verified ARV is included in the initial scope. Professionals remain responsible for checking all material investment assumptions.',
      },
      {
        q: 'Does the map show exact parcel boundaries?',
        a: 'Not in the initial release. Basic location mapping or a map link is planned. Parcel GIS and surveyed/legal boundary interpretations are separate future work.',
      },
      {
        q: 'Can I market other people’s properties?',
        a: 'Users must have the legal authority and necessary permissions to publish property information and imagery, including any agent/brokerage disclosures required in their market. LAREI does not establish that authority for them.',
      },
      {
        q: 'Does LAREI automatically find buyers or send campaigns?',
        a: 'No buyer-finding guarantee or mass distribution is part of the first release. It is designed to make approved property pages easy to share and inquiries easy to receive.',
      },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy & publishing',
    items: [
      {
        q: 'Can I hide my address or documents?',
        a: 'The planned publication process provides user control over what becomes public. The implemented settings and supported privacy options will be explained in the beta.',
      },
      {
        q: 'Can I see exactly who clicks my link?',
        a: 'Analytics can show measurable page activity and tracked clicks. They do not automatically reveal the identity of anonymous visitors. Identifying contact information is collected only when visitors choose to submit it.',
      },
      {
        q: 'Is LAREI a CRM?',
        a: 'No. The initial scope emphasizes presentation, publication and basic inquiry visibility rather than a full lead management, transaction or contract system.',
      },
    ],
  },
  {
    id: 'commercial',
    label: 'Commercial',
    items: [
      {
        q: 'How much does LAREI cost?',
        a: 'Pricing has not been announced. Any pricing, plan limits and beta terms will be communicated before a paid commitment is requested.',
      },
      {
        q: 'How can I contact ORVN Labs?',
        a: 'Use the contact page or hello@orvnlabs.com. We respond to relevant product and early-access questions.',
      },
    ],
  },
];

export default function FAQ() {
  useDocumentMeta({
    title: 'FAQ — access, accuracy, privacy and scope',
    description: 'Plain answers about LAREI access, the beta, AI behaviour, fact accuracy, mapping, privacy and pricing.',
    path: '/faq',
  });

  return (
    <PageWrapper>
      <section className="page-hero">
        <div className="shell">
          <div className="page-hero-grid">
            <div>
              <span className="eyebrow">Questions</span>
              <h1 className="page-title">
                Asked plainly. <span className="em">Answered plainly.</span>
              </h1>
            </div>
            <div>
              <p className="page-lede">
                Access, accuracy, mapping, privacy and scope — including the things LAREI does not
                do.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 'clamp(48px,6vw,88px)' }}>
        <div className="shell">
          <div className="faq-layout">
            <aside className="faq-side">
              <span className="label-mono">Contents</span>
              <nav>
                {GROUPS.map((g, i) => (
                  <a key={g.id} href={`#${g.id}`}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {g.label}
                  </a>
                ))}
              </nav>
              <div className="faq-help">
                <Mail size={16} strokeWidth={1.5} color="var(--ember)" />
                <p>Still unclear? Ask a direct question — a person answers.</p>
                <Link to="/contact" className="access-cta" style={{ borderTop: 'none', paddingTop: 0 }}>
                  Contact us
                  <ArrowUpRight size={12} strokeWidth={1.8} />
                </Link>
              </div>
            </aside>

            <div>
              {GROUPS.map((g, i) => (
                <Reveal key={g.id} delay={0.02}>
                  <section id={g.id} style={{ marginBottom: 'clamp(32px,4vw,52px)', scrollMarginTop: 'calc(var(--nav-h) + 32px)' }}>
                    <div className="faq-group-head">
                      <span className="label-mono-primary">{String(i + 1).padStart(2, '0')}</span>
                      <h2>{g.label}</h2>
                    </div>
                    <FaqAccordion items={g.items} initial={null} />
                  </section>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
