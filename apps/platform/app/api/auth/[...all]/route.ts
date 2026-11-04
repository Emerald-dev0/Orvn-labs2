import { toNextJsHandler } from 'better-auth/next-js';
import { assertAuthConfigured, auth } from '@/lib/auth';

const handler = toNextJsHandler(auth);

export async function GET(request: Request) {
  assertAuthConfigured();
  return handler.GET(request);
}

export async function POST(request: Request) {
  assertAuthConfigured();
  return handler.POST(request);
}
