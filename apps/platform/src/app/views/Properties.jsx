'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '../icons';
import { PageHead, StatusPill, EmptyState } from '../ui';
import { properties } from '../data';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'needs_review', label: 'Needs review' },
  { id: 'published', label: 'Published' },
  { id: 'archived', label: 'Archived' },
];

export default function Properties({ empty = false }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    if (empty) return [];
    return properties.filter((p) => {
      const matchesFilter = filter === 'all' || p.status === filter;
      const matchesQuery =
        !query || `${p.title} ${p.place}`.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [empty, filter, query]);

  return (
    <>
      <PageHead
        title="Properties"
        description="One record per property. Every page, sheet and printout is generated from it."
        actions={
          <Link href="/properties/new" className="ws-btn is-lime">
            <Icon name="add" size={16} strokeWidth={2.2} />
            Create property
          </Link>
        }
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div className="ws-tabs" style={{ background: 'transparent', padding: 0, gap: 6 }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`ws-tab ${filter === f.id ? 'is-active' : ''}`}
              onClick={() => setFilter(f.id)}
              style={{
                border: '1px solid var(--line)',
                background: filter === f.id ? 'var(--white)' : 'transparent',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <label className="ws-search" style={{ marginLeft: 'auto', height: 38, maxWidth: 280 }}>
          <Icon name="search" size={16} strokeWidth={1.8} />
          <input
            placeholder="Search properties"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search properties"
          />
        </label>
      </div>

      {rows.length === 0 ? (
        empty ? (
          <EmptyState
            icon="properties"
            title="No properties yet"
            body="Create your first record from notes, a brochure or a listing you already have. It stays private until you publish it."
            action={{ href: '/properties/new', label: 'Create a property' }}
            secondary={{ href: '/how-it-works', label: 'How records work' }}
          />
        ) : (
          <EmptyState
            icon="filter"
            title="Nothing matches that"
            body="No properties with this status and search. Clear the filter to see all of them."
            action={{ href: '/properties', label: 'Clear filters' }}
          />
        )
      ) : (
        <div className="ws-list">
          {rows.map((p) => (
            <Link key={p.id} href={`/properties/${p.id}`} className="ws-row" style={{ textDecoration: 'none' }}>
              <img src={p.cover} alt="" className="ws-row-thumb" />
              <div>
                <div className="ws-row-title">{p.title}</div>
                <div className="ws-row-sub">
                  {p.place} · {p.type} · {p.completeness}% complete
                </div>
              </div>
              <div className="ws-row-cell is-price">
                <strong>{p.price}</strong>
                <div className="ws-row-sub">{p.priceVisibility === 'on_request' ? 'on request' : 'asking'}</div>
              </div>
              <div className="ws-row-cell">
                <StatusPill status={p.status} />
              </div>
              <div className="ws-row-cell is-updated">
                {p.views ? `${p.views} views` : 'No views'}
                <div className="ws-row-sub">{p.updated}</div>
              </div>
              <Icon name="arrowRight" size={16} className="ws-row-arrow" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
