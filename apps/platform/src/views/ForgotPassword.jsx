'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import Logo from '../components/site/Logo';
import { authClient } from '../../lib/auth-client';

/**
 * Password reset request. The answer is the same whether or not the address exists, so the
 * form cannot be used to check who has an account.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  async function submit(event) {
    event.preventDefault();
    setStatus('pending');
    try {
      await authClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch {
      // Swallowed on purpose. The response must not differ for an unknown address.
    }
    setStatus('sent');
  }

  return (
    <PageWrapper>
      <section className="signin-page">
        <div className="shell">
          <div className="signin-card">
            <div className="signin-main">
              <Logo />
              <span className="eyebrow" style={{ marginTop: 24 }}>Account</span>
              <h1 className="signin-title">Reset your password.</h1>
              <p className="lead">
                We send a single-use link. It works for one hour and only for this request.
              </p>

              {status === 'sent' ? (
                <div className="signin-sent" role="status">
                  <Mail size={18} strokeWidth={2} />
                  <div>
                    <strong>Check your inbox</strong>
                    <p>
                      If {email || 'that address'} has an account here, a reset link is on its way.
                      If it does not arrive, sign in with a magic link instead.
                    </p>
                  </div>
                </div>
              ) : (
                <form className="signin-form" onSubmit={submit}>
                  <div className="field">
                    <label className="field-label" htmlFor="fp-email">Email address</label>
                    <input
                      id="fp-email"
                      type="email"
                      required
                      className="input"
                      placeholder="you@business.com"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={status === 'pending'}>
                    {status === 'pending' ? 'Sending…' : 'Send reset link'}
                    <ArrowRight strokeWidth={2.2} />
                  </button>
                </form>
              )}

              <div className="signin-switch">
                <Link href="/sign-in">Back to sign in</Link>
                <span aria-hidden="true">·</span>
                <Link href="/early-access">Request access</Link>
              </div>
            </div>

            <aside className="signin-aside">
              <h3>Why a link?</h3>
              <p>
                A reset link proves the address as well as changing the password. There is no
                security question to guess and nothing to remember.
              </p>
              <p>
                Changing a password signs out every other session on the account.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
