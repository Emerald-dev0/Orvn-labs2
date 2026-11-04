import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const QUESTIONS = [
  {
    q: 'Do I need to move off the portals?',
    a: 'No. Keep your listings where they are. LAREI is the record you own, and the page you control. Many people add it alongside their existing listing rather than replacing anything.',
  },
  {
    q: 'Do you write the descriptions with AI?',
    a: 'Only if you ask it to draft, and only from facts already in your record. It will not invent features, measurements or prices. Every draft has to be edited and approved by a person before it can be published.',
  },
  {
    q: 'What happens to my photographs?',
    a: 'They stay yours. We store them so we can render pages, sheets and printouts. We do not resell them, and we do not use them to train models. You can delete a property and its files at any time.',
  },
  {
    q: 'Can two people work on the same property?',
    a: 'On the Studio plan, yes. Everyone sees the same record, and you can require approval before anything is published. On the beta plan a workspace is usually one or two people.',
  },
  {
    q: 'How long does a property take to set up?',
    a: 'Around twenty minutes if you already have the facts and photographs, and considerably less for the second one, because your details and house style are already in the system.',
  },
  {
    q: 'Is it available outside Nigeria?',
    a: 'Yes. The interface is in English, prices can be set in any currency and addresses work anywhere. Billing, if and when it starts, will depend on where you are.',
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
            <h2 className="faq-home-title">The things people ask before signing up.</h2>
            <p className="lead">If yours is not here, write to us and we will answer it plainly.</p>
            <Link to="/faq" className="arrow-link">All questions</Link>
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
