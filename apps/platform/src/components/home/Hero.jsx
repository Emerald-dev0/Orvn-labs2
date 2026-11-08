"use client";

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, Check, Copy, FileText, MapPin, Mic, Share2 } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1];

/**
 * The hero.
 *
 * One claim and one piece of evidence. The claim is the reason someone keeps reading — what they
 * send today is a forwarded PDF and a voice note. The evidence is the same property after ORREI:
 * a record, a deal sheet, a page with a share link.
 *
 * The left column is deliberately loud (pine ground, oversized display type, one lime stroke) and
 * the right column is deliberately quiet (two cards, side by side in time). Everything in the
 * cards is illustrative; the tag says so, and no figure here is a customer result.
 */
export default function Hero() {
  const reduce = useReducedMotion();

  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.85, delay, ease: EASE },
        };

  const tilt = (rotate, delay) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18, rotate: rotate * 2.4 },
          animate: { opacity: 1, y: 0, rotate },
          transition: { duration: 0.95, delay, ease: EASE },
        };

  return (
    <section className="hero">
      <div className="hero-glow" aria-hidden="true" />

      <div className="shell hero-grid">
        <div className="hero-copy">
          <motion.p className="hero-kicker" {...rise(0)}>
            <span className="hero-kicker-dot" aria-hidden="true" />
            Early access · ORREI by ORVN Labs
          </motion.p>

          <motion.h1 className="hero-title" {...rise(0.06)}>
            A property deserves better than a <em>forwarded PDF</em>.
          </motion.h1>

          <motion.p className="hero-sub" {...rise(0.14)}>
            Organise the record, prepare an editable deal sheet, and publish a professional page
            that hangs off your profile — so the first thing a buyer sees is the property at its
            best, not a file named final.
          </motion.p>

          <motion.div className="hero-actions" {...rise(0.2)}>
            <Link href="/early-access" className="btn btn-primary">
              Request early access
              <ArrowRight strokeWidth={2.2} />
            </Link>
            <Link href="/how-it-works" className="hero-ghost">
              See how it works
            </Link>
          </motion.div>

          <motion.p className="hero-note" {...rise(0.26)}>
            In development. The example opposite is an illustration of the intended flow, not a live
            account. Every request is read and answered by a person.
          </motion.p>
        </div>

        <div className="hero-proof">
          <motion.div className="proof-card proof-today" {...tilt(-1.2, 0.2)}>
            <span className="proof-label">What goes out today</span>
            <p className="proof-note">
              “4 bed in Lekki, 480k, service charge negotiable. Call me — no photos yet.”
            </p>
            <div className="proof-attachments">
              <span className="proof-attach">
                <FileText size={12} strokeWidth={2} />
                brochure-final-FINAL.pdf
              </span>
              <span className="proof-attach">
                <Mic size={12} strokeWidth={2} />
                voice note · 0:42
              </span>
            </div>
          </motion.div>

          <motion.span className="proof-arrow" aria-hidden="true" {...rise(0.34)}>
            <ArrowDown size={15} strokeWidth={2.6} />
          </motion.span>

          <motion.div className="proof-card proof-orrei" {...tilt(0, 0.28)}>
            <div className="proof-head">
              <span className="proof-label is-dark">What ORREI sends</span>
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
              <p className="proof-facts">4 bed · 5 bath · 620 m² · $480,000 asking</p>

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
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
