import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Always-visible floating Book-Direct badge.
 *
 * Position: fixed at the very bottom of the viewport (same vertical level
 * as the hero "Discover more" chevron), left-aligned. Identical on all
 * breakpoints — only the badge size changes responsively.
 *
 * Click goes straight to SimpleBooking.
 * Honors prefers-reduced-motion.
 */
const BOOK_DIRECT_URL =
  `${import.meta.env.VITE_SIMPLEBOOKING_BASE || "https://www.simplebooking.it/portal/256"}?lang=EN&cur=EUR`;

const FloatingBookButton = () => {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState(() => {
    if (typeof window === "undefined") return "desktop";
    if (window.innerWidth < 640) return "mobile";
    if (window.innerWidth < 1024) return "tablet";
    return "desktop";
  });

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 700);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setViewport(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!mounted) return null;

  // Responsive badge size — position stays at the bottom on every breakpoint.
  const size = viewport === "mobile" ? 64 : viewport === "tablet" ? 76 : 88;
  const bottomPx = viewport === "mobile" ? 16 : 22;
  const leftPx = viewport === "mobile" ? 12 : 20;

  return (
    <motion.a
      href={BOOK_DIRECT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${t("badgeBookDirect") || "Réservez en direct"} — ${t("badgeBestPrices") || "Meilleurs tarifs"} ${t("badgeGuaranteed") || "garantis"}`}
      initial={reduce ? { opacity: 0 } : { scale: 0.35, opacity: 0, rotate: -20 }}
      animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: 0 }}
      transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={reduce ? undefined : { scale: 1.08 }}
      whileTap={reduce ? undefined : { scale: 0.95 }}
      className="fab-book-direct fixed z-[70] block select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c4804a] rounded-full"
      style={{
        width: size,
        height: size,
        bottom: bottomPx,
        left: leftPx,
      }}
    >
      {/* Orbiting dashed ring */}
      {!reduce && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border border-dashed"
          style={{ borderColor: "rgba(196,128,74,0.45)", animation: "fab-orbit 28s linear infinite" }}
        />
      )}
      {/* Radial glow pulse */}
      {!reduce && (
        <span
          aria-hidden
          className="absolute inset-[-10px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(196,128,74,0.28) 0%, transparent 70%)",
            animation: "fab-pulse 4s ease-in-out infinite",
          }}
        />
      )}
      {/* Expanding wave ring */}
      {!reduce && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border border-[#c4804a]/55"
          style={{ animation: "fab-wave 2.6s ease-out infinite" }}
        />
      )}

      {/* The badge image — softly floating */}
      <motion.img
        src="/images/Badge-reservez-en-direct.png"
        alt=""
        draggable={false}
        className="relative z-10 w-full h-full object-contain drop-shadow-[0_14px_28px_rgba(29,29,27,0.45)]"
        animate={reduce ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
      />

      <style>{`
        @keyframes fab-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fab-pulse {
          0%, 100% { opacity: 0.55; transform: scale(0.95); }
          50%      { opacity: 1;    transform: scale(1.06); }
        }
        @keyframes fab-wave {
          0%   { opacity: 0.7; transform: scale(1); }
          80%  { opacity: 0;   transform: scale(1.55); }
          100% { opacity: 0;   transform: scale(1.55); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fab-book-direct * { animation: none !important; }
        }
      `}</style>
    </motion.a>
  );
};

export default FloatingBookButton;
