/**
 * Email goes out through Calder (https://calder.click), behind a provider seam.
 *
 * Nothing in the app calls `sendCalderEmail()`. Callers ask for an email; this module decides
 * who delivers it. Swapping provider is one adapter and one env var, and the rest of the
 * product keeps its own rules about who may be mailed and what the message says.
 */

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  /** `transactional` (default) or `marketing`. Calder keeps the reputation streams apart. */
  stream?: 'transactional' | 'marketing';
  /**
   * Business key for idempotency, e.g. `invite:123` or `inquiry:abc`.
   * Retrying with the same key replays the first result instead of sending twice.
   */
  businessKey?: string;
};

export type EmailResult = {
  id: string | null;
  provider: string;
  replayed?: boolean;
};

export class EmailError extends Error {
  readonly provider: string;
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;

  constructor(opts: { provider: string; status: number; code: string; message: string; requestId?: string }) {
    super(opts.message);
    this.name = 'EmailError';
    this.provider = opts.provider;
    this.status = opts.status;
    this.code = opts.code;
    this.requestId = opts.requestId;
  }

  /** The provider's machine-readable code outranks the HTTP status: 403 is not always auth. */
  get retryable(): boolean {
    return this.code === 'rate_limited' || this.status >= 500 || this.code === 'idempotency_conflict';
  }
}

interface EmailProvider {
  id: string;
  send(message: EmailMessage): Promise<EmailResult>;
}

/* ── Calder ─────────────────────────────────────────────────────────────── */

const CALDER_BASE = process.env.CALDER_API_URL ?? 'https://api.calder.click/v1';
const CALDER_TIMEOUT_MS = 10_000;

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function calderOnce(message: EmailMessage, idempotencyKey: string): Promise<EmailResult> {
  const apiKey = process.env.CALDER_API_KEY as string;

  const response = await fetch(`${CALDER_BASE}/emails`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM ?? 'ORVN Labs <hello@orvnlabs.com>',
      to: message.to,
      subject: message.subject,
      text: message.text,
      ...(message.html ? { html: message.html } : {}),
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      stream: message.stream ?? 'transactional',
    }),
    signal: AbortSignal.timeout(CALDER_TIMEOUT_MS),
  });

  if (!response.ok) {
    let code = `http_${response.status}`;
    let detail = response.statusText;
    let requestId: string | undefined;
    try {
      const body = (await response.json()) as {
        error?: { code?: string; message?: string; request_id?: string };
      };
      code = body.error?.code ?? code;
      detail = body.error?.message ?? detail;
      requestId = body.error?.request_id;
    } catch {
      /* non-JSON error body: keep the status-derived code */
    }
    throw new EmailError({ provider: 'calder', status: response.status, code, message: detail, requestId });
  }

  const body = (await response.json().catch(() => ({}))) as { id?: string };
  return { id: body.id ?? null, provider: 'calder', replayed: response.status === 200 };
}

const calderProvider: EmailProvider = {
  id: 'calder',
  async send(message) {
    const key = message.businessKey ?? (await sha256Hex(`${message.to}:${message.subject}`));
    try {
      return await calderOnce(message, key);
    } catch (error) {
      // One retry only, and only where a retry is safe: same key, so the worst case is a replay.
      if (error instanceof EmailError && error.retryable) {
        await new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 250));
        return calderOnce(message, key);
      }
      throw error;
    }
  },
};

/* ── Development fallback ───────────────────────────────────────────────── */

const consoleProvider: EmailProvider = {
  id: 'console',
  async send(message) {
    console.info(`[email:console] to=${message.to} subject="${message.subject}"\n${message.text}`);
    return { id: null, provider: 'console' };
  },
};

/* ── Entry point ────────────────────────────────────────────────────────── */

function resolveProvider(): EmailProvider {
  if (process.env.CALDER_API_KEY) return calderProvider;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CALDER_API_KEY is not set. Refusing to pretend an email was sent.');
  }
  return consoleProvider;
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  return resolveProvider().send(message);
}
