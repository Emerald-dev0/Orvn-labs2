import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Minus } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import PageHero from '../components/site/PageHero';
import { Reveal } from '../components/site/Reveal';
import { useDocumentMeta } from '../lib/seo';

const ROLES = [
  {
    tint: 'sand',
    name: 'Agents and brokers',
    title: 'Look as good as the property does.',
    body: 'You already have the photographs and the facts. LAREI turns them into a page you are happy to send, a deal sheet you can hand over, and an inspection sheet that matches both.',
    gets: [
      'A page per property, in your name',
      'Deal sheets for serious buyers',
      'Print sheets for site inspections',
      'Enquiry buttons that come straight to you',
    ],
  },
  {
    tint: 'sky',
    name: 'Developers',
    title: 'Keep a whole scheme consistent.',
    body: 'Twenty units, one story. Hold the scheme and every unit in one workspace so the brochure, the site office and the sales agent are always talking about the same numbers.',
    gets: [
      'Multiple units under one project',
      'Shared facts across a scheme',
      'Print-ready site packs',
      'Updates pushed to every output',
    ],
  },
  {
    tint: 'blush',
    name: 'Small agencies',
    title: 'Make the newest hire sound senior.',
    body: 'One record, one house style, one approval step. Everybody publishes from the same source, so the quality does not depend on who happened to answer the phone.',
    gets: [
      'Shared workspace and roles',
      'Approval before publishing',
      'Consistent branding across the team',
      'A record that survives staff changes',
    ],
  },
];

const POOR_FIT = [
  'You want automated valuations or investment analysis. LAREI does not model price.',
  'You are looking for a CRM with pipelines, tasks and commission tracking.',
  'You need a mass-distribution engine that pushes to hundreds of buyer lists.',
  'You want a website builder for a general business rather than property.',
];

export default function WhoItsFor() {
  useDocumentMeta({
    title: "Who it's for",
    description:
      'LAREI is built for agents, brokers, developers and small agencies who need one consistent property record behind every page, sheet and printout they send.',
    path: '/who-its-for',
  });

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Who it's for"
        title={<>Made for the people who carry the deal.</>}
        lede="Not everybody needs a property record. These are the people who do, and the ones who should probably use something else."
        media={
          <div className="hero-photo-card">
            <img src="/images/prop-1.jpg" alt="A residential property photographed for a listing" />
            <div className="hero-photo-chip glass">
              <Check size={16} strokeWidth={2.6} />
              <div>
                <strong>Built with property people</strong>
                <span>Agents, developers, small teams</span>
              </div>
            </div>
          </div>
        }
      />

      <section className="roles">
        <div className="shell">
          {ROLES.map((role, i) => (
            <Reveal
              key={role.name}
              className={`role-block ${i % 2 === 1 ? 'is-reverse' : ''}`}
            >
              <div className={`role-block-panel tint-${role.tint}`}>
                <span className="pill">{role.name}</span>
                <h2 className="role-block-title">{role.title}</h2>
                <p className="role-block-body">{role.body}</p>
              </div>
              <ul className="role-gets">
                {role.gets.map((g) => (
                  <li key={g}>
                    <span className="list-check-icon"><Check size={12} strokeWidth={3} /></span>
                    {g}
                  </li>
                ))}
                <li className="role-gets-link">
                  <Link to="/product" className="arrow-link">
                    What you get
                    <ArrowUpRight strokeWidth={2} />
                  </Link>
                </li>
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="poor-fit section-y">
        <div className="shell">
          <div className="poor-fit-card">
            <div>
              <span className="eyebrow">Honest answer</span>
              <h2 className="section-title">When LAREI is the wrong tool.</h2>
              <p className="lead">
                We would rather say this now than have you find out after a month of setting
                things up.
              </p>
            </div>
            <ul className="poor-fit-list">
              {POOR_FIT.map((item) => (
                <li key={item}>
                  <Minus size={16} strokeWidth={2.4} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="shell">
          <div className="cta-band-inner on-dark">
            <div>
              <h2>If that sounds like your week, we should talk.</h2>
              <p>Beta access is free and reviewed personally. Tell us what you are publishing today.</p>
            </div>
            <Link to="/early-access" className="btn btn-lime">
              Request access
              <ArrowRight strokeWidth={2.2} />
            </Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
