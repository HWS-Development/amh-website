/**
 * Image URL optimization utilities.
 *
 * Supports per-CDN rewriting + width/quality params:
 *   - Supabase Storage  → /render/image/public/ + width + quality
 *   - Cloudflare Images (imagedelivery.net) → /w=<W>,q=<Q> variant
 *   - All other URLs    → ?quality=<Q> appended (best-effort)
 *
 * The same utility is used to build single src and srcset entries.
 */

const SUPABASE_OBJECT_PATH = '/storage/v1/object/public/';
const SUPABASE_RENDER_PATH = '/storage/v1/render/image/public/';
const CLOUDFLARE_HOST = 'imagedelivery.net';

/**
 * Return an optimized version of an image URL.
 *
 * @param {string} url        — original image URL
 * @param {object} [options]
 * @param {number} [options.quality=60] — JPEG/WebP quality (1-100)
 * @param {number} [options.width]      — optional resize width (px)
 * @param {number} [options.height]     — optional resize height (px)
 * @returns {string}
 */
export function optimizeImageUrl(url, { quality = 60, width, height } = {}) {
  if (!url || typeof url !== 'string') return url || '';

  // ── Supabase storage → render endpoint with quality + resize
  if (url.includes(SUPABASE_OBJECT_PATH)) {
    let optimized = url.replace(SUPABASE_OBJECT_PATH, SUPABASE_RENDER_PATH);
    const params = new URLSearchParams();
    params.set('quality', String(quality));
    if (width) params.set('width', String(width));
    if (height) params.set('height', String(height));
    const separator = optimized.includes('?') ? '&' : '?';
    return `${optimized}${separator}${params.toString()}`;
  }

  // ── Cloudflare Images (imagedelivery.net/<account>/<id>/<variant>)
  // Replace the variant with a flexible one: `w=<W>,q=<Q>`.
  if (url.includes(CLOUDFLARE_HOST)) {
    const parts = url.split('/');
    if (parts.length >= 6) {
      const variant = [];
      if (width) variant.push(`w=${Math.round(width)}`);
      variant.push(`q=${Math.round(quality)}`);
      parts[parts.length - 1] = variant.join(',');
      return parts.join('/');
    }
  }

  // ── All other URLs: append quality param (best-effort)
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}quality=${encodeURIComponent(quality)}`;
}

/**
 * Returns true if the URL supports CDN-side resizing (so srcset variants
 * actually produce different sizes).
 */
export function supportsResponsiveResize(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes(SUPABASE_OBJECT_PATH) || url.includes(CLOUDFLARE_HOST);
}
