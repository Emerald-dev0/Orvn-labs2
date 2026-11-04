/** Shared result shape for form actions. Errors are sentences a person can act on. */
export type ActionState =
  | { status: 'idle' }
  | { status: 'ok'; message?: string }
  | { status: 'error'; message: string; blockers?: string[] };
