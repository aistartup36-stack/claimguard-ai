/**
 * Image utilities for the analysis pipeline.
 *
 * Claude's vision API caps base64 images at 5 MB. iPhone / Android photos
 * routinely exceed that (a 12 MP HEIC -> JPEG export is often 8–15 MB).
 *
 * `compressForClaude(file)` returns a `{ buffer, mimetype, originalname }`
 * shape that is guaranteed to be either:
 *   - the original file unchanged (if it's already safe), or
 *   - a re-encoded JPEG that fits comfortably under Claude's limit.
 *
 * Non-images (PDFs, anything sharp can't decode) are returned unchanged so
 * the caller can pass them straight through to Claude as document blocks.
 *
 * On any failure we return the original — let Claude reject if it must,
 * but never throw out of this helper.
 */

const sharp = require('sharp');

// Claude's hard cap is 5 MB; we aim well under to leave headroom for base64
// expansion (~33% overhead) and small per-request envelope.
const TARGET_MAX_BYTES = 4.5 * 1024 * 1024;

// Anything above this width gets resized. 2000 px is more than enough detail
// for Claude to assess a damage photo and keeps file size predictable.
const MAX_DIMENSION = 2000;

const COMPRESSIBLE_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp'
]);

async function compressForClaude(file) {
  // Pass through anything we can't or shouldn't touch.
  if (!file || !file.buffer || !COMPRESSIBLE_MIMES.has(file.mimetype)) return file;
  if (file.buffer.length <= TARGET_MAX_BYTES) return file;

  try {
    let pipeline = sharp(file.buffer, { failOn: 'none' }).rotate(); // auto-orient via EXIF

    const meta = await pipeline.metadata();
    if (meta.width > MAX_DIMENSION || meta.height > MAX_DIMENSION) {
      pipeline = pipeline.resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true });
    }

    let buffer = await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer();

    // Belt-and-braces: if 2000 px @ q80 still busts the limit (very rare),
    // step down quality until it fits.
    for (const q of [65, 50, 35]) {
      if (buffer.length <= TARGET_MAX_BYTES) break;
      buffer = await sharp(file.buffer, { failOn: 'none' })
        .rotate()
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: q, mozjpeg: true })
        .toBuffer();
    }

    if (buffer.length > TARGET_MAX_BYTES) {
      console.warn(`[image-utils] could not compress ${file.originalname} below ${TARGET_MAX_BYTES} bytes; got ${buffer.length}`);
      return file; // last resort — return original; Claude will reject and the error will surface
    }

    console.log(`[image-utils] ${file.originalname}: ${file.buffer.length} -> ${buffer.length} bytes (${file.mimetype} -> image/jpeg)`);
    return { buffer, mimetype: 'image/jpeg', originalname: file.originalname };

  } catch (err) {
    console.warn(`[image-utils] compress failed for ${file.originalname}: ${err.message}`);
    return file;
  }
}

module.exports = { compressForClaude };
