"use client";

import React from 'react';
import { ArrowRight, Check, Copy, Eye, Sparkles } from 'lucide-react';

/** Professional website editor, as described in the hero composition. */
export function SiteEditorMock() {
  return (
    <div className="mock-frame">
      <div className="app-window">
        <div className="app-bar">
          <span className="app-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="app-url">larei.app/my-website</span>
        </div>
        <div className="app-main">
          <div className="site-editor-head">
            <div>
              <p className="site-editor-title">My Website</p>
              <span className="site-editor-status">Draft</span>
            </div>
            <div className="site-editor-actions">
              <span className="site-editor-btn"><Eye size={12} strokeWidth={2} /> Preview</span>
              <span className="site-editor-btn is-primary">Publish site</span>
            </div>
          </div>

          <div className="site-editor-profile">
            <span className="hero-site-avatar">AP</span>
            <div>
              <p className="site-editor-name">Northaven Property Group</p>
              <p className="site-editor-meta">Wholesaler · 6-person team · 3 properties</p>
            </div>
          </div>

          <div className="site-editor-grid">
            {[
              ['/images/prop-3.jpg', 'Halden House', '$480,000'],
              ['/images/prop-4.jpg', 'Elm Court', '$320,000'],
              ['/images/prop-2.jpg', 'Kestrel Row', '$210,000'],
            ].map(([src, name, price]) => (
              <div className="site-editor-card" key={name}>
                <img src={src} alt="" />
                <div>
                  <p>{name}</p>
                  <span>{price}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="site-editor-foot">
            <span className="site-editor-link"><Copy size={12} strokeWidth={2} /> Copy public link</span>
            <span className="site-editor-note">3 properties in portfolio</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Brand voice and approved context. */
export function VoiceMock() {
  return (
    <div className="mock-frame">
      <div className="voice-card">
        <div className="voice-head">
          <span className="voice-icon"><Sparkles size={16} strokeWidth={2} /></span>
          <div>
            <p className="voice-title">Brand voice</p>
            <span className="voice-sub">Approved context, editable any time</span>
          </div>
        </div>

        <div className="voice-chips">
          <span className="voice-chip is-on">Precise</span>
          <span className="voice-chip">Conversational</span>
          <span className="voice-chip">Formal</span>
        </div>

        <div className="voice-row">
          <span>Audience</span>
          <strong>Buyers and agents in your market</strong>
        </div>
        <div className="voice-row">
          <span>Terms to use</span>
          <strong>detached, serviced, C of O</strong>
        </div>
        <div className="voice-row">
          <span>Terms to avoid</span>
          <strong>guaranteed, best in market</strong>
        </div>

        <div className="voice-sample">
          <p>
            “A four-bedroom detached house in the Harbour district, 620 m² internally, with title
            documents on file and a service charge confirmed by the developer.”
          </p>
          <span><Check size={12} strokeWidth={3} /> Used in this draft</span>
        </div>
      </div>
    </div>
  );
}

/** Observable activity, including the approved caption. */
export function StatsMock() {
  const bars = [44, 68, 52, 80, 70, 94, 61];
  return (
    <div className="mock-frame">
      <div className="app-window">
        <div className="app-bar">
          <span className="app-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="app-url">larei.app/analytics</span>
        </div>
        <div className="app-main">
          <div className="mock-insight-top">
            <div>
              <p className="mock-insight-num">1,284</p>
              <span className="mock-insight-label">Page views, last 7 days</span>
            </div>
            <div>
              <p className="mock-insight-num">37</p>
              <span className="mock-insight-label">Inquiries this month</span>
            </div>
          </div>
          <div className="mock-bars" aria-hidden="true">
            {bars.map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} className={i === 5 ? 'is-peak' : ''} />
            ))}
          </div>
          <div className="mock-facts" style={{ marginTop: 14 }}>
            {[
              ['Portfolio card clicked', '118 times'],
              ['Deal sheet downloaded', '24 times'],
              ['Property page shared', '9 times'],
            ].map(([k, v]) => (
              <div className="mock-fact" key={k}>
                <span className="mock-fact-key">{k}</span>
                <span className="mock-fact-val">{v}</span>
              </div>
            ))}
          </div>
          <p className="mock-insight-foot">
            <ArrowRight size={12} strokeWidth={2.4} />
            Views are not verified buyers; inquiries identify only what the visitor voluntarily
            submits.
          </p>
        </div>
      </div>
    </div>
  );
}
