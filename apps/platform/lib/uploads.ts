/**
 * Upload validation, done on the server.
 *
 * A `Content-Type` header is a claim, not evidence. Each accepted type is checked against its
 * magic bytes before a byte is written, so an HTML file renamed to `.jpg` is refused rather
 * than stored and later served by the media route.
 */

/** PRD D18: photos 10 MB each (JPEG/PNG/WebP), documents 25 MB each (PDF only). No AVIF, no video. */
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = MAX_DOCUMENT_BYTES; // back-compat upper bound
export const MAX_PHOTOS_PER_PROPERTY = 25;
export const MAX_DOCUMENTS_PER_PROPERTY = 10;
export const MAX_PROPERTY_TOTAL_BYTES = 500 * 1024 * 1024;

export type AllowedType = 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';

const SIGNATURES: { type: AllowedType; test: (bytes: Uint8Array) => boolean; ext: string }[] = [
  { type: 'image/jpeg', ext: 'jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    type: 'image/png',
    ext: 'png',
    test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    type: 'image/webp',
    ext: 'webp',
    test: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  {
    type: 'application/pdf',
    ext: 'pdf',
    test: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
  },
];

export function detectType(bytes: Uint8Array): AllowedType | null {
  for (const signature of SIGNATURES) {
    try {
      if (signature.test(bytes)) return signature.type;
    } catch {
      return null;
    }
  }
  return null;
}

export function extensionFor(type: AllowedType): string {
  return SIGNATURES.find((signature) => signature.type === type)?.ext ?? 'bin';
}

export type ValidationFailure =
  | 'empty'
  | 'too_large'
  | 'unsupported_type'
  | 'name_too_long'
  | 'type_mismatch';

/**
 * One shape with optional fields rather than a discriminated union: the project compiles with
 * `strict: false`, where narrowing on a boolean discriminant is unreliable.
 */
export type ValidatedUpload = {
  ok: boolean;
  type?: AllowedType;
  filename?: string;
  reason?: ValidationFailure;
};

const REASON_COPY: Record<ValidationFailure, string> = {
  empty: 'That file was empty.',
  too_large: 'That file is over the limit: 10 MB for photos, 25 MB for PDFs. Compress it and try again.',
  unsupported_type: 'Photos (JPEG, PNG, WebP, up to 10 MB) and PDFs (up to 25 MB) only.',
  name_too_long: 'That filename is too long. Rename it and try again.',
  type_mismatch: 'That file is not the type its name claims. We did not store it.',
};

export function byteLimitFor(type: AllowedType): number {
  return type === 'application/pdf' ? MAX_DOCUMENT_BYTES : MAX_PHOTO_BYTES;
}

export function uploadErrorMessage(reason: ValidationFailure): string {
  return REASON_COPY[reason];
}

/**
 * Validates a file by its bytes. `declaredType` is only used to detect a mismatch worth
 * telling the user about; the decision comes from the content.
 */
export function validateUpload(input: {
  filename: string;
  declaredType: string;
  bytes: Uint8Array;
}): ValidatedUpload {
  if (input.bytes.byteLength === 0) return { ok: false, reason: 'empty' };
  if (input.filename.length > 120) return { ok: false, reason: 'name_too_long' };

  const detected = detectType(input.bytes);
  if (!detected) return { ok: false, reason: 'unsupported_type' };
  if (input.bytes.byteLength > byteLimitFor(detected)) return { ok: false, reason: 'too_large' };

  if (
    input.declaredType &&
    input.declaredType !== detected &&
    !(input.declaredType === 'image/jpg' && detected === 'image/jpeg')
  ) {
    return { ok: false, reason: 'type_mismatch' };
  }

  const base =
    input.filename
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '-')
      // No traversal fragments and no leading punctuation: a filename is not a path.
      .replace(/\.{2,}/g, '.')
      .replace(/^[.\-_]+/, '')
      .slice(0, 60) || 'file';

  return { ok: true, type: detected, filename: `${base}.${extensionFor(detected)}` };
}
