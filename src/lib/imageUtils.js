/**
 * Image URL optimization utilities.
 *
 * Transforms Supabase Storage public URLs to use the render/transform
 * endpoint with quality compression. Other URLs pass through unchanged.
 *
 * Supabase transform docs:
 *   /storage/v1/object/public/...   → original (no transforms)
 *   /storage/v1/render/image/public/... ?quality=60  → optimized
 */

const SUPABASE_OBJECT_PATH = '/storage/v1/object/public/';
const SUPABASE_RENDER_PATH = '/storage/v1/render/image/public/';

/**
 * Return an optimized version of an image URL.
 *
 * - Supabase storage URLs: rewrite to the render endpoint + quality param.
 * - All other URLs: returned unchanged.
 *
 * @param {string} url        — original image URL
 * @param {object} [options]
 * @param {number} [options.quality=60] — JPEG/WebP quality (1-100)
 * @param {number} [options.width]      — optional resize width
 * @param {number} [options.height]     — optional resize height
 * @returns {string}
 */
export function optimizeImageUrl(url, { quality = 60, width, height } = {}) {
  if (!url || typeof url !== 'string') return url || '';

  // Only transform Supabase storage URLs
  if (!url.includes(SUPABASE_OBJECT_PATH)) return url;

  let optimized = url.replace(SUPABASE_OBJECT_PATH, SUPABASE_RENDER_PATH);

  const params = new URLSearchParams();
  params.set('quality', String(quality));
  if (width) params.set('width', String(width));
  if (height) params.set('height', String(height));

  const separator = optimized.includes('?') ? '&' : '?';
  return `${optimized}${separator}${params.toString()}`;
}
