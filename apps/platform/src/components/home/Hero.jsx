"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Copy, FileText, MapPin, Share2 } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1];

/**
 * The hero.
 *
 * The evidence is the product flow, not the property photograph: a record being assembled with
 * sources attached, the deal sheet it produces, and the page that goes out with a share link.
 * Property imagery appears once, inside the page panel, as context.
 *
 * Everything in the stage is illustrative. The tag says so, and no figure here is presented as a
 * customer result.
 */
export default function Hero() {
  return (
    <section className="flow-hero">
      <div className="shell flow-hero-grid">
        <motion.div
          className="flow-hero-copy"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <p className="flow-kicker">Property presentations · Early access</p>

          <h1 className="flow-title">
            Turn property details into presentations you can share.
          </h1>

          <p className="flow-sub">
            Organise a property, prepare an editable deal sheet, and publish a professional page
            linked to your profile.
          </p>

          <div className="flow-actions">
            <Link href="/early-access" className="btn btn-primary">
              Request early access
              <ArrowRight strokeWidth={2.2} />
            </Link>
            <Link href="/how-it-works" className="btn btn-secondary">
              See how it works
            </Link>
          </div>

          <p className="flow-note">
            In development. The screens below are illustrations of the intended flow, not a live
            account. Requests are read and answered by a person.
          </p>
        </motion.div>

        <motion.div
          className="flow-stage"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: EASE }}
        >
          <div className="flow-stage-head">
            <span className="flow-stage-title">One property, start to share</span>
            <span className="flow-stage-tag">Illustrative · pre-release</span>
          </div>

          <ol className="flow-list">
            <li className="flow-panel">
              <span className="flow-panel-num">01</span>
              <div className="flow-panel-body">
                <div className="flow-panel-head">
                  <p className="flow-panel-title">Add the property</p>
                  <span className="flow-panel-meta">Record</span>
                </div>

                <div className="flow-fact">
                  <span>Halden House, 4 bed · 5 bath · 620 m²</span>
                  <em>from your notes</em>
                </div>
                <div className="flow-fact">
                  <span>$480,000 asking</span>
                  <em>from the brochure</em>
                </div>
                <div className="flow-fact is-gap">
                  <span>Service charge</span>
                  <em>missing, flagged</em>
                </div>
              </div>
            </li>

            <li className="flow-panel">
              <span className="flow-panel-num">02</span>
              <div className="flow-panel-body">
                <div className="flow-panel-head">
                  <p className="flow-panel-title">Prepare the deal sheet</p>
                  <span className="flow-panel-meta">v3 · editable</span>
                </div>

                <div className="flow-sheet">
                  <span className="flow-sheet-icon">
                    <FileText size={14} strokeWidth={2} />
                  </span>
                  <div>
                    <p>Halden House — deal sheet</p>
                    <span>Facts approved by you · wording edited by you</span>
                  </div>
                  <span className="flow-sheet-check">
                    <Check size={12} strokeWidth={3} />
                  </span>
                </div>
              </div>
            </li>

            <li className="flow-panel is-last">
              <span className="flow-panel-num">03</span>
              <div className="flow-panel-body">
                <div className="flow-panel-head">
                  <p className="flow-panel-title">Publish the property page</p>
                  <span className="flow-panel-meta">Link ready</span>
                </div>

                <div className="flow-page">
                  <img src="/images/prop-3.jpg" alt="" className="flow-page-thumb" />
                  <div className="flow-page-info">
                    <p>Halden House</p>
                    <span>
                      <MapPin size={11} strokeWidth={2} /> Harbour district · approximate
                    </span>
                  </div>
                </div>

                <div className="flow-page-actions">
                  <span className="flow-page-btn is-primary">
                    <Share2 size={12} strokeWidth={2} /> Share link
                  </span>
                  <span className="flow-page-btn">
                    <Copy size={12} strokeWidth={2} /> Copy
                  </span>
                </div>
              </div>
            </li>
          </ol>
        </motion.div>
      </div>
    </section>
  );
}
