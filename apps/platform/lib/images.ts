/**
 * Image delivery rules.
 *
 * Photos are stored once, at full size, in the private bucket. Three WebP renditions are made
 * beside every original and served by the same authorised route, so a phone asks for 480px and
 * a laptop asks for 1600px while both still pass through one release check.
 *
 * Everything here is pure: no storage, no database, no sharp. It is safe to import from a
 * client component, which is how the public page builds its `srcset`.
 */

/** Deliberately few. Each width is a real object in the bucket and a real byte on a phone. */
export const VARIANT_WIDTHS = [480, 960, 1600] as const;

export type VariantWidth = (typeof VARIANT_WIDTHS)[number];

/** The width a page falls back to when a browser ignores `srcset`. */
export const DEFAULT_WIDTH: VariantWidth = 960;

/** Thumbnails in the workspace grid never need more than this. */
export const THUMB_WIDTH: VariantWidth = 480;

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

export function isVariantWidth(value: number): value is VariantWidth {
  return (VARIANT_WIDTHS as readonly number[]).includes(value);
}

/** A requested width is only ever honoured if it is one we actually made. */
export function parseWidthParam(raw: string | null | undefined): VariantWidth | null {
  // Strict digits only: `parseInt('960;drop')` returns 960, which would let junk ride along.
  if (!raw || !/^[0-9]{1,4}$/.test(raw)) return null;
  const parsed = Number.parseInt(raw, 10);
  return isVariantWidth(parsed) ? parsed : null;
}

export function imageExtension(key: string): string | null {
  const ext = key.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.includes(ext) ? ext : null;
}

export function isImageKey(key: string | null | undefined): boolean {
  return typeof key === 'string' && imageExtension(key) !== null;
}

/**
 * The rendition key for a given width: `.../front-room.jpg` becomes `.../front-room-960.webp`.
 * Derived, never supplied by the client, so a guessed key cannot address a file that the
 * release check has not seen.
 */
export function variantKeyFor(key: string, width: number): string {
  if (!isImageKey(key)) return key;
  const base = key.replace(/\.[^.]+$/, '');
  // The key shape allows 80 characters for the filename segment; keep derivations inside it.
  const stem = base.slice(0, base.lastIndexOf('/') + 1) + (base.slice(base.lastIndexOf('/') + 1)).slice(0, 60);
  return `${stem}-${width}.webp`;
}

export function variantKeysFor(key: string): string[] {
  if (!isImageKey(key)) return [];
  return VARIANT_WIDTHS.map((width) => variantKeyFor(key, width));
}

/** Widths worth requesting for a source that is smaller than our largest rendition. */
export function widthsFor(sourceWidth: number | null | undefined): VariantWidth[] {
  if (!sourceWidth || sourceWidth <= 0) return [...VARIANT_WIDTHS];
  const usable = VARIANT_WIDTHS.filter((width) => width <= sourceWidth * 1.02);
  return usable.length > 0 ? usable : [VARIANT_WIDTHS[0]];
}

export type MediaUrlOptions = {
  /** Force one rendition, e.g. a 480px thumbnail. */
  width?: number | null;
  /** Only offer renditions the source is big enough for, so nothing is upscaled. */
  sourceWidth?: number | null;
};

export function mediaUrl(key: string | null | undefined, options: MediaUrlOptions = {}): string | null {
  if (!key) return null;
  if (!isImageKey(key)) return `/api/media/${key}`;
  const width = options.width ?? null;
  return width ? `/api/media/${key}?w=${width}` : `/api/media/${key}`;
}

/**
 * `srcset` for a stored photo. Returns undefined for documents and for sources too small to
 * benefit, so the caller can spread the result without branching.
 */
export function srcSetFor(
  key: string | null | undefined,
  options: { sourceWidth?: number | null } = {},
): string | undefined {
  if (!key || !isImageKey(key)) return undefined;
  const widths = widthsFor(options.sourceWidth);
  if (widths.length < 2) return undefined;
  return widths.map((width) => `/api/media/${key}?w=${width} ${width}w`).join(', ');
}

/** Common `sizes` values, named so pages do not invent their own and drift. */
export const SIZES = {
  fullBleed: '100vw',
  hero: '(min-width: 1024px) 58vw, 100vw',
  galleryHalf: '(min-width: 900px) 50vw, 100vw',
  galleryThird: '(min-width: 900px) 33vw, 50vw',
  thumb: '(min-width: 900px) 220px, 45vw',
} as const;

/** Aspect ratio as a CSS value, so a photo reserves its box before a byte arrives. */
export function aspectRatio(
  width: number | null | undefined,
  height: number | null | undefined,
): string | undefined {
  if (!width || !height || width <= 0 || height <= 0) return undefined;
  return `${width} / ${height}`;
}
