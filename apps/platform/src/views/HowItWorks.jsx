"use client";

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Camera,
  Check,
  CircleAlert,
  FileText,
  RefreshCw,
  ScanEye,
  Send,
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import PageHero from '../components/site/PageHero';
import { Reveal } from '../components/site/Reveal';
import FaqAccordion from '../components/site/FaqAccordion';
import { useDocumentMeta } from '../lib/seo';

const STEPS = [
  {
    icon: Camera,
    label: 'Step one',
    title: 'Put the property in.',
    body: 'Add the address, the price, the figures and your photographs. If the listing already exists on a portal, import it and fix what is wrong instead of typing it all again.',
    points: ['Address and location', 'Price and key figures', 'Photographs and floor plans', 'Your role and contact details'],
    visual: 'add',
  },
  {
    icon: ScanEye,
    label: 'Step two',
    title: 'Check it once.',
    body: 'LAREI lists the facts it can support and flags the ones that disagree with another source. You confirm each figure. Publication stays blocked until the open questions are closed.',
    points: ['Conflicts shown side by side', 'Unknown values left blank', 'Every decision dated', 'Nothing published by accident'],
    visual: 'check',
  },
  {
    icon: Send,
    label: 'Step three',
    title: 'Publish what you need.',
    body: 'Turn on the property page, send a deal sheet, share a buyer summary or print the inspection sheet. Each output has its own state, so you control who sees what.',
    points: ['Page, sheet, summary, printout', 'Preview before publishing', 'Private documents stay private', 'Update one, update all'],
    visual: 'publish',
  },
  {
    icon: RefreshCw,
    label: 'Step four',
    title: 'Change it once, everywhere.',
    body: 'When the price moves or a unit sells, edit the record. Every output that used that figure is regenerated, and the old versions are kept in the history.',
    points: ['One edit, all outputs', 'Version history', 'Retire a listing without deleting it', 'No stale brochures in circulation'],
    visual: 'update',
  },
];

const NEEDS = [
  {
    title: 'The facts you already have',
    body: 'Price, size, tenure, bedrooms, service charge. If a figure is missing, leave it blank. The product is built to handle not knowing.',
  },
  {
    title: 'Photographs worth showing',
    body: 'Phone photographs are fine. LAREI crops and lays them out, and tells you when an image is too small to print well.',
  },
  {
    title: 'Twenty minutes',
    body: 'That is the realistic time for a property you know well. The second one is quicker because your details and house style are already saved.',
  },
];

const FAQS = [
  {
    q: 'Do I have to move my listings off the portals?',
    a: 'No. Keep them where they are. LAREI gives you a record and a page you control, and it will import from a portal rather than asking you to start again.',
  },
  {
    q: 'What if I do not have all the information?',
    a: 'Leave it blank. A missing field is shown as missing rather than guessed, and you can publish without it. LAREI will not invent a measurement or a service charge.',
  },
  {
    q: 'Can I publish something before the whole property is ready?',
    a: 'Yes. A deal sheet can go to a buyer while the public page is still in draft, and a print sheet can exist before either. Each output is switched on separately.',
  },
  {
    q: 'What happens when a price changes?',
    a: 'You change it once in the record. Every output that carries the price is regenerated, and the previous version stays in the history so you can see what was sent and when.',
  },
];

function Visual({ kind }) {
  if (kind === 'add') {
    return (
      <div className="flow-visual">
        <div className="flow-card">
          <p className="flow-card-kicker">New property</p>
          <div className="flow-field"><span>Address</span><strong>18 Meridian Quay, Harbour district</strong></div>
          <div className="flow-field"><span>Asking price</span><strong>$480,000</strong></div>
          <div className="flow-field"><span>Bedrooms</span><strong>4</strong></div>
          <div className="flow-dropzone">
            <Camera size={16} strokeWidth={2} />
            <span>6 photographs added</span>
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'check') {
    return (
      <div className="flow-visual">
        <div className="flow-card">
          <div className="flow-check-row is-open">
            <CircleAlert size={14} strokeWidth={2.4} />
            <div>
              <strong>Price disagrees with the portal</strong>
              <span>$480,000 against $465,000</span>
            </div>
          </div>
          <div className="flow-check-row is-ok">
            <Check size={14} strokeWidth={3} />
            <div>
              <strong>Internal area confirmed</strong>
              <span>620 m², survey plan attached</span>
            </div>
          </div>
          <div className="flow-check-row is-ok">
            <Check size={14} strokeWidth={3} />
            <div>
              <strong>Tenure confirmed</strong>
              <span>Certificate of occupancy</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'publish') {
    return (
      <div className="flow-visual">
        <div className="flow-card">
          {[
            ['Property page', 'Live on the web', true],
            ['Deal sheet', 'Sent to 2 buyers', true],
            ['Buyer summary', 'Draft', false],
            ['Print sheet', 'Draft', false],
          ].map(([name, meta, on]) => (
            <div className="flow-publish-row" key={name}>
              <FileText size={15} strokeWidth={1.9} />
              <div>
                <strong>{name}</strong>
                <span>{meta}</span>
              </div>
              <span className={`mock-toggle ${on ? 'is-on' : ''}`} aria-hidden="true"><span /></span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flow-visual">
      <div className="flow-card">
        <div className="flow-update">
          <span className="flow-update-dot" />
          <div>
            <strong>Price changed to $475,000</strong>
            <span>Today, 09:14 by Ada Okonkwo</span>
          </div>
        </div>
        <div className="flow-update-list">
          {['Property page regenerated', 'Deal sheet regenerated', 'Buyer summary updated', 'Previous versions kept'].map((t) => (
            <div key={t}>
              <Check size={12} strokeWidth={3} />
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  useDocumentMeta({
    title: 'How it works',
    description:
      'Add a property, check the facts once, publish the page, the deal sheet, the buyer summary and the print sheet, then keep everything current from one record.',
    path: '/how-it-works',
  });

  return (
    <PageWrapper>
      <PageHero
        eyebrow="How it works"
        title={<>From a set of notes to a published property.</>}
        lede="Four steps, in the order you already work. About twenty minutes for a property you know well, and less for the next one because your details and house style are saved."
        actions={
          <>
            <Link href="/early-access" className="btn btn-primary">
              Request beta access
              <ArrowRight strokeWidth={2.2} />
            </Link>
            <Link href="/product" className="btn btn-secondary">
              See the product
            </Link>
          </>
        }
        media={
          <div className="hero-photo-card">
            <img src="/images/prop-2.jpg" alt="A photographed living space used in a sample listing" />
            <div className="hero-photo-chip glass">
              <FileText size={16} strokeWidth={2.2} />
              <div>
                <strong>One record</strong>
                <span>Page, sheet, summary, printout</span>
              </div>
            </div>
          </div>
        }
      />

      <section className="flow">
        <div className="shell">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal
                key={step.title}
                className={`flow-item ${i % 2 === 1 ? 'is-reverse' : ''}`}
              >
                <div className="flow-copy">
                  <span className="flow-icon"><Icon size={20} strokeWidth={1.9} /></span>
                  <p className="flow-label">{step.label}</p>
                  <h2 className="flow-title">{step.title}</h2>
                  <p className="lead">{step.body}</p>
                  <ul className="list-check">
                    {step.points.map((p) => (
                      <li key={p}>
                        <span className="list-check-icon"><Check size={12} strokeWidth={3} /></span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <Visual kind={step.visual} />
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="needs section-y">
        <div className="shell">
          <div className="section-head">
            <span className="eyebrow">Before you start</span>
            <h2 className="section-title">What you actually need.</h2>
          </div>
          <div className="needs-grid">
            {NEEDS.map((need, i) => (
              <Reveal key={need.title} delay={0.05 * i} className="need-card">
                <h3>{need.title}</h3>
                <p>{need.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-faq section-y">
        <div className="shell">
          <div className="page-faq-grid">
            <div className="page-faq-aside">
              <span className="eyebrow">Questions</span>
              <h2 className="section-title">The practical ones.</h2>
              <p className="lead">
                Anything else, write to us and a person will answer.
              </p>
              <Link href="/contact" className="btn btn-secondary">Ask a question</Link>
            </div>
            <FaqAccordion items={FAQS} initial={0} />
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="shell">
          <div className="cta-band-inner on-dark">
            <div>
              <h2>See whether it fits how you already work.</h2>
              <p>Tell us about one property and we will show you the record, the page and the deal sheet.</p>
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
