'use client';

import Link from 'next/link';
import { Icon } from '../icons';
import { PageHead, Card, StatCard, EmptyState } from '../ui';
import { weeklyViews, topProperties, stats } from '../data';

export default function Analytics({ empty = false }) {
  if (empty) {
    return (
      <>
        <PageHead
          title="Analytics"
          description="What was viewed, what was clicked, and what prompted a reply."
        />
        <EmptyState
          icon="analytics"
          title="No traffic to count yet"
          body="Analytics begin the day a property page is published. We count page views separately from inquiries, and we never identify an anonymous visitor."
          action={{ href: '/properties', label: 'Open properties' }}
          secondary={{ href: '/website', label: 'Publish your site' }}
        />
      </>
    );
  }

  const max = Math.max(...weeklyViews.map((d) => Math.max(d.site, d.property)));

  return (
    <>
      <PageHead
        title="Analytics"
        description="Last 30 days. Views are impressions, not people, and bots are filtered."
        actions={
          <button type="button" className="ws-btn is-quiet" disabled>
            <Icon name="download" size={15} />
            Export
          </button>
        }
      />

      <div className="ws-grid is-4" style={{ marginBottom: 14 }}>
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="ws-split">
        <Card>
          <div className="ws-section-head">
            <h2>Views this week</h2>
            <div className="ws-legend">
              <span><i style={{ background: 'var(--pine)' }} /> Property pages</span>
              <span><i style={{ background: 'var(--lime-2)' }} /> Site</span>
            </div>
          </div>

          <div className="ws-chart">
            {weeklyViews.map((d) => (
              <div className="ws-chart-col" key={d.day}>
                <div className="ws-chart-bars">
                  <div
                    className="ws-chart-bar is-primary"
                    style={{ height: `${(d.property / max) * 100}%` }}
                    title={`${d.property} property views`}
                  />
                  <div
                    className="ws-chart-bar is-accent"
                    style={{ height: `${(d.site / max) * 100}%` }}
                    title={`${d.site} site views`}
                  />
                </div>
                <span className="ws-chart-day">{d.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="ws-section-head">
            <h2>Where it came from</h2>
          </div>
          <div className="ws-stack" style={{ gap: 10 }}>
            {[
              ['Shared link', 62],
              ['Direct', 24],
              ['Social', 9],
              ['Unknown', 5],
            ].map(([label, pct]) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                  <span>{label}</span>
                  <span className="ws-muted">{pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bone-2)', borderRadius: 999 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--pine)', borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
          <p className="ws-small ws-muted" style={{ marginTop: 14 }}>
            Only the referrer is recorded. No fingerprinting, no cross-site identifiers.
          </p>
        </Card>
      </div>

      <Card style={{ marginTop: 12 }}>
        <div className="ws-section-head">
          <h2>By property</h2>
          <Link href="/properties">All properties</Link>
        </div>
        <div className="ws-facts">
          {topProperties.map((p) => (
            <div className="ws-fact" key={p.id} style={{ gridTemplateColumns: 'minmax(0,1fr) 90px 90px 80px' }}>
              <span className="ws-fact-key">{p.title}</span>
              <span className="ws-fact-value">{p.views}</span>
              <span className="ws-fact-source">{p.inquiries} inquiries</span>
              <span className="ws-fact-state is-ok">{p.rate}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
