'use client';

import Link from 'next/link';
import { Icon } from './icons';

export function PageHead({ title, description, actions, meta }) {
  return (
    <header className="ws-head">
      <div className="ws-head-copy">
        {meta ? <span className="ws-kicker">{meta}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="ws-head-actions">{actions}</div> : null}
    </header>
  );
}

export function Card({ children, className = '', as: Tag = 'section' }) {
  return <Tag className={`ws-card ${className}`}>{children}</Tag>;
}

const STATUS = {
  published: { label: 'Published', tone: 'live' },
  needs_review: { label: 'Needs review', tone: 'warn' },
  draft: { label: 'Draft', tone: 'muted' },
  unpublished: { label: 'Unpublished', tone: 'muted' },
  archived: { label: 'Archived', tone: 'quiet' },
};

export function StatusPill({ status }) {
  const s = STATUS[status] ?? STATUS.draft;
  return (
    <span className={`ws-status is-${s.tone}`}>
      <span className="ws-status-dot" aria-hidden="true" />
      {s.label}
    </span>
  );
}

export function StatCard({ label, value, delta, note, trend = 'flat' }) {
  return (
    <div className="ws-stat">
      <span className="ws-stat-label">{label}</span>
      <div className="ws-stat-row">
        <strong>{value}</strong>
        {delta ? (
          <span className={`ws-delta is-${trend}`}>
            {trend === 'up' ? <Icon name="arrowUp" size={12} strokeWidth={2} /> : null}
            {delta}
          </span>
        ) : null}
      </div>
      {note ? <span className="ws-stat-note">{note}</span> : null}
    </div>
  );
}

export function EmptyState({ icon = 'properties', title, body, action, secondary, compact = false }) {
  return (
    <div className={`ws-empty ${compact ? 'is-compact' : ''}`}>
      <span className="ws-empty-icon">
        <Icon name={icon} size={26} strokeWidth={1.5} />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      {action || secondary ? (
        <div className="ws-empty-actions">
          {action ? (
            <Link href={action.href} className="ws-btn is-lime">
              {action.label}
              <Icon name="arrowRight" size={15} strokeWidth={2} />
            </Link>
          ) : null}
          {secondary ? (
            <Link href={secondary.href} className="ws-btn is-quiet">
              {secondary.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="ws-tabs" role="tablist" aria-label="Property sections">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          className={`ws-tab ${value === t.id ? 'is-active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {t.count ? <span className="ws-tab-count">{t.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

const FACT_STATE = {
  approved: { label: 'Approved', tone: 'ok' },
  unreviewed: { label: 'Unreviewed', tone: 'warn' },
  rejected: { label: 'Rejected', tone: 'neg' },
  unknown: { label: 'Unknown', tone: 'muted' },
};

export function FactRow({ fact }) {
  const state = FACT_STATE[fact.state] ?? FACT_STATE.unreviewed;
  return (
    <div className="ws-fact">
      <div className="ws-fact-key">
        <span>{fact.key}</span>
        {fact.public ? <span className="ws-fact-public">public</span> : null}
      </div>
      <div className="ws-fact-value">{fact.value || <em>Not supplied</em>}</div>
      <div className="ws-fact-source">{fact.source}</div>
      <div className={`ws-fact-state is-${state.tone}`}>{state.label}</div>
    </div>
  );
}

export function Avatar({ initials, size = 34 }) {
  return (
    <span className="ws-avatar" style={{ width: size, height: size, fontSize: size / 2.9 }}>
      {initials}
    </span>
  );
}

export function Divider() {
  return <div className="ws-divider" role="presentation" />;
}
