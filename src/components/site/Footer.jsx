import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { Mark } from './Logo';

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Product', to: '/product' },
      { label: 'How it works', to: '/how-it-works' },
      { label: 'Who it’s for', to: '/who-its-for' },
      { label: 'First-contact AI', to: '/pas' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Journal', to: '/blog' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact', to: '/contact' },
      { label: 'Early access', to: '/early-access' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '/legal/privacy' },
      { label: 'Terms', to: '/legal/terms' },
      { label: 'AI disclosure', to: '/legal/ai-disclosure' },
      { label: 'Fair housing', to: '/legal/fair-housing' },
    ],
  },
];

function Clock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Africa/Lagos',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date())
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="footer-meta-mono">{time} WAT</span>;
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="shell">
        {/* Top: newsletter + statement */}
        <div className="footer-top">
          <div style={{ maxWidth: 460 }}>
            <span className="footer-eyebrow">Field notes</span>
            <h2 className="footer-h">
              Understand the record
              <br />
              <span className="em" style={{ color: 'var(--ember-bright)' }}>behind the page.</span>
            </h2>
            <p className="footer-sub">
              Occasional notes on property presentation, verified facts and publishing with control. No noise.
            </p>
            <form
              className="footer-form"
              action="https://formspree.io/f/placeholder"
              method="POST"
              onSubmit={(e) => e.preventDefault()}
            >
              <input type="email" name="email" placeholder="Your email address" aria-label="Email address" required />
              <button type="submit" aria-label="Subscribe">
                <ArrowUp size={16} strokeWidth={1.5} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </form>
          </div>

          <div className="footer-columns">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <span className="footer-col-title">{col.title}</span>
                <ul className="footer-list">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Wordmark */}
        <div className="footer-wordmark-wrap" aria-hidden="true">
          <div className="footer-wordmark">LAREI</div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mark size={16} color="rgba(239,234,225,0.75)" accent="var(--ember-bright)" />
            <span className="footer-meta-mono">© {year} ORVN Labs</span>
          </div>
          <span className="footer-meta-mono hide-mobile">Built in Lagos · Operating worldwide</span>
          <Clock />
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="footer-top-link"
          >
            Back to top
            <ArrowUp size={13} strokeWidth={1.6} />
          </a>
        </div>
      </div>
    </footer>
  );
}
