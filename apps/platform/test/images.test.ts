import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import {
  SIZES,
  VARIANT_WIDTHS,
  aspectRatio,
  isImageKey,
  mediaUrl,
  parseWidthParam,
  srcSetFor,
  variantKeyFor,
  variantKeysFor,
  widthsFor,
} from '../lib/images';
import { renderImageRenditions } from '../lib/image-encoder';
import { isWellFormedStorageKey } from '../lib/media';

const KEY = 'w/3f6b1c9e-0f3a-4b2e-9c1d-5a7e8f9b0c1d/2a1b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d/front-room.jpg';

describe('rendition keys', () => {
  it('derives a WebP key beside the original', () => {
    expect(variantKeyFor(KEY, 960)).toBe(
      'w/3f6b1c9e-0f3a-4b2e-9c1d-5a7e8f9b0c1d/2a1b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d/front-room-960.webp',
    );
  });

  it('keeps every derived key inside the shape the media gate accepts', () => {
    const odd = 'w/3f6b1c9e-0f3a-4b2e-9c1d-5a7e8f9b0c1d/2a1b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d/a-very-long-filename-that-someone-actually-typed-out.png';
    for (const variant of variantKeysFor(odd)) {
      expect(isWellFormedStorageKey(variant)).toBe(true);
    }
  });

  it('never invents renditions for documents', () => {
    const pdf = KEY.replace('.jpg', '.pdf');
    expect(variantKeysFor(pdf)).toEqual([]);
    expect(variantKeyFor(pdf, 960)).toBe(pdf);
    expect(srcSetFor(pdf)).toBeUndefined();
  });

  it('recognises only the image types we store', () => {
    expect(isImageKey(KEY)).toBe(true);
    expect(isImageKey(KEY.replace('.jpg', '.avif'))).toBe(true);
    expect(isImageKey(KEY.replace('.jpg', '.pdf'))).toBe(false);
    expect(isImageKey(null)).toBe(false);
  });
});

describe('width requests', () => {
  it('accepts only widths we actually made', () => {
    expect(parseWidthParam('960')).toBe(960);
    expect(parseWidthParam('1000')).toBeNull();
    expect(parseWidthParam('0')).toBeNull();
    expect(parseWidthParam('-480')).toBeNull();
    expect(parseWidthParam('960;drop')).toBeNull();
    expect(parseWidthParam(null)).toBeNull();
  });

  it('does not offer a width larger than the source', () => {
    expect(widthsFor(1200)).toEqual([480, 960]);
    expect(widthsFor(4000)).toEqual([...VARIANT_WIDTHS]);
    expect(widthsFor(300)).toEqual([480]);
    expect(widthsFor(null)).toEqual([...VARIANT_WIDTHS]);
  });

  it('builds URLs that route through the gate, not the bucket', () => {
    expect(mediaUrl(KEY)).toBe(`/api/media/${KEY}`);
    expect(mediaUrl(KEY, { width: 480 })).toBe(`/api/media/${KEY}?w=480`);
    expect(mediaUrl(null)).toBeNull();
  });

  it('gives a browser a srcset of real files only', () => {
    expect(srcSetFor(KEY)).toBe(
      `/api/media/${KEY}?w=480 480w, /api/media/${KEY}?w=960 960w, /api/media/${KEY}?w=1600 1600w`,
    );
    // A small source gets no srcset at all rather than a promise it cannot keep.
    expect(srcSetFor(KEY, { sourceWidth: 400 })).toBeUndefined();
  });

  it('reserves a box only when the dimensions are known', () => {
    expect(aspectRatio(1600, 1200)).toBe('1600 / 1200');
    expect(aspectRatio(null, 1200)).toBeUndefined();
    expect(aspectRatio(0, 0)).toBeUndefined();
    expect(SIZES.thumb).toContain('vw');
  });
});

/** A JPEG as a phone would produce it: portrait, with EXIF including a location. */
async function phonePhoto(width = 2000, height = 3000) {
  return sharp({ create: { width, height, channels: 3, background: { r: 180, g: 170, b: 150 } } })
    .withMetadata({
      orientation: 6,
      exif: {
        IFD0: { Copyright: 'private@example.com', Software: 'TestCam 1.0' },
        IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '6/1 27/1 0/1' },
      },
    })
    .jpeg()
    .toBuffer();
}

describe('renditions', () => {
  it('makes one WebP per width the source can fill', async () => {
    const source = await phonePhoto();
    const result = await renderImageRenditions(
      source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength),
    );

    expect(result).not.toBeNull();
    expect(result!.variants.map((variant) => variant.width)).toEqual([480, 960, 1600]);

    for (const variant of result!.variants) {
      const meta = await sharp(Buffer.from(variant.body)).metadata();
      expect(meta.format).toBe('webp');
      expect(meta.width).toBe(variant.width);
    }
  });

  it('drops EXIF, including the location, and bakes in the orientation', async () => {
    const source = await phonePhoto();
    const result = await renderImageRenditions(
      source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength),
    );

    // The phone says 2000x3000 with orientation 6, which is really a landscape frame.
    expect(result!.width).toBe(3000);
    expect(result!.height).toBe(2000);

    const meta = await sharp(Buffer.from(result!.variants[0].body)).metadata();
    expect(meta.exif).toBeUndefined();
    expect(meta.orientation).toBeUndefined();
    expect(meta.width).toBe(480);
    expect(meta.height).toBe(320);
  });

  it('is much smaller than the original it stands in for', async () => {
    const source = await phonePhoto();
    const result = await renderImageRenditions(
      source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength),
    );
    expect(result!.variants[0].body.byteLength).toBeLessThan(source.byteLength / 2);
  });

  it('refuses anything that is not an image, without throwing', async () => {
    const pdf = Buffer.from('%PDF-1.7\nnot an image');
    expect(await renderImageRenditions(pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength))).toBeNull();
  });
});

describe('media gate without a database', () => {
  it('refuses rather than throwing, so a preview build is not a public file host', async () => {
    const { authoriseMediaRequest } = await import('../lib/media');
    const decision = await authoriseMediaRequest(KEY);
    expect(decision.allowed).toBe(false);
  });
});
