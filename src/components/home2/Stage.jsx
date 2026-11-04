import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, ArrowUpRight, FileText, Lock } from 'lucide-react';
import ChapterHead from '../site/ChapterHead';
import { Mark } from '../site/Logo';

const TABS = [
  {
    n: '01',
    t: 'Identity',
    d: 'Your profile, markets, services and the voice you want to be read in.',
  },
  {
    n: '02',
    t: 'Property record',
    d: 'Facts, sources, photographs and the conflicts worth resolving.',
  },
  {
    n: '03',
    t: 'Deal sheet',
    d: 'A print-ready summary generated from the same approved facts.',
  },
  {
    n: '04',
    t: 'Insight',
    d: 'What was viewed, clicked and inquired — and nothing more.',
  },
];

function MockChrome({ crumb, status = 'Draft', children }) {
  return (
    <div className="mock">
      <div className="mock-top">
        <div className="mock-top-left">
          <span className="mock-brand">
            <Mark size={13} color="var(--ink)" />
            LAREI
          </span>
          <span className="mock-crumb">{crumb}</span>
        </div>
        <span className={`mock-pill ${status === 'Published' ? 'live' : ''}`}>{status}</span>
      </div>
      {children}
    </div>
  );
}

function SideNav({ active }) {
  const items = ['Overview', 'Identity', 'Portfolio', 'Records', 'Pages', 'Insights', 'Settings'];
  return (
    <div className="mock-side">
      <span className="mock-label" style={{ marginBottom: 8 }}>
        Workspace
      </span>
      {items.map((i) => (
        <span key={i} className={`mock-side-item ${i === active ? 'is-on' : ''}`}>
          <i />
          {i}
        </span>
      ))}
      <div style={{ marginTop: 'auto', paddingTop: 18 }}>
        <span className="mock-label">Plan</span>
        <div style={{ fontSize: 10.5, marginTop: 4, color: 'var(--ink-mid)' }}>Private beta</div>
      </div>
    </div>
  );
}

function IdentityMock() {
  return (
    <MockChrome crumb="Workspace / Identity" status="Published">
      <div className="mock-body mock-split">
        <SideNav active="Identity" />
        <div className="mock-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="mock-avatar">AO</span>
            <div>
              <div className="mock-h">Adaeze Okonkwo</div>
              <div className="mock-label" style={{ marginTop: 3 }}>
                Associate broker · Lagos mainland
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="mock-field">
              <span>Markets</span>
              <b>Ikoyi · Lekki · Yaba</b>
            </div>
            <div className="mock-field">
              <span>Services</span>
              <b>Sales · Lettings · Advisory</b>
            </div>
            <div className="mock-field">
              <span>Voice</span>
              <b>Direct, factual, unfussy</b>
            </div>
            <div className="mock-field">
              <span>Contact</span>
              <b>adaeze@okonkwo.estate</b>
            </div>
            <div className="mock-field">
              <span>Public sections</span>
              <b style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Check size={11} color="var(--ok)" strokeWidth={2.4} /> Approved
              </b>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              border: '1px dashed rgba(18,18,15,0.22)',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <div>
              <div className="mock-label">Public profile</div>
              <div style={{ fontSize: 11.5, marginTop: 2 }}>larei.page/adaeze-okonkwo</div>
            </div>
            <span className="mock-pill live">live</span>
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

function RecordMock() {
  return (
    <MockChrome crumb="Workspace / Records / Adeola Court" status="Draft">
      <div className="mock-body mock-split">
        <SideNav active="Records" />
        <div className="mock-main">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div className="mock-h">Adeola Court, Ikoyi</div>
              <div className="mock-label" style={{ marginTop: 3 }}>
                12 fields · 3 sources · 1 conflict
              </div>
            </div>
            <span className="mock-pill">Review</span>
          </div>

          <div style={{ marginTop: 14 }}>
            <div className="mock-field">
              <span>Tenure</span>
              <b>Freehold</b>
            </div>
            <div className="mock-field">
              <span>Built area</span>
              <b>420 m²</b>
            </div>
            <div className="mock-field">
              <span>Bedrooms / baths</span>
              <b>4 / 5</b>
            </div>
            <div className="mock-field" style={{ alignItems: 'flex-start' }}>
              <span>Price</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--warn)', textAlign: 'right' }}>
                <AlertTriangle size={11} strokeWidth={2} />
                ₦685m vs ₦720m
              </span>
            </div>
            <div className="mock-field">
              <span>Documents</span>
              <b style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Lock size={10} strokeWidth={2} /> 6 private
              </b>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              background: 'rgba(168,113,43,0.08)',
              border: '1px solid rgba(168,113,43,0.28)',
              padding: '9px 11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 10.5, color: 'var(--ink-mid)' }}>
              Two sources disagree on price. Choose the approved figure.
            </span>
            <span className="mock-pill">Resolve</span>
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

function SheetMock() {
  return (
    <MockChrome crumb="Workspace / Records / Outputs" status="Published">
      <div className="mock-body mock-split">
        <SideNav active="Records" />
        <div className="mock-main" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <span className="mock-label">Outputs from one record</span>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                ['Property page', 'Live'],
                ['Deal sheet', 'A4 · PDF'],
                ['Share summary', 'Text'],
                ['Print sheet', 'A4 · PDF'],
              ].map(([name, meta], i) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(18,18,15,0.12)',
                    padding: '7px 9px',
                    background: i === 1 ? 'rgba(18,18,15,0.04)' : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={10} strokeWidth={1.8} />
                    {name}
                  </span>
                  <span className="mock-label">{meta}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 5 }}>
              <span className="mock-pill" style={{ background: 'var(--ink)', color: 'var(--paper)', borderColor: 'var(--ink)' }}>
                Generate
              </span>
              <span className="mock-pill">Preview</span>
            </div>
          </div>

          <div className="mock-doc">
            <div className="mock-doc-head">
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, lineHeight: 1 }}>Adeola Court</div>
                <div className="mock-label" style={{ marginTop: 4 }}>
                  Deal sheet · 07 Nov 2026
                </div>
              </div>
              <Mark size={14} color="var(--ink)" />
            </div>
            <div className="mock-line w85" />
            <div className="mock-line w70" />
            <div className="mock-line w50" />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 6,
                margin: '10px 0',
                borderTop: '1px solid rgba(18,18,15,0.12)',
                borderBottom: '1px solid rgba(18,18,15,0.12)',
                padding: '8px 0',
              }}
            >
              {[
                ['Beds', '4'],
                ['m²', '420'],
                ['Tenure', 'Freehold'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="mock-label" style={{ fontSize: 6.5 }}>
                    {k}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="mock-line w85" />
            <div className="mock-line w70" />
            <div className="mock-line w50" />
            <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(18,18,15,0.12)' }}>
              <div className="mock-label" style={{ fontSize: 6.5 }}>
                Approved facts only · 3 sources
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

function InsightMock() {
  const bars = [34, 52, 41, 63, 78, 46, 88, 61, 72, 55, 91, 68, 84, 59];
  return (
    <MockChrome crumb="Workspace / Insights" status="Published">
      <div className="mock-body mock-split">
        <SideNav active="Insights" />
        <div className="mock-main">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div className="mock-h">Engagement</div>
              <div className="mock-label" style={{ marginTop: 3 }}>
                Last 14 days · larei.page/adeola-court
              </div>
            </div>
            <span className="mock-pill">Observable only</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
            {[
              ['Page views', '214'],
              ['Link clicks', '38'],
              ['Inquiries', '6'],
            ].map(([k, v]) => (
              <div key={k} style={{ border: '1px solid rgba(18,18,15,0.12)', padding: '9px 10px' }}>
                <div className="mock-label">{k}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, marginTop: 3 }}>{v}</div>
              </div>
            ))}
          </div>

          <div className="mock-chart">
            {bars.map((h, i) => (
              <span key={i} className={`mock-bar ${i === 10 ? 'is-hot' : ''}`} style={{ height: `${h}%` }} />
            ))}
          </div>

          <div
            style={{
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              borderTop: '1px solid rgba(18,18,15,0.12)',
              paddingTop: 9,
            }}
          >
            <span className="mock-label">Anonymous visitors are not identified.</span>
            <span style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--ember-ink)' }}>
              Export <ArrowUpRight size={10} />
            </span>
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

const MOCKS = [IdentityMock, RecordMock, SheetMock, InsightMock];

export default function Stage() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % TABS.length), 7000);
    return () => clearTimeout(t);
  }, [active, paused]);

  const Mock = MOCKS[active];

  return (
    <section
      className="stage"
      id="workspace"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="shell" style={{ position: 'relative', zIndex: 1 }}>
        <div className="stage-head">
          <div>
            <div className="chapter-head on-dark" style={{ marginBottom: 0 }}>
              <div className="chapter-meta">
                <span className="chapter-index">
                  <i className="tick" style={{ background: 'var(--ember-bright)' }} />
                  02 / The workspace
                </span>
                <span className="chapter-label">One record, four surfaces</span>
              </div>
              <h2 className="chapter-title on-dark" style={{ marginTop: 'clamp(16px,2vw,26px)' }}>
                Built around the property,
                <br />
                <span className="em" style={{ color: 'var(--ember-bright)' }}>not the page builder.</span>
              </h2>
            </div>
          </div>
          <p className="chapter-lede" style={{ color: 'rgba(239,234,225,0.55)', justifySelf: 'end' }}>
            The record is the product. Pages, sheets and summaries are what it produces — so the
            tenth output costs you nothing but a click.
          </p>
        </div>

        <div className="stage-grid">
          <div className="stage-tabs" role="tablist" aria-label="Workspace surfaces">
            {TABS.map((tab, i) => (
              <button
                key={tab.n}
                type="button"
                role="tab"
                aria-selected={active === i}
                className={`stage-tab ${active === i ? 'is-active' : ''}`}
                onClick={() => setActive(i)}
              >
                <span className="n">{tab.n}</span>
                <span>
                  <span className="t">{tab.t}</span>
                  <span className="d">{tab.d}</span>
                </span>
              </button>
            ))}
            <div style={{ marginTop: 22 }} className="hide-mobile">
              <span className="label-mono" style={{ color: 'rgba(239,234,225,0.34)' }}>
                {paused ? 'Paused' : 'Auto-advancing'} · 0{active + 1} / 04
              </span>
            </div>
          </div>

          <div className="stage-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Mock />
              </motion.div>
            </AnimatePresence>

            <div className="stage-caption">
              <span>Fig. 0{active + 2} — {TABS[active].t}</span>
              <span>Illustrative interface</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
