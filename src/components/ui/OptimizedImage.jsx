import React, { useState } from 'react';
import { optimizeImageUrl, supportsResponsiveResize } from '@/lib/imageUtils';

/**
 * Drop-in `<img>` replacement with:
 *   - `loading="lazy"` by default            (skipped when `loading="eager"`)
 *   - `decoding="async"` + `fetchpriority="auto"`
 *   - Automatic `quality=60` for every URL
 *   - Responsive `srcset` for CDNs that support resizing
 *     (Supabase Storage and Cloudflare Images)
 *   - Smooth fade-in on load so partially-decoded JPEGs don't appear
 *     "piece by piece"; the image is fully revealed only once decoded.
 *
 * Accepts all standard <img> attributes plus:
 *   - `quality`   (number) — JPEG/WebP quality (default 60).
 *   - `sizes`     (string) — CSS `sizes` hint (default '100vw' on mobile).
 *   - `responsive`(bool)   — disable srcset generation when false.
 *   - `fade`      (bool)   — disable fade-in when false.
 *   - `width`     (number) — base width hint for the 1x source.
 */
const DEFAULT_WIDTHS = [400, 640, 960, 1280, 1600];

const OptimizedImage = React.forwardRef(
  (
    {
      src,
      loading = 'lazy',
      quality = 60,
      width,
      height,
      sizes,
      responsive = true,
      fade = true,
      onLoad,
      onError,
      style,
      className = '',
      ...props
    },
    ref,
  ) => {
    const [loaded, setLoaded] = useState(false);

    const baseSrc = optimizeImageUrl(src, {
      quality,
      width: width || undefined,
      height: height || undefined,
    });

    // srcset only when the CDN actually supports resize
    let srcSet;
    if (responsive && supportsResponsiveResize(src)) {
      srcSet = DEFAULT_WIDTHS.map(
        (w) => `${optimizeImageUrl(src, { quality, width: w })} ${w}w`,
      ).join(', ');
    }

    const handleLoad = (e) => {
      setLoaded(true);
      if (onLoad) onLoad(e);
    };

    const handleError = (e) => {
      // Reveal even on error so the broken-image icon / alt text shows
      setLoaded(true);
      if (onError) onError(e);
    };

    const fadeStyle = fade
      ? {
          opacity: loaded ? 1 : 0,
          transition: 'opacity 320ms ease-out',
          backgroundColor: loaded ? undefined : 'rgba(214, 200, 178, 0.18)',
          ...style,
        }
      : style;

    return (
      <img
        ref={ref}
        src={baseSrc}
        srcSet={srcSet}
        sizes={srcSet ? (sizes || '(max-width: 768px) 100vw, 50vw') : undefined}
        loading={loading}
        decoding="async"
        fetchpriority={props.fetchPriority || props.fetchpriority || 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        style={fadeStyle}
        className={className}
        {...props}
      />
    );
  },
);

OptimizedImage.displayName = 'OptimizedImage';
export default OptimizedImage;
