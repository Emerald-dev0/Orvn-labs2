'use client';

import { useActionState, useState } from 'react';
import { Icon } from './icons';
import { setMediaVisibility, setCoverMedia, removeMedia, moveMedia } from '../../lib/actions/media';
import { SIZES, THUMB_WIDTH, aspectRatio, mediaUrl, srcSetFor } from '../../lib/images';

/**
 * One media tile with its controls.
 *
 * Per-file visibility is a real server decision, so the toggle is a form, not a client
 * optimistic flip: nothing changes on screen until the server agrees. Removing a file
 * confirms first, because a removed photo cannot be brought back.
 */
export default function MediaTile({ item, propertyId, position = 0, total = 1 }) {
  const [visibilityState, toggleVisibility, visibilityPending] = useActionState(setMediaVisibility, {
    status: 'idle',
  });
  const [coverState, makeCover, coverPending] = useActionState(setCoverMedia, { status: 'idle' });
  const [removeState, remove, removePending] = useActionState(removeMedia, { status: 'idle' });
  const [moveState, move, movePending] = useActionState(moveMedia, { status: 'idle' });
  const [confirming, setConfirming] = useState(false);

  const isPublic = item.visibility === 'public';
  const error = [visibilityState, coverState, removeState, moveState].find((s) => s.status === 'error');
  const pending = visibilityPending || coverPending || removePending || movePending;

  return (
    <div className="ws-media-cell">
      <div className="ws-media">
        <img
          src={mediaUrl(item.key, { width: THUMB_WIDTH, sourceWidth: item.width })}
          srcSet={srcSetFor(item.key, { sourceWidth: item.width })}
          sizes={SIZES.thumb}
          width={item.width || undefined}
          height={item.height || undefined}
          style={{ aspectRatio: aspectRatio(item.width, item.height) }}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div className="ws-media-tags">
          {item.isCover ? <span className="ws-media-tag">Cover</span> : null}
          <span className={`ws-media-tag ${isPublic ? '' : 'is-private'}`}>
            {isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
      <div className="ws-media-actions">
        {!item.isCover ? (
          <form action={makeCover}>
            <input type="hidden" name="mediaId" value={item.id} />
            <input type="hidden" name="propertyId" value={propertyId} />
            <button type="submit" className="ws-media-btn" disabled={pending}>
              {coverPending ? 'Setting…' : 'Set as cover'}
            </button>
          </form>
        ) : null}
        {total > 1 ? (
          <>
            <form action={move}>
              <input type="hidden" name="mediaId" value={item.id} />
              <input type="hidden" name="propertyId" value={propertyId} />
              <input type="hidden" name="direction" value="up" />
              <button type="submit" className="ws-media-btn" disabled={pending || position === 0} title="Move earlier">
                <Icon name="arrowLeft" size={13} />
                Earlier
              </button>
            </form>
            <form action={move}>
              <input type="hidden" name="mediaId" value={item.id} />
              <input type="hidden" name="propertyId" value={propertyId} />
              <input type="hidden" name="direction" value="down" />
              <button type="submit" className="ws-media-btn" disabled={pending || position === total - 1} title="Move later">
                Later
                <Icon name="arrowRight" size={13} />
              </button>
            </form>
          </>
        ) : null}
        <form action={toggleVisibility}>
          <input type="hidden" name="mediaId" value={item.id} />
          <input type="hidden" name="propertyId" value={propertyId} />
          {isPublic ? null : <input type="hidden" name="isPublic" value="true" />}
          <button type="submit" className="ws-media-btn" disabled={pending}>
            {visibilityPending ? 'Saving…' : isPublic ? 'Make private' : 'Make public'}
          </button>
        </form>
        {confirming ? (
          <>
            <form action={remove}>
              <input type="hidden" name="mediaId" value={item.id} />
              <input type="hidden" name="propertyId" value={propertyId} />
              <button type="submit" className="ws-media-btn is-danger" disabled={pending}>
                {removePending ? 'Removing…' : 'Confirm remove'}
              </button>
            </form>
            <button type="button" className="ws-media-btn" onClick={() => setConfirming(false)}>
              Keep
            </button>
          </>
        ) : (
          <button
            type="button"
            className="ws-media-btn is-danger"
            disabled={pending}
            onClick={() => setConfirming(true)}
          >
            <Icon name="trash" size={13} />
            Remove
          </button>
        )}
        {error ? (
          <p className="ws-small" role="alert" style={{ margin: 0 }}>{error.message}</p>
        ) : null}
      </div>
    </div>
  );
}
