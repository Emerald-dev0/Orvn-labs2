import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import ChapterHead from '../site/ChapterHead';
import { Reveal } from '../site/Reveal';

const PLANS = [
  {
    label: 'Cohort',
    name: 'Private beta',
    fit: 'For professionals who present property every week and can tell us where the workflow breaks.',
    points: ['No cost during beta', '10 property records', 'Pages, sheets and summaries', 'Direct line to the team'],
    cta: 'Apply for the beta',
    to: '/early-access',
    dark: false,
    state: 'Open',
  },
  {
    label: 'Practice',
    name: 'Working desk',
    fit: 'For agents, wholesalers and investors running a live portfolio across several markets.',
    points: ['Unlimited records', 'Custom domain (evaluated)', 'Engagement insight', 'Priority onboarding'],
    cta: 'Join the waitlist',
    to: '/early-access',
    dark: true,
    state: '2026',
  },
  {
    label: 'Brokerage',
    name: 'Team desk',
    fit: 'For teams that need one approved version of the truth across several agents and territories.',
    points: ['Shared record and roles', 'Brand controls', 'Guided migration', 'Support and training'],
    cta: 'Talk to us',
    to: '/contact',
    dark: false,
    state: 'By conversation',
  },
];

export default function Access() {
  return (
    <section className="section-y access" id="pricing">
      <div className="shell">
        <ChapterHead
          index="08 / Access"
          label="A small beta, deliberately"
          title={['Access is', <>earned, <span className="em">not bought.</span></>]}
          note="We are onboarding in cohorts so the workflow can be corrected while it is still cheap to correct."
        />

        <div className="access-grid">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.07} className={`access-card ${plan.dark ? 'is-dark' : ''}`}>
              <div className="ac-top">
                <span className="ac-label">{plan.label}</span>
                <span className="pill" style={plan.dark ? { color: 'rgba(239,234,225,0.7)', borderColor: 'rgba(239,234,225,0.24)' } : undefined}>
                  {plan.state}
                </span>
              </div>
              <div>
                <h3>{plan.name}</h3>
                <p className="ac-fit">{plan.fit}</p>
              </div>
              <ul className="access-list">
                {plan.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <Link to={plan.to} className="access-cta">
                {plan.cta}
                <ArrowUpRight size={12} strokeWidth={1.8} />
              </Link>
            </Reveal>
          ))}
        </div>

        <p className="access-note">
          Pricing has not been announced. No payment is requested during the beta, and plan limits
          will be published before any paid commitment is asked for.
        </p>
      </div>
    </section>
  );
}
