import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  MessageSquare,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import PageHero from '../components/site/PageHero';
import { Reveal } from '../components/site/Reveal';
import { useDocumentMeta } from '../lib/seo';

const FEATURES = [
  {
    icon: Clock,
    title: 'It answers in seconds',
    body: 'A property enquiry arrives and gets a real answer immediately, with the price, the size and the viewing arrangements already filled in.',
  },
  {
    icon: ShieldCheck,
    title: 'It only says what is true',
    body: 'Answers are drawn from the record you approved. If a figure is missing, PAS says it is being confirmed rather than guessing.',
  },
  {
    icon: UserRound,
    title: 'It hands over properly',
    body: 'When somebody is ready to talk, PAS passes the conversation to you with the property, the question and the contact details attached.',
  },
];

const SPEC = [
  ['Channels', 'Web form, WhatsApp link, portal enquiry'],
  ['First response', 'Within seconds, any hour'],
  ['Sources', 'Your approved property record only'],
  ['Handover', 'To a named person, with context'],
  ['Availability', 'Included in the beta'],
];

const LIMITS = [
  'Not a CRM. PAS handles the first exchange, not the pipeline.',
  'No mass messaging, cold outreach or purchased lists.',
  'No invented answers when a fact is missing.',
  'No pretending to be a person when it is not.',
];

function ChatMock() {
  return (
    <div className="chat-mock">
      <div className="chat-head">
        <span className="chat-avatar"><MessageSquare size={15} strokeWidth={2} /></span>
        <div>
          <strong>Adaora House enquiry</strong>
          <span>Ikoyi, Lagos</span>
        </div>
        <span className="chat-live">Replied in 6s</span>
      </div>

      <div className="chat-body">
        <div className="chat-bubble is-them">
          Is the Ikoyi house still available? What is the service charge?
        </div>
        <div className="chat-bubble is-us">
          Yes, it is available. The asking price is ₦480,000,000 and the service charge is
          ₦4,200,000 per year. There are four bedrooms and the internal area is 620 m².
        </div>
        <div className="chat-bubble is-them">Can I see it this weekend?</div>
        <div className="chat-bubble is-us">
          Saturday morning is possible. I have passed this to Ada, who handles viewings, and she
          will confirm a time today.
        </div>
      </div>

      <div className="chat-foot">
        <Check size={13} strokeWidth={3} />
        Answered from the approved record. Ada has been notified.
      </div>
    </div>
  );
}

export default function PAS() {
  useDocumentMeta({
    title: 'PAS',
    description:
      'PAS answers property enquiries within seconds using the same verified record, then hands the conversation to a person.',
    path: '/pas',
  });

  return (
    <PageWrapper>
      <div className="pas on-dark">
        <PageHero
          dark
          eyebrow="PAS, the second product"
          title={<>The first reply still wins.</>}
          lede="PAS answers property enquiries the moment they arrive, using facts from the same verified record. It is deliberately narrow: it handles first contact, then hands the conversation to a person."
          actions={
            <>
              <Link to="/contact" className="btn btn-lime">
                Ask about PAS
                <ArrowRight strokeWidth={2.2} />
              </Link>
              <Link to="/product" className="btn btn-glass">
                See LAREI first
              </Link>
            </>
          }
          media={<ChatMock />}
        />

        <section className="pas-features">
          <div className="shell">
            <div className="section-head">
              <span className="eyebrow on-dark">What it does</span>
              <h2 className="section-title" style={{ color: 'var(--white)' }}>
                Three things, done properly.
              </h2>
            </div>
            <div className="pas-feature-grid">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={f.title} delay={0.05 * i} className="pas-feature">
                    <span className="pas-feature-icon"><Icon size={20} strokeWidth={1.9} /></span>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pas-spec section-y">
          <div className="shell">
            <div className="pas-spec-grid">
              <div>
                <span className="eyebrow on-dark">The short version</span>
                <h2 className="section-title" style={{ color: 'var(--white)', marginTop: 14 }}>
                  Narrow on purpose.
                </h2>
                <p className="lead" style={{ marginTop: 14 }}>
                  PAS is not a platform. It is one job done well: making certain that the first
                  reply a buyer gets is accurate, quick and in your name.
                </p>
                <Link to="/contact" className="arrow-link" style={{ marginTop: 22 }}>
                  Talk through a use case
                  <ArrowUpRight strokeWidth={2} />
                </Link>
              </div>

              <div className="pas-spec-card">
                <p className="pas-spec-title">Specification</p>
                <div className="pas-spec-list">
                  {SPEC.map(([k, v]) => (
                    <div key={k}>
                      <span>{k}</span>
                      <strong>{v}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pas-limits">
              {LIMITS.map((l) => (
                <div key={l} className="pas-limit">
                  <span aria-hidden="true">·</span>
                  {l}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="shell">
            <div className="cta-band-inner on-dark" style={{ background: 'var(--pine-2)' }}>
              <div>
                <h2>PAS comes with the beta.</h2>
                <p>If you are trying LAREI, you can turn on first-contact replies as well.</p>
              </div>
              <Link to="/early-access" className="btn btn-lime">
                Request access
                <ArrowRight strokeWidth={2.2} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
