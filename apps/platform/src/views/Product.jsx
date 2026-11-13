"use client";

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CircleAlert,
  FileSpreadsheet,
  FileText,
  Printer,
  Send,
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import PageHero from '../components/site/PageHero';
import { Reveal } from '../components/site/Reveal';
import { useDocumentMeta } from '../lib/seo';

const OUTPUTS = [
  {
    icon: FileText,
    title: 'Property page',
    body: 'A public page with your photographs, the facts you approved and an enquiry button that comes to you.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Deal sheet',
    body: 'One page for the buyer, the bank or the developer, with every figure taken from the record.',
  },
  {
    icon: Send,
    title: 'Buyer summary',
    body: 'A short overview you can forward on WhatsApp without losing the details that matter.',
  },
  {
    icon: Printer,
    title: 'Print sheet',
    body: 'An A4 sheet for the site office and the inspection, laid out so nothing is cut off.',
  },
];

const LIMITS = [
  {
    title: 'No valuation',
    body: 'We do not estimate worth, produce an ARV or underwrite anything. You decide the price and we keep it consistent.',
  },
  {
    title: 'No legal boundaries',
    body: 'A map is location context. The platform does not claim surveyed parcel boundaries or a title opinion.',
  },
  {
    title: 'No buyer promises',
    body: 'We do not run campaigns or guarantee demand. The page is a better front door, not a sales engine.',
  },
  {
    title: 'No pipeline',
    body: 'The platform presents property. It is not a CRM, an accounting tool or a commission tracker.',
  },
];

function RecordMock() {
  return (
    <div className="mock-frame">
      <div className="app-window">
        <div className="app-bar">
          <span className="app-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="app-url">app.orvnlabs.com/properties/adaora-house/record</span>
        </div>
        <div className="app-main">
          <div className="mock-prop">
            <img src="/images/prop-3.jpg" alt="" />
            <div>
              <p className="mock-prop-name">Halden House</p>
              <p className="mock-prop-addr">18 Meridian Quay, Harbour district</p>
            </div>
            <span className="mock-status">Live</span>
          </div>
          <div className="mock-facts">
            {[
              ['Asking price', '$480,000', 'Taken from your brief, 2 days ago'],
              ['Internal area', '620 m²', 'Survey plan uploaded'],
              ['Bedrooms', '4', 'Confirmed by the developer'],
              ['Tenure', 'Certificate of occupancy', 'Document attached'],
            ].map(([k, v, note]) => (
              <div className="mock-fact-record" key={k}>
                <div>
                  <p className="mock-fact-key">{k}</p>
                  <p className="mock-fact-val">{v}</p>
                </div>
                <p className="mock-fact-note">{note}</p>
                <span className="mock-fact-state is-ok"><Check size={10} strokeWidth={3} /> Checked</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConflictMock() {
  return (
    <div className="mock-frame">
      <div className="app-window">
        <div className="app-bar">
          <span className="app-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="app-url">Illustrative design · pre-release</span>
        </div>
        <div className="app-main">
          <div className="mock-conflict">
            <div className="mock-conflict-head">
              <span className="mock-conflict-icon"><CircleAlert size={14} strokeWidth={2.4} /></span>
              <p>Price does not match the brochure</p>
              <span className="mock-time">2h ago</span>
            </div>
            <div className="mock-conflict-rows">
              <div><span>Record</span><strong>$480,000</strong><em>your source</em></div>
              <div><span>Brochure (PDF)</span><strong>$465,000</strong><em>your document</em></div>
            </div>
            <div className="mock-conflict-actions">
              <span className="mock-btn-dark">Use my figure</span>
              <span className="mock-btn-light">Use brochure figure</span>
            </div>
          </div>

          <div className="mock-conflict" style={{ marginTop: 10 }}>
            <div className="mock-conflict-head">
              <span className="mock-conflict-icon is-ok"><BadgeCheck size={14} strokeWidth={2.4} /></span>
              <p>Service charge confirmed</p>
              <span className="mock-time">yesterday</span>
            </div>
            <p className="mock-resolved-note">Checked against the management agreement by A. Bello.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightMock() {
  const bars = [38, 62, 48, 78, 66, 92, 58];
  return (
    <div className="mock-frame">
      <div className="app-window">
        <div className="app-bar">
          <span className="app-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="app-url">Illustrative design · pre-release</span>
        </div>
        <div className="app-main">
          <p className="mock-insight-foot" style={{ marginBottom: 10 }}>
            Illustrative example — not real customer results
          </p>
          <div className="mock-insight-top">
            <div>
              <p className="mock-insight-num">132</p>
              <span className="mock-insight-label">Page opens, last 7 days</span>
            </div>
            <div>
              <p className="mock-insight-num">12</p>
              <span className="mock-insight-label">Inquiries this month</span>
            </div>
          </div>
          <div className="mock-bars" aria-hidden="true">
            {bars.map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} className={i === 5 ? 'is-peak' : ''} />
            ))}
          </div>
          <div className="mock-facts" style={{ marginTop: 16 }}>
            {[
              ['Property page', '132 opens · last 7 days'],
              ['Inquiries', '12 this month'],
            ].map(([k, v]) => (
              <div className="mock-fact" key={k}>
                <span className="mock-fact-key">{k}</span>
                <span className="mock-fact-val">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Product() {
  useDocumentMeta({
    title: 'Product',
    description:
      'One property record that becomes a published page, a printable deal sheet and a buyer summary you can paste into a message.',
    path: '/product',
  });

  return (
    <PageWrapper>
      <PageHero
        eyebrow="ORREI"
        title={<>The workspace behind the page.</>}
        lede="ORREI keeps the facts, the photographs and the permissions for each property in one place. The published page, the printable deal sheet and the buyer summary are all made from that record, so they agree."
        actions={
          <>
            <Link href="/early-access" className="btn btn-primary">
              Request early access
              <ArrowRight strokeWidth={2.2} />
            </Link>
            <Link href="/how-it-works" className="btn btn-secondary">
              How it works
            </Link>
          </>
        }
        media={
          <div className="hero-photo-card">
            <img src="/images/interior-1.jpg" alt="A warm living room photographed for a property page" />
            <div className="hero-photo-chip glass">
              <BadgeCheck size={16} strokeWidth={2.2} />
              <div>
                <strong>Facts you approved</strong>
                <span>Before anything publishes</span>
              </div>
            </div>
          </div>
        }
      />

      <section className="split">
        <div className="split-copy">
          <span className="eyebrow">The record</span>
          <h2 className="split-title">Every line has a source behind it.</h2>
          <p className="lead">
            Price, size, tenure, bedrooms, service charge, the agent responsible. Each field keeps
            the document or the person it came from, so you can answer a question six weeks later
            without searching your phone.
          </p>
          <ul className="list-check">
            {[
              'Facts you entered or confirmed from your documents',
              'Unknowns marked as unknown, not filled in',
              'Documents attached to the field they prove',
              'A history of who changed what',
            ].map((t) => (
              <li key={t}>
                <span className="list-check-icon"><Check size={12} strokeWidth={3} /></span>
                {t}
              </li>
            ))}
          </ul>
          <Link href="/early-access" className="arrow-link">
            See it with your own listing
            <ArrowUpRight strokeWidth={2} />
          </Link>
        </div>
        <RecordMock />
      </section>

      <section className="split is-reverse">
        <ConflictMock />
        <div className="split-copy">
          <span className="eyebrow">Checking</span>
          <h2 className="split-title">When two sources disagree, you decide.</h2>
          <p className="lead">
            Property facts drift. A price changes on one portal and not another, a colleague measures
            a room differently, a brochure is three years old. The record shows you the conflict and holds
            publication until you settle it.
          </p>
          <ul className="list-check">
            {[
              'Conflicts surfaced with both sources',
              'One click to keep your figure',
              'Publishing blocked while a check is open',
              'A dated trail of every decision',
            ].map((t) => (
              <li key={t}>
                <span className="list-check-icon"><Check size={12} strokeWidth={3} /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="product-outputs section-y">
        <div className="shell">
          <div className="section-head">
            <span className="eyebrow">Publishing</span>
            <h2 className="section-title">Four outputs, one set of facts.</h2>
            <p className="lead">
              Choose what to send and who can see it. Each output has its own state, so a deal sheet
              can go to a buyer before the public page exists.
            </p>
          </div>

          <div className="outputs-grid">
            {OUTPUTS.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={0.05 * i} className="output-card">
                  <span className="output-icon"><Icon size={20} strokeWidth={1.9} /></span>
                  <h3 className="output-card-title">{item.title}</h3>
                  <p className="output-card-body">{item.body}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="split">
        <div className="split-copy">
          <span className="eyebrow">Insight</span>
          <h2 className="split-title">See what happened after you shared.</h2>
          <p className="lead">
            Where available, track page opens and submitted inquiries. Views are not verified
            buyers, and interest is not proof of purchase.
          </p>
          <Link href="/legal/privacy" className="arrow-link">
            How the analytics work
            <ArrowUpRight strokeWidth={2} />
          </Link>
        </div>
        <InsightMock />
      </section>

      <section className="limits section-y">
        <div className="shell">
          <div className="section-head">
            <span className="eyebrow">Limits</span>
            <h2 className="section-title">What ORREI will not do.</h2>
            <p className="lead">
              A tool is defined by what it refuses. These are ours, written down so nobody is
              surprised later.
            </p>
          </div>
          <div className="limits-grid">
            {LIMITS.map((limit, i) => (
              <Reveal key={limit.title} delay={0.04 * i} className="limit-card">
                <h3>{limit.title}</h3>
                <p>{limit.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="shell">
          <div className="cta-band-inner on-dark">
            <div>
              <h2>Put one property in and judge for yourself.</h2>
              <p>Beta access is free, reviewed by a person, and comes with a direct line to us.</p>
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
