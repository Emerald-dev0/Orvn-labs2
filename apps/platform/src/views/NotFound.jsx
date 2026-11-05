"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PageWrapper from '../components/PageWrapper';
import Icon from '../app/icons';
import { useDocumentMeta } from '../lib/seo';

/**
 * The 404.
 *
 * One idea, drawn: a house that is boarded up and not on the register. Two windows crossed
 * with planks, a door with the knob still catching light, a survey stake in the yard and a
 * 404 board on the lawn. Almost no copy, because a picture of a missing home says "this page
 * is gone" faster than a paragraph can.
 *
 * The drawing is inline vector, so the page weighs nothing and stays crisp on any screen.
 * Every path that does exist is one tap away underneath.
 */

const PAGES = [
  { to: '/', label: 'Home', icon: 'properties' },
  { to: '/product', label: 'Product', icon: 'website' },
  { to: '/how-it-works', label: 'How it works', icon: 'layers' },
  { to: '/who-its-for', label: 'Who it is for', icon: 'user' },
  { to: '/faq', label: 'Questions', icon: 'help' },
  { to: '/early-access', label: 'Early access', icon: 'badge' },
  { to: '/contact', label: 'Contact', icon: 'mail' },
];

function BoardedHouse() {
  return (
      <svg
        className="lost-house"
        viewBox="0 0 1360 640"
        role="presentation"
        focusable="false"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="lost-glow" cx="76%" cy="2%" r="58%">
            <stop offset="0%" stopColor="#c9f26e" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#c9f26e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lost-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e4ded1" />
            <stop offset="100%" stopColor="#f1ede3" />
          </linearGradient>
          <pattern id="lost-grid" width="54" height="54" patternUnits="userSpaceOnUse">
            <path d="M54 0H0V54" fill="none" stroke="#101613" strokeOpacity="0.05" strokeWidth="1" />
          </pattern>
        </defs>
<rect width="1360" height="640" fill="#f8f5ef"/>
        <rect width="1360" height="640" fill="url(#lost-grid)"/>
        <rect width="1360" height="640" fill="url(#lost-glow)"/>
        <rect x="0" y="470" width="1360" height="170" fill="url(#lost-ground)"/>
        <line x1="0" y1="470" x2="1360" y2="470" stroke="#101613" strokeOpacity="0.16" strokeWidth="2"/>
        <g transform="translate(250,-40) scale(1.16)">



        <g fill="none" stroke="#101613" strokeOpacity="0.18" strokeWidth="2.5" strokeDasharray="10 9" strokeLinecap="round">
        <path d="M458 452 L520 580"/>
        <path d="M566 452 L640 580"/>
        </g>

        <g transform="translate(120,0)">

        <ellipse cx="392" cy="452" rx="200" ry="12" fill="#101613" fillOpacity="0.09"/>


        <rect x="222" y="300" width="340" height="142" fill="#fffdf8" stroke="#0e1512" strokeWidth="4"/>
        <g stroke="#101613" strokeOpacity="0.08" strokeWidth="2">
        <line x1="222" y1="342" x2="562" y2="342"/>
        <line x1="222" y1="386" x2="562" y2="386"/>
        </g>

        <path d="M196 306 L392 202 L588 306 Z" fill="#0e1512"/>
        <path d="M196 306 L588 306" stroke="#0e1512" strokeWidth="10" strokeLinecap="round"/>
        <rect x="498" y="238" width="42" height="62" fill="#0e1512"/>
        <rect x="490" y="230" width="58" height="12" rx="3" fill="#0e1512"/>


        <rect x="250" y="334" width="76" height="64" fill="#f0fbd8" stroke="#0e1512" strokeWidth="4"/>
        <g stroke="#0e1512" strokeWidth="7" strokeLinecap="round">
        <line x1="238" y1="342" x2="338" y2="390"/>
        <line x1="238" y1="390" x2="338" y2="342"/>
        </g>


        <rect x="458" y="334" width="76" height="64" fill="#f0fbd8" stroke="#0e1512" strokeWidth="4"/>
        <g stroke="#0e1512" strokeWidth="7" strokeLinecap="round">
        <line x1="446" y1="342" x2="546" y2="390"/>
        <line x1="446" y1="390" x2="546" y2="342"/>
        </g>

        <rect x="548" y="306" width="8" height="134" fill="#101613" fillOpacity="0.18"/>


        <rect x="352" y="348" width="80" height="94" fill="#0e1512"/>
        <rect x="364" y="360" width="56" height="28" fill="none" stroke="#fffdf8" strokeOpacity="0.45" strokeWidth="3"/>
        <circle cx="420" cy="404" r="4.5" fill="#c9f26e"/>
        <rect x="338" y="440" width="108" height="12" rx="3" fill="#101613" fillOpacity="0.2"/>


        <g transform="translate(196,470)">
        <ellipse cx="0" cy="0" rx="26" ry="7" fill="none" stroke="#b6e754" strokeWidth="3" strokeDasharray="5 5"/>
        <path d="M0 0 L0 -54" stroke="#b6e754" strokeWidth="6" strokeLinecap="round"/>
        <path d="M-13 -58 L13 -58" stroke="#0e1512" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="0" cy="-70" r="9" fill="#b6e754" stroke="#fffdf8" strokeWidth="3.5"/>
        </g>

        <ellipse cx="812" cy="556" rx="34" ry="8" fill="#101613" fillOpacity="0.1"/>


        <g transform="translate(700,296) rotate(-4)">
        <rect x="-9" y="130" width="12" height="126" fill="#0e1512"/>
        <rect x="-96" y="-14" width="196" height="150" rx="12" fill="#fffdf8" stroke="#0e1512" strokeWidth="4"/>
        <text x="2" y="64" fontFamily="'Bricolage Grotesque Variable', system-ui, sans-serif" fontSize="64" fontWeight="700" fill="#0e1512" textAnchor="middle">404</text>
        <rect x="-86" y="82" width="176" height="32" rx="16" fill="#c9f26e"/>
        <text x="2" y="103" fontFamily="'Figtree Variable', system-ui, sans-serif" fontSize="11.5" fontWeight="600" letterSpacing="0.4" fill="#22380c" textAnchor="middle">NOT ON THE REGISTER</text>
        </g>


        <path d="M330 178 q10 -12 20 0 q10 -12 20 0" fill="none" stroke="#101613" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round"/>


        <g stroke="#101613" strokeOpacity="0.36" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M236 474 q2 -20 6 -3"/><path d="M244 474 q-8 -24 -14 -6"/><path d="M230 474 q-4 -16 -10 -4"/>
        <path d="M596 476 q3 -22 7 -3"/><path d="M604 476 q-8 -26 -14 -6"/>
        <path d="M330 528 q3 -20 7 -3"/><path d="M338 528 q-8 -24 -14 -5"/>
        <path d="M676 530 q3 -22 7 -3"/><path d="M684 530 q-8 -26 -14 -6"/>
        </g>
        </g>
        </g>
      </svg>
  );
}

export default function NotFound() {
  const pathname = usePathname();

  useDocumentMeta({
    title: 'Not on the register',
    description: 'That address is not listed here. Every page that does exist is one tap away.',
    path: pathname,
  });

  return (
    <PageWrapper>
      <section className="lost">
        <div className="shell">
          <figure className="lost-scene">
            <BoardedHouse />

            <span className="lost-path" title={pathname}>
              {pathname}
            </span>

            <figcaption className="lost-card">
              <span className="lost-tag">
                <Icon name="location" size={13} strokeWidth={2} />
                404 not on the register
              </span>

              <h1 className="lost-title">This address is not listed.</h1>

              <p className="lost-lede">
                No page is built here. The link may be old, the page retired, or the listing
                withdrawn.
              </p>

              <div className="lost-actions">
                <Link href="/" className="btn btn-primary">
                  Back to the beginning
                  <Icon name="arrowRight" size={17} strokeWidth={2.2} />
                </Link>
                <a href="mailto:hello@orvnlabs.com" className="lost-mail">
                  Tell us what you wanted
                </a>
              </div>
            </figcaption>
          </figure>

          <div className="lost-register">
            <span className="lost-register-label">Every page that does exist</span>
            <nav className="lost-chips" aria-label="Every page on this site">
              {PAGES.map((page) => (
                <Link key={page.to} href={page.to} className="lost-chip">
                  <Icon name={page.icon} size={15} strokeWidth={1.8} />
                  {page.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <section className="lost-foot dark-band">
        <div className="shell lost-foot-inner">
          <p className="lost-foot-line">
            A withdrawn listing stays withdrawn. Whoever sent you that link can share a live page
            instead.
          </p>
          <Link href="/early-access" className="btn btn-lime">
            Request early access
            <Icon name="arrowUpRight" size={17} strokeWidth={2.2} />
          </Link>
        </div>
      </section>
    </PageWrapper>
  );
}
