/**
 * Motion design tokens for the AMH editorial design system.
 * Use these everywhere instead of hard-coding durations / easings,
 * so every animation feels consistent across the site.
 */

// Cubic-bezier easings tuned for editorial / luxury feel
export const easing = {
  // Smooth, decelerating — for content reveals
  editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
  // Tight and snappy — for UI feedback (buttons, toggles)
  silk: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Strong accel + decel — for hero / large transitions
  inOutQuint: 'cubic-bezier(0.83, 0, 0.17, 1)',
  // Soft overshoot — used sparingly
  softBack: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
};

// GSAP easing strings (different API than CSS)
export const gsapEase = {
  editorial: 'power3.out',
  silk: 'power2.out',
  inOutQuint: 'power4.inOut',
  softBack: 'back.out(1.4)',
};

// Standard durations (seconds — gsap) and ms — CSS
export const duration = {
  instant: 0.15,
  fast: 0.25,
  base: 0.4,
  slow: 0.7,
  hero: 1.1,
  cinematic: 1.6,
};

// Default reveal config for scroll-triggered fade-up animations.
export const revealUp = {
  y: 32,
  opacity: 0,
  duration: duration.slow,
  ease: gsapEase.editorial,
};

export const revealUpFast = {
  y: 18,
  opacity: 0,
  duration: duration.base,
  ease: gsapEase.editorial,
};

// Standard ScrollTrigger window settings
export const scrollTrigger = {
  start: 'top 82%',
  once: true,
};

// Stagger presets
export const stagger = {
  tight: 0.06,
  base: 0.1,
  loose: 0.16,
};

// Respect user's reduced-motion preference
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
