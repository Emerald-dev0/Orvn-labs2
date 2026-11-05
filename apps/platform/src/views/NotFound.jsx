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
 * One image, nearly no words. A house nobody has come back to: every window boarded with crossed
 * planks, the door still shut, weeds up to the sills, a blank signpost leaning in the yard. It is
 * drawn in pine ink on cream, so it sits inside the brand without a photograph of somebody else's
 * building.
 *
 * The copy is a small card laid over the empty left third of the drawing and nowhere else, so the
 * picture is never covered. Everything that does exist on the site is one tap away underneath.
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
            <img
              className="lost-house"
              src="/images/404/lost-house-2000.webp"
              srcSet="/images/404/lost-house-1100.webp 1100w, /images/404/lost-house-2000.webp 2000w"
              sizes="(max-width: 1080px) 100vw, 1244px"
              width={2048}
              height={1152}
              alt=""
              fetchPriority="high"
              decoding="async"
            />

            <span className="lost-path" title={pathname}>
              {pathname}
            </span>

            <figcaption className="lost-card">
              <span className="lost-pill">
                <Icon name="location" size={13} strokeWidth={2} />
                Not on the register
              </span>

              <span className="lost-num" aria-hidden="true">
                404
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
