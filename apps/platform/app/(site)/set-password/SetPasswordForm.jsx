'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PageWrapper from '../../../src/components/PageWrapper';
import Logo from '../../../src/components/site/Logo';
import { setPassword } from './actions';

export default function SetPasswordForm() {
  const [state, submit, pending] = useActionState(setPassword, { status: 'idle' });
  const [password, setPasswordValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const tooShort = password.length > 0 && password.length < 10;
  const mismatch = confirm.length > 0 && confirm !== password;

  return (
    <PageWrapper>
      <section className="signin-page">
        <div className="shell">
          <div className="signin-card">
            <div className="signin-main">
              <Logo />
              <span className="eyebrow" style={{ marginTop: 24 }}>Account</span>
              <h1 className="signin-title">Set a password.</h1>
              <p className="lead">
                You can keep using email links. A password lets you sign in without waiting for an email.
                Ten characters or more.
              </p>

              {state.status === 'ok' ? (
                <div className="signin-form">
                  <p role="status">{state.message}</p>
                  <Link className="btn btn-primary btn-block" href="/dashboard">
                    Continue to your workspace <ArrowRight strokeWidth={2.2} />
                  </Link>
                </div>
              ) : (
                <form className="signin-form" action={submit}>
                  <div className="field">
                    <label className="field-label" htmlFor="sp-pass">New password</label>
                    <input
                      id="sp-pass"
                      name="password"
                      type="password"
                      required
                      minLength={10}
                      autoComplete="new-password"
                      className="input"
                      value={password}
                      onChange={(event) => setPasswordValue(event.target.value)}
                    />
                    {tooShort ? <span className="field-error">At least 10 characters.</span> : null}
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="sp-confirm">Confirm password</label>
                    <input
                      id="sp-confirm"
                      name="confirm"
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
                  {state.status === 'error' ? (
                    <p className="field-error" role="alert">{state.message}</p>
                  ) : null}
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={pending || tooShort || mismatch || password.length < 10}
                  >
                    {pending ? 'Saving…' : 'Save password'}
                    <ArrowRight strokeWidth={2.2} />
                  </button>
                </form>
              )}

              <div className="signin-switch">
                <Link href="/dashboard">Back to your workspace</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
