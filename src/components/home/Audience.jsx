import React from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../site/Reveal';
import { ArrowUpRight } from 'lucide-react';

const ROLES = [
  {
    tint: 'sand',
    title: 'Agents and brokers',
    body: 'Keep a listing looking sharp on the portal, in the WhatsApp group and at the inspection, without retyping the same details.',
    points: ['One page per property', 'Deal sheets on demand', 'Your branding, not ours'],
  },
  {
    tint: 'sky',
    title: 'Developers',
    body: 'Hold a whole scheme in one place and give buyers a consistent picture from launch through to handover.',
    points: ['Multiple units per project', 'Print-ready site packs', 'Changes pushed everywhere'],
  },
  {
    tint: 'blush',
    title: 'Small agencies',
    body: 'Give everyone the same record and the same house style, so the newest hire publishes like the most senior one.',
    points: ['Shared workspace', 'Approval before publishing', 'Roles and permissions'],
  },
];

export default function Audience() {
  return (
    <section className="audience">
      <div className="shell">
        <div className="audience-head">
          <Reveal>
            <span className="eyebrow">Who it&rsquo;s for</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="audience-title">Made for the people who carry the deal.</h2>
          </Reveal>
        </div>

        <div className="audience-grid">
          {ROLES.map((role, i) => (
            <Reveal
              key={role.title}
              delay={0.06 * i}
              className={`role-card tint-${role.tint}`}
            >
              <h3 className="role-card-title">{role.title}</h3>
              <p className="role-card-body">{role.body}</p>
              <ul className="role-card-list">
                {role.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <Link to="/who-its-for" className="arrow-link audience-link">
            See how it fits your role
            <ArrowUpRight strokeWidth={2} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
