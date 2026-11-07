"use client";

import React from 'react';
import { Reveal } from '../site/Reveal';
import { EyeOff, MapPin, ShieldCheck } from 'lucide-react';

const POINTS = [
  {
    icon: ShieldCheck,
    title: 'Private stays private',
    body: 'Workspace material, source documents and seller-sensitive notes are kept apart from anything public.',
  },
  {
    icon: EyeOff,
    title: 'Nothing publishes itself',
    body: 'AI assists with the draft. You make the factual and publication decisions, and you approve what goes public.',
  },
  {
    icon: MapPin,
    title: 'Maps show general location',
    body: 'The first release does not claim surveyed boundaries. A pin is context, not a legal description.',
  },
];

export default function Trust() {
  return (
    <section className="verify">
      <div className="shell">
        <div className="verify-card">
          <div className="verify-copy">
            <Reveal>
              <span className="eyebrow">Trust</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="verify-title">Your brand. Your review. Your publishing decision.</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lead">
                The platform is designed to separate private workspace material from information you
                explicitly approve for public pages. AI assists with the draft; the user makes the
                factual and publication decisions. Maps show general location in the first release,
                not surveyed property boundaries.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="verify-list">
            {POINTS.map((p) => {
              const Icon = p.icon;
              return (
                <div className="verify-row trust-row" key={p.title}>
                  <Icon size={17} strokeWidth={1.9} className="verify-row-icon trust-icon" />
                  <div>
                    <strong>{p.title}</strong>
                    <p>{p.body}</p>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
