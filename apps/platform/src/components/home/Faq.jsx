"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const QUESTIONS = [
  {
    q: 'What does it actually do?',
    a: 'It keeps one record per property and turns it into a presentation: an editable description, a deal sheet layout and a property page you can publish and send as a link.',
  },
  {
    q: 'Who is it for?',
    a: 'Wholesalers and small disposition teams first, with agents, investors and developers supported by the same record. It is not built around one country.',
  },
  {
    q: 'Is it a CRM?',
    a: 'No. It prepares and publishes property information and stores the inquiries a page receives. Pipelines, commissions and accounting are out of scope.',
  },
  {
    q: 'Can the AI check my facts?',
    a: 'No. It helps with wording only. Every fact keeps the source you gave it, disagreements are shown to you, and nothing publishes until you approve it.',
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="faq-home">
      <div className="shell">
        <div className="faq-home-grid">
          <div className="faq-home-aside">
            <span className="eyebrow">Questions</span>
            <h2 className="faq-home-title">A few things worth knowing first.</h2>
            <p className="lead">
              Plain answers, including the ones about what the platform does not do.
            </p>
            <Link href="/faq" className="arrow-link">View all questions</Link>
          </div>

          <div className="faq-home-list">
            {QUESTIONS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q} className={`faq-row ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="faq-row-btn"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span>{item.q}</span>
                    <span className="faq-row-icon"><Plus size={18} strokeWidth={2.2} /></span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        className="faq-row-answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <p>{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
