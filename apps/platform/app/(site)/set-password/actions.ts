'use server';

import { headers } from 'next/headers';
import { APIError } from 'better-auth/api';
import { auth } from '../../../lib/auth';
import { requireUser } from '../../../lib/access';

export type SetPasswordState =
  | { status: 'idle' }
  | { status: 'ok'; message: string }
  | { status: 'error'; message: string };

/**
 * Lets someone who was approved and signed in with a link add a password.
 *
 * Better Auth only lets this run on a recent session (`freshAge`, one day), so a stale session is
 * sent back to a link rather than allowed to change credentials silently. Anyone who already has
 * a password is told to use "Forgot password", which is the path that proves inbox access again.
 */
export async function setPassword(
  _previous: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  await requireUser('/set-password');

  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 10) {
    return { status: 'error', message: 'Use at least 10 characters. A short phrase is easier to remember.' };
  }
  if (password.length > 200) {
    return { status: 'error', message: 'That password is too long. Use 200 characters or fewer.' };
  }
  if (password !== confirm) {
    return { status: 'error', message: 'The two passwords are not the same.' };
  }

  try {
    await auth.api.setPassword({ body: { newPassword: password }, headers: await headers() });
  } catch (error) {
    const detail = `${(error as Error).message ?? ''} ${(error as { body?: { code?: string } }).body?.code ?? ''}`;
    console.error('[set-password] failed', { message: (error as Error).message });
    if (error instanceof APIError && /PASSWORD_ALREADY_SET|already/i.test(detail)) {
      return {
        status: 'error',
        message: 'This account already has a password. Use Forgot password to change it.',
      };
    }
    if (/fresh|sensitive|session/i.test(detail)) {
      return {
        status: 'error',
        message: 'For your safety, sign in again with an email link first, then come back here.',
      };
    }
    return { status: 'error', message: 'The password could not be saved. Try again.' };
  }

  return {
    status: 'ok',
    message: 'Password saved. From now on you can sign in with your email and password.',
  };
}
