import { describe, expect, it } from 'vitest';
import { MAX_UPLOAD_BYTES, detectType, validateUpload } from '../lib/uploads';

const bytes = (...values: number[]) => new Uint8Array(values);

const jpeg = bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46);
const png = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const pdf = bytes(0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37);
const webp = bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50);
const html = bytes(0x3c, 0x21, 0x44, 0x4f, 0x43, 0x54, 0x59, 0x50, 0x45);

describe('file type detection', () => {
  it('reads magic bytes, not names', () => {
    expect(detectType(jpeg)).toBe('image/jpeg');
    expect(detectType(png)).toBe('image/png');
    expect(detectType(pdf)).toBe('application/pdf');
    expect(detectType(webp)).toBe('image/webp');
  });

  it('refuses anything that is not a photo or a PDF', () => {
    expect(detectType(html)).toBeNull();
    expect(detectType(bytes(0x3c, 0x73, 0x76, 0x67))).toBeNull();
    expect(detectType(bytes())).toBeNull();
  });
});

describe('upload validation', () => {
  it('accepts a real JPEG and renames it to the detected type', () => {
    const result = validateUpload({ filename: 'Front of house.JPG', declaredType: 'image/jpeg', bytes: jpeg });
    expect(result.ok).toBe(true);
    expect(result.type).toBe('image/jpeg');
    expect(result.filename).toBe('front-of-house.jpg');
  });

  it('catches a renamed file: HTML bytes wearing a .jpg name', () => {
    const result = validateUpload({ filename: 'photo.jpg', declaredType: 'image/jpeg', bytes: html });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('unsupported_type');
  });

  it('catches a declared type that does not match the bytes', () => {
    const result = validateUpload({ filename: 'photo.jpg', declaredType: 'image/jpeg', bytes: png });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('type_mismatch');
  });

  it('rejects empty files', () => {
    expect(validateUpload({ filename: 'a.jpg', declaredType: 'image/jpeg', bytes: bytes() }).reason).toBe(
      'empty',
    );
  });

  it('rejects files over the limit before reading them further', () => {
    const big = new Uint8Array(MAX_UPLOAD_BYTES + 1);
    big.set(jpeg);
    expect(validateUpload({ filename: 'big.jpg', declaredType: 'image/jpeg', bytes: big }).reason).toBe(
      'too_large',
    );
  });

  it('strips path characters out of the stored filename', () => {
    const result = validateUpload({
      filename: '../../etc/passwd.jpg',
      declaredType: 'image/jpeg',
      bytes: jpeg,
    });
    expect(result.ok).toBe(true);
    expect(result.filename).not.toContain('/');
    expect(result.filename).not.toContain('..');
  });
});
