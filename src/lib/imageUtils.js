/**
 * Image URL optimization utilities.
 *
 * - Supabase Storage URLs: rewrite to render/transform endpoint + quality=60.
 * - All other URLs: append quality=60 query param (best-effort — some CDNs
 *   respect it, others ignore it).
 */

const SUPABASE_OBJECT_PATH = '/storage/v1/object/public/';
const SUPABASE_RENDER_PATH = '/storage/v1/render/image/public/';

/**
 * Return an optimized version of an image URL.
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

  // Supabase storage → render endpoint with quality+resize
  if (url.includes(SUPABASE_OBJECT_PATH)) {
    let optimized = url.replace(SUPABASE_OBJECT_PATH, SUPABASE_RENDER_PATH);
    const params = new URLSearchParams();
    params.set('quality', String(quality));
    if (width) params.set('width', String(width));
    if (height) params.set('height', String(height));
    const separator = optimized.includes('?') ? '&' : '?';
    return `${optimized}${separator}${params.toString()}`;
  }

  // All other URLs: append quality param (best-effort)
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}quality=${encodeURIComponent(quality)}`;
}
