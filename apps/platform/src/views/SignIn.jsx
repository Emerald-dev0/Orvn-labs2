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
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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

  /**
   * Account creation for an operator or invitee, who chooses their own password.
   *
   * Deliberately not a shared default: a known starting password on a public sign-in page is the
   * single most abused door in an admin panel, and "change it later" is a promise people break.
   * The beta gate still decides who may create one — everybody else is refused.
   */
  async function createAccount(event) {
    event.preventDefault();
    setMessage('');

    if (password.length < 10) {
      setStatus('error');
      setMessage('Use at least 10 characters. Three or four words is easier to remember than a puzzle.');
      return;
    }
    if (password !== confirm) {
      setStatus('error');
      setMessage('Those two passwords are not the same.');
      return;
    }

    setStatus('pending');
    try {
      const result = await authClient.signUp.email({ email, password, name: name || email });
      if (result?.error) throw new Error(result.error.message ?? 'rejected');
      window.location.assign(next);
    } catch (error) {
      const detail = String(error?.message ?? '');
      setStatus('error');
      setMessage(
        /exist/i.test(detail)
          ? 'An account already uses that address. Sign in with your password instead.'
          : /invit|forbidden|beta/i.test(detail)
            ? 'That address is not on the beta list yet. Request access and we will add it.'
            : 'We could not create the account just now. Try again, or use a sign-in link.',
      );
    }
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
              <span className="eyebrow" style={{ marginTop: 24 }}>
                {mode === 'create' ? 'Create account' : 'Sign in'}
              </span>
              <h1 className="signin-title">
                {mode === 'create' ? 'Set your password.' : 'Welcome back.'}
              </h1>
              <p className="lead">
                {mode === 'create'
                  ? 'For operators and invited testers. If your address is on the list, this creates your account.'
                  : 'Your records, drafts and published pages, exactly where you left them.'}
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
              ) : mode === 'create' ? (
                <form className="signin-form" onSubmit={createAccount}>
                  <div className="field">
                    <label className="field-label" htmlFor="si-name">Your name</label>
                    <input
                      id="si-name"
                      type="text"
                      className="input"
                      placeholder="Daniel"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="si-email-c">Email address</label>
                    <input
                      id="si-email-c"
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
                    <label className="field-label" htmlFor="si-pass-c">Password</label>
                    <input
                      id="si-pass-c"
                      type="password"
                      required
                      minLength={10}
                      className="input"
                      placeholder="At least 10 characters"
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="si-pass-c2">Repeat it</label>
                    <input
                      id="si-pass-c2"
                      type="password"
                      required
                      minLength={10}
                      className="input"
                      placeholder="The same, once more"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(event) => setConfirm(event.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={status === 'pending'}>
                    {status === 'pending' ? 'Creating…' : 'Create my account'}
                    <ArrowRight strokeWidth={2.2} />
                  </button>
                  {message ? <p className="field-error" role="alert">{message}</p> : null}
                </form>
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
                {mode === 'create' ? (
                  <button type="button" onClick={() => { setMode('password'); setStatus('idle'); setMessage(''); }}>
                    I already have a password
                  </button>
                ) : (
                  <button type="button" onClick={() => { setMode('link'); setStatus('idle'); setMessage(''); }}>
                    Email me a link instead
                  </button>
                )}
                {mode !== 'create' ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <button type="button" onClick={() => { setMode('create'); setStatus('idle'); setMessage(''); }}>
                      Create your password
                    </button>
                  </>
                ) : null}
                <span aria-hidden="true">·</span>
                <Link href="/forgot-password">Forgot password</Link>
              </div>

              <p className="signin-note">
                Access is by invitation during early access, and every operator creates their own
                password — there is no shared one. If you are not on the list,{' '}
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
