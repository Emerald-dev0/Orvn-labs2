import { toNextJsHandler } from 'better-auth/next-js';
import { NextResponse } from 'next/server';
import { assertAuthConfigured, auth } from '@/lib/auth';
import { MAGIC_LINK_VERIFY_PATH, refusalRedirect } from '@/lib/magic-link-refusal';

const handler = toNextJsHandler(auth);

// Links come from BETTER_AUTH_URL in production; the request origin is only a fallback for local runs.
function originFor(request: Request): string {
  return process.env.BETTER_AUTH_URL?.trim() || new URL(request.url).origin;
}

export async function GET(request: Request) {
  assertAuthConfigured();
  const path = new URL(request.url).pathname;
  let response: Response;
  try {
    response = await handler.GET(request);
  } catch (error) {
    // A thrown refusal on the verify step gets the same friendly redirect as a returned one.
    if (path === MAGIC_LINK_VERIFY_PATH) {
      // Never log the error object here. The verify step handles the one-time token in the query
      // string, so the error's message (and the request URL) can carry it. Log the failure with
      // only its type and the token-free pathname; the token must not reach logs or analytics.
      console.error('[auth] magic-link verify failed', {
        name: error instanceof Error ? error.name : 'Error',
        path,
      });
      return NextResponse.redirect(refusalRedirect(path, 403, originFor(request))!);
    }
    throw error;
  }
  const target = refusalRedirect(path, response.status, originFor(request));
  return target ? NextResponse.redirect(target) : response;
}

export async function POST(request: Request) {
  assertAuthConfigured();
  return handler.POST(request);
}
