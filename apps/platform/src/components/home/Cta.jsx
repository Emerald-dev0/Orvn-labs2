"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Mail } from 'lucide-react';

/**
 * The closing call to action.
 *
 * This used to be a form that accepted an address and printed a success message without sending
 * anything anywhere. It is now a link to the real application, which validates, stores, emails the
 * team and states what happens next.
 */
export default function Cta() {
  return (
    <section className="cta-home">
      <div className="shell">
        <div className="cta-frame">
          <img src="/images/interior-1.jpg" alt="" className="cta-photo" loading="lazy" />
          <div className="cta-scrim" aria-hidden="true" />

          <div className="cta-card glass">
            <h2 className="cta-title">
              One property record. The presentation, the page and the share link come from it.
            </h2>
            <p className="cta-body">
              We are inviting a small number of operators to work through the first release with
              us. Tell us what you present today and we will answer by email.
            </p>

            <div className="cta-actions">
              <Link href="/early-access" className="btn btn-lime cta-submit">
                Request early access
                <ArrowRight strokeWidth={2.2} />
              </Link>
              <a href="mailto:hello@orvnlabs.com" className="cta-mail">
                <Mail size={15} strokeWidth={2} />
                hello@orvnlabs.com
              </a>
            </div>

            <ul className="cta-points">
              {[
                'Read by a person, not an autoresponder',
                'No card, nothing charged during early access',
                'Nothing published without you approving it',
              ].map((point) => (
                <li key={point}>
                  <Check size={12} strokeWidth={3} />
                  {point}
                </li>
              ))}
            </ul>

            <p className="cta-note">
              Already invited? <Link href="/sign-in">Sign in</Link>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
