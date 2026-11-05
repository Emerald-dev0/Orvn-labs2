"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PageWrapper from '../components/PageWrapper';
import Icon from '../app/icons';
import { useDocumentMeta } from '../lib/seo';

/**
 * The 404.
 *
 * The idea is a property that is not on the register. Two cast house-number plates and, where
 * the middle number belongs, an empty surveyed plot: hatched ground, a perimeter being drawn
 * around nothing, a plot marker dropped in the centre. The plates sit on a survey grid and the
 * whole thing is stamped NOT ON THE REGISTER, because that is what a registry does to a page
 * that no longer exists.
 *
 * Then it stops being a picture. The register is real: every public page, filterable, with
 * `/` focusing the field the way a command palette would.
 */

const PAGES = [
  { to: '/', label: 'Home', note: 'What ORVN Labs is building', icon: 'properties' },
  { to: '/product', label: 'Product', note: 'Websites, portfolios and published pages', icon: 'website' },
  { to: '/how-it-works', label: 'How it works', note: 'Four steps, first record to published page', icon: 'layers' },
  { to: '/who-its-for', label: 'Who it is for', note: 'Agents, wholesalers, investors and their teams', icon: 'user' },
  { to: '/faq', label: 'Questions', note: 'The practical ones, answered plainly', icon: 'help' },
  { to: '/early-access', label: 'Early access', note: 'Ask for a place in the beta', icon: 'badge' },
  { to: '/contact', label: 'Contact', note: 'One inbox, read by the people building it', icon: 'mail' },
];

function EmptyPlot() {
  return (
    <svg className="lost-survey" viewBox="0 0 100 100" role="presentation" focusable="false">
      <defs>
        <pattern id="lost-hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Hatched ground: the architectural shorthand for nothing built here. */}
      <rect className="lost-survey-hatch" x="10" y="10" width="80" height="80" rx="8" fill="url(#lost-hatch)" />

      {/* The perimeter, drawn as if somebody is walking it for the first time. */}
      <rect className="lost-survey-frame" x="10" y="10" width="80" height="80" rx="8" />

      {/* Surveyor corner marks. */}
      <g className="lost-survey-ticks">
        <path d="M10 26 V10 H26" />
        <path d="M74 10 H90 V26" />
        <path d="M90 74 V90 H74" />
        <path d="M26 90 H10 V74" />
      </g>

      <circle className="lost-survey-marker" cx="50" cy="50" r="4.6" />
    </svg>
  );
}

/**
 * A round registry stamp. The ring is set character by character rather than with `textPath`,
 * because a stamp that renders as an empty circle on one browser is the whole joke failing.
 */
const STAMP_RING = 'NOT ON THE REGISTER · ORVN LABS ·';

function RegisterStamp() {
  const step = 360 / STAMP_RING.length;

  return (
    <svg className="lost-stamp" viewBox="0 0 120 120" role="presentation" focusable="false">
      <circle className="lost-stamp-ring" cx="60" cy="60" r="55" />
      <circle className="lost-stamp-ring is-inner" cx="60" cy="60" r="32" />

      {Array.from(STAMP_RING).map((character, index) =>
        character === ' ' ? null : (
          <text
            key={`${character}-${index}`}
            className="lost-stamp-char"
            x="60"
            y="17"
            textAnchor="middle"
            transform={`rotate(${(-90 + step * index).toFixed(2)} 60 60)`}
          >
            {character}
          </text>
        ),
      )}

      <text className="lost-stamp-mark" x="60" y="65.5" textAnchor="middle">
        404
      </text>
    </svg>
  );
}

export default function NotFound() {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const field = useRef(null);

  useDocumentMeta({
    title: 'Not on the register',
    description: 'That address is not listed here. Search every page, or go back to the beginning.',
    path: pathname,
  });

  // `/` focuses the register, the way it focuses a command palette. Not while typing elsewhere.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = (event.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || event.target?.isContentEditable) return;
      event.preventDefault();
      field.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const needle = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!needle) return PAGES;
    return PAGES.filter((page) =>
      `${page.label} ${page.note} ${page.to}`.toLowerCase().includes(needle),
    );
  }, [needle]);

  return (
    <PageWrapper>
      <section className="lost">
        <div className="shell">
          <div className="lost-head">
            <span className="lost-tag">
              <Icon name="location" size={14} strokeWidth={2} />
              404 · not on the register
            </span>
            <span className="lost-path" title={pathname}>
              {pathname}
            </span>
          </div>

          <div className="lost-hero">
            <div className="lost-copy">
              <h1 className="lost-title">
                This address
                <br />
                is not listed.
              </h1>
              <p className="lost-lede">
                No page is built at this URL. The link may be old, the page may have been retired,
                or a published listing may have been withdrawn along with its address. Nothing is
                broken on your side.
              </p>

              <div className="lost-actions">
                <Link href="/" className="btn btn-primary">
                  Back to the beginning
                  <Icon name="arrowRight" size={17} strokeWidth={2.2} />
                </Link>
                <a href="mailto:hello@orvnlabs.com" className="lost-mail">
                  <Icon name="mail" size={16} strokeWidth={1.8} />
                  hello@orvnlabs.com
                </a>
              </div>
            </div>

            <div className="lost-plates" aria-hidden="true">
              <span className="lost-plate">4</span>
              <span className="lost-plate is-plot">
                <EmptyPlot />
                <span className="lost-plot-note">empty plot</span>
              </span>
              <span className="lost-plate">4</span>
              <RegisterStamp />
            </div>
          </div>

          <div className="lost-finder">
            <div className="lost-finder-head">
              <div>
                <h2 className="lost-finder-title">Every page that does exist.</h2>
                <p className="lost-finder-note" id="lost-finder-note">
                  {PAGES.length} of them. Type to narrow the list, or press{' '}
                  <kbd className="lost-kbd">/</kbd> to search.
                </p>
              </div>

              <label className="lost-field">
                <span className="lost-field-label">Search pages</span>
                <span className="lost-field-inner">
                  <Icon name="search" size={16} strokeWidth={2} />
                  <input
                    ref={field}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') setQuery('');
                    }}
                    placeholder="Early access, pricing, how it works"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  {query ? (
                    <button
                      type="button"
                      className="lost-clear"
                      onClick={() => {
                        setQuery('');
                        field.current?.focus();
                      }}
                      aria-label="Clear search"
                    >
                      <Icon name="close" size={14} strokeWidth={2.2} />
                    </button>
                  ) : (
                    <kbd className="lost-kbd">/</kbd>
                  )}
                </span>
              </label>
            </div>

            <nav className="lost-list" aria-label="Every page on this site">
              {results.map((page, index) => (
                <Link key={page.to} href={page.to} className="lost-row">
                  <span className="lost-row-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="lost-row-icon">
                    <Icon name={page.icon} size={18} strokeWidth={1.7} />
                  </span>
                  <span className="lost-row-body">
                    <strong>{page.label}</strong>
                    <span>{page.note}</span>
                  </span>
                  <span className="lost-row-go">
                    <Icon name="arrowUpRight" size={16} strokeWidth={2} />
                  </span>
                </Link>
              ))}
            </nav>

            <p className="lost-none" aria-live="polite">
              {results.length === 0
                ? `Nothing on the register matches “${query.trim()}”. Try a shorter word, or write to hello@orvnlabs.com and a person will point you at it.`
                : ''}
            </p>
          </div>
        </div>
      </section>

      <section className="lost-foot dark-band">
        <div className="shell lost-foot-inner">
          <div>
            <span className="eyebrow">If you were following a link</span>
            <h2 className="lost-foot-title">Ask for the current one.</h2>
            <p className="lost-foot-body">
              A listing that has been withdrawn stays withdrawn. Whoever sent you that link can
              share a live page instead, and it will open normally.
            </p>
          </div>
          <Link href="/early-access" className="btn btn-lime">
            Request early access
            <Icon name="arrowUpRight" size={17} strokeWidth={2.2} />
          </Link>
        </div>
      </section>
    </PageWrapper>
  );
}
