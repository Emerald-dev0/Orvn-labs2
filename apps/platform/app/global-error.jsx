'use client';

/**
 * Root error boundary. This file replaces the root layout when the layout itself fails, so it
 * carries its own html and body and cannot rely on shared components or CSS variables.
 */
export default function GlobalError({ error, reset }) {
  const digest = error?.digest;

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          background: '#f5f2eb',
          color: '#141b17',
          margin: 0,
          padding: 0,
        }}
      >
        <main style={{ maxWidth: 520, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
          <h1 style={{ letterSpacing: '-0.03em' }}>Something broke.</h1>
          <p style={{ lineHeight: 1.6 }}>
            Nothing you saved was lost by this error. Try again — if it keeps happening, send the
            reference below to support.
          </p>
          {digest ? (
            <p style={{ fontFamily: 'monospace', fontSize: 13 }}>Reference: {digest}</p>
          ) : null}
          <button type="button" onClick={() => reset()} style={{ marginTop: 20, padding: '12px 22px', fontSize: 15 }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
