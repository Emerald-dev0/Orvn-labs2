'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import Logo from '../components/site/Logo';
import { authClient } from '../../lib/auth-client';

/**
 * D01: magic link only. One way in, and the form never says whether an address has an
 * account — an uninvited address gets exactly the same answer as an invited one.
 */
/**
 * Shown on every refusal path. It names the early-access list without confirming whether the
 * address is on it, so it is safe to show to someone who was never invited and to someone who was.
 */
function NotInvitedNotice() {
  return (
    <p className="signin-note" style={{ marginTop: 12 }}>
      Not on the early-access list yet?{' '}
      <Link href="/early-access">Request access</Link> and we will get back to you.
    </p>
  );
}

export default function SignIn({ next = '/dashboard', refused = false }) {
  const [email, setEmail] = useState('');
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

  return (
    <PageWrapper>
      <section className="signin-page">
        <div className="shell">
          <div className="signin-card">
            <div className="signin-main">
              <Logo />
              <span className="eyebrow" style={{ marginTop: 24 }}>
                Sign in
              </span>
              <h1 className="signin-title">Sign in to your ORREI workspace.</h1>
              <p className="lead">
                Only invited beta members can currently access ORREI. Enter your email to receive
                a secure sign-in link. Your private workspace is not publicly visible.
              </p>

              {refused && status !== 'sent' ? (
                <div className="field-error" role="alert" style={{ marginBottom: 16 }}>
                  <strong>This sign-in link can&apos;t be used.</strong>{' '}
                  Access is by invitation during early access. You can ask for a new link below, or request access.
                  <NotInvitedNotice />
                </div>
              ) : null}

              {status === 'sent' ? (
                <div className="signin-sent" role="status">
                  <Mail size={18} strokeWidth={2} />
                  <div>
                    <strong>Check your inbox</strong>
                    <p>
                      If {email || 'that address'} has beta access, a sign-in link is on its way.
                      It works once and expires in fifteen minutes.
                    </p>
                    <NotInvitedNotice />
                  </div>
                </div>
              ) : (
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
                  {message ? <p className="field-error" role="alert">{message}</p> : null}
                </form>
              )}

              <p className="signin-note">
                Access is by invitation during early access, and there is no password to
                remember — the link is the key. If you are not on the list,{' '}
                <Link href="/early-access">request access</Link>.
              </p>
            </div>

            <aside className="signin-aside">
              <ShieldCheck size={20} strokeWidth={2} />
              <h3>What happens when you sign in</h3>
              <p>
                The link in your inbox works once, within fifteen minutes. Nothing in your
                workspace is public until you publish it, and unpublishing removes the page and
                its files.
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
