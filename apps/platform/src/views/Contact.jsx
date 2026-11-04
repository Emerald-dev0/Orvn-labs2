"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Check, Mail } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import PageHero from '../components/site/PageHero';
import { Reveal } from '../components/site/Reveal';
import { useDocumentMeta } from '../lib/seo';

const TOPICS = [
  'Beta access',
  'A property I want to publish',
  'Teams and agencies',
  'PAS',
  'Something else',
];

export default function Contact() {
  useDocumentMeta({
    title: 'Contact',
    description:
      'Questions about LAREI, beta access or a property you want to publish. A person reads every message.',
    path: '/contact',
  });

  const [status, setStatus] = useState('idle');

  const onSubmit = (e) => {
    e.preventDefault();
    setStatus('sent');
  };

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Contact"
        title={<>Talk to a person.</>}
        lede="Questions about LAREI, beta access, or a property you are trying to present. Tell us what you are working on and we will answer in plain language."
      />

      <section className="form-page">
        <div className="shell">
          <div className="form-shell">
            <div>
              {status === 'sent' ? (
                <Reveal className="form-success-block">
                  <span className="form-success-icon"><Check size={20} strokeWidth={2.6} /></span>
                  <h2>Message received.</h2>
                  <p>
                    We answer within one working day, usually sooner. If your question is about
                    access, the application form gets a faster response.
                  </p>
                  <Link href="/early-access" className="btn btn-primary">
                    Request access instead
                    <ArrowRight strokeWidth={2.2} />
                  </Link>
                </Reveal>
              ) : (
                <form onSubmit={onSubmit} className="form-grid">
                  <div className="field">
                    <label className="field-label" htmlFor="c-name">Your name</label>
                    <input id="c-name" required className="input" placeholder="Ada Okonkwo" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="c-email">Email</label>
                    <input id="c-email" required type="email" className="input" placeholder="you@business.com" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="c-company">Company</label>
                    <input id="c-company" className="input" placeholder="Optional" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="c-topic">What is this about?</label>
                    <select id="c-topic" className="select" defaultValue="">
                      <option value="" disabled>Select a topic</option>
                      {TOPICS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="field span-2">
                    <label className="field-label" htmlFor="c-message">Message</label>
                    <textarea id="c-message" required className="textarea" rows={6} placeholder="What are you trying to publish, and what is getting in the way?" />
                  </div>

                  <div className="form-foot span-2">
                    <p className="form-legal">
                      We use your message to answer it. Nothing else. See the{' '}
                      <Link href="/legal/privacy">Privacy Policy</Link>.
                    </p>
                    <button type="submit" className="btn btn-primary">
                      Send message
                      <ArrowRight strokeWidth={2.2} />
                    </button>
                  </div>
                </form>
              )}
            </div>

            <aside className="form-aside">
              <h3>Reach us directly</h3>
              <div className="contact-details">
                <a href="mailto:hello@orvnlabs.com" className="contact-line">
                  <Mail size={16} strokeWidth={1.9} />
                  <span>
                    <span className="contact-line-label">Email</span>
                    hello@orvnlabs.com
                  </span>
                </a>
                <div className="contact-line">
                  <Building2 size={16} strokeWidth={1.9} />
                  <span>
                    <span className="contact-line-label">Company</span>
                    ORVN Labs, makers of LAREI
                  </span>
                </div>
              </div>

              <ul className="form-aside-list">
                {['A person replies within a working day', 'No sales sequence', 'Your message stays private'].map((t) => (
                  <li key={t}><Check size={12} strokeWidth={3} />{t}</li>
                ))}
              </ul>

              <div className="form-aside-contact">
                <p>Looking for access?</p>
                <Link href="/early-access" className="arrow-link">
                  Request beta access
                  <ArrowRight size={15} strokeWidth={2.2} />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
