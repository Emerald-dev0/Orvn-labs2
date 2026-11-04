import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FaqAccordion({ items, initial = 0 }) {
  const [open, setOpen] = useState(initial);

  return (
    <div className="faq-list">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className={`faq-row ${isOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="faq-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="faq-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="faq-q">{item.q}</span>
              <span className="faq-sign" aria-hidden />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  className="faq-answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p>{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
