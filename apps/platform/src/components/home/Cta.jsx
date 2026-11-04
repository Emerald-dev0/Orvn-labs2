"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export default function Cta() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail('');
  };

  return (
    <section className="cta-home">
      <div className="shell">
        <div className="cta-frame">
          <img src="/images/interior-1.jpg" alt="" className="cta-photo" loading="lazy" />
          <div className="cta-scrim" aria-hidden="true" />

          <div className="cta-card glass">
            <h2 className="cta-title">Make every property presentation reflect the business behind it.</h2>
            <p className="cta-body">
              We&rsquo;re inviting a small set of real-estate operators to help test the first release
              of LAREI.
            </p>

            {sent ? (
              <p className="cta-sent">
                <Check size={17} strokeWidth={2.6} />
                Your request has been received. We will review it and reply by email.
              </p>
            ) : (
              <form className="cta-form" onSubmit={submit}>
                <input
                  type="email"
                  className="cta-input"
                  placeholder="Your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Your work email"
                  required
                />
                <button type="submit" className="btn btn-lime cta-submit">
                  Request early access
                  <ArrowRight strokeWidth={2.2} />
                </button>
              </form>
            )}

            <p className="cta-note">
              Already invited? <Link href="/sign-in">Sign in</Link>. Applications are reviewed
              individually.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
