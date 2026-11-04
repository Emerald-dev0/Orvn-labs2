import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Mail } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import PageHero from '../components/site/PageHero';
import { Reveal } from '../components/site/Reveal';
import { useDocumentMeta } from '../lib/seo';

const ROLES = ['Agent or broker', 'Developer', 'Small agency', 'Property manager', 'Other'];
const VOLUMES = ['0–2', '3–10', '11–30', '31+', 'Prefer not to say'];

export default function EarlyAccess() {
  useDocumentMeta({
    title: 'Request beta access',
    description:
      'LAREI is onboarding in small cohorts. Tell us what you publish today and a person will read your request.',
    path: '/early-access',
  });

  const [status, setStatus] = useState('idle');

  const onSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('success'), 700);
  };

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
              {status === 'success' ? (
                <Reveal className="form-success-block">
                  <span className="form-success-icon"><Check size={20} strokeWidth={2.6} /></span>
                  <h2>Your request is in review.</h2>
                  <p>
                    A person reads it, and if there is a suitable place in the next cohort you will
                    get an email with a workspace invitation. No newsletter and no follow-up sequence.
                  </p>
                  <Link to="/" className="btn btn-primary">
                    Back to the site
                    <ArrowRight strokeWidth={2.2} />
                  </Link>
                </Reveal>
              ) : (
                <form onSubmit={onSubmit} className="form-grid">
                  <div className="field">
                    <label className="field-label" htmlFor="name">Full name</label>
                    <input id="name" required className="input" placeholder="Ada Okonkwo" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="email">Work email</label>
                    <input id="email" required type="email" className="input" placeholder="you@business.com" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="company">Company or business</label>
                    <input id="company" className="input" placeholder="Optional" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="role">Your role</label>
                    <select id="role" required className="select" defaultValue="">
                      <option value="" disabled>Select a role</option>
                      {ROLES.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="markets">Primary market</label>
                    <input id="markets" required className="input" placeholder="Lagos, Abuja" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="volume">Properties presented monthly</label>
                    <select id="volume" className="select" defaultValue="">
                      <option value="" disabled>Select a range</option>
                      {VOLUMES.map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="field span-2">
                    <label className="field-label" htmlFor="current">How do you share properties today?</label>
                    <textarea id="current" required className="textarea" rows={3} placeholder="Links, PDFs, WhatsApp, a website, a deck." />
                  </div>
                  <div className="field span-2">
                    <label className="field-label" htmlFor="frustration">What is the most frustrating part of that?</label>
                    <textarea id="frustration" required className="textarea" rows={3} placeholder="Be specific. This is the part we are building against." />
                  </div>
                  <div className="field span-2">
                    <label className="field-label" htmlFor="site">Website or professional profile</label>
                    <input id="site" className="input" placeholder="Optional" />
                  </div>

                  <div className="form-foot span-2">
                    <p className="form-legal">
                      By sending this you agree that ORVN Labs may contact you about LAREI early
                      access. See our <Link to="/legal/privacy">Privacy Policy</Link>.
                    </p>
                    <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                      {status === 'sending' ? 'Sending' : 'Request access'}
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
                {['Reviewed individually', 'Invitations in small cohorts', 'No payment during beta'].map((t) => (
                  <li key={t}><Check size={12} strokeWidth={3} />{t}</li>
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
