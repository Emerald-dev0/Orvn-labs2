import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@react-email/render';
import { invitationEmail } from '../lib/emails/invitation';
import { resetPasswordEmail } from '../lib/emails/reset-password';
import { signInLinkEmail } from '../lib/emails/sign-in-link';
import { inquiryNotificationEmail } from '../lib/emails/inquiry-notification';
import { betaApplicationEmail } from '../lib/emails/beta-application';
import { Invitation } from '../emails/Invitation';
import { InquiryNotification } from '../emails/InquiryNotification';

const expires = new Date('2026-11-11T18:30:00Z');

/**
 * The emails are React now, so the checks that matter changed.
 *
 * The old string templates escaped by hand and a missed escape was one careless edit away. React
 * escapes, so what is left to prove is that (a) everything a person can type stays text, (b) the
 * plain-text half still carries the URL, and (c) every message keeps its own idempotency key.
 */

const hasTag = (html: string) => /<(script|iframe|object|embed|form)\b/i.test(html);

describe('invitation', () => {
  it('names the workspace and carries the link in both halves', async () => {
    const message = await invitationEmail({
      to: 'ada@example.com',
      workspaceName: 'Northaven Property Group',
      acceptUrl: 'https://orvnlabs.com/invite/abc',
      expiresAt: expires,
      invitationId: 'inv_1',
    });

    expect(message.subject).toBe('Your ORREI invitation to Northaven Property Group');
    expect(message.businessKey).toBe('invite:inv_1');
    expect(message.text).toContain('https://orvnlabs.com/invite/abc');
    expect(message.html).toContain('https://orvnlabs.com/invite/abc');
    expect(message.html).toContain('Northaven Property Group');
  });

  it('keeps a workspace name that looks like markup as text', async () => {
    const message = await invitationEmail({
      to: 'ada@example.com',
      workspaceName: '<script>alert(1)</script> Estates',
      acceptUrl: 'https://orvnlabs.com/invite/abc',
      expiresAt: expires,
      invitationId: 'inv_2',
    });

    expect(message.html).not.toContain('<script>alert(1)</script>');
    expect(message.html).toContain('&lt;script&gt;');
    expect(hasTag(message.html ?? '')).toBe(false);
  });

  it('works without a workspace name', async () => {
    const message = await invitationEmail({
      to: 'ada@example.com',
      acceptUrl: 'https://orvnlabs.com/invite/abc',
      expiresAt: expires,
      invitationId: 'inv_3',
    });
    expect(message.subject).toBe('Your ORREI invitation');
    expect(message.text).toContain('ORREI');
  });
});

describe('password and sign-in mail', () => {
  it('resets by link, and says nothing changed if it was not you', async () => {
    const message = await resetPasswordEmail({ to: 'ada@example.com', url: 'https://orvnlabs.com/reset/x' });
    expect(message.subject).toBe('Reset your ORREI password');
    expect(message.text).toContain('https://orvnlabs.com/reset/x');
    expect(message.text.toLowerCase()).toContain('nothing has changed');
    expect(message.html).toContain('Choose a new password');
  });

  it('bucket-keys the reset so a double submit is one email', async () => {
    const a = await resetPasswordEmail({ to: 'ada@example.com', url: 'https://x/1' });
    const b = await resetPasswordEmail({ to: 'ada@example.com', url: 'https://x/1' });
    expect(a.businessKey).toBe(b.businessKey);
  });

  it('signs in with a single-use link and states the expiry', async () => {
    const message = await signInLinkEmail({ to: 'ada@example.com', url: 'https://orvnlabs.com/sign-in/t', expiresAt: expires });
    expect(message.subject).toBe('Sign in to ORREI');
    expect(message.text).toContain('https://orvnlabs.com/sign-in/t');
    expect(message.text).toContain('works once');
    expect(message.html).not.toContain('<script');
  });
});

describe('inquiry notification', () => {
  const base = {
    to: 'owner@example.com',
    inquirerName: 'Tunde',
    inquirerEmail: 'tunde@example.com',
    propertyTitle: 'Harbour house',
    workspaceName: 'Northaven Property Group',
    inboxUrl: 'https://orvnlabs.com/inquiries/1',
    inquiryId: 'inq_1',
  };

  it('replies to the buyer, and keys to the inquiry', async () => {
    const message = await inquiryNotificationEmail({ ...base, message: 'Is it still available?' });
    expect(message.replyTo).toBe('tunde@example.com');
    expect(message.businessKey).toBe('inquiry:inq_1');
    expect(message.subject).toBe('New inquiry: Harbour house');
  });

  it('keeps a buyer message that contains markup as text', async () => {
    const message = await inquiryNotificationEmail({
      ...base,
      message: 'Hi <img src=x onerror=alert(1)> and <b>bold</b>',
    });
    expect(message.html).not.toContain('<img src=x');
    expect(message.html).toContain('&lt;img');
    expect(message.text).toContain('onerror=alert(1)');
  });

  it('does not claim the inquiry has been read', async () => {
    const message = await inquiryNotificationEmail({ ...base, message: 'Hello' });
    expect((message.text + message.html).toLowerCase()).not.toContain('has read');
  });
});

describe('shared shell', () => {
  it('renders the wordmark, the company and the address in every message', async () => {
    const message = await resetPasswordEmail({ to: 'a@b.co', url: 'https://x/1' });
    expect(message.html).toContain('ORREI');
    expect(message.html).toContain('by ORVN Labs');
    expect(message.html).toContain('hello@orvnlabs.com');
  });

  it('never mentions the retired product name', async () => {
    const messages = await Promise.all([
      invitationEmail({ to: 'a@b.co', acceptUrl: 'https://x/1', expiresAt: expires, invitationId: 'i' }),
      resetPasswordEmail({ to: 'a@b.co', url: 'https://x/1' }),
      signInLinkEmail({ to: 'a@b.co', url: 'https://x/1', expiresAt: expires }),
    ]);
    for (const message of messages) {
      expect(message.html?.toLowerCase()).not.toContain('larei');
      expect(message.text.toLowerCase()).not.toContain('larei');
    }
  });

  it('is a complete document, not a fragment', async () => {
    const html = await render(
      <Invitation workspaceName="Northaven" acceptUrl="https://x/1" expiresAt={expires} />,
    );
    expect(html.startsWith('<!DOCTYPE')).toBe(true);
    expect(html).toContain('viewport');
  });
});
