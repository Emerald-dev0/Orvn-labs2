import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const QUESTIONS = [
  {
    q: 'Is LAREI a CRM?',
    a: 'No. It focuses on professional presentation and property publishing, not a full relationship or transaction management system.',
  },
  {
    q: 'Can anybody access it?',
    a: 'The first release is a controlled private beta. Requests are reviewed before invitations are issued.',
  },
  {
    q: 'Does LAREI verify real-estate facts automatically?',
    a: 'Not in its initial scope. Users must verify property facts and approve public claims.',
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
              Plain answers, including the ones about what LAREI does not do.
            </p>
            <Link to="/faq" className="arrow-link">View all questions</Link>
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
