'use client';

import { useActionState } from 'react';
import { submitInquiry } from './actions';

/**
 * The buyer's side of F09. Copy is chosen carefully:
 * - the confirmation never says the owner has read it, because they have not;
 * - a failure says nothing was sent, because a half-submitted inquiry is worse than a retry.
 */
export default function InquiryForm({ propertySlug, username, businessName, contactEmail, requestToken }) {
  const [state, formAction, pending] = useActionState(submitInquiry, { status: 'idle' });

  if (state.status === 'sent') {
    return (
      <div className="pub-inquire" id="inquire">
        <h2 className="pub-h2">Your question is with {businessName}</h2>
        <div className="pub-message is-ok">
          Sent from {state.email}. {businessName} has not opened it yet. If they reply, it will come
          to your inbox.
        </div>
        <p>
          Nothing else was shared with them. If you need to add something, reply to the same
          address rather than sending a second form.
        </p>
        {contactEmail ? (
          <p>
            Prefer email? <a href={`mailto:${contactEmail}`} style={{ color: 'var(--lime)' }}>{contactEmail}</a>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="pub-inquire" id="inquire">
      <div style={{ display: 'grid', gap: 6 }}>
        <h2 className="pub-h2">Ask about this property</h2>
        <p>
          Your question goes straight to {businessName} with this property attached. No account
          needed, and no one else sees what you write.
        </p>
      </div>

      <form action={formAction} className="pub-form" noValidate>
        <input type="hidden" name="propertySlug" value={propertySlug} />
        <input type="hidden" name="username" value={username} />
        <input type="hidden" name="requestToken" value={requestToken} />
        <input type="hidden" name="source" value="property-page" />
        <div className="pub-hp" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="pub-field-row">
          <div className="pub-field">
            <label htmlFor="inq-name">Your name</label>
            <input id="inq-name" name="name" type="text" autoComplete="name" maxLength={120} />
          </div>
          <div className="pub-field">
            <label htmlFor="inq-email">Email</label>
            <input
              id="inq-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              maxLength={254}
            />
          </div>
        </div>

        <div className="pub-field">
          <label htmlFor="inq-phone">Phone (optional)</label>
          <input id="inq-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </div>

        <div className="pub-field">
          <label htmlFor="inq-message">Your question</label>
          <textarea
            id="inq-message"
            name="message"
            required
            minLength={10}
            maxLength={4000}
            placeholder="What would you like to know about this property?"
          />
        </div>

        <label className="pub-consent" htmlFor="inq-consent">
          <input id="inq-consent" name="consent" type="checkbox" required />
          <span>
            I agree that {businessName} may use these details to reply to this question. They are
            not added to a mailing list.
          </span>
        </label>

        {state.status === 'error' ? (
          <div className="pub-message is-error" role="alert">
            {state.message}
          </div>
        ) : null}

        <div className="pub-form-foot">
          <span className="pub-note">
            We record that a page was viewed, not who viewed it. This form is the only thing that
            identifies you.
          </span>
          <button className="pub-submit" type="submit" disabled={pending}>
            {pending ? 'Sending…' : 'Send question'}
          </button>
        </div>
      </form>
    </div>
  );
}
