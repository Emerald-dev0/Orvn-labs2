'use client';

import { useState } from 'react';
import { Icon } from '../icons';
import { PageHead, Card } from '../ui';
import { workspace as sampleWorkspace } from '../data';

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

/** The sample build: real layout, demo values, nothing is saved. */
function SampleSettings() {
  const ws = sampleWorkspace;
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
            <span className="ws-mono-note">Sample data</span>
          </div>
          <Row label="Business name" value={ws.name} />
          <Row label="Public address" value={ws.publicUrl} />
          <Row label="Plan" value={ws.plan} />
          <Row label="Owner" value={`${ws.owner.name} · ${ws.owner.email}`} />
        </Card>
        <SignInCard email={ws.owner.email} connected={false} />
        <PrivacyCard />
        <BillingCard />
        <SupportCard />
      </div>
    </>
  );
}

function SignInCard({ email, connected }) {
  return (
    <Card>
      <div className="ws-section-head">
        <h2>Sign-in</h2>
      </div>
      <Row label="Email" value={email} />
      <Row label="Method" value="Magic link — we email you a sign-in link. There is no password." />
      <p className="ws-small ws-muted" style={{ marginTop: 12 }}>
        {connected
          ? 'Every sign-in sends a fresh, single-use link to your email. Links expire after fifteen minutes.'
          : 'In a connected workspace every sign-in sends a fresh, single-use link to your email. Links expire after fifteen minutes.'}
      </p>
    </Card>
  );
}

function NotificationsCard() {
  return (
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
  );
}

function PrivacyCard() {
  return (
    <Card>
      <div className="ws-section-head">
        <h2>Data and privacy</h2>
      </div>
      <Row label="Analytics" value="Page opens and inquiry counts. No IP stored." />
      <Row label="Anonymous visitors" value="Never identified" />
      <Row label="Your content" value="Yours. Export or delete on request." />
    </Card>
  );
}

function BillingCard() {
  return (
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
  );
}

function SupportCard() {
  return (
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
  );
}

export default function Settings({ data = null, showNotifications = false }) {
  if (!data) {
    return <SampleSettings />;
  }

  const { workspace, owner, memberCount } = data;

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
          <Row label="Public address" value={`/w/${workspace.username}`} />
          <Row label="Plan" value="Early access" />
          <Row label="Owner" value={`${owner.name} · ${owner.email}`} />
          <Row label="Members" value={`${memberCount} ${memberCount === 1 ? 'member' : 'members'}`} />
        </Card>

        <SignInCard email={owner.email} connected />
        {showNotifications ? <NotificationsCard /> : null}
        <PrivacyCard />
        <BillingCard />
        <SupportCard />
      </div>
    </>
  );
}
