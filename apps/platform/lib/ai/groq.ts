/**
 * The only place that talks to the model provider.
 *
 * Kept deliberately small: one function, a timeout, and failures that read like English. If the
 * key is missing the feature is unavailable and says so; it never falls back to template text and
 * pretends the model produced it.
 */

import type { ChatMessage } from './draft';

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const TIMEOUT_MS = 20_000;

export type CompletionFailure = 'not_configured' | 'timeout' | 'rate_limited' | 'upstream';

/**
 * A flat shape rather than a discriminated union: this project compiles with `strict: false`, and
 * a narrowed union on a boolean literal does not survive that setting.
 */
export type CompletionResult = {
  ok: boolean;
  text?: string;
  reason?: CompletionFailure;
};

export function draftingConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export function draftModel(): string {
  return process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b';
}

export async function complete(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number } = {},
): Promise<CompletionResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { ok: false, reason: 'not_configured' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: draftModel(),
        messages,
        temperature: options.temperature ?? 0.4,
        max_tokens: options.maxTokens ?? 400,
        top_p: 0.9,
      }),
      signal: controller.signal,
      cache: 'no-store',
    });

    if (response.status === 429) return { ok: false, reason: 'rate_limited' };
    if (!response.ok) {
      console.error('[ai] completion failed', { status: response.status });
      return { ok: false, reason: 'upstream' };
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = payload.choices?.[0]?.message?.content ?? '';
    if (!text.trim()) return { ok: false, reason: 'upstream' };
    return { ok: true, text };
  } catch (error) {
    const name = (error as Error).name;
    if (name === 'AbortError' || name === 'TimeoutError') return { ok: false, reason: 'timeout' };
    console.error('[ai] completion threw', { message: (error as Error).message });
    return { ok: false, reason: 'upstream' };
  } finally {
    clearTimeout(timer);
  }
}

/** One message per failure, in the voice of the rest of the workspace. */
export function completionMessage(reason: CompletionFailure = 'upstream'): string {
  switch (reason) {
    case 'not_configured':
      return 'Drafting is not switched on for this workspace yet. Your words and facts are unchanged.';
    case 'rate_limited':
      return 'The drafting service is busy. Try again in a minute. Nothing was saved.';
    case 'timeout':
      return 'Drafting took too long and was stopped. Nothing was saved. Try again.';
    case 'upstream':
    default:
      return 'Drafting did not come back with a description. Nothing was saved. Try again.';
  }
}
