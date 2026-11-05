"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PageWrapper from '../components/PageWrapper';
import Icon from '../app/icons';
import { useDocumentMeta } from '../lib/seo';

/**
 * The 404.
 *
 * The idea: a property that is not on the register. Three house-number plates where the
 * middle digit is an empty plot, because "no such address" is the accurate description and
 * a missing house is more interesting to look at than a large number.
 *
 * It is also a working index. The field filters every public page, so a wrong link becomes
 * a way in rather than a dead end.
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

export default function NotFound() {
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  useDocumentMeta({
    title: 'Not on the register',
    description: 'That address is not listed here. Search every page, or go back to the beginning.',
    path: pathname,
  });

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return PAGES;
    return PAGES.filter((page) =>
      `${page.label} ${page.note} ${page.to}`.toLowerCase().includes(needle),
    );
  }, [query]);

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
                Nothing is broken on your side. Either the link was mistyped, or the page was
                retired. A published property page can also be withdrawn by whoever owns it, in
                which case the current link is theirs to give you.
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
                <span className="lost-plot" />
              </span>
              <span className="lost-plate">4</span>
            </div>
          </div>

          <div className="lost-finder">
            <div className="lost-finder-head">
              <div>
                <h2 className="lost-finder-title">Find the page you meant.</h2>
                <p className="lost-finder-note">
                  Every page on this site, in one list. Type to narrow it.
                </p>
              </div>

              <label className="lost-field">
                <span className="lost-field-label">Search pages</span>
                <span className="lost-field-inner">
                  <Icon name="search" size={16} strokeWidth={2} />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Early access, pricing, how it works"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </span>
              </label>
            </div>

            <nav className="lost-list" aria-label="All pages">
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
                ? `Nothing here matches “${query.trim()}”. Try a shorter word, or write to hello@orvnlabs.com and a person will point you at it.`
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
              A property page that has been withdrawn is withdrawn on purpose, and this site will
              not show it again. Whoever sent you the link can share a live page instead.
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
