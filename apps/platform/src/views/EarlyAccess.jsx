'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Mail } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import PageHero from '../components/site/PageHero';
import { Reveal } from '../components/site/Reveal';
import { requestEarlyAccess } from '../../app/(site)/early-access/actions';

const ROLES = ['Agent or broker', 'Developer', 'Small agency', 'Property manager', 'Other'];
const VOLUMES = ['0–2', '3–10', '11–30', '31+', 'Prefer not to say'];

export default function EarlyAccess() {
  const [state, formAction, pending] = useActionState(requestEarlyAccess, { status: 'idle' });

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Early access"
        title={<>Ask for a place in the beta.</>}
        lede="Five minutes, a few questions. We read every request and invite people in small groups so the workflow can still be changed by the people using it."
      />

      <section className="form-page">
        <div className="shell">
          <div className="form-shell">
            <div>
              {state.status === 'sent' ? (
                <Reveal className="form-success-block">
                  <span className="form-success-icon"><Check size={20} strokeWidth={2.6} /></span>
                  <h2>Your request is in review.</h2>
                  <p>
                    A person reads it. If there is a suitable place in the next cohort, you will get
                    an email with a workspace invitation. No newsletter and no follow-up sequence.
                  </p>
                  <Link href="/" className="btn btn-primary">
                    Back to the site
                    <ArrowRight strokeWidth={2.2} />
                  </Link>
                </Reveal>
              ) : (
                <form action={formAction} className="form-grid">
                  <div className="field">
                    <label className="field-label" htmlFor="name">Full name</label>
                    <input id="name" name="name" required minLength={2} maxLength={120} className="input" placeholder="Ada Okonkwo" autoComplete="name" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="email">Work email</label>
                    <input id="email" name="email" required type="email" maxLength={254} className="input" placeholder="you@business.com" autoComplete="email" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="company">Company or business</label>
                    <input id="company" name="company" maxLength={160} className="input" placeholder="Optional" autoComplete="organization" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="role">Your role</label>
                    <select id="role" name="role" required className="select" defaultValue="">
                      <option value="" disabled>Select a role</option>
                      {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="markets">Primary market</label>
                    <input id="markets" name="markets" required maxLength={200} className="input" placeholder="City or region" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="volume">Properties presented monthly</label>
                    <select id="volume" name="volume" className="select" defaultValue="">
                      <option value="" disabled>Select a range</option>
                      {VOLUMES.map((volume) => <option key={volume} value={volume}>{volume}</option>)}
                    </select>
                  </div>
                  <div className="field span-2">
                    <label className="field-label" htmlFor="current">How do you share properties today?</label>
                    <textarea id="current" name="current" required maxLength={1000} className="textarea" rows={3} placeholder="Links, PDFs, WhatsApp, a website, a deck." />
                  </div>
                  <div className="field span-2">
                    <label className="field-label" htmlFor="frustration">What is the most frustrating part of that?</label>
                    <textarea id="frustration" name="frustration" required maxLength={1000} className="textarea" rows={3} placeholder="Be specific. This is the part we are building against." />
                  </div>
                  <div className="field span-2">
                    <label className="field-label" htmlFor="site">Website or professional profile</label>
                    <input id="site" name="site" maxLength={200} className="input" placeholder="Optional" />
                  </div>

                  {/* Honeypot: a real person never fills this in. */}
                  <div className="field span-2" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
                    <label htmlFor="company_url_confirm">Company URL</label>
                    <input id="company_url_confirm" name="company_url_confirm" type="text" tabIndex={-1} autoComplete="off" />
                  </div>

                  {state.status === 'error' ? (
                    <p className="form-error span-2" role="alert">{state.message}</p>
                  ) : null}

                  <div className="form-foot span-2">
                    <label className="form-legal" htmlFor="consent" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <input id="consent" name="consent" type="checkbox" required style={{ marginTop: 3 }} />
                      <span>
                        I agree that ORVN Labs may contact me about LAREI early access. See our{' '}
                        <Link href="/legal/privacy">Privacy Policy</Link>. Nothing else is done with
                        these details.
                      </span>
                    </label>
                    <button type="submit" className="btn btn-primary" disabled={pending}>
                      {pending ? 'Sending' : 'Request access'}
                      <ArrowRight strokeWidth={2.2} />
                    </button>
                  </div>
                </form>
              )}
            </div>

            <aside className="form-aside">
              <h3>What happens next</h3>
              <p>
                A person reads your request. If there is a suitable place in the next cohort, you
                receive an email with a workspace invitation.
              </p>
              <p>A request is not a guaranteed invitation, and nothing is charged during the beta.</p>

              <ul className="form-aside-list">
                {['Reviewed individually', 'Invitations in small cohorts', 'No payment during beta'].map((item) => (
                  <li key={item}><Check size={12} strokeWidth={3} />{item}</li>
                ))}
              </ul>

              <div className="form-aside-contact">
                <p>Prefer email?</p>
                <a href="mailto:hello@orvnlabs.com" className="arrow-link">
                  <Mail size={15} strokeWidth={2} />
                  hello@orvnlabs.com
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
