import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Download, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChapterHead from '../site/ChapterHead';
import { Reveal } from '../site/Reveal';
import { Mark } from '../site/Logo';

const OUTPUTS = [
  ['01', 'Property page', 'Shareable URL'],
  ['02', 'Deal sheet', 'A4 · PDF'],
  ['03', 'Buyer summary', 'Plain text'],
  ['04', 'Print sheet', 'A4 · PDF'],
];

export default function Sheet() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [3.2, 0, -2.4]);
  const yShift = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section className="section-y sheet-section" id="outputs" ref={ref}>
      <div className="shell">
        <ChapterHead
          index="05 / Outputs"
          label="The same facts, properly printed"
          title={['Write it once.', <>Then <span className="em">publish it four ways.</span></>]}
          note="A page for the buyer who is browsing, a sheet for the one who wants the numbers, and a summary for the one who only reads WhatsApp."
        />

        <div className="sheet-grid">
          <div>
            <Reveal>
              <p className="lead">
                Every output is generated from the record you already checked. Update the approved
                price and the page, the sheet and the summary agree — without a second pass in a
                design tool at eleven at night.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <ul className="output-list">
                {OUTPUTS.map(([n, t, s]) => (
                  <li key={n}>
                    <span className="on">{n}</span>
                    <span className="ot">{t}</span>
                    <span className="os">{s}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 28, flexWrap: 'wrap' }}>
                <Link to="/early-access" className="btn-primary">
                  <Download size={15} strokeWidth={1.6} />
                  See a sample deal sheet
                </Link>
                <Link to="/product" className="arrow-link">
                  All outputs
                  <ArrowRight size={15} strokeWidth={1.6} />
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="doc-stage">
            <motion.div style={{ rotate, y: yShift, width: '100%', display: 'grid', placeItems: 'center' }}>
              <article className="doc">
                <div className="doc-head">
                  <div>
                    <div className="doc-title">Adeola Court</div>
                    <div className="doc-sub">Ikoyi, Lagos · 4-bed detached</div>
                  </div>
                  <Mark size={26} color="var(--ink)" />
                </div>

                <div className="doc-photo">
                  <img src="/images/prop-5.jpg" alt="" loading="lazy" />
                </div>

                <div className="doc-facts">
                  <div>
                    <span>Price</span>
                    <b>₦685m</b>
                  </div>
                  <div>
                    <span>Built</span>
                    <b>420 m²</b>
                  </div>
                  <div>
                    <span>Tenure</span>
                    <b>Freehold</b>
                  </div>
                </div>

                <p className="doc-note">
                  Detached four-bedroom residence with covered parking, a service wing and a
                  private garden. Documents available to qualified buyers on request.
                </p>

                <div className="doc-facts" style={{ borderBottom: 'none', borderTop: '1px solid var(--line)' }}>
                  <div>
                    <span>Beds</span>
                    <b>4</b>
                  </div>
                  <div>
                    <span>Baths</span>
                    <b>5</b>
                  </div>
                  <div>
                    <span>Sources</span>
                    <b>3</b>
                  </div>
                </div>

                <div className="doc-foot">
                  <span className="label-mono" style={{ fontSize: 7.5 }}>
                    LAREI · Deal sheet 07/11/26
                  </span>
                  <span className="doc-stamp">Facts approved</span>
                </div>
              </article>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
