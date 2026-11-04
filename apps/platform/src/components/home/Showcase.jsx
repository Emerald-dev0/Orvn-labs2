"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeCheck,
  Building2,
  ChartNoAxesColumn,
  Check,
  CircleAlert,
  FileText,
  LayoutGrid,
  Settings2,
  Sparkles,
  Users,
} from 'lucide-react';

const TABS = [
  {
    id: 'record',
    label: 'The record',
    title: 'One property, one set of facts.',
    body: 'Address, price, size, tenure, the agent responsible and where each fact came from. Everything else on the platform reads from this page.',
  },
  {
    id: 'check',
    label: 'Checking',
    title: 'Disagreements get caught, not published.',
    body: 'When a portal, a brochure and a colleague say three different things about the same flat, LAREI shows you the conflict and asks you to settle it.',
  },
  {
    id: 'publish',
    label: 'Publishing',
    title: 'Nothing goes live without your say.',
    body: 'Draft, review, publish. Each output has its own state, so you can send a deal sheet before the public page is ready.',
  },
  {
    id: 'insight',
    label: 'Insight',
    title: 'See what people actually looked at.',
    body: 'Page views, which photographs held attention, how many enquired. No personal data, no tracking pixels, no guesswork.',
  },
];

const NAV = [
  { icon: LayoutGrid, label: 'Overview' },
  { icon: Building2, label: 'Properties' },
  { icon: FileText, label: 'Outputs' },
  { icon: Users, label: 'Clients' },
  { icon: ChartNoAxesColumn, label: 'Insight' },
  { icon: Settings2, label: 'Settings' },
];

function RecordPanel() {
  return (
    <div className="mock-record">
      <div className="mock-prop">
        <img src="/images/interior-1.jpg" alt="" />
        <div>
          <p className="mock-prop-name">Halden House</p>
          <p className="mock-prop-addr">18 Meridian Quay, Harbour district</p>
        </div>
        <span className="mock-status">Live</span>
      </div>

      <div className="mock-facts">
        {[
          ['Asking price', '$480,000', true],
          ['Internal area', '620 m²', true],
          ['Bedrooms', '4', true],
          ['Tenure', 'Certificate of occupancy', true],
          ['Service charge', '$4,200 per year', false],
        ].map(([k, v, ok]) => (
          <div className="mock-fact" key={k}>
            <span className="mock-fact-key">{k}</span>
            <span className="mock-fact-val">{v}</span>
            <span className={`mock-fact-state ${ok ? 'is-ok' : 'is-todo'}`}>
              {ok ? <Check size={11} strokeWidth={3} /> : <CircleAlert size={11} strokeWidth={2.6} />}
              {ok ? 'Verified' : 'Review'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckPanel() {
  return (
    <div className="mock-check">
      <div className="mock-conflict">
        <div className="mock-conflict-head">
          <span className="mock-conflict-icon"><CircleAlert size={14} strokeWidth={2.4} /></span>
          <p>Price does not match the portal</p>
          <span className="mock-time">2h ago</span>
        </div>
        <div className="mock-conflict-rows">
          <div><span>LAREI record</span><strong>$480,000</strong><em>your source</em></div>
          <div><span>Portal import</span><strong>$465,000</strong><em>imported</em></div>
        </div>
        <div className="mock-conflict-actions">
          <span className="mock-btn-dark">Use my figure</span>
          <span className="mock-btn-light">Accept import</span>
        </div>
      </div>

      <div className="mock-conflict is-resolved">
        <div className="mock-conflict-head">
          <span className="mock-conflict-icon is-ok"><BadgeCheck size={14} strokeWidth={2.4} /></span>
          <p>Bedroom count confirmed</p>
          <span className="mock-time">yesterday</span>
        </div>
        <p className="mock-resolved-note">Checked against the survey plan by A. Bello.</p>
      </div>
    </div>
  );
}

function PublishPanel() {
  return (
    <div className="mock-publish">
      {[
        ['Property page', 'larei.page/adaora-house', 'Live', true],
        ['Deal sheet', 'adaora-house-deal.pdf', 'Sent', true],
        ['Buyer summary', 'Shared with 3 buyers', 'Draft', false],
        ['Print sheet', 'A4, print ready', 'Draft', false],
      ].map(([name, meta, state, on]) => (
        <div className="mock-publish-row" key={name}>
          <span className={`mock-toggle ${on ? 'is-on' : ''}`} aria-hidden="true">
            <span />
          </span>
          <div className="mock-publish-text">
            <p>{name}</p>
            <span>{meta}</span>
          </div>
          <span className={`mock-publish-state ${on ? 'is-live' : ''}`}>{state}</span>
        </div>
      ))}
    </div>
  );
}

function InsightPanel() {
  const bars = [42, 66, 54, 82, 71, 96, 63];
  return (
    <div className="mock-insight">
      <div className="mock-insight-top">
        <div>
          <p className="mock-insight-num">1,284</p>
          <span className="mock-insight-label">Property page views, last 7 days</span>
        </div>
        <div>
          <p className="mock-insight-num">37</p>
          <span className="mock-insight-label">Enquiries this month</span>
        </div>
      </div>
      <div className="mock-bars" aria-hidden="true">
        {bars.map((h, i) => (
          <span key={i} style={{ height: `${h}%` }} className={i === 5 ? 'is-peak' : ''} />
        ))}
      </div>
      <p className="mock-insight-note">
        <Sparkles size={13} strokeWidth={2.2} />
        Most people stopped on the kitchen photograph.
      </p>
    </div>
  );
}

const PANELS = {
  record: RecordPanel,
  check: CheckPanel,
  publish: PublishPanel,
  insight: InsightPanel,
};

export default function Showcase() {
  const [tab, setTab] = useState('record');
  const active = TABS.find((t) => t.id === tab);
  const Panel = PANELS[tab];

  return (
    <section className="showcase">
      <div className="shell">
        <div className="showcase-panel on-dark">
          <div className="showcase-head">
            <span className="eyebrow on-dark">AI that works with your facts</span>
            <h2 className="showcase-title">
              Spend less time assembling. Keep control of what gets said.
            </h2>
            <p className="lead">
              Start from notes, documents and photos. LAREI organizes what you supply, flags gaps for
              review and helps draft property descriptions, deal sheets and outreach copy. Your
              approval comes before publication.
            </p>
          </div>

          <div className="showcase-tabs" role="tablist" aria-label="Workspace views">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`showcase-tab ${tab === t.id ? 'is-active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="showcase-body">
            <div className="showcase-copy" aria-live="polite">
              <h3>{active.title}</h3>
              <p>{active.body}</p>
            </div>

            <div className="app-window">
              <div className="app-bar">
                <span className="app-dots" aria-hidden="true">
                  <i /><i /><i />
                </span>
                <span className="app-url">larei.app/properties/adaora-house</span>
              </div>

              <div className="app-shell">
                <aside className="app-side" aria-hidden="true">
                  <span className="app-side-mark" />
                  {NAV.map((n, i) => {
                    const Icon = n.icon;
                    return (
                      <span key={n.label} className={`app-side-item ${i === 1 ? 'is-active' : ''}`}>
                        <Icon size={15} strokeWidth={1.9} />
                      </span>
                    );
                  })}
                </aside>

                <div className="app-main">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Panel />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <p className="showcase-note">
            AI assistance does not independently verify title, valuation, zoning, parcel boundaries
            or buyer economics.
          </p>
        </div>
      </div>
    </section>
  );
}
