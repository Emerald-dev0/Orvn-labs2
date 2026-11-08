import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailError, sendEmail } from '../lib/email';

const originalFetch = globalThis.fetch;

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('Calder adapter', () => {
  beforeEach(() => {
    process.env.CALDER_API_KEY = 'calder_sk_test_example';
    process.env.CALDER_API_URL = 'https://api.calder.click/v1';
    process.env.MAIL_FROM = 'ORVN Labs <hello@orvnlabs.com>';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
    delete process.env.CALDER_API_KEY;
  });

  it('posts to /emails with bearer auth, idempotency key and the documented body', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    globalThis.fetch = vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return jsonResponse(202, { id: 'em_123' });
    }) as unknown as typeof fetch;

    const result = await sendEmail({
      to: 'ada@example.com',
      subject: 'Your ORVN Labs invitation',
      text: 'hello',
      businessKey: 'invite:42',
    });

    expect(result).toEqual({ id: 'em_123', provider: 'calder', replayed: false });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://api.calder.click/v1/emails');

    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer calder_sk_test_example');
    expect(headers['Idempotency-Key']).toBe('invite:42');

    const body = JSON.parse(String(calls[0].init.body));
    expect(body).toMatchObject({
      from: 'ORVN Labs <hello@orvnlabs.com>',
      to: 'ada@example.com',
      subject: 'Your ORVN Labs invitation',
      text: 'hello',
      stream: 'transactional',
    });
  });

  it('retries once on 429 using the same idempotency key', async () => {
    let attempt = 0;
    globalThis.fetch = vi.fn(async () => {
      attempt += 1;
      if (attempt === 1) return jsonResponse(429, { error: { code: 'rate_limited', message: 'slow down' } });
      return jsonResponse(202, { id: 'em_456' });
    }) as unknown as typeof fetch;

    const result = await sendEmail({ to: 'a@b.co', subject: 's', text: 't', businessKey: 'k1' });
    expect(attempt).toBe(2);
    expect(result.id).toBe('em_456');
    const keys = (globalThis.fetch as unknown as { mock: { calls: unknown[][] } }).mock.calls.map(
      (c) => (c[1] as RequestInit).headers as Record<string, string>,
    );
    expect(keys[0]['Idempotency-Key']).toBe(keys[1]['Idempotency-Key']);
  });

  it('does not retry a 422 and keeps the provider code', async () => {
    let attempt = 0;
    globalThis.fetch = vi.fn(async () => {
      attempt += 1;
      return jsonResponse(422, { error: { code: 'suppressed', message: 'recipient suppressed' } });
    }) as unknown as typeof fetch;

    await expect(sendEmail({ to: 'a@b.co', subject: 's', text: 't' })).rejects.toMatchObject({
      code: 'suppressed',
      status: 422,
    });
    expect(attempt).toBe(1);
    await expect(
      sendEmail({ to: 'a@b.co', subject: 's', text: 't' }),
    ).rejects.toBeInstanceOf(EmailError);
  });

  it('treats a 403 domain_not_verified as an auth-class failure, not a retry', async () => {
    let attempt = 0;
    globalThis.fetch = vi.fn(async () => {
      attempt += 1;
      return jsonResponse(403, { error: { code: 'domain_not_verified', message: 'unverified domain' } });
    }) as unknown as typeof fetch;

    await expect(sendEmail({ to: 'a@b.co', subject: 's', text: 't' })).rejects.toMatchObject({
      code: 'domain_not_verified',
    });
    expect(attempt).toBe(1);
  });
});
