"use client";

import { useActionState, useRef } from 'react';
import { Icon } from './icons';
import { uploadSiteMedia, removeSiteMedia } from '../../lib/actions/site';

/**
 * One slot of the professional page (logo mark or hero cover).
 *
 * Uploads are server-validated like every other image; the public page serves these files only
 * while the site is published, so the preview here is a local object URL the browser builds
 * from the picked file — nothing pretends to be public before it is.
 *
 * This slot is rendered inside the profile <form>, so it must not open a nested <form> of its
 * own (nested forms are invalid and make React fall back to a javascript: action that CSP
 * blocks). The file change and Remove button call the server-action dispatch directly with a
 * FormData instead.
 */
export default function SiteImageSlot({ kind, label, note, currentKey, published }) {
  const [uploadState, upload, uploading] = useActionState(uploadSiteMedia, { status: 'idle' });
  const [removeState, remove, removing] = useActionState(removeSiteMedia, { status: 'idle' });
  const inputRef = useRef(null);

  const state = uploadState.status !== 'idle' ? uploadState : removeState;
  const isSet = Boolean(currentKey) || uploadState.status === 'ok';

  function onPick(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const data = new FormData();
    data.set('kind', kind);
    data.set('file', file);
    upload(data);
  }

  function onRemove() {
    const data = new FormData();
    data.set('kind', kind);
    remove(data);
  }

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
            disabled={uploading || removing}
            onClick={() => inputRef.current?.click()}
          >
            <Icon name="upload" size={14} />
            {isSet ? 'Replace' : 'Upload'}
          </button>
          {isSet ? (
            <button
              type="button"
              className="ws-btn is-quiet is-sm"
              disabled={removing || uploading}
              onClick={onRemove}
            >
              {removing ? 'Removing…' : 'Remove'}
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        aria-label={`${label} to upload`}
        onChange={onPick}
      />

      {state.status === 'error' ? (
        <p className="ws-small" role="alert" style={{ margin: 0 }}>{state.message}</p>
      ) : null}
      {state.status === 'ok' ? (
        <p className="ws-small ws-muted" role="status" style={{ margin: 0 }}>{state.message}</p>
      ) : null}
    </div>
  );
}