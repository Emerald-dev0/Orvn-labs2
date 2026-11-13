import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import PageHero from '../components/site/PageHero';
import { Reveal } from '../components/site/Reveal';
import { useDocumentMeta } from '../lib/seo';

const PRINCIPLES = [
  {
    title: 'Status is part of the copy',
    body: 'If a screen, a feature or a price is a prototype or undecided, the page says so. Nothing here is presented as live when it is not.',
  },
  {
    title: 'No invented numbers',
    body: 'We have not published pricing, customer counts or performance claims because those things are not settled. Sample listings on this site are labelled as illustrative.',
  },
  {
    title: 'You talk to the builders',
    body: 'During the beta there is no ticket queue and no chatbot pretending to be a person. Messages reach the people working on the product.',
  },
];

export default function About() {
  useDocumentMeta({
    title: 'About ORVN Labs',
    description:
      'ORVN Labs builds software for how real estate gets presented. LAREI is its current product, in private beta. PAS, an earlier product, is archived.',
    path: '/about',
  });

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Company"
        title={<>A small company building tools for how property gets presented.</>}
        lede="ORVN Labs makes software for real estate. LAREI is the product we are building now. This page explains what that means, what is live, and what is not."
      />

      <section className="about">
        <div className="shell">
          <div className="about-grid">
            <Reveal className="about-card">
              <span className="eyebrow">Current product</span>
              <h2>LAREI</h2>
              <p>
                A workspace for professional websites, property portfolios and published property
                pages, with AI-assisted drafts that stay under your review. In private beta.
              </p>
              <Link to="/product" className="arrow-link">
                Explore LAREI
                <ArrowUpRight strokeWidth={2} />
              </Link>
            </Reveal>

            <Reveal delay={0.08} className="about-card">
              <span className="eyebrow">Earlier product</span>
              <h2>PAS</h2>
              <p>
                First-contact response for brokerages, offered before LAREI. No longer actively
                developed and not part of the LAREI beta. The page stays online for old links.
              </p>
              <Link to="/pas" className="arrow-link">
                PAS (archived)
                <ArrowUpRight strokeWidth={2} />
              </Link>
            </Reveal>
          </div>

          <div className="about-principles">
            <Reveal>
              <span className="eyebrow">How we work</span>
              <h2 className="about-title">What we will and will not put on this site.</h2>
            </Reveal>
            <div className="about-principle-grid">
              {PRINCIPLES.map((p, i) => (
                <Reveal key={p.title} delay={0.05 + i * 0.05} className="about-principle">
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.06} className="about-contact dark-band">
            <div>
              <span className="eyebrow">Contact</span>
              <h2 className="about-title">One inbox, read by a person.</h2>
              <p className="lead">
                Questions about LAREI, the beta, or something you read here: write to us.
              </p>
            </div>
            <div className="about-contact-actions">
              <a href="mailto:hello@orvnlabs.com" className="btn btn-lime btn-sm">
                <Mail size={15} strokeWidth={2} />
                hello@orvnlabs.com
              </a>
              <Link to="/early-access" className="about-contact-link">
                Request early access
                <ArrowRight strokeWidth={2} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </PageWrapper>
  );
}
