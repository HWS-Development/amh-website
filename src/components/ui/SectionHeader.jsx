import React from 'react';

/**
 * Editorial section header with eyebrow + serif title + optional subtitle.
 *
 * Usage:
 *   <SectionHeader eyebrow="Stay" title="Unforgettable Experiences" subtitle="..." />
 *
 * Props:
 *   eyebrow   — short uppercase tag (optional)
 *   title     — main heading (string OR ReactNode for italic accent)
 *   subtitle  — supporting paragraph (optional)
 *   align     — 'center' (default) | 'left'
 *   as        — heading tag, defaults to 'h2'
 *   className — extra classes for the wrapper
 *   titleClassName — extra classes for the heading
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  as: Heading = 'h2',
  className = '',
  titleClassName = '',
}) {
  const isCenter = align === 'center';
  const wrapper = isCenter ? 'section-header' : 'section-header-left';
  const eyebrowClass = isCenter
    ? 'eyebrow flex items-center gap-3 before:hidden after:hidden'
    : 'eyebrow';

  return (
    <header className={`${wrapper} ${className}`.trim()}>
      {eyebrow && (
        <span className={eyebrowClass}>
          {isCenter && <span className="inline-block h-px w-8 bg-brand-action/50" />}
          {eyebrow}
          {isCenter && <span className="inline-block h-px w-8 bg-brand-action/50" />}
        </span>
      )}
      <Heading className={`h2-style text-brand-ink ${titleClassName}`.trim()}>
        {title}
      </Heading>
      {subtitle && (
        <p className="body-text text-brand-ink/65 max-w-prose">{subtitle}</p>
      )}
    </header>
  );
}
