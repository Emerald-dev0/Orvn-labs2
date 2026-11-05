'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import Logo from '../components/site/Logo';
import { authClient } from '../../lib/auth-client';

export default function ResetPassword({ token = '' }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const tooShort = password.length > 0 && password.length < 10;
  const mismatch = confirm.length > 0 && confirm !== password;

  if (!token) {
    return (
      <PageWrapper>
        <section className="signin-page">
          <div className="shell">
            <div className="signin-card">
              <div className="signin-main">
                <Logo />
                <h1 className="signin-title" style={{ marginTop: 24 }}>That link is incomplete.</h1>
                <p className="lead">
                  Reset links work once and expire after an hour. Request a fresh one and open it
                  from the same device.
                </p>
                <div className="signin-switch">
                  <Link href="/forgot-password">Request a new link</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </PageWrapper>
    );
  }

  if (status === 'done') {
    return (
      <PageWrapper>
        <section className="signin-page">
          <div className="shell">
            <div className="signin-card">
              <div className="signin-main">
                <Logo />
                <h1 className="signin-title" style={{ marginTop: 24 }}>Password changed.</h1>
                <p className="lead">
                  Every other session has been signed out. Sign in with the new password.
                </p>
                <Link className="btn btn-primary" href="/sign-in">
                  Sign in <ArrowRight strokeWidth={2.2} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </PageWrapper>
    );
  }

  async function submit(event) {
    event.preventDefault();
    if (password !== confirm) {
      setMessage('The two passwords do not match.');
      return;
    }

    setStatus('pending');
    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result?.error) throw new Error('rejected');
      setStatus('done');
    } catch {
      setStatus('error');
      setMessage('That link has expired or already been used. Request a new one.');
    }
  }

  return (
    <PageWrapper>
      <section className="signin-page">
        <div className="shell">
          <div className="signin-card">
            <div className="signin-main">
              <Logo />
              <span className="eyebrow" style={{ marginTop: 24 }}>Account</span>
              <h1 className="signin-title">Choose a new password.</h1>
              <p className="lead">Ten characters or more. A phrase beats a complicated word.</p>

              <form className="signin-form" onSubmit={submit}>
                <div className="field">
                  <label className="field-label" htmlFor="rp-pass">New password</label>
                  <input
                    id="rp-pass"
                    type="password"
                    required
                    minLength={10}
                    autoComplete="new-password"
                    className="input"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  {tooShort ? <span className="field-error">At least 10 characters.</span> : null}
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="rp-confirm">Confirm password</label>
                  <input
                    id="rp-confirm"
                    type="password"
                    required
                    minLength={10}
                    autoComplete="new-password"
                    className="input"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                  />
                  {mismatch ? <span className="field-error">The two do not match.</span> : null}
                </div>
                {status === 'error' ? <p className="field-error" role="alert">{message}</p> : null}
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={status === 'pending' || tooShort || mismatch || password.length < 10}
                >
                  {status === 'pending' ? 'Saving…' : 'Set new password'}
                  <ArrowRight strokeWidth={2.2} />
                </button>
              </form>

              <div className="signin-switch">
                <Link href="/forgot-password">Request a new link</Link>
                <span aria-hidden="true">·</span>
                <Link href="/sign-in">Back to sign in</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
