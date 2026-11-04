import React from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../site/Reveal';
import { ArrowRight, Check } from 'lucide-react';

const PLANS = [
  {
    id: 'beta',
    name: 'Private beta',
    price: 'Free while we build',
    blurb:
      'For individuals and small teams who will use it properly and tell us where it hurts. We review applications weekly.',
    points: [
      'Up to 10 properties',
      'Property pages, deal sheets, buyer summaries and print sheets',
      'Your own branding on everything you publish',
      'Direct line to the team building it',
    ],
    cta: 'Apply for beta access',
    to: '/early-access',
    feature: true,
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 'Pricing announced later',
    blurb:
      'For agencies and developers who need a shared record, approvals and a house style across the whole team.',
    points: [
      'Unlimited properties',
      'Shared workspace with roles',
      'Approval before anything publishes',
      'Bulk exports and site packs',
      'Priority support',
    ],
    cta: 'Talk to us',
    to: '/contact',
    feature: false,
  },
];

export default function Access() {
  return (
    <section className="access">
      <div className="shell">
        <div className="access-head">
          <Reveal>
            <span className="eyebrow">Access</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="access-title">Two ways in, both honest.</h2>
          </Reveal>
          <Reveal delay={0.09}>
            <p className="lead">
              We are not pretending to have published pricing. The beta is open by application and
              costs nothing; the paid plan arrives when the product has earned it.
            </p>
          </Reveal>
        </div>

        <div className="access-grid">
          {PLANS.map((plan, i) => (
            <Reveal
              key={plan.id}
              delay={0.07 * i}
              className={`plan-card ${plan.feature ? 'is-feature on-dark' : ''}`}
            >
              <div className="plan-top">
                <p className="plan-name">{plan.name}</p>
                {plan.feature && <span className="pill pill-lime">Open now</span>}
              </div>
              <p className="plan-price">{plan.price}</p>
              <p className="plan-blurb">{plan.blurb}</p>
              <ul className="plan-list">
                {plan.points.map((p) => (
                  <li key={p}>
                    <span className="plan-check"><Check size={12} strokeWidth={3} /></span>
                    {p}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.to}
                className={`btn btn-block ${plan.feature ? 'btn-lime' : 'btn-secondary'}`}
              >
                {plan.cta}
                <ArrowRight strokeWidth={2.2} />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
