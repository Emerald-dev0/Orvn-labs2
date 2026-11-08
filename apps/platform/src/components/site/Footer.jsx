"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Mail } from 'lucide-react';
import Logo from './Logo';

const COLUMNS = [
  {
    title: 'ORREI',
    links: [
      { to: '/product', label: 'What it does' },
      { to: '/how-it-works', label: 'How it works' },
      { to: '/who-its-for', label: "Who it's for" },
      { to: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About ORVN Labs' },
      { to: '/early-access', label: 'Early access' },
      { to: '/contact', label: 'Contact' },
      { to: '/legal/privacy', label: 'Privacy' },
      { to: '/legal/terms', label: 'Terms' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer on-dark">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo dark />
            <p className="footer-tagline">ORREI: software for clearer real-estate presentation.</p>
            <p className="footer-note">
              ORREI is for wholesalers and small disposition teams first, with agents, investors
              and the teams behind property deals supported by the same record.
            </p>

            <div className="footer-actions">
              <Link href="/early-access" className="btn btn-lime btn-sm">
                Request early access
                <ArrowUpRight strokeWidth={2} />
              </Link>
              <a href="mailto:hello@orvnlabs.com" className="footer-mail-link">
                <Mail size={15} strokeWidth={2} />
                hello@orvnlabs.com
              </a>
            </div>
          </div>

          <div className="footer-cols">
            {COLUMNS.map((col) => (
              <div key={col.title} className="footer-col">
                <p className="footer-col-title">{col.title}</p>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link href={l.to} className="footer-link">
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
          <p>© {new Date().getFullYear()} ORVN Labs. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link href="/faq">Questions</Link>
            <a href="mailto:hello@orvnlabs.com">hello@orvnlabs.com</a>
          </div>
        </div>
      </div>

      <div className="footer-wordmark" aria-hidden="true">
        ORVN
      </div>
    </footer>
  );
}
