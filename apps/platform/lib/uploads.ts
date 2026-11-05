/**
 * Upload validation, done on the server.
 *
 * A `Content-Type` header is a claim, not evidence. Each accepted type is checked against its
 * magic bytes before a byte is written, so an HTML file renamed to `.jpg` is refused rather
 * than stored and later served by the media route.
 */

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

export type AllowedType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif' | 'application/pdf';

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
    type: 'image/avif',
    ext: 'avif',
    test: (b) =>
      b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 &&
      b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69 && b[11] === 0x66,
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
  too_large: 'That file is over 12 MB. Compress it and try again.',
  unsupported_type: 'Photos (JPEG, PNG, WebP, AVIF) and PDFs only.',
  name_too_long: 'That filename is too long. Rename it and try again.',
  type_mismatch: 'That file is not the type its name claims. We did not store it.',
};

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
  if (input.bytes.byteLength > MAX_UPLOAD_BYTES) return { ok: false, reason: 'too_large' };
  if (input.filename.length > 120) return { ok: false, reason: 'name_too_long' };

  const detected = detectType(input.bytes);
  if (!detected) return { ok: false, reason: 'unsupported_type' };

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
