"use client";

import React, { useActionState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Check, Mail } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import PageHero from '../components/site/PageHero';
import { Reveal } from '../components/site/Reveal';
import SelectField from '../components/SelectField';
import { useDocumentMeta } from '../lib/seo';
import { sendContactMessage } from '../../app/(site)/contact/actions';

const TOPICS = [
  'Beta access',
  'A property I want to publish',
  'Teams and agencies',
  'Something else',
];

/** The message must reach someone; see app/(site)/contact/actions.ts. */

export default function Contact() {
  useDocumentMeta({
    title: 'Contact',
    description:
      'Questions about ORREI, early access or a property you want to publish. A person reads every message.',
    path: '/contact',
  });

  const [state, formAction, pending] = useActionState(sendContactMessage, { status: 'idle' });

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Contact"
        title={<>Talk to a person.</>}
        lede="Questions about ORREI, early access, or a property you are trying to present. Tell us what you are working on and we will answer in plain language."
      />

      <section className="form-page">
        <div className="shell">
          <div className="form-shell">
            <div>
              {state.status === 'sent' ? (
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
                <form action={formAction} className="form-grid">
                  <div className="field">
                    <label className="field-label" htmlFor="c-name">Your name</label>
                    <input id="c-name" name="name" required minLength={2} maxLength={120} className="input" placeholder="Ada Okonkwo" autoComplete="name" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="c-email">Email</label>
                    <input id="c-email" name="email" required type="email" maxLength={254} className="input" placeholder="you@business.com" autoComplete="email" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="c-company">Company</label>
                    <input id="c-company" name="company" maxLength={160} className="input" placeholder="Optional" autoComplete="organization" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="c-topic">What is this about?</label>
                    <SelectField id="c-topic" name="topic" options={TOPICS} placeholder="Select a topic" />
                  </div>
                  <div className="field span-2">
                    <label className="field-label" htmlFor="c-message">Message</label>
                    <textarea id="c-message" name="message" required minLength={10} maxLength={4000} className="textarea" rows={6} placeholder="What are you trying to publish, and what is getting in the way?" />
                  </div>

                  <div className="form-foot span-2">
                    <p className="form-legal">
                      We use your message to answer it. Nothing else. See the{' '}
                      <Link href="/legal/privacy">Privacy Policy</Link>.
                    </p>
                    <button type="submit" className="btn btn-primary" disabled={pending}>
                      {pending ? 'Sending…' : 'Send message'}
                      <ArrowRight strokeWidth={2.2} />
                    </button>
                  </div>

                  {/* Honeypot: a real person never fills this in. */}
                  <div className="field span-2" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
                    <label htmlFor="c-company-url">Company URL</label>
                    <input id="c-company-url" name="company_url_confirm" type="text" tabIndex={-1} autoComplete="off" />
                  </div>

                  {state.status === 'error' ? (
                    <p className="field-error span-2" role="alert">{state.message}</p>
                  ) : null}
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
                    ORVN Labs
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
