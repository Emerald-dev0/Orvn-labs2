"use client";

import React, { useState } from 'react';

/**
 * Copies the buyer summary to the clipboard.
 *
 * The text comes from the published summary route rather than being rebuilt in the browser, so
 * what gets pasted is exactly what the server considers publishable. Clipboard access can fail
 * (permissions, insecure context), so there is a visible failure state and a link to the same
 * text as a fallback rather than a silent no-op.
 */
export default function CopySummary({ summaryUrl }) {
  const [state, setState] = useState('idle');

  async function copy() {
    setState('working');
    try {
      const response = await fetch(summaryUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error('summary unavailable');
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setState('copied');
      window.setTimeout(() => setState('idle'), 2600);
    } catch {
      setState('failed');
    }
  }

  return (
    <div className="pub-copy">
      <button type="button" className="pub-btn" onClick={copy} disabled={state === 'working'}>
        {state === 'working'
          ? 'Copying'
          : state === 'copied'
            ? 'Summary copied'
            : state === 'failed'
              ? 'Could not copy'
              : 'Copy buyer summary'}
      </button>
      <p className="pub-copy-note" aria-live="polite">
        {state === 'failed' ? (
          <>
            Your browser blocked the clipboard. <a href={summaryUrl}>Open the summary</a> and copy it
            from there.
          </>
        ) : state === 'copied' ? (
          'Ready to paste into a message.'
        ) : (
          'Plain text: the facts on this page, the price and the link.'
        )}
      </p>
    </div>
  );
}
