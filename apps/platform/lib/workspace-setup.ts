import { z } from 'zod';
import { usernameField } from './validation/common';

/**
 * Who may create their own workspace without an invitation, and when.
 *
 * Only an operator on `ADMIN_EMAILS` may do this. Everyone else joins a workspace through an
 * invitation, because a workspace is the thing the beta gate protects. Pure, so the rule is
 * tested without a session or a database; the action and the page both call it.
 */
export type SetupDecision = 'create' | 'already-has-workspace' | 'not-an-operator';

export function setupDecision(opts: { isOperator: boolean; hasWorkspace: boolean }): SetupDecision {
  if (!opts.isOperator) return 'not-an-operator';
  if (opts.hasWorkspace) return 'already-has-workspace';
  return 'create';
}

export const setupSchema = z.object({
  name: z.string().trim().min(2, 'Use at least 2 characters').max(80, 'Use at most 80 characters'),
  username: usernameField,
});

/** Turns a Postgres unique-violation into a sentence a person can act on. */
export function isUsernameTaken(error: unknown): boolean {
  const text = String((error as { message?: string })?.message ?? error ?? '');
  return /duplicate key|unique constraint|workspaces_username/i.test(text);
}
