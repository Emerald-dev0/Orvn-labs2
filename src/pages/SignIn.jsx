import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';
import Logo from '../components/site/Logo';

export default function SignIn() {
  useDocumentMeta({
    title: 'Sign in',
    description: 'Access your LAREI workspace, property records and published pages.',
    path: '/sign-in',
  });

  return (
    <PageWrapper>
      <section className="signin-page">
        <div className="shell">
          <div className="signin-card">
            <div className="signin-main">
              <Logo />
              <span className="eyebrow" style={{ marginTop: 24 }}>Sign in</span>
              <h1 className="signin-title">Welcome back.</h1>
              <p className="lead">
                Your records, drafts and published pages, exactly where you left them.
              </p>

              <form className="signin-form" onSubmit={(e) => e.preventDefault()}>
                <div className="field">
                  <label className="field-label" htmlFor="si-email">Email address</label>
                  <input id="si-email" type="email" className="input" placeholder="you@business.com" autoComplete="email" />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="si-pass">Password</label>
                  <input id="si-pass" type="password" className="input" placeholder="Your password" autoComplete="current-password" />
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Sign in
                  <ArrowRight strokeWidth={2.2} />
                </button>
              </form>

              <p className="signin-note">
                LAREI is invitation only during the beta. If you have not received an invitation,
                <Link to="/early-access"> request access</Link>.
              </p>

              <Link to="/" className="signin-back">
                <ArrowLeft size={15} strokeWidth={2} />
                Back to the site
              </Link>
            </div>

            <aside className="signin-visual">
              <img src="/images/interior-1.jpg" alt="" />
              <div className="signin-visual-body glass">
                <ShieldCheck size={18} strokeWidth={2} />
                <div>
                  <strong>One record, every output</strong>
                  <p>Pages, sheets and printouts stay in step with the facts you approved.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
