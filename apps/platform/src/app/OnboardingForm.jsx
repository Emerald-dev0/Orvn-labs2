'use client';

import { useActionState } from 'react';
import { ONBOARDING_ROLES } from '../../lib/onboarding';
import { completeOnboarding, skipOnboarding } from '../../lib/actions/site';

/**
 * The first-run form. Radio roles, one market, who you are to buyers, how to reach you.
 * Every answer maps 1:1 to the public page — nothing here is decorative.
 */
export default function OnboardingForm({ workspaceName, initials }) {
  const [state, submit, pending] = useActionState(completeOnboarding, { status: 'idle' });
  const [skipState, skip, skipping] = useActionState(skipOnboarding, { status: 'idle' });

  const error = state.status === 'error' ? state.message : skipState.status === 'error' ? skipState.message : null;

  return (
    <form action={submit} style={{ marginTop: 28, display: 'grid', gap: 18 }}>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="field-label" style={{ marginBottom: 8 }}>
          What do you do?
        </legend>
        <div className="ws-grid is-2" style={{ gap: 8 }}>
          {ONBOARDING_ROLES.map((role) => (
            <label
              key={role.id}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: 14,
                border: '1px solid var(--line)',
                background: 'var(--bone)',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              <input
                type="radio"
                name="role"
                value={role.id}
                defaultChecked={initials.role === role.id}
                required
                style={{ accentColor: 'var(--ink)' }}
              />
              {role.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="field-label" htmlFor="ob-market">Your primary market</label>
        <input
          id="ob-market"
          name="market"
          className="input"
          required
          maxLength={80}
          defaultValue={initials.market}
          placeholder="Miami, FL"
          autoComplete="address-level2"
        />
        <p className="signin-note">The place buyers should picture. One market to start — add more later.</p>
      </div>

      <div className="ws-grid is-2" style={{ gap: 12 }}>
        <div>
          <label className="field-label" htmlFor="ob-name">Name buyers will see</label>
          <input
            id="ob-name"
            name="displayName"
            className="input"
            required
            minLength={2}
            maxLength={120}
            defaultValue={initials.displayName}
            placeholder="Ada Bello"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="ob-email">Email buyers can use</label>
          <input
            id="ob-email"
            name="contactEmail"
            type="email"
            className="input"
            required
            defaultValue={initials.contactEmail}
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="ob-phone">Phone — optional, never shown without your tick</label>
        <input
          id="ob-phone"
          name="contactPhone"
          type="tel"
          className="input"
          maxLength={40}
          defaultValue={initials.contactPhone}
          placeholder="+1 305 555 0134"
          autoComplete="tel"
        />
        <p className="signin-note">Stored but kept private until you tick “show my phone” in Professional profile.</p>
      </div>

      {error ? <p className="field-error" role="alert">{error}</p> : null}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="submit" className="btn btn-primary" disabled={pending || skipping}>
          {pending ? 'Saving…' : 'Save and create your first property'}
        </button>
        <button
          type="submit"
          formAction={skip}
          className="btn btn-quiet"
          disabled={pending || skipping}
        >
          {skipping ? 'Skipping…' : 'Skip for now'}
        </button>
      </div>
    </form>
  );
}
