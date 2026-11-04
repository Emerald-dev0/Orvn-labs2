'use client';

import { Icon } from '../icons';
import { PageHead, Card } from '../ui';
import { workspace } from '../data';

function Row({ label, value, action }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '11px 0',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
        {value ? <div className="ws-small ws-muted">{value}</div> : null}
      </div>
      {action ?? <span className="ws-small ws-muted">—</span>}
    </div>
  );
}

export default function Settings() {
  return (
    <>
      <PageHead
        title="Settings"
        description="Account, workspace and what leaves this building."
      />

      <div className="ws-grid is-2">
        <Card>
          <div className="ws-section-head">
            <h2>Workspace</h2>
          </div>
          <Row label="Business name" value={workspace.name} />
          <Row label="Public address" value={workspace.publicUrl} />
          <Row label="Plan" value={workspace.plan} />
          <Row label="Owner" value={`${workspace.owner.name} · ${workspace.owner.email}`} />
        </Card>

        <Card>
          <div className="ws-section-head">
            <h2>Sign-in</h2>
          </div>
          <Row label="Email" value={workspace.owner.email} />
          <Row label="Password" value="Set at invitation" action={<button type="button" className="ws-btn is-quiet is-sm" disabled>Change</button>} />
          <Row label="Sessions" value="One active session" />
          <p className="ws-small ws-muted" style={{ marginTop: 12 }}>
            Sign-in is wired to the database in the next milestone. Until then this screen is the
            layout, not the controls.
          </p>
        </Card>

        <Card>
          <div className="ws-section-head">
            <h2>Email and notifications</h2>
            <span className="ws-mono-note">Calder</span>
          </div>
          <Row label="Inquiry notifications" value="One email per inquiry, no digest yet" />
          <Row label="Sender" value="hello@orvnlabs.com" />
          <Row label="Delivery provider" value="Calder · transactional stream" />
          <p className="ws-small ws-muted" style={{ marginTop: 12 }}>
            Invitation and sign-in mail go out through Calder. A verified sending domain is required
            before live mail leaves the account.
          </p>
        </Card>

        <Card>
          <div className="ws-section-head">
            <h2>Data and privacy</h2>
          </div>
          <Row label="Analytics" value="Page views, referrer, bot filtering. No IP stored." />
          <Row label="Anonymous visitors" value="Never identified" />
          <Row label="Your content" value="Yours. Export or delete on request." />
          <Row label="Data location" value="Neon Postgres, EU/US region chosen at setup" />
        </Card>

        <Card>
          <div className="ws-section-head">
            <h2>Billing</h2>
            <span className="ws-status is-quiet">Not live</span>
          </div>
          <p className="ws-small ws-muted">
            Pricing has not been announced, so there is nothing to bill. Beta accounts are not moved
            onto a paid plan without agreeing to it.
          </p>
        </Card>

        <Card>
          <div className="ws-section-head">
            <h2>Support</h2>
          </div>
          <p className="ws-small ws-muted">
            During the beta you talk to the people building the product. No ticket queue, no chatbot
            pretending to be a person.
          </p>
          <a href="mailto:hello@orvnlabs.com" className="ws-btn is-quiet is-sm" style={{ marginTop: 12 }}>
            <Icon name="mail" size={15} />
            hello@orvnlabs.com
          </a>
        </Card>
      </div>
    </>
  );
}
