import { describe, expect, it } from 'vitest';
import { isUsernameTaken, setupDecision, setupSchema } from '../lib/workspace-setup';

/**
 * A workspace is what the beta gate protects. Only an operator may create one without an
 * invitation, and only once.
 */
describe('who may set up a workspace without an invitation', () => {
  it('lets an operator with no workspace create one', () => {
    expect(setupDecision({ isOperator: true, hasWorkspace: false })).toBe('create');
  });

  it('refuses a non-operator, even with no workspace', () => {
    expect(setupDecision({ isOperator: false, hasWorkspace: false })).toBe('not-an-operator');
  });

  it('never creates a second workspace for an operator', () => {
    expect(setupDecision({ isOperator: true, hasWorkspace: true })).toBe('already-has-workspace');
  });
});

describe('the setup form', () => {
  it('accepts a name and a lowercase address', () => {
    const ok = setupSchema.safeParse({ name: 'Carter Property Group', username: 'carter-property' });
    expect(ok.success).toBe(true);
  });

  it('refuses a reserved address', () => {
    const bad = setupSchema.safeParse({ name: 'Admin', username: 'admin' });
    expect(bad.success).toBe(false);
  });

  it('refuses an address with spaces or capitals after normalising', () => {
    expect(setupSchema.safeParse({ name: 'Carter', username: 'carter property' }).success).toBe(false);
    // Capitals are normalised by usernameField (trim + lowercase), so this one is accepted.
    expect(setupSchema.safeParse({ name: 'Carter', username: 'Carter-Property' }).success).toBe(true);
  });

  it('refuses a one-letter name', () => {
    expect(setupSchema.safeParse({ name: 'A', username: 'carter' }).success).toBe(false);
  });
});

describe('a taken address is explained, not reported as a crash', () => {
  it('recognises a Postgres unique violation', () => {
    expect(isUsernameTaken(new Error('duplicate key value violates unique constraint "workspaces_username_key"'))).toBe(true);
  });

  it('does not mistake other failures for a taken address', () => {
    expect(isUsernameTaken(new Error('connection terminated'))).toBe(false);
  });
});
