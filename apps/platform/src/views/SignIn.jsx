'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import Logo from '../components/site/Logo';
import { authClient } from '../../lib/auth-client';

/**
 * Two ways in, one rule: the form never says whether an address has an account.
 * A magic link that finds no invitation is answered exactly like one that does.
 */
export default function SignIn({ next = '/dashboard' }) {
  const [mode, setMode] = useState('link');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function sendLink(event) {
    event.preventDefault();
    setStatus('pending');
    setMessage('');
    try {
      await authClient.signIn.magicLink({ email, callbackURL: next });
    } catch {
      // Deliberately swallowed: the answer must not differ for an uninvited address.
    }
    setStatus('sent');
  }

  async function signInWithPassword(event) {
    event.preventDefault();
    setStatus('pending');
    setMessage('');
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result?.error) throw new Error('rejected');
      window.location.assign(next);
    } catch {
      setStatus('error');
      setMessage('That email and password do not match an account.');
    }
  }

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

              {status === 'sent' ? (
                <div className="signin-sent" role="status">
                  <Mail size={18} strokeWidth={2} />
                  <div>
                    <strong>Check your inbox</strong>
                    <p>
                      If {email || 'that address'} has beta access, a sign-in link is on its way.
                      It works once and expires in ten minutes.
                    </p>
                  </div>
                </div>
              ) : mode === 'link' ? (
                <form className="signin-form" onSubmit={sendLink}>
                  <div className="field">
                    <label className="field-label" htmlFor="si-email">Email address</label>
                    <input
                      id="si-email"
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
                    {status === 'pending' ? 'Sending…' : 'Email me a sign-in link'}
                    <ArrowRight strokeWidth={2.2} />
                  </button>
                </form>
              ) : (
                <form className="signin-form" onSubmit={signInWithPassword}>
                  <div className="field">
                    <label className="field-label" htmlFor="si-email-p">Email address</label>
                    <input
                      id="si-email-p"
                      type="email"
                      required
                      className="input"
                      placeholder="you@business.com"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="si-pass">Password</label>
                    <input
                      id="si-pass"
                      type="password"
                      required
                      className="input"
                      placeholder="Your password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={status === 'pending'}>
                    {status === 'pending' ? 'Checking…' : 'Sign in'}
                    <ArrowRight strokeWidth={2.2} />
                  </button>
                  {message ? <p className="field-error" role="alert">{message}</p> : null}
                </form>
              )}

              <div className="signin-switch">
                {mode === 'link' ? (
                  <button type="button" onClick={() => { setMode('password'); setStatus('idle'); }}>
                    Use a password instead
                  </button>
                ) : (
                  <button type="button" onClick={() => { setMode('link'); setStatus('idle'); }}>
                    Email me a link instead
                  </button>
                )}
                <span aria-hidden="true">·</span>
                <Link href="/forgot-password">Forgot password</Link>
              </div>

              <p className="signin-note">
                Access is by invitation during the private beta. If you have not received one,{' '}
                <Link href="/early-access">request access</Link>.
              </p>
            </div>

            <aside className="signin-aside">
              <ShieldCheck size={20} strokeWidth={2} />
              <h3>What happens when you sign in</h3>
              <p>
                A session is created on this device only. Nothing in your workspace is public
                until you publish it, and unpublishing removes the page and its files.
              </p>
              <p>
                We do not tell anyone whether an address has an account here. If a link does not
                arrive, the address is not on the beta list yet.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
