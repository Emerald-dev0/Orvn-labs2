'use client';

import { useActionState, useRef } from 'react';
import { Icon } from './icons';
import { uploadSiteMedia, removeSiteMedia } from '../../lib/actions/site';

/**
 * One slot of the professional page (logo mark or hero cover).
 *
 * Uploads are server-validated like every other image; the public page serves these files only
 * while the site is published, so the preview here is a local object URL the browser builds
 * from the picked file — nothing pretends to be public before it is.
 */
export default function SiteImageSlot({ kind, label, note, currentKey, published }) {
  const [uploadState, upload, uploading] = useActionState(uploadSiteMedia, { status: 'idle' });
  const [removeState, remove, removing] = useActionState(removeSiteMedia, { status: 'idle' });
  const inputRef = useRef(null);

  const state = uploadState.status !== 'idle' ? uploadState : removeState;
  const isSet = Boolean(currentKey) || uploadState.status === 'ok';

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <strong style={{ fontSize: 13.5 }}>{label}</strong>
          <p className="ws-small ws-muted" style={{ margin: '2px 0 0' }}>
            {isSet
              ? published
                ? 'Stored and serving on the live page.'
                : 'Stored. It will appear on the public page once you publish.'
              : note}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            className="ws-btn is-quiet is-sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Icon name="upload" size={14} />
            {isSet ? 'Replace' : 'Upload'}
          </button>
          {isSet ? (
            <form action={remove}>
              <input type="hidden" name="kind" value={kind} />
              <button type="submit" className="ws-btn is-quiet is-sm" disabled={removing || uploading}>
                {removing ? 'Removing…' : 'Remove'}
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <form action={upload}>
        <input type="hidden" name="kind" value={kind} />
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp"
          required
          style={{ display: 'none' }}
          aria-label={`${label} to upload`}
          onChange={(event) => {
            const form = event.target.closest('form');
            if (form) form.requestSubmit();
          }}
        />
      </form>

      {state.status === 'error' ? (
        <p className="ws-small" role="alert" style={{ margin: 0 }}>{state.message}</p>
      ) : null}
      {state.status === 'ok' ? (
        <p className="ws-small ws-muted" role="status" style={{ margin: 0 }}>{state.message}</p>
      ) : null}
    </div>
  );
}
