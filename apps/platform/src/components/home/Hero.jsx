"use client";

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, Check, Copy, FileText, MapPin, Mic, Share2 } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1];

/**
 * The hero.
 *
 * One claim, then the same property twice: the message a buyer receives today, and the page they
 * receive instead. The right column is the argument; the left column is why anyone keeps reading.
 *
 * No location, no price claim, no customer result. The cards are illustrative and say so — the tag
 * stays on the page even though it costs a line of polish, because the alternative is implying a
 * customer exists who does not.
 */
export default function Hero() {
  const reduce = useReducedMotion();

  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  const card = (rotate, delay) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20, rotate: rotate * 2.6 },
          animate: { opacity: 1, y: 0, rotate },
          transition: { duration: 1, delay, ease: EASE },
        };

  return (
    <section className="hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />

      <div className="shell hero-grid">
        <div className="hero-copy">
          <motion.p className="eyebrow" style={{ marginBottom: 14 }} {...rise(0)}>
            Built first for wholesalers and disposition teams
          </motion.p>
          <motion.h1 className="hero-title" {...rise(0.05)}>
            A property deserves better than a <em>forwarded PDF</em>.
          </motion.h1>

          <motion.p className="hero-sub" {...rise(0.1)}>
            Turn scattered property notes, photos and documents into one organized record, a
            buyer-ready deal sheet and a professional page you can share. Review the facts before
            anything goes live.
          </motion.p>

          <motion.div className="hero-actions" {...rise(0.18)}>
            <Link href="/early-access" className="btn btn-primary">
              Request early access
              <ArrowRight strokeWidth={2.2} />
            </Link>
            <Link href="/how-it-works" className="hero-ghost">
              See how it works
            </Link>
          </motion.div>

          <motion.p className="hero-note" {...rise(0.24)}>
            In development. The example opposite is an illustration of the intended flow, not a live
            account. Every request is read and answered by a person.
          </motion.p>
        </div>

        <div className="hero-proof">
          <motion.div className="proof-today" {...card(-1.4, 0.22)}>
            <div className="proof-thread-head">
              <span className="proof-thread-dot" aria-hidden="true" />
              Forwarded · 09:41
            </div>

            <p className="proof-bubble">
              “4 bed townhouse, 480k, service charge negotiable. Call me — no photos yet.”
            </p>

            <div className="proof-attachments">
              <span className="proof-attach">
                <FileText size={12} strokeWidth={2} />
                brochure-final-FINAL.pdf
              </span>
              <span className="proof-attach">
                <Mic size={12} strokeWidth={2} />
                0:42
              </span>
            </div>
          </motion.div>

          <motion.span className="proof-arrow" aria-hidden="true" {...rise(0.34)}>
            <ArrowDown size={15} strokeWidth={2.6} />
          </motion.span>

          <motion.div className="proof-orrei" {...card(0, 0.3)}>
            <div className="proof-head">
              <span className="proof-label">The page, instead</span>
              <span className="proof-tag">Illustrative · pre-release</span>
            </div>

            <div className="proof-photo-wrap">
              <img src="/images/prop-3.jpg" alt="" className="proof-photo" />
              <span className="proof-photo-chip">
                <MapPin size={11} strokeWidth={2} />
                Harbour district · approximate
              </span>
            </div>

            <div className="proof-body">
              <p className="proof-title">Halden House</p>
              <p className="proof-facts">4 bed · 5 bath · 2,200 sq ft · $480,000 asking</p>

              <div className="proof-sheet">
                <span className="proof-sheet-icon">
                  <FileText size={13} strokeWidth={2} />
                </span>
                <div className="proof-sheet-text">
                  <strong>Deal sheet v3</strong>
                  <span>Facts approved by you · wording edited by you</span>
                </div>
                <span className="proof-sheet-check">
                  <Check size={12} strokeWidth={3} />
                </span>
              </div>

              <div className="proof-page-actions">
                <span className="proof-page-btn is-primary">
                  <Share2 size={12} strokeWidth={2} />
                  Share link
                </span>
                <span className="proof-page-btn">
                  <Copy size={12} strokeWidth={2} />
                  Copy
                </span>

                {!reduce && (
                  <motion.span
                    className="proof-toast"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: [0, 0, 1, 1], y: [4, 4, 0, 0] }}
                    transition={{ duration: 2.6, delay: 1.5, times: [0, 0.15, 0.3, 1], ease: 'easeOut' }}
                  >
                    Link copied
                  </motion.span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
