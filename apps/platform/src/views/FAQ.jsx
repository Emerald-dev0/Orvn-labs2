"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import PageHero from '../components/site/PageHero';
import FaqAccordion from '../components/site/FaqAccordion';
import { useDocumentMeta } from '../lib/seo';

const GROUPS = [
  {
    id: 'product',
    title: 'What it does',
    items: [
      {
        q: 'What is ORREI, in one paragraph?',
        a: 'ORREI is the product ORVN Labs is building. It keeps a property record and turns that record into a presentation: a description you edit, a deal sheet laid out for you, and a property page you can publish and send as a link. The human approves the facts and presses publish.',
      },
      {
        q: 'Who is it for?',
        a: 'Wholesalers and small disposition teams first, because they repeat the same job many times a month. Agents, brokers, developers and investors are supported by the same record, and nothing in the model assumes one country.',
      },
      {
        q: 'Is it a CRM?',
        a: 'No. It does not manage pipelines, commissions, accounting or long-running contact histories. It prepares and publishes property information, and it stores the inquiries a page receives.',
      },
      {
        q: 'What does one property actually produce?',
        a: 'A structured record with the source of each fact, an editable description, a published page with a share link, a printable deal sheet (one A4 page, saved as PDF from the print dialog) and a plain-text buyer summary you can paste into a message.',
      },
      {
        q: 'Do I have to stop using portals or WhatsApp?',
        a: 'No. Keep the tools you already use. The platform gives you a record and a page you control, and a link is usually easier to send than a file.',
      },
    ],
  },
  {
    id: 'facts',
    title: 'Facts and artificial intelligence',
    items: [
      {
        q: 'Does it verify property facts automatically?',
        a: 'No. It records where each fact came from, shows when two sources disagree and blocks publication until you approve the value. It does not confirm ownership, title, zoning, condition or seller authority, and it will not be presented as if it does.',
      },
      {
        q: 'What can the AI do, exactly?',
        a: 'Help with wording: draft a description from facts already in the record, tighten your own text and keep a consistent tone. It does not invent measurements, prices or dates, and nothing it writes publishes without review.',
      },
      {
        q: 'Do you fill in missing information?',
        a: 'No. Unknown values stay unknown. The platform will not estimate a size, a service charge or a completion date to make a page look complete.',
      },
      {
        q: 'Is there an automated valuation?',
        a: 'No. No valuations, ARV figures or investment analysis. The price is yours to set and ours to keep consistent.',
      },
      {
        q: 'What happens when a fact changes?',
        a: 'You change it once in the record. The description and the page are prepared again from the updated record, and the previous published version remains in the history with who changed it and when.',
      },
    ],
  },
  {
    id: 'publishing',
    title: 'Publishing and visibility',
    items: [
      {
        q: 'Can buyers see a page without signing up?',
        a: 'Yes. A published property page opens with no account, no wall and no form before the details. Inquiries are optional and go to the publisher, not to us.',
      },
      {
        q: 'What visibility options exist?',
        a: 'Three. Private: a draft that only your workspace sees. Link-only: published and reachable by anyone with the address, kept out of the portfolio and marked so search engines do not index it. Note that link-only is unlisted, not confidential: anyone with the link can open it. Public: published, listed on your portfolio and indexable.',
      },
      {
        q: 'Who can see my drafts and documents?',
        a: 'Only your workspace. Drafts, source files and unpublished outputs are private by default and are not indexed.',
      },
      {
        q: 'What do the analytics record?',
        a: 'That a page was opened, plus the inquiries a visitor chooses to send. We do not identify anonymous visitors, we do not fingerprint devices and we do not sell data.',
      },
      {
        q: 'Do you use my photographs to train models?',
        a: 'No. Images are stored to render your pages. They are not used for training and they are not resold.',
      },
    ],
  },
  {
    id: 'access',
    title: 'Access, price and status',
    items: [
      {
        q: 'Is it available now?',
        a: 'It is in development. There is an early-access list, invitations go out in small groups, and features are labelled as shipped or planned rather than described as if they were finished.',
      },
      {
        q: 'How do I get in?',
        a: 'Request access and a person reads it. If there is a place in the next group you get an email with a workspace invitation. There is no queue position to chase and no automated account creation.',
      },
      {
        q: 'What does it cost?',
        a: 'Nothing during early access. No card is taken. Pricing is not decided and it is not published; when it is, you will hear first and nobody moves onto a paid plan without agreeing.',
      },
      {
        q: 'Which countries does it work in?',
        a: 'The interface is in English and the data model is not built around one country: addresses are free-form, prices take any currency and property types are generic. That is not the same as being localised everywhere, and billing, when it arrives, will depend on where you are.',
      },
      {
        q: 'Who owns the content?',
        a: 'You do. The facts, the photographs and the descriptions stay yours. You can retire a page, export what you supplied or delete the record.',
      },
    ],
  },
];

export default function FAQ() {
  useDocumentMeta({
    title: 'Questions',
    description:
      'Straight answers about ORREI: early access, what you get for a property, how facts are checked, privacy, analytics and pricing.',
    path: '/faq',
  });

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Questions"
        title={<>Everything people ask before signing up.</>}
        lede="Written the way we would answer it on a call. If something is missing, ask and we will add it here rather than sending you a brochure."
        actions={
          <Link href="/contact" className="btn btn-secondary">
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
                <Link href="/contact" className="arrow-link">
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
            <Link href="/early-access" className="btn btn-lime">
              Request access
              <ArrowRight strokeWidth={2.2} />
            </Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
