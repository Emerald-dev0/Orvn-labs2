'use client';

import { useActionState } from 'react';
import { Icon } from './icons';
import { uploadMedia } from '../../lib/actions/media';

/**
 * Server-side uploads: the browser posts the file to the app, the app validates the bytes and
 * writes to private storage. No presigned write credential ever reaches the page.
 */
export default function MediaUploader({ propertyId }) {
  const [state, action, pending] = useActionState(uploadMedia, { status: 'idle' });

  return (
    <form action={action} style={{ display: 'grid', gap: 10 }}>
      <input type="hidden" name="propertyId" value={propertyId} />
      <label
        style={{
          display: 'grid',
          placeItems: 'center',
          gap: 6,
          padding: '22px 16px',
          borderRadius: 14,
          border: '1px dashed var(--line-2)',
          background: 'var(--bone)',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        <Icon name="upload" size={20} />
        <span style={{ fontSize: 13.5, fontWeight: 500 }}>Choose photos or documents</span>
        <span className="ws-small ws-muted">JPEG, PNG, WebP, AVIF or PDF · up to 12 MB each</span>
        <input type="file" name="files" multiple accept="image/jpeg,image/png,image/webp,image/avif,application/pdf" style={{ display: 'none' }} />
      </label>

      <label className="ws-small ws-muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" name="makePublic" defaultChecked />
        Make these public on the page once it is published
      </label>

      {state.status === 'error' ? (
        <div className="ws-callout is-warn" role="alert">
          <Icon name="alert" size={16} />
          <div><p>{state.message}</p></div>
        </div>
      ) : null}

      {state.status === 'ok' ? (
        <div className="ws-callout is-ok" role="status">
          <Icon name="checkCircle" size={16} />
          <div><p>{state.message}</p></div>
        </div>
      ) : null}

      <button type="submit" className="ws-btn is-dark is-sm" disabled={pending}>
        {pending ? 'Uploading…' : 'Upload'}
      </button>
    </form>
  );
}
