'use client';

import Link from 'next/link';

/**
 * Route-level error boundary. A person who hits a failure gets a way forward and a reference to
 * hand to support — never a stack trace, and never a claim that nothing went wrong.
 */
export default function Error({ error, reset }) {
  const digest = error?.digest;

  return (
    <main id="main" style={{ maxWidth: 560, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <p className="eyebrow">Something broke</p>
      <h1 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', marginTop: 12 }}>
        That did not work.
      </h1>
      <p style={{ marginTop: 12, lineHeight: 1.6 }}>
        Nothing you saved was lost by this error. Try again — if it keeps happening, send the
        reference below to support so the failing step can be found.
      </p>
      {digest ? (
        <p
          style={{
            marginTop: 16,
            fontFamily: 'monospace',
            fontSize: 13,
            padding: '10px 14px',
            border: '1px solid var(--line-2, #e3ded2)',
            borderRadius: 12,
            display: 'inline-block',
          }}
        >
          Reference: {digest}
        </p>
      ) : null}
      <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button type="button" onClick={() => reset()} className="btn btn-primary">
          Try again
        </button>
        <Link href="/dashboard" className="btn">
          Back to workspace
        </Link>
      </div>
    </main>
  );
}
