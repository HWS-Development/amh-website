/**
 * Motion primitives for premium micro-interactions.
 * Built on framer-motion. All respect prefers-reduced-motion.
 *
 * Exports:
 *   MagneticButton  — Cursor-attracted CTA. Wrap any clickable.
 *   TiltCard        — 3D tilt on hover (mouse parallax). Wrap an image card.
 *   RevealOnView    — Fade-up reveal on first viewport entry.
 *   StaggerGroup    — Staggers children RevealOnView automatically.
 *   Spotlight       — Cursor-following radial highlight overlay.
 *   ShimmerText     — Reveal text on view with mask sweep.
 *   MarqueeRow      — Infinite horizontal scrolling row.
 *   FloatingOrbs    — Decorative animated background blobs.
 */

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";

/* ────────────────────────────────────────────────  MagneticButton  ─── */
export function MagneticButton({
  children,
  as: Tag = "button",
  className = "",
  strength = 22,
  haptic = true,
  ...rest
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const mx = e.clientX - (r.left + r.width / 2);
    const my = e.clientY - (r.top + r.height / 2);
    const max = Math.max(r.width, r.height) / 2;
    x.set((mx / max) * strength);
    y.set((my / max) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const MotionTag = motion(Tag);
  return (
    <MotionTag
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onBlur={reset}
      style={{ x: sx, y: sy }}
      whileTap={haptic && !reduce ? { scale: 0.96 } : undefined}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/* ────────────────────────────────────────────────────────  TiltCard  ─── */
export function TiltCard({
  children,
  className = "",
  intensity = 8,
  ...rest
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
  const rotX = useTransform(sy, [0, 1], [intensity, -intensity]);
  const rotY = useTransform(sx, [0, 1], [-intensity, intensity]);

  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width);
    y.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: reduce ? 0 : rotX,
        rotateY: reduce ? 0 : rotY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────  RevealOnView  ─── */
export function RevealOnView({
  children,
  y = 28,
  delay = 0,
  duration = 0.7,
  className = "",
  once = true,
  as: Tag = "div",
  ...rest
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion(Tag);
  return (
    <MotionTag
      initial={reduce ? false : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-80px" }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/* ──────────────────────────────────────────────────────  StaggerGroup  ─── */
export const StaggerGroup = React.forwardRef(function StaggerGroup(
  { children, className = "", stagger = 0.09, delayChildren = 0, y = 26, ...rest },
  ref
) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren } },
      }}
      className={className}
      {...rest}
    >
      {React.Children.map(children, (child, i) =>
        child && typeof child === "object" ? (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y, filter: "blur(5px)" },
              show: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            {child}
          </motion.div>
        ) : (
          child
        )
      )}
    </motion.div>
  );
});

/* ───────────────────────────────────────────────────────  Spotlight  ─── */
export function Spotlight({ className = "", color = "rgba(191,103,62,0.18)", radius = 320 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [pos, setPos] = useState({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el || reduce) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top, active: true });
    };
    const onLeave = () => setPos((p) => ({ ...p, active: false }));
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduce]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
        pos.active ? "opacity-100" : "opacity-0"
      } ${className}`}
      style={{
        background: `radial-gradient(${radius}px circle at ${pos.x}px ${pos.y}px, ${color}, transparent 60%)`,
      }}
    />
  );
}

/* ──────────────────────────────────────────────────────  ShimmerText  ─── */
export function ShimmerText({ children, className = "", delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      initial={reduce ? false : { backgroundPosition: "200% 0" }}
      whileInView={reduce ? undefined : { backgroundPosition: "-200% 0" }}
      viewport={{ once: true }}
      transition={{ duration: 2, ease: "easeOut", delay }}
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, currentColor 0%, currentColor 35%, rgba(191,103,62,1) 50%, currentColor 65%, currentColor 100%)",
        backgroundSize: "200% 100%",
      }}
    >
      {children}
    </motion.span>
  );
}

/* ──────────────────────────────────────────────────────  MarqueeRow  ─── */
export function MarqueeRow({ children, speed = 40, className = "", reverse = false }) {
  const reduce = useReducedMotion();
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        animate={reduce ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
        className="flex w-max gap-12 will-change-transform"
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────  FloatingOrbs  ─── */
export function FloatingOrbs({ count = 3, className = "" }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const orbs = Array.from({ length: count });
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {orbs.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: 200 + i * 60,
            height: 200 + i * 60,
            background:
              i % 2 === 0
                ? "radial-gradient(circle, rgba(191,103,62,0.18), transparent 70%)"
                : "radial-gradient(circle, rgba(245,241,232,0.5), transparent 70%)",
            top: `${(i * 37) % 80}%`,
            left: `${(i * 53) % 70}%`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
          }}
          transition={{
            duration: 18 + i * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────  AnimatedNumber (counts up) ─── */
export function AnimatedNumber({ value, duration = 1.4, className = "" }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const start = performance.now();
            const animate = (now) => {
              const t = Math.min(1, (now - start) / (duration * 1000));
              const eased = 1 - Math.pow(1 - t, 3);
              setDisplay(Math.round(value * eased));
              if (t < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration, reduce]);
  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

export { AnimatePresence, motion };
