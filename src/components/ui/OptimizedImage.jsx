import React from 'react';
import { optimizeImageUrl } from '@/lib/imageUtils';

/**
 * Drop-in `<img>` replacement with:
 *   - `loading="lazy"` by default
 *   - Automatic quality=60 optimization for Supabase storage URLs
 *
 * Accepts all standard <img> attributes.
 *
 * Usage:
 *   <OptimizedImage src={url} alt="..." className="..." />
 *   <OptimizedImage src={url} alt="..." loading="eager" />  // override lazy
 *   <OptimizedImage src={url} alt="..." quality={80} />     // override quality
 */
const OptimizedImage = React.forwardRef(
  ({ src, loading = 'lazy', quality = 60, width, height, ...props }, ref) => (
    <img
      ref={ref}
      src={optimizeImageUrl(src, { quality, width: undefined, height: undefined })}
      loading={loading}
      decoding="async"
      {...props}
    />
  ),
);

OptimizedImage.displayName = 'OptimizedImage';
export default OptimizedImage;
