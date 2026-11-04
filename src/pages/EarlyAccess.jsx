import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowUpRight } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';
import { Reveal } from '../components/site/Reveal';

const ROLES = ['Wholesaler', 'Agent', 'Investor', 'Acquisitions / dispositions', 'Other'];
const VOLUMES = ['0–2', '3–10', '11–30', '31+', 'Prefer not to say'];

export default function EarlyAccess() {
  useDocumentMeta({
    title: 'Request early access',
    description: 'Help shape a better way to present real-estate deals. LAREI is onboarding in small cohorts.',
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
      <section className="page-hero">
        <div className="shell">
          <div className="page-hero-grid">
            <div>
              <span className="eyebrow">LAREI · Early access</span>
              <h1 className="page-title">
                Help shape a better way to present <span className="em">property.</span>
              </h1>
            </div>
            <div>
              <p className="page-lede">
                Four minutes, six questions. We read every request and invite people in small
                cohorts so the workflow can be corrected while it is still cheap to correct.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 'clamp(56px,7vw,104px)' }}>
        <div className="shell">
          <div className="form-shell">
            <aside className="form-aside">
              <div className="side-note">
                <span className="label-mono-primary">What happens next</span>
                <p>
                  A person reviews your request. If there is a suitable opening, you receive an
                  email with a workspace invitation.
                </p>
                <p>
                  A request is not a guaranteed invitation, and nothing is charged during the beta.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  {['Reviewed individually', 'Invitations in cohorts', 'No payment during beta'].map((t) => (
                    <span key={t} className="label-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Check size={11} strokeWidth={2.4} color="var(--ember)" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                <span className="label-mono">Prefer email?</span>
                <a href="mailto:hello@orvnlabs.com" className="arrow-link" style={{ marginTop: 10 }}>
                  hello@orvnlabs.com
                  <ArrowUpRight size={14} strokeWidth={1.6} />
                </a>
              </div>
            </aside>

            <div>
              {status === 'success' ? (
                <Reveal className="form-success">
                  <span className="pill tag-ember">Received</span>
                  <h2 className="h-display-2" style={{ maxWidth: '18ch' }}>
                    Thank you. Your request is <span className="em">in review.</span>
                  </h2>
                  <p className="lead" style={{ fontSize: 15 }}>
                    We review the information you submitted. If there is a suitable beta opening, we
                    will contact you by email. No newsletter, no sequence.
                  </p>
                  <Link to="/" className="btn-secondary" style={{ marginTop: 10 }}>
                    Back to the site
                  </Link>
                </Reveal>
              ) : (
                <form onSubmit={onSubmit} className="form-grid">
                  <div className="field">
                    <label className="field-label" htmlFor="name">
                      Full name *
                    </label>
                    <input id="name" required className="input" placeholder="Ada Okonkwo" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="email">
                      Work email *
                    </label>
                    <input id="email" required type="email" className="input" placeholder="you@business.com" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="company">
                      Company / business
                    </label>
                    <input id="company" className="input" placeholder="Optional" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="role">
                      Your role *
                    </label>
                    <select id="role" required className="select" defaultValue="">
                      <option value="" disabled>
                        Select a role
                      </option>
                      {ROLES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="markets">
                      Primary market(s) *
                    </label>
                    <input id="markets" required className="input" placeholder="Lagos · Abuja" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="volume">
                      Opportunities presented monthly
                    </label>
                    <select id="volume" className="select" defaultValue="">
                      <option value="" disabled>
                        Select a range
                      </option>
                      {VOLUMES.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field span-2">
                    <label className="field-label" htmlFor="current">
                      How do you currently share properties? *
                    </label>
                    <textarea id="current" required className="textarea" rows={3} placeholder="Links, PDFs, WhatsApp, a website, a deck…" />
                  </div>
                  <div className="field span-2">
                    <label className="field-label" htmlFor="frustration">
                      What is the most frustrating part of that process? *
                    </label>
                    <textarea id="frustration" required className="textarea" rows={3} placeholder="Be specific — this is the part we are building against." />
                  </div>
                  <div className="field span-2">
                    <label className="field-label" htmlFor="site">
                      Website / professional profile
                    </label>
                    <input id="site" className="input" placeholder="Optional" />
                  </div>

                  <div className="span-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginTop: 6 }}>
                    <p style={{ fontSize: 12, color: 'var(--ink-dim)', maxWidth: '46ch', lineHeight: 1.5 }}>
                      By sending this request you agree that ORVN Labs may contact you about LAREI
                      early access and evaluate your request. See our{' '}
                      <Link to="/legal/privacy" style={{ color: 'var(--ember-ink)', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                        Privacy Policy
                      </Link>
                      .
                    </p>
                    <button type="submit" className="btn-primary" disabled={status === 'sending'}>
                      {status === 'sending' ? 'Sending…' : 'Request early access'}
                      <ArrowUpRight size={15} strokeWidth={1.6} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
