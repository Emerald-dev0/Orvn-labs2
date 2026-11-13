'use client';

import { SIZES, THUMB_WIDTH, aspectRatio, mediaUrl, srcSetFor } from '../../../lib/images';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Icon } from '../icons';
import { PageHead, Card, StatusPill, Tabs, FactRow, EmptyState } from '../ui';
import VisibilityControl from '../VisibilityControl';
import DraftPanel from '../DraftPanel';
import MediaUploader from '../MediaUploader';
import { properties, activity } from '../data';
import { updateLocation } from '../../../lib/actions/properties';

const DISCLOSURE_LABEL = {
  exact: 'Exact address',
  street: 'Street only',
  area: 'Area only',
};

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
  { id: 'media', label: 'Media' },
  { id: 'copy', label: 'Copy & assets' },
  { id: 'sheet', label: 'Deal sheet' },
  { id: 'public', label: 'Public page' },
  { id: 'activity', label: 'Activity' },
];

function Overview({ property, live = false, publicPath = null }) {
  const approved = property.facts.filter((f) => f.state === 'approved' && f.public).slice(0, 4);
  const stale = live && property.publication
    ? Date.parse(property.updatedAt) > Date.parse(property.publication.publishedAt)
    : false;
  return (
    <>
    {stale ? <StaleBanner property={property} /> : null}
    <div className="ws-split">
      <Card>
        <div className="ws-section-head">
          <h2>What buyers see</h2>
          <Link href={`/properties/${property.id}?tab=public`}>Preview page</Link>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <img
            src={property.cover}
            alt=""
            style={{ width: 128, height: 96, borderRadius: 14, objectFit: 'cover', flex: 'none' }}
          />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.015em' }}>{property.title}</div>
            <div className="ws-small ws-muted" style={{ marginTop: 3 }}>
              {property.place} · {property.type}
            </div>
            <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600 }}>{property.price}</div>
          </div>
        </div>

        <div className="ws-divider" />
        <div className="ws-facts">
          {approved.map((f) => (
            <div className="ws-fact" key={f.key} style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
              <span className="ws-fact-key">{f.key}</span>
              <span className="ws-fact-value">{f.value}</span>
            </div>
          ))}
        </div>
        <p className="ws-small ws-muted" style={{ marginTop: 12 }}>
          Public facts are the ones you approved for publication. Private values never appear on the page.
        </p>
      </Card>

      <div className="ws-stack">
        <Card>
          <div className="ws-section-head">
            <h2>Record</h2>
            <span className="ws-small ws-muted">{property.completeness}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'var(--bone-2)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${property.completeness}%`,
                height: '100%',
                background: 'var(--lime-2)',
                borderRadius: 999,
              }}
            />
          </div>
          <p className="ws-small ws-muted" style={{ marginTop: 10 }}>{property.nextAction}</p>
        </Card>

        {live ? (
          <Card>
            <VisibilityControl
              propertyId={property.id}
              visibility={property.visibility ?? 'private'}
              blockers={property.blockers ?? []}
              publicPath={property.visibility === 'public' || property.visibility === 'link_only' ? publicPath : null}
            />
          </Card>
        ) : (
          <Card>
            <div className="ws-section-head">
              <h2>Who can see this page</h2>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="ws-small ws-muted">Visibility</span>
                <span style={{ fontSize: 13 }}>Sample workspace</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="ws-small ws-muted">Address visibility</span>
                <span style={{ fontSize: 13 }}>Approximate location</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="ws-small ws-muted">Last updated</span>
                <span style={{ fontSize: 13 }}>{property.updated}</span>
              </div>
            </div>
            <p className="ws-small ws-muted" style={{ marginTop: 10 }}>
              Private, link only and public are real states. Changing one is limited to the owners
              and editors of the workspace, so this card is read-only from here.
            </p>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}

function StaleBanner({ property }) {
  const publishedAt = Date.parse(property.publication?.publishedAt ?? '');
  const updatedAt = Date.parse(property.updatedAt ?? '');
  if (Number.isNaN(publishedAt) || Number.isNaN(updatedAt) || updatedAt <= publishedAt) {
    return null;
  }
  const publishedOn = new Date(publishedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return (
    <div className="ws-callout is-warn" role="status" style={{ marginBottom: 12 }}>
      <Icon name="alert" size={16} />
      <div>
        <strong>Version {property.publication.version} is out of date</strong>
        <p>
          The record changed after version {property.publication.version} was published on {publishedOn}.
          Buyers, the public page and the deal sheet still carry version {property.publication.version}.
          <Link href={`/properties/${property.id}?tab=public`}>Republish to issue the update</Link>
        </p>
      </div>
    </div>
  );
}

const fieldStyle = {
  height: 40,
  borderRadius: 12,
  border: '1px solid var(--line)',
  background: 'var(--bone)',
  padding: '0 12px',
  fontSize: 14,
  color: 'var(--ink)',
  width: '100%',
};

const labelStyle = { display: 'grid', gap: 6 };
const labelText = { fontSize: 12, color: 'var(--muted)' };

function LocationPanel({ property }) {
  const [state, formAction, pending] = useActionState(updateLocation, { status: 'idle' });
  const disclosure = property.locationDisclosure ?? 'area';

  return (
    <Card style={{ marginTop: 12 }}>
      <div className="ws-section-head">
        <h2>Address and what buyers see</h2>
        <span className="ws-mono-note">D07 · Area only by default</span>
      </div>
      <form action={formAction}>
        <input type="hidden" name="propertyId" value={property.id} />
        <div className="ws-grid is-2">
          <label style={labelStyle}>
            <span style={labelText}>Street address</span>
            <input name="addressLine" defaultValue={property.addressLine ?? ''} placeholder="18 Meridian Quay" style={fieldStyle} />
          </label>
          <label style={labelStyle}>
            <span style={labelText}>ZIP / postcode</span>
            <input name="postalCode" defaultValue={property.postalCode ?? ''} placeholder="33101" style={fieldStyle} />
          </label>
          <label style={labelStyle}>
            <span style={labelText}>City</span>
            <input name="city" defaultValue={property.city ?? ''} placeholder="Miami" style={fieldStyle} />
          </label>
          <label style={labelStyle}>
            <span style={labelText}>State / region</span>
            <input name="region" defaultValue={property.region ?? ''} placeholder="FL" style={fieldStyle} />
          </label>
          <label style={labelStyle}>
            <span style={labelText}>Country</span>
            <input name="country" defaultValue={property.country ?? ''} placeholder="US" style={fieldStyle} />
          </label>
          <label style={labelStyle}>
            <span style={labelText}>Pin precision</span>
            <select name="locationPrecision" defaultValue={property.locationPrecision ?? 'unknown'} style={fieldStyle}>
              <option value="unknown">No pin — never shown beyond the disclosure level</option>
              <option value="approximate">Approximate — neighbourhood-level</option>
              <option value="exact">Exact pin — required for Exact disclosure</option>
            </select>
          </label>
        </div>

        <fieldset style={{ border: 0, padding: 0, margin: '14px 0 0' }}>
          <legend style={{ ...labelText, marginBottom: 8 }}>What buyers see on the public page</legend>
          {[
            ['area', 'Area only (default)', 'City, state and ZIP — never the street.'],
            ['street', 'Street only', 'The street name. House number and pin stay private.'],
            ['exact', 'Exact address', 'Full street line and pin. Requires an exact pin.'],
          ].map(([value, label, hint]) => (
            <label key={value} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0', fontSize: 13.5 }}>
              <input
                type="radio"
                name="locationDisclosure"
                value={value}
                defaultChecked={disclosure === value}
                style={{ accentColor: 'var(--ink)', marginTop: 2 }}
              />
              <span>
                <strong>{label}</strong>
                <span className="ws-small ws-muted" style={{ display: 'block' }}>{hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {state.status === 'error' ? (
          <p className="field-error" role="alert" style={{ marginTop: 10 }}>{state.message}</p>
        ) : null}
        {state.status === 'ok' ? (
          <p className="ws-small ws-muted" role="status" style={{ marginTop: 10 }}>{state.message}</p>
        ) : null}

        <div style={{ marginTop: 12 }}>
          <button type="submit" className="ws-btn is-dark" disabled={pending}>
            {pending ? 'Saving…' : 'Save address and disclosure'}
          </button>
        </div>
      </form>
    </Card>
  );
}

function Details({ property, live = false }) {
  return (
    <>
    <Card>
      <div className="ws-section-head">
        <h2>Approved fields</h2>
        <span className="ws-small ws-muted">Source and approval are stored per value</span>
      </div>
      <div className="ws-facts">
        {property.facts.map((f) => (
          <FactRow key={`${f.key}-${f.source}`} fact={f} />
        ))}
      </div>
      <p className="ws-small ws-muted" style={{ marginTop: 14 }}>
        A blank field stays blank. It is never rendered as “not in a flood zone” or “no restrictions”.
      </p>
    </Card>
    {live ? <LocationPanel property={property} /> : null}
    </>
  );
}

function Media({ property, live = false }) {
  const items = Array.isArray(property.media) ? property.media : [];

  return (
    <Card>
      <div className="ws-section-head">
        <h2>Photos</h2>
        <span className="ws-small ws-muted">Visibility is per file</span>
      </div>

      {live && items.length === 0 ? (
        <div className="ws-empty" style={{ padding: '28px 20px' }}>
          <Icon name="image" size={22} />
          <strong>No files yet</strong>
          <p className="ws-small ws-muted">
            A page can be published without photos, but one good cover is worth more than five
            average ones.
          </p>
        </div>
      ) : null}

      {live && items.length > 0 ? (
        <div className="ws-media-grid">
          {items.map((item) => (
            <div className="ws-media" key={item.id}>
              <img
                src={mediaUrl(item.key, { width: THUMB_WIDTH, sourceWidth: item.width })}
                srcSet={srcSetFor(item.key, { sourceWidth: item.width })}
                sizes={SIZES.thumb}
                width={item.width || undefined}
                height={item.height || undefined}
                style={{ aspectRatio: aspectRatio(item.width, item.height) }}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <div className="ws-media-tags">
                {item.isCover ? <span className="ws-media-tag">Cover</span> : null}
                <span className={`ws-media-tag ${item.visibility === 'public' ? '' : 'is-private'}`}>
                  {item.visibility === 'public' ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!live ? (
        <div className="ws-media-grid">
          {['/images/interior-1.jpg', '/images/prop-2.jpg', '/images/prop-4.jpg', '/images/prop-5.jpg'].map(
            (src, index) => (
              <div className="ws-media" key={src}>
                <img src={src} alt="" />
                <div className="ws-media-tags">
                  {index === 0 ? <span className="ws-media-tag">Cover</span> : null}
                  <span className={`ws-media-tag ${index === 3 ? 'is-private' : ''}`}>
                    {index === 3 ? 'Private' : 'Public'}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      ) : null}

      {live ? (
        <div style={{ marginTop: 14 }}>
          <MediaUploader propertyId={property.id} />
        </div>
      ) : (
        <button type="button" className="ws-media-add" style={{ marginTop: 12 }}>
          <Icon name="upload" size={18} strokeWidth={1.6} />
          Add files
        </button>
      )}

      <p className="ws-small ws-muted" style={{ marginTop: 12 }}>
        Private files are never served on the public page, even if someone guesses the address.
      </p>
    </Card>
  );
}

function CopyAssets({ property, live = false }) {
  const description = (property.description ?? '').trim();
  const words = description ? description.split(/\s+/).length : 0;

  return (
    <div className="ws-split">
      <div className="ws-stack">
        <Card>
          <div className="ws-section-head">
            <h2>Buyer description</h2>
            <span className="ws-small ws-muted">{description ? `${words} words` : 'Empty'}</span>
          </div>
          {description ? (
            <div
              style={{
                background: 'var(--bone)',
                borderRadius: 14,
                padding: 16,
                fontSize: 14.5,
                lineHeight: 1.65,
                color: 'var(--ink-2)',
              }}
            >
              {description}
            </div>
          ) : (
            <p className="ws-small ws-muted" style={{ margin: 0 }}>
              Nothing written yet. Draft one from the facts below, or write it yourself on the
              Details tab. A blank description stays blank on the page.
            </p>
          )}
          <p className="ws-small ws-muted" style={{ marginTop: 12 }}>
            This is the text the public page prints. It changes only when you save it.
          </p>
        </Card>

        <Card>
          {live ? (
            <DraftPanel
              propertyId={property.id}
              description={description}
              facts={Array.isArray(property.facts) ? property.facts : []}
            />
          ) : (
            <>
              <div className="ws-section-head">
                <h2>Drafting</h2>
              </div>
              <p className="ws-small ws-muted">
                Drafting runs from the approved public facts on the record and writes nothing until
                a person accepts it. It is limited to owners and editors, so this record is
                read-only from here.
              </p>
              <div className="ws-callout is-ok" style={{ marginTop: 12 }}>
                <Icon name="checkCircle" size={16} />
                <div>
                  <strong>Facts stay fixed</strong>
                  <p>Drafted words can never change a price, an ID or a status.</p>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function DealSheet({ property }) {
  return (
    <div className="ws-split">
      <Card style={{ background: 'var(--bone)' }}>
        <div
          style={{
            background: 'var(--white)',
            borderRadius: 12,
            padding: 22,
            boxShadow: 'var(--sh-1)',
          }}
        >
          <div className="ws-small ws-muted">Northaven Property Group</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '-0.03em', marginTop: 4 }}>
            {property.title}
          </h3>
          <div className="ws-small ws-muted">{property.place} · Approximate location</div>
          <img
            src={property.cover}
            alt=""
            style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 10, marginTop: 12 }}
          />
          <div className="ws-facts" style={{ marginTop: 10 }}>
            {property.facts.slice(0, 5).map((f) => (
              <div className="ws-fact" key={f.key} style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
                <span className="ws-fact-key">{f.key}</span>
                <span className="ws-fact-value">{f.value || '—'}</span>
              </div>
            ))}
          </div>
          <p className="ws-small ws-muted" style={{ marginTop: 12 }}>
            Facts supplied by the seller’s representative and not independently verified.
          </p>
        </div>
      </Card>

      <Card>
        <div className="ws-section-head">
          <h2>Export</h2>
        </div>
        <p className="ws-small ws-muted">
          One or two pages, print-ready, generated from the same record as the page.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button type="button" className="ws-btn is-dark" disabled>
            <Icon name="printer" size={15} />
            Print sheet
          </button>
          <button type="button" className="ws-btn is-quiet" disabled>
            <Icon name="download" size={15} />
            PDF
          </button>
        </div>
        <p className="ws-small ws-muted" style={{ marginTop: 12 }}>
          Export arrives with the record editor. The layout above is the print target.
        </p>
      </Card>
    </div>
  );
}

function CopyLinkButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="ws-btn is-quiet is-sm"
      style={{ marginLeft: 'auto' }}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function PublicPage({ property, live = false, publicPath = null }) {
  const shareUrl = live && publicPath ? `orvnlabs.com${publicPath}` : `orvnlabs.com/w/northaven/p/${property.id}`;
  const disclosure = DISCLOSURE_LABEL[property.locationDisclosure] ?? 'Area only';
  return (
    <div className="ws-split">
      <Card>
        <div className="ws-section-head">
          <h2>Public link</h2>
          <StatusPill status={property.status} />
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            background: 'var(--bone)',
            borderRadius: 12,
            padding: '10px 12px',
          }}
        >
          <Icon name="link" size={16} className="ws-muted" />
          <span style={{ fontSize: 13.5, wordBreak: 'break-all' }}>{shareUrl}</span>
          {live && publicPath ? (
            <CopyLinkButton text={`https://${shareUrl}`} />
          ) : (
            <button type="button" className="ws-btn is-quiet is-sm" style={{ marginLeft: 'auto' }} disabled>
              Copy
            </button>
          )}
        </div>
        <p className="ws-small ws-muted" style={{ marginTop: 12 }}>
          Unpublishing removes the page and its files. Old links land on a neutral unavailable page,
          never on a draft.
        </p>
      </Card>

      <div className="ws-preview">
        <div className="ws-preview-bar">
          <span style={{ width: 9, height: 9, borderRadius: 99, background: '#d9d2c6' }} />
          <span style={{ width: 9, height: 9, borderRadius: 99, background: '#d9d2c6' }} />
          <span className="ws-preview-url">{shareUrl}</span>
        </div>
        <div style={{ padding: 18 }}>
          <img
            src={property.cover}
            alt=""
            style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', borderRadius: 12 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, gap: 10 }}>
            <div>
              <div className="ws-preview-name" style={{ fontSize: 18 }}>{property.title}</div>
              <div className="ws-preview-meta">{property.place} · {disclosure}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{property.price}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityTab({ property, live = false }) {
  const rows = live ? (property.activity ?? []) : activity;
  return (
    <Card>
      <div className="ws-section-head">
        <h2>History</h2>
        <span className="ws-small ws-muted">{property.title}</span>
      </div>
      {rows.length === 0 ? (
        <p className="ws-small ws-muted">Nothing recorded yet. Publishing, edits and inquiries appear here.</p>
      ) : (
        <div className="ws-stack" style={{ gap: 14 }}>
          {rows.map((a) => (
            <div key={a.id} style={{ display: 'flex', gap: 11 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: 'var(--lime-2)',
                  marginTop: 7,
                  flex: 'none',
                }}
              />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{a.text}</div>
                <div className="ws-small ws-muted">{a.detail ? `${a.detail} · ` : ''}{a.when}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function PropertyDetail({ id, property: provided = null, initialTab = 'overview', live = false, publicPath = null }) {
  const [tab, setTab] = useState(initialTab);
  const property = provided ?? properties.find((p) => p.id === id);

  if (!property) {
    return (
      <>
        <PageHead title="Property" description="That record is not in this workspace." />
        <EmptyState
          icon="file"
          title="No such property"
          body="This link does not match a property in Northaven Property Group, or it was archived."
          action={{ href: '/properties', label: 'Back to properties' }}
          secondary={{ href: '/dashboard', label: 'Go to overview' }}
        />
      </>
    );
  }

  return (
    <>
      <Link href="/properties" className="ws-small ws-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Icon name="arrowLeft" size={14} />
        Properties
      </Link>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginTop: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '-0.03em' }}>
              {property.title}
            </h1>
            <StatusPill status={property.status} />
          </div>
          <p className="ws-small ws-muted" style={{ marginTop: 4 }}>
            {property.place} · {property.type} · {property.price}
          </p>
        </div>
        {live ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {property.status === 'published' && publicPath ? (
              <a href={publicPath} target="_blank" rel="noreferrer" className="ws-btn is-quiet">
                <Icon name="view" size={16} />
                Open page
              </a>
            ) : null}
            <Link href={`/properties/${property.id}?tab=copy`} className="ws-btn is-dark">
              <Icon name="magic" size={16} />
              Draft copy
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="ws-btn is-quiet">
              <Icon name="view" size={16} />
              Preview
            </button>
            <button type="button" className="ws-btn is-dark" disabled>
              <Icon name="upload" size={16} />
              Publish
            </button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 14 }}>
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
      </div>

      {tab === 'overview' ? <Overview property={property} live={live} publicPath={publicPath} /> : null}
      {tab === 'details' ? <Details property={property} live={live} /> : null}
      {tab === 'media' ? <Media property={property} live={live} /> : null}
      {tab === 'copy' ? <CopyAssets property={property} live={live} /> : null}
      {tab === 'sheet' ? <DealSheet property={property} /> : null}
      {tab === 'public' ? <PublicPage property={property} live={live} publicPath={publicPath} /> : null}
      {tab === 'activity' ? <ActivityTab property={property} live={live} /> : null}
    </>
  );
}
