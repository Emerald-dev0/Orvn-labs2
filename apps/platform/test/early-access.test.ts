import { beforeAll, describe, expect, it } from 'vitest';
import { betaApplySchema } from '../lib/validation/invite';
import { betaApplicationEmail } from '../lib/emails/beta-application';

const valid = {
  name: 'Ada Okonkwo',
  email: 'ada@northaven.example',
  company: 'Northaven Property Group',
  role: 'Agent or broker',
  markets: 'Harbour district',
  volume: '3–10',
  currentTools: 'PDFs and WhatsApp links',
  frustration: 'Every buyer asks for the same three details.',
  website: 'northaven.example',
  consent: 'on',
  company_url_confirm: '',
};

describe('early-access form', () => {
  it('accepts a complete request', () => {
    expect(betaApplySchema.safeParse(valid).success).toBe(true);
  });

  it('requires consent to be given, not assumed', () => {
    const { consent, ...withoutConsent } = valid;
    expect(betaApplySchema.safeParse(withoutConsent).success).toBe(false);
  });

  it('requires a name and a plausible email', () => {
    expect(betaApplySchema.safeParse({ ...valid, name: ' A ' }).success).toBe(false);
    expect(betaApplySchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it('accepts a request without the optional fields', () => {
    const minimal = { name: 'Ada', email: 'ada@example.com', consent: 'on' };
    expect(betaApplySchema.safeParse(minimal).success).toBe(true);
  });

  it('caps free text so the form cannot be used as a storage dump', () => {
    expect(betaApplySchema.safeParse({ ...valid, frustration: 'x'.repeat(1001) }).success).toBe(false);
  });
});

describe('notification email', () => {
  let message: Awaited<ReturnType<typeof betaApplicationEmail>>;

  beforeAll(async () => {
    message = await betaApplicationEmail({
      id: 'app_123',
      name: 'Ada Okonkwo',
      email: 'ada@northaven.example',
      company: 'Northaven Property Group',
      role: 'Agent or broker',
      markets: 'Harbour district',
      volume: '3–10',
      currentTools: 'PDFs and WhatsApp links',
      frustration: 'Every buyer asks for the same three details.',
      website: 'northaven.example',
      receivedAt: new Date('2026-11-04T12:00:00Z'),
    });
  });

  it('is replyable in one click', () => {
    expect(message.replyTo).toBe('ada@northaven.example');
  });

  it('keys idempotency to the application, not the moment', async () => {
    const again = await betaApplicationEmail({
      id: 'app_123',
      name: 'Ada Okonkwo',
      email: 'ada@northaven.example',
      receivedAt: new Date('2026-11-04T18:00:00Z'),
    });
    expect(again.businessKey).toBe(message.businessKey);
  });

  it('carries every answer the person gave, in plain text', () => {
    expect(message.text).toContain('Harbour district');
    expect(message.text).toContain('PDFs and WhatsApp links');
    expect(message.text).toContain('Every buyer asks for the same three details.');
    expect(message.text).toContain('npm run invite --email ada@northaven.example');
  });

  it('labels the request with the person and the company', () => {
    expect(message.subject).toBe('Early access: Ada Okonkwo (Northaven Property Group)');
  });

  it('renders a designed HTML body alongside the text', () => {
    expect(message.html).toContain('ORREI');
    expect(message.html).toContain('Northaven Property Group');
    expect(message.html).not.toContain('<script');
  });
});
