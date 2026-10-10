import { PNG } from 'pngjs';
import * as jpeg from 'jpeg-js';
import type { ImageDataLike } from './contrast';

export interface DecodedImage extends ImageDataLike {
  data: Uint8ClampedArray;
}

/** Decode a PNG or JPEG screenshot to RGBA pixels. No native modules. */
export function decodeImage(buffer: Uint8Array): DecodedImage {
  const b = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    const png = PNG.sync.read(b);
    return { data: new Uint8ClampedArray(png.data), width: png.width, height: png.height };
  }
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8) {
    const img = jpeg.decode(b, { useTArray: true, formatAsRGBA: true });
    return { data: new Uint8ClampedArray(img.data), width: img.width, height: img.height };
  }
  throw new Error('RenderCheck: unsupported image format (expected PNG or JPEG)');
}
