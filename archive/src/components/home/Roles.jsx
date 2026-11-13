import React from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../site/Reveal';
import { ArrowUpRight } from 'lucide-react';

const ROLES = [
  {
    tint: 'sand',
    title: 'Wholesalers',
    body: 'Present off-market opportunities with consistent property information and a more professional buyer experience.',
  },
  {
    tint: 'sky',
    title: 'Agents',
    body: 'Showcase authorized listings, services and professional identity from one branded destination.',
  },
  {
    tint: 'blush',
    title: 'Investors',
    body: 'Present projects, owned properties or investment opportunities with appropriate factual context.',
  },
  {
    tint: 'lime',
    title: 'Operators & teams',
    body: 'Standardize how the business and its properties appear when shared.',
  },
];

export default function Roles() {
  return (
    <section className="audience">
      <div className="shell">
        <div className="audience-head">
          <Reveal>
            <span className="eyebrow">Roles</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="audience-title">Designed for the professionals moving the property.</h2>
          </Reveal>
        </div>

        <div className="audience-grid is-four">
          {ROLES.map((role, i) => (
            <Reveal key={role.title} delay={0.05 * i} className={`role-card tint-${role.tint}`}>
              <h3 className="role-card-title">{role.title}</h3>
              <p className="role-card-body">{role.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <Link to="/who-its-for" className="arrow-link audience-link">
            See who it&rsquo;s for
            <ArrowUpRight strokeWidth={2} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
