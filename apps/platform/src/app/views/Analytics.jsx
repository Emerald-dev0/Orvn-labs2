'use client';

import Link from 'next/link';
import { Icon } from '../icons';
import { PageHead, Card, StatCard, EmptyState } from '../ui';
import { weeklyViews, topProperties, stats as sampleStats } from '../data';

function PageHeadBlock({ action }) {
  return (
    <PageHead
      title="Analytics"
      description="Page opens and inquiry counts, with their limits stated plainly."
      actions={action}
    />
  );
}

function csvCell(value) {
  let text = String(value ?? '');
  // A leading =, +, - or @ is a formula to a spreadsheet; a title may legitimately start one.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** Builds a CSV of the live numbers the person is already looking at. No server, no PII. */
function ExportButton({ data }) {
  if (!data) {
    return null;
  }
  const { totals, byProperty, sources } = data;
  const rows = [
    ['metric', 'value'],
    ['page opens (30 days)', totals.views],
    ['inquiries (30 days)', totals.inquiries],
    ['deal sheet opens (30 days)', totals.sheetOpens ?? 0],
    ['published properties', totals.published],
    [],
    ['property', 'page opens', 'inquiries', 'conversion rate'],
    ...byProperty.map((row) => [row.title, row.views, row.inquiries, row.rate]),
    [],
    ['referrer', 'percent'],
    ...sources.map((row) => [row.label, row.percent]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  return (
    <a href={href} download="orrei-analytics.csv" className="ws-btn is-quiet">
      <Icon name="download" size={15} />
      Export
    </a>
  );
}

/** Sample preview, only in a preview build with no database. Clearly labelled, never in a real account. */
function SampleAnalytics() {
  const max = Math.max(...weeklyViews.map((d) => d.property));
  return (
    <>
      <PageHeadBlock action={null} />
      <p className="ws-small ws-muted" style={{ marginBottom: 12 }}>
        <span className="ws-mono-note">Sample data</span> — no database is connected in this preview,
        so these are illustrative numbers. They are not shown in a real account.
      </p>
      <div className="ws-grid is-3" style={{ marginBottom: 14 }}>
        {sampleStats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
      <Card>
        <div className="ws-section-head">
          <h2>Page opens this week</h2>
        </div>
        <div className="ws-chart">
          {weeklyViews.map((d) => (
            <div className="ws-chart-col" key={d.day}>
              <div className="ws-chart-bars">
                <div
                  className="ws-chart-bar is-primary"
                  style={{ height: `${(d.property / max) * 100}%` }}
                  title={`${d.property} property page opens`}
                />
              </div>
              <span className="ws-chart-day">{d.day}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{ marginTop: 12 }}>
        <div className="ws-section-head">
          <h2>By property</h2>
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

export default function Analytics({ empty = false, data = null, sample = false }) {
  if (empty) {
    return (
      <>
        <PageHead
          title="Analytics"
          description="Page opens and inquiry counts, with their limits stated plainly."
        />
        <EmptyState
          icon="analytics"
          title="No traffic to count yet"
          body="Analytics begin the day a property page is published. We count page opens separately from inquiries, and we never identify an anonymous visitor. A new workspace shows zero, not pretend numbers."
          action={{ href: '/properties', label: 'Open properties' }}
          secondary={{ href: '/website', label: 'Publish your site' }}
        />
      </>
    );
  }

  if (sample || !data) {
    return <SampleAnalytics />;
  }

  const { totals, series, byProperty, sources } = data;
  const exportData = { totals, byProperty, sources };
  const max = Math.max(1, ...series.map((d) => d.property));
  const statCards = [
    { label: 'Page opens', value: totals.views.toLocaleString('en-GB'), delta: '', trend: 'flat', note: 'last 30 days' },
    { label: 'Inquiries', value: String(totals.inquiries), delta: '', trend: 'flat', note: 'last 30 days' },
    { label: 'Deal sheet opens', value: String(totals.sheetOpens ?? 0), delta: '', trend: 'flat', note: 'print-ready sheet, last 30 days' },
    { label: 'Published', value: String(totals.published), delta: '', trend: 'flat', note: 'properties live' },
  ];

  return (
    <>
      <PageHeadBlock action={<ExportButton data={exportData} />} />
      <p className="ws-small ws-muted" style={{ marginBottom: 12 }}>
        Counts come from real events. Page opens are not verified buyers, and interest is not proof of purchase.
      </p>

      <div className="ws-grid is-3" style={{ marginBottom: 14 }}>
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="ws-split">
        <Card>
          <div className="ws-section-head">
            <h2>Page opens this week</h2>
          </div>
          <div className="ws-chart">
            {series.map((d) => (
              <div className="ws-chart-col" key={d.day}>
                <div className="ws-chart-bars">
                  <div
                    className="ws-chart-bar is-primary"
                    style={{ height: `${(d.property / max) * 100}%` }}
                    title={`${d.property} property page opens`}
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
            {sources.map(({ label, percent }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                  <span>{label}</span>
                  <span className="ws-muted">{percent}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bone-2)', borderRadius: 999 }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: 'var(--pine)', borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
          <p className="ws-small ws-muted" style={{ marginTop: 14 }}>
            Only the coarse referrer is recorded, where lawful. No fingerprinting, no cross-site identifiers, no IP stored.
          </p>
        </Card>
      </div>

      <Card style={{ marginTop: 12 }}>
        <div className="ws-section-head">
          <h2>By property</h2>
          <Link href="/properties">All properties</Link>
        </div>
        {byProperty.length === 0 ? (
          <p className="ws-small ws-muted">No published properties yet.</p>
        ) : (
          <div className="ws-facts">
            {byProperty.map((p) => (
              <div className="ws-fact" key={p.id} style={{ gridTemplateColumns: 'minmax(0,1fr) 90px 90px 80px' }}>
                <span className="ws-fact-key">{p.title}</span>
                <span className="ws-fact-value">{p.views}</span>
                <span className="ws-fact-source">{p.inquiries} inquiries</span>
                <span className="ws-fact-state is-ok">{p.rate}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
