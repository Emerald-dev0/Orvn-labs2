import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import PageHero from '../components/site/PageHero';
import FaqAccordion from '../components/site/FaqAccordion';
import { useDocumentMeta } from '../lib/seo';

const GROUPS = [
  {
    id: 'access',
    title: 'Access and the beta',
    items: [
      {
        q: 'How do I get in?',
        a: 'Request access and a person reads it. Invitations go out in small cohorts so we can fix the workflow while it is still cheap to fix. There is no queue position to chase.',
      },
      {
        q: 'What does it cost during the beta?',
        a: 'Nothing. No card is taken and nothing is charged. When a paid plan arrives you will be told the price before anything changes, and you can leave with your data.',
      },
      {
        q: 'How long until I hear back?',
        a: 'Usually within a week. If we cannot offer a place yet, we say so rather than leaving the request open indefinitely.',
      },
      {
        q: 'Do you take teams?',
        a: 'Yes. Small agencies and developer sales teams are the second group we are inviting, and the Studio workspace is being built with them.',
      },
    ],
  },
  {
    id: 'product',
    title: 'The product',
    items: [
      {
        q: 'What exactly do I get for one property?',
        a: 'A property page on the web, a PDF deal sheet, a short buyer summary you can forward, and an A4 print sheet. All four are generated from the same record.',
      },
      {
        q: 'Do I need to stop using the portals?',
        a: 'No. Keep your portal listings. LAREI gives you a record and a page you control, and it can import from a portal rather than asking you to type everything again.',
      },
      {
        q: 'Can I use my own branding?',
        a: 'Yes. Your name, your colours, your contact details. The page should look like your business, not like a platform you rented.',
      },
      {
        q: 'Does it work on a phone?',
        a: 'Adding photographs and checking a record works well on a phone, which is where most inspections happen. Layout editing is easier on a larger screen.',
      },
    ],
  },
  {
    id: 'facts',
    title: 'Facts and accuracy',
    items: [
      {
        q: 'What happens when a fact is wrong?',
        a: 'Change it once in the record. Every output that used the figure is regenerated. The previous version stays in the history along with who changed it and when.',
      },
      {
        q: 'Do you fill in missing information?',
        a: 'No. Unknown values are shown as unknown. LAREI will not estimate a size, a service charge or a completion date to make a page look complete.',
      },
      {
        q: 'Is there an automated valuation?',
        a: 'No. We do not produce valuations, ARV figures or investment analysis. The price is yours to set and ours to keep consistent.',
      },
      {
        q: 'Who writes the descriptions?',
        a: 'You do, by default. If you ask for a draft, it is written only from facts already in the record, clearly marked as a draft, and it cannot publish without your approval.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy and publishing',
    items: [
      {
        q: 'Who can see my drafts?',
        a: 'Only your workspace. Drafts, private documents and unpublished outputs are not public and are not indexed by search engines.',
      },
      {
        q: 'What do the analytics record?',
        a: 'Page views, image attention, downloads and enquiry clicks. We do not identify anonymous visitors and we do not sell data to anybody.',
      },
      {
        q: 'Do you use my photographs to train models?',
        a: 'No. Your images are stored so we can render pages, sheets and printouts for you. They are not used for training and they are not resold.',
      },
      {
        q: 'Can I delete a property?',
        a: 'Yes. Deleting removes the record, the outputs and the files. You can also retire a listing, which takes the page offline and keeps the history.',
      },
    ],
  },
  {
    id: 'commercial',
    title: 'Commercial',
    items: [
      {
        q: 'What will it cost after the beta?',
        a: 'We have not announced pricing because the product is still changing. When it is decided, beta users hear first and nobody is moved onto a paid plan without agreeing to it.',
      },
      {
        q: 'Is it available outside Nigeria?',
        a: 'Yes. The interface is in English, prices can be set in any currency and addresses work anywhere. Billing, when it starts, will depend on where you are.',
      },
      {
        q: 'Do you offer support?',
        a: 'During the beta you talk directly to the people building it. There is no ticket queue and no chatbot pretending to be a person.',
      },
      {
        q: 'Who owns the content?',
        a: 'You do. The facts, the photographs and the descriptions remain yours. We host and render them, and you can export or delete them.',
      },
    ],
  },
];

export default function FAQ() {
  useDocumentMeta({
    title: 'Questions',
    description:
      'Straight answers about LAREI: beta access, what you get for a property, how facts are checked, privacy, analytics and pricing.',
    path: '/faq',
  });

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Questions"
        title={<>Everything people ask before signing up.</>}
        lede="Written the way we would answer it on a call. If something is missing, ask and we will add it here rather than sending you a brochure."
        actions={
          <Link to="/contact" className="btn btn-secondary">
            Ask a question
            <ArrowUpRight strokeWidth={2} />
          </Link>
        }
      />

      <section className="faq-page section-y">
        <div className="shell">
          <div className="faq-layout">
            <aside className="faq-side">
              <p className="label-mono">Sections</p>
              <nav className="faq-index">
                {GROUPS.map((g) => (
                  <a key={g.id} href={`#${g.id}`}>{g.title}</a>
                ))}
              </nav>

              <div className="faq-help">
                <Mail size={18} strokeWidth={1.9} />
                <p>Still unsure about something? Write to a person, not a form robot.</p>
                <Link to="/contact" className="arrow-link">
                  Contact us
                  <ArrowUpRight strokeWidth={2} />
                </Link>
              </div>
            </aside>

            <div className="faq-groups">
              {GROUPS.map((group, i) => (
                <div id={group.id} className="faq-group" key={group.id}>
                  <h2 className="faq-group-title">{group.title}</h2>
                  <FaqAccordion items={group.items} initial={i === 0 ? 0 : -1} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="shell">
          <div className="cta-band-inner on-dark">
            <div>
              <h2>Ready to put a property in?</h2>
              <p>Beta access is free, reviewed by a person, and you keep everything you upload.</p>
            </div>
            <Link to="/early-access" className="btn btn-lime">
              Request access
              <ArrowRight strokeWidth={2.2} />
            </Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
