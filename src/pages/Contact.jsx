import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MapPin, Clock } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';
import { Reveal } from '../components/site/Reveal';

export default function Contact() {
  useDocumentMeta({
    title: 'Contact — talk to a person',
    description: 'Questions about LAREI, early access or a potential use case. Reach a person, not a queue.',
    path: '/contact',
  });

  const [status, setStatus] = useState('idle');

  const onSubmit = (e) => {
    e.preventDefault();
    setStatus('sent');
  };

  return (
    <PageWrapper>
      <section className="page-hero">
        <div className="shell">
          <div className="page-hero-grid">
            <div>
              <span className="eyebrow">Contact</span>
              <h1 className="page-title">
                Talk to a <span className="em">person.</span>
              </h1>
            </div>
            <div>
              <p className="page-lede">
                Questions about LAREI, early access or a use case we have not thought of. Tell us
                your role and what you are trying to accomplish.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 'clamp(56px,7vw,104px)' }}>
        <div className="shell">
          <div className="form-shell">
            <aside className="form-aside">
              <div className="contact-details">
                <a href="mailto:hello@orvnlabs.com" className="contact-line">
                  <Mail size={15} strokeWidth={1.5} color="var(--ember)" />
                  <span>
                    <span className="label-mono">Email</span>
                    hello@orvnlabs.com
                  </span>
                </a>
                <div className="contact-line">
                  <MapPin size={15} strokeWidth={1.5} color="var(--ember)" />
                  <span>
                    <span className="label-mono">Based in</span>
                    Lagos, Nigeria
                  </span>
                </div>
                <div className="contact-line">
                  <Clock size={15} strokeWidth={1.5} color="var(--ember)" />
                  <span>
                    <span className="label-mono">Hours</span>
                    Mon–Fri · WAT
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                <span className="label-mono">Looking for access?</span>
                <p style={{ fontSize: 13.5, color: 'var(--ink-mid)', marginTop: 8, lineHeight: 1.6 }}>
                  The early-access form is faster — it gives us the context we need to evaluate a fit.
                </p>
                <Link to="/early-access" className="arrow-link" style={{ marginTop: 12 }}>
                  Request early access
                  <ArrowUpRight size={14} strokeWidth={1.6} />
                </Link>
              </div>
            </aside>

            <div>
              {status === 'sent' ? (
                <Reveal className="form-success">
                  <span className="pill tag-ember">Received</span>
                  <h2 className="h-display-2" style={{ maxWidth: '18ch' }}>
                    Message received. <span className="em">Thank you.</span>
                  </h2>
                  <p className="lead" style={{ fontSize: 15 }}>
                    If a response is needed, we will get back to you using the contact details you
                    provided.
                  </p>
                </Reveal>
              ) : (
                <form onSubmit={onSubmit} className="form-grid">
                  <div className="field">
                    <label className="field-label" htmlFor="c-name">
                      Name *
                    </label>
                    <input id="c-name" required className="input" placeholder="Your name" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="c-email">
                      Work email *
                    </label>
                    <input id="c-email" required type="email" className="input" placeholder="you@business.com" />
                  </div>
                  <div className="field span-2">
                    <label className="field-label" htmlFor="c-topic">
                      Topic
                    </label>
                    <select id="c-topic" className="select" defaultValue="Beta access">
                      <option>Beta access</option>
                      <option>Product question</option>
                      <option>Support</option>
                      <option>Press</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="field span-2">
                    <label className="field-label" htmlFor="c-message">
                      Message *
                    </label>
                    <textarea id="c-message" required className="textarea" rows={6} placeholder="What are you trying to accomplish?" />
                  </div>
                  <div className="span-2" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary">
                      Send message
                      <ArrowUpRight size={15} strokeWidth={1.6} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
