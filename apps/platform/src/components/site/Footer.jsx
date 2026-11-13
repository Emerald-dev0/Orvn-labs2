"use client";

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
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
      { to: '/legal/privacy', label: 'Privacy notice' },
      { to: '/legal/terms', label: 'Terms of service' },
    ],
  },
];

/** The roofline from the brand mark, drawn at poster scale. */
const ROOFLINE =
  'M0 208 L96 128 L192 208 M216 208 L336 100 L456 208 M480 208 L576 128 L672 208 ' +
  'M696 208 L816 100 L936 208 M960 208 L1056 128 L1152 208';

export default function Footer() {
  const reduce = useReducedMotion();

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
            <p className="footer-note">
              ORREI is in development. Screens and properties are illustrative. Access is limited to
              approved beta users.
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

      {/* Illustrated lockup: the mark's roofline drawn wide, the letters outlined over it. */}
      <div className="footer-wordmark" aria-hidden="true">
        <svg
          className="footer-wordmark-art"
          viewBox="0 0 1152 240"
          preserveAspectRatio="xMidYMax meet"
          focusable="false"
        >
          <motion.path
            d={ROOFLINE}
            fill="none"
            stroke="var(--lime)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            whileInView={reduce ? {} : { pathLength: 1, opacity: 0.34 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.path
            d="M0 208 H1152"
            fill="none"
            stroke="rgba(255, 253, 248, 0.16)"
            strokeWidth="1.5"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={reduce ? {} : { pathLength: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 1.2, delay: 0.25, ease: 'easeOut' }}
          />
        </svg>

        <span className="footer-wordmark-type">
          ORVN
          <i className="footer-wordmark-dot" />
        </span>
      </div>
    </footer>
  );
}
