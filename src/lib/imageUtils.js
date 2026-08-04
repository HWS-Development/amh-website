/**
 * Image URL optimization utilities.
 *
 * Supports per-CDN rewriting + width/quality params:
 *   - Cloudflare Images (imagedelivery.net) → /w=<W>,q=<Q> variant
 *   - All other URLs    → ?quality=<Q> appended (best-effort)
 *
 * The same utility is used to build single src and srcset entries.
 */

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
  return url.includes(CLOUDFLARE_HOST);
}
