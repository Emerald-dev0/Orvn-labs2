"use client";

import React from 'react';
import { Reveal } from './Reveal';

/**
 * Shared page opener. Copy on the left, an optional media panel on the right.
 */
export default function PageHero({ eyebrow, title, lede, actions, media, children, dark = false, wide = false }) {
  return (
    <section className={`page-hero ${dark ? 'on-dark' : ''}`}>
      <div className="shell">
        <div className={`page-hero-grid ${media ? '' : 'is-single'} ${wide ? 'is-wide' : ''}`}>
          <div className="page-hero-copy">
            {eyebrow && (
              <Reveal y={14}>
                <span className="eyebrow">{eyebrow}</span>
              </Reveal>
            )}
            <Reveal delay={0.05} y={22}>
              <h1 className="page-title">{title}</h1>
            </Reveal>
            {lede && (
              <Reveal delay={0.1} y={18}>
                <p className="page-lede">{lede}</p>
              </Reveal>
            )}
            {actions && (
              <Reveal delay={0.14} y={16}>
                <div className="page-hero-actions">{actions}</div>
              </Reveal>
            )}
          </div>

          {media && (
            <Reveal delay={0.12} y={26} className="page-hero-media">
              {media}
            </Reveal>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
