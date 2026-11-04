import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import Logo from './Logo';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { to: '/product', label: 'Product overview' },
      { to: '/how-it-works', label: 'How it works' },
      { to: '/who-its-for', label: "Who it's for" },
      { to: '/pas', label: 'PAS' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/blog', label: 'Journal' },
      { to: '/early-access', label: 'Early access' },
      { to: '/contact', label: 'Contact' },
      { to: '/sign-in', label: 'Sign in' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/legal/privacy', label: 'Privacy' },
      { to: '/legal/terms', label: 'Terms' },
      { to: '/legal/ai-disclosure', label: 'AI disclosure' },
      { to: '/legal/fair-housing', label: 'Fair housing' },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail('');
  };

  return (
    <footer className="site-footer on-dark">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo dark />
            <p className="footer-tagline">
              One verified property record, published everywhere it needs to be seen.
            </p>

            <form className="footer-form" onSubmit={submit}>
              {sent ? (
                <p className="footer-sent">
                  <Check size={16} strokeWidth={2.4} />
                  You are on the list. We will write when there is something worth reading.
                </p>
              ) : (
                <>
                  <label className="footer-form-label" htmlFor="footer-email">
                    Field notes, occasionally
                  </label>
                  <div className="footer-input-row">
                    <input
                      id="footer-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@brokerage.com"
                      className="footer-input"
                      required
                    />
                    <button type="submit" className="footer-submit" aria-label="Subscribe">
                      <ArrowRight size={18} strokeWidth={2.2} />
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          <div className="footer-cols">
            {COLUMNS.map((col) => (
              <div key={col.title} className="footer-col">
                <p className="footer-col-title">{col.title}</p>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="footer-link">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} LAREI · A product of ORVN Labs</p>
          <p className="footer-bottom-note">Built for property people, wherever they work.</p>
          <a href="mailto:hello@orvnlabs.com" className="footer-mail">
            hello@orvnlabs.com
          </a>
        </div>
      </div>

      <div className="footer-wordmark" aria-hidden="true">
        LAREI
      </div>
    </footer>
  );
}
