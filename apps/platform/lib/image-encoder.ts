import { VARIANT_WIDTHS, type VariantWidth } from './images';

/**
 * Renditions, made once on the server at upload time.
 *
 * Two things happen in this pipeline that matter beyond file size:
 *
 * 1. **Metadata is dropped.** A phone photo carries GPS coordinates, a device serial and a
 *    capture time. Re-encoding without `keepMetadata()` removes all of it, which is the
 *    difference between a listing photo and a home address for the seller.
 * 2. **Orientation is baked in.** `.rotate()` applies the EXIF orientation before the tag is
 *    discarded, so a portrait photo stays portrait instead of arriving sideways.
 *
 * Renditions live beside the original in the same private bucket and are served by the same
 * authorised route. Nothing here knows about URLs, release state or databases.
 */

export type RenderedVariant = {
  width: VariantWidth;
  body: ArrayBuffer;
};

export type ImageRendition = {
  /** Source dimensions after orientation, used for `aspect-ratio` and `srcset` limits. */
  width: number;
  height: number;
  variants: RenderedVariant[];
};

const WEBP_QUALITY = 78;

type SharpLike = (input: ArrayBuffer | Uint8Array) => {
  metadata: () => Promise<{ width?: number; height?: number; orientation?: number }>;
  rotate: () => any;
};

async function loadSharp(): Promise<SharpLike | null> {
  try {
    const mod = await import('sharp');
    return (mod.default ?? mod) as unknown as SharpLike;
  } catch (error) {
    console.error('[images] sharp is unavailable; storing originals only', {
      message: (error as Error).message,
    });
    return null;
  }
}

/**
 * Returns `null` when the file cannot be read as an image. Callers keep the original either
 * way: a missing rendition must never lose the upload.
 */
export async function renderImageRenditions(bytes: ArrayBuffer): Promise<ImageRendition | null> {
  const sharp = await loadSharp();
  if (!sharp) return null;

  try {
    const input = Buffer.from(bytes);
    const probe = sharp(bytes);
    const meta = await probe.metadata();
    const orientation = meta.orientation ?? 1;
    const swapped = orientation >= 5 && orientation <= 8;
    const sourceWidth = swapped ? meta.height ?? 0 : meta.width ?? 0;
    const sourceHeight = swapped ? meta.width ?? 0 : meta.height ?? 0;

    if (!sourceWidth || !sourceHeight) return null;

    // Only widths the source can fill. Upscaling would cost bandwidth and look worse.
    const targets = VARIANT_WIDTHS.filter((width) => width <= sourceWidth * 1.02);
    const widths = targets.length > 0 ? targets : [VARIANT_WIDTHS[0]];

    const variants: RenderedVariant[] = [];
    for (const width of widths) {
      const body = await sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: WEBP_QUALITY, effort: 4 })
        .toBuffer();

      variants.push({ width, body: body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) });
    }

    return { width: sourceWidth, height: sourceHeight, variants };
  } catch (error) {
    console.error('[images] rendition failed; keeping the original', {
      message: (error as Error).message,
    });
    return null;
  }
}
