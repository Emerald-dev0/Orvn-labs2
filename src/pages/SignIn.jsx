import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';
import { Mark } from '../components/site/Logo';

export default function SignIn() {
  useDocumentMeta({
    title: 'Sign in to LAREI',
    description: 'Access your workspace, public site drafts and property records.',
    path: '/sign-in',
  });

  return (
    <PageWrapper>
      <section className="page-hero" style={{ paddingBottom: 'clamp(48px,6vw,88px)' }}>
        <div className="shell">
          <div className="signin-shell">
            <div className="signin-form">
              <Mark size={26} />
              <span className="eyebrow" style={{ marginTop: 22 }}>
                LAREI · Sign in
              </span>
              <h1 className="h-display" style={{ fontSize: 'clamp(32px,4.4vw,52px)', marginTop: 14 }}>
                Welcome back.
              </h1>
              <p className="lead" style={{ fontSize: 15, marginTop: 12 }}>
                Access your workspace, public profile drafts and property records.
              </p>

              <form style={{ display: 'grid', gap: 20, marginTop: 30 }} onSubmit={(e) => e.preventDefault()}>
                <div className="field">
                  <label className="field-label" htmlFor="si-email">
                    Email address
                  </label>
                  <input id="si-email" type="email" className="input" placeholder="you@business.com" autoComplete="email" />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="si-pass">
                    Password
                  </label>
                  <input id="si-pass" type="password" className="input" placeholder="••••••••" autoComplete="current-password" />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: 6 }}>
                  Sign in
                  <ArrowUpRight size={15} strokeWidth={1.6} />
                </button>
              </form>

              <p className="label-mono" style={{ marginTop: 24 }}>
                LAREI is available by invitation during the beta.
              </p>
            </div>

            <aside className="signin-aside">
              <span className="label-mono">No workspace yet?</span>
              <h2 className="h-display-2" style={{ marginTop: 14, maxWidth: '16ch' }}>
                Apply for the <span className="em">private beta.</span>
              </h2>
              <p className="lead" style={{ fontSize: 14.5, marginTop: 14 }}>
                We onboard in small cohorts so the workflow can be corrected while it is still cheap
                to correct.
              </p>
              <Link to="/early-access" className="btn-secondary" style={{ marginTop: 22, justifySelf: 'start' }}>
                Request early access
              </Link>
              <Link to="/" className="arrow-link" style={{ marginTop: 26 }}>
                <ArrowLeft size={14} strokeWidth={1.6} />
                Back to the site
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
