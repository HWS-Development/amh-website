import React, { useRef, useLayoutEffect, useState, useEffect, useCallback, useMemo } from "react";
import gsap from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

import { useLanguage } from "@/contexts/LanguageContext";
import BookingStrip from "@/components/BookingStrip";

/* ─── Config ──────────────────────────────────────────────────────────── */
const storageBase =
  import.meta.env.VITE_SUPABASE_STORAGE_BASE ||
  "https://dzuwwfttnigeisicqyto.supabase.co";

const rota = (file) =>
  `${storageBase}/storage/v1/object/public/amhimages/rotative/${file}`;

const BOOK_DIRECT_URL =
  `${import.meta.env.VITE_SIMPLEBOOKING_BASE || "https://www.simplebooking.it/portal/256"}?lang=EN&cur=EUR`;

/* ─── Side thumbnail images (2 static vignettes right column) ────────── */
const SIDE_IMAGES = [
  { src: rota("Ouarzazate_rota1.jpeg"), label: "Ouarzazate" },
  { src: rota("Essaouira_rota1.jpg"),   label: "Essaouira"  },
];

/* ─── Framer variants ─────────────────────────────────────────────────── */
const headlineVariants = {
  hidden:  { opacity: 0, y: 22, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.28, ease: "easeIn" } },
};

const descVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.12 } },
  exit:    { opacity: 0,        transition: { duration: 0.2 } },
};

/* ─── BookDirect Badge ────────────────────────────────────────────────── */
const BookDirectBadge = ({ t }) => (
  <motion.a
    href={BOOK_DIRECT_URL}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`${t("badgeBookDirect")} — ${t("badgeBestPrices")} ${t("badgeGuaranteed")}`}
    initial={{ scale: 0.35, opacity: 0, rotate: -18 }}
    animate={{ scale: 1,    opacity: 1, rotate: 0   }}
    transition={{ delay: 1.3, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
    whileHover={{ scale: 1.06 }}
    whileTap={{ scale: 0.96 }}
    className="relative block select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c4804a]"
    style={{ width: 100, height: 100 }}
  >
    {/* Orbit ring */}
    <span
      aria-hidden
      className="absolute inset-0 rounded-full border border-dashed"
      style={{
        borderColor: "rgba(196,128,74,0.28)",
        animation: "hero-orbit 30s linear infinite",
      }}
    />
    {/* Glow pulse */}
    <span
      aria-hidden
      className="absolute inset-[-8px] rounded-full"
      style={{
        background: "radial-gradient(circle, rgba(196,128,74,0.18) 0%, transparent 70%)",
        animation: "hero-pulse 4s ease-in-out infinite",
      }}
    />
    {/* Badge image */}
    <motion.img
      src="/images/Badge-reservez-en-direct.png"
      alt=""
      draggable={false}
      className="relative z-10 w-full h-full object-contain"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
    />
  </motion.a>
);

/* ═══════════════════════════════════════════════════════════ HERO ══════ */
const HeroSection = () => {
  const { t, currentLanguage, date, onDateChange } = useLanguage();

  const sectionRef  = useRef(null);
  const topBarRef   = useRef(null);
  const bottomRef   = useRef(null);
  const badgeRef    = useRef(null);
  const mainImgRef  = useRef(null);
  const cornersRef  = useRef([]);

  const [activeIdx, setActiveIdx]         = useState(0);
  const [titleKey,  setTitleKey]          = useState(0); // force AnimatePresence remount

  const slides = useMemo(() => [
    {
      key: "marrakech",
      image:   rota("Marrakech_rota1.jpg"),
      title:   t("heroSliderMarrakech"),
      desc:    t("heroSliderMarrakechDesc"),
      dest:    "Marrakech",
    },
    {
      key: "ouarzazate",
      image:   rota("Ouarzazate_rota1.jpeg"),
      title:   t("heroSliderOuarzazate"),
      desc:    t("heroSliderOuarzazateDesc"),
      dest:    "Ouarzazate",
    },
    {
      key: "agafay",
      image:   rota("Marrakech_rota1.jpg"),
      title:   t("heroSliderAgafay"),
      desc:    t("heroSliderAgafayDesc"),
      dest:    "Agafay",
    },
    {
      key: "essaouira",
      image:   rota("Essaouira_rota1.jpg"),
      title:   t("heroSliderEssaouira"),
      desc:    t("heroSliderEssaouiraDesc"),
      dest:    "Essaouira",
    },
  ], [t, currentLanguage]);

  const current = slides[activeIdx];

  /* ── Slide change: bump titleKey so AnimatePresence re-animates ────── */
  const handleSlideChange = useCallback((swiper) => {
    setActiveIdx(swiper.realIndex);
    setTitleKey((k) => k + 1);
  }, []);

  /* ── Entrance choreography (GSAP) ──────────────────────────────────── */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      /* Top bar slides down */
      tl.from(topBarRef.current, { y: -28, opacity: 0, duration: 0.7 }, 0.1)

      /* Corner accents draw in */
        .from(cornersRef.current, {
          scale: 0, opacity: 0, duration: 0.5, stagger: 0.12, ease: "back.out(2)",
        }, 0.3)

      /* Bottom booking strip slides up */
        .from(bottomRef.current, { y: 28, opacity: 0, duration: 0.65 }, 0.7);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ── Badge: Framer handles its own entrance; GSAP scroll hint ──────── */
  useEffect(() => {
    const hint = document.querySelector(".hero-scroll-hint");
    if (!hint) return;
    gsap.fromTo(hint,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.6, delay: 1.6, ease: "power3.out" }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        height: "min(100svh, 920px)",
        minHeight: 640,
        background: "#0a0804",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {/* ── Google Fonts (add to your <head> or _document if using Next.js) ─ */}
      {/* <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" /> */}

      {/* ════════════ MOSAIC BACKGROUND ══════════════════════════════════ */}
      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: "1fr 320px", gridTemplateRows: "1fr 1fr", gap: 2 }}>

        {/* Main slide image */}
        <div className="row-span-2 relative overflow-hidden" ref={mainImgRef}>
          <Swiper
            modules={[Autoplay, EffectFade, Keyboard]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            speed={1100}
            loop
            autoplay={{ delay: 5400, disableOnInteraction: false, pauseOnMouseEnter: true }}
            keyboard={{ enabled: true }}
            onSlideChange={handleSlideChange}
            className="absolute inset-0 w-full h-full"
          >
            {slides.map((s, i) => (
              <SwiperSlide key={s.key + i} className="!w-full !h-full">
                {({ isActive }) => (
                  <img
                    src={s.image}
                    alt={s.title}
                    className={`absolute inset-0 w-full h-full object-cover ${isActive ? "hero-kenburns" : ""}`}
                    style={{ filter: "contrast(1.2) brightness(1.0) saturate(1.05)" }}
                    draggable={false}
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Subtle left-to-right gradient for text readability */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(105deg, rgba(10,8,4,0.40) 0%, rgba(10,8,4,0.08) 55%, rgba(10,8,4,0.20) 100%)", zIndex: 2 }}
          />
          {/* Subtle bottom fade for booking strip */}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{ height: "40%", background: "linear-gradient(to top, rgba(10,8,4,0.30) 0%, transparent 100%)", zIndex: 3 }}
          />
        </div>

        {/* Side vignettes */}
        {SIDE_IMAGES.map((img, i) => (
          <div key={img.label} className="relative overflow-hidden">
            <img
              src={img.src}
              alt={img.label}
              className="absolute inset-0 w-full h-full object-cover hero-kenburns-side"
              style={{ filter: "contrast(1.15) brightness(1.0) saturate(1.0)", animationDelay: `${i * 0.4}s` }}
              draggable={false}
              loading="lazy"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(10,8,4,0.25) 100%)" }} />
            {/* Label */}
            <span
              className="absolute bottom-3 right-3 text-white/40 font-montserrat uppercase tracking-[0.28em]"
              style={{ fontSize: 8, fontWeight: 400 }}
            >
              {img.label}
            </span>
          </div>
        ))}
      </div>

      {/* ════════════ GOLDEN CORNER ACCENTS ══════════════════════════════ */}
      {[
        { style: { top: 0, left: 0, borderTop: "1px solid rgba(196,128,74,0.45)", borderLeft: "1px solid rgba(196,128,74,0.45)" } },
        { style: { bottom: 0, right: 0, borderBottom: "1px solid rgba(196,128,74,0.2)", borderRight: "1px solid rgba(196,128,74,0.2)" } },
      ].map((c, i) => (
        <div
          key={i}
          ref={(el) => (cornersRef.current[i] = el)}
          className="absolute pointer-events-none"
          style={{ width: 52, height: 52, zIndex: 10, ...c.style }}
        />
      ))}

      {/* ════════════ CONTENT LAYER ══════════════════════════════════════ */}
      <div className="relative z-10 h-full flex flex-col" style={{ padding: "0 32px" }}>

        {/* ── Top bar ── */}
        <div
          ref={topBarRef}
          className="flex items-center justify-between"
          style={{ paddingTop: 24, paddingBottom: 0 }}
        >
          {/* Logo / Brand */}
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 17, letterSpacing: "0.28em", color: "#f5ede0", textTransform: "uppercase" }}>
            AMH <span style={{ color: "#c4804a" }}>·</span> Voyages
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {["Séjours", "Circuits", "Excursions"].map((label) => (
              <button
                key={label}
                className="transition-colors duration-300"
                style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(245,237,224,0.55)", background: "none", border: "none", cursor: "pointer" }}
                onMouseEnter={(e) => (e.target.style.color = "#f5ede0")}
                onMouseLeave={(e) => (e.target.style.color = "rgba(245,237,224,0.55)")}
              >
                {label}
              </button>
            ))}
            <button
              style={{
                fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
                color: "#c4804a", border: "0.5px solid rgba(196,128,74,0.5)",
                padding: "7px 18px", background: "none", cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(196,128,74,0.1)"; e.currentTarget.style.borderColor = "#c4804a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "rgba(196,128,74,0.5)"; }}
            >
              Contactez-nous
            </button>
          </nav>
        </div>

        {/* ── Headline (Framer AnimatePresence) ── */}
        <div className="flex-1 flex items-center" style={{ maxWidth: 560 }}>
          <div>
            {/* Eyebrow — brand-action pill */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginBottom: 16 }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: "#bf673e",
                  color: "#fff",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: 9,
                  letterSpacing: "0.38em",
                  textTransform: "uppercase",
                  padding: "4px 14px",
                  lineHeight: 1.4,
                }}
              >
                Royaume du Maroc
              </span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${titleKey}`}
                variants={headlineVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontSize: "clamp(42px, 5.5vw, 64px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.01em",
                  color: "#f5ede0",
                  margin: 0,
                }}
              >
                {current?.title}
              </motion.h1>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${titleKey}`}
                variants={descVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  display: "inline-block",
                  background: "#f5f1e8",
                  color: "#1d1d1b",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontSize: 10.5,
                  letterSpacing: "0.04em",
                  lineHeight: 1.6,
                  maxWidth: "44ch",
                  marginTop: 14,
                  marginBottom: 0,
                  padding: "5px 16px",
                }}
              >
                {current?.desc}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Bottom: pagination + booking strip ── */}
        <div ref={bottomRef} style={{ paddingBottom: 22 }}>

          {/* Slide indicators + counter */}
          <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
            {slides.map((s, i) => (
              <motion.div
                key={s.key}
                animate={{ width: i === activeIdx ? 36 : 18, background: i === activeIdx ? "#c4804a" : "rgba(245,237,224,0.25)" }}
                transition={{ duration: 0.4, ease: [0.2, 0.9, 0.25, 1] }}
                style={{ height: 1.5, cursor: "pointer" }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
            <span style={{ marginLeft: 10, fontSize: 9, letterSpacing: "0.3em", color: "rgba(245,237,224,0.4)" }}>
              <strong style={{ color: "#c4804a" }}>{String(activeIdx + 1).padStart(2, "0")}</strong> / {String(slides.length).padStart(2, "0")}
            </span>
          </div>

          {/* Booking strip + badge */}
          <div className="flex items-stretch gap-4">

            {/* Glass booking bar */}
            <div
              className="flex-1 min-w-0 relative overflow-hidden"
              style={{
                background: "rgba(10,8,4,0.58)",
                border: "0.5px solid rgba(245,237,224,0.1)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              {/* Top golden line */}
              <div
                className="absolute top-0 inset-x-0"
                style={{ height: 0.5, background: "linear-gradient(90deg, transparent, rgba(196,128,74,0.7), rgba(196,128,74,0.35), transparent)" }}
              />
              <div className="p-3 sm:p-4">
                <BookingStrip date={date} onDateChange={onDateChange} isMobile={false} luxuryMode />
              </div>
            </div>

            {/* Badge */}
            <div className="hidden lg:flex items-center shrink-0" ref={badgeRef}>
              <BookDirectBadge t={t} />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════ RIGHT: Destination tags (vertical) ════════════════ */}
      <motion.div
        className="absolute right-8 hidden lg:flex flex-col gap-2"
        style={{ top: "50%", transform: "translateY(-50%)", zIndex: 20 }}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {slides.map((s, i) => (
          <motion.div
            key={s.key}
            className="flex items-center gap-2 cursor-pointer"
            style={{
              padding: "6px 10px 6px 8px",
              borderLeft: i === activeIdx ? "1.5px solid #c4804a" : "1.5px solid transparent",
              background: i === activeIdx ? "rgba(10,8,4,0.32)" : "transparent",
              transition: "all 0.35s ease",
            }}
            whileHover={{ x: -2 }}
          >
            <div
              style={{
                width: 5, height: 5, borderRadius: "50%",
                background: i === activeIdx ? "#c4804a" : "rgba(245,237,224,0.25)",
                flexShrink: 0, transition: "background 0.3s",
              }}
            />
            <span
              style={{
                fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase",
                color: i === activeIdx ? "#f5ede0" : "rgba(245,237,224,0.42)",
                fontWeight: 400, transition: "color 0.3s",
              }}
            >
              {s.dest}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* ════════════ SCROLL HINT ════════════════════════════════════════ */}
      <div
        className="hero-scroll-hint absolute left-8 bottom-5 hidden sm:flex items-center gap-2 pointer-events-none"
        style={{ zIndex: 20 }}
      >
        <div
          style={{
            width: 1, height: 32,
            background: "linear-gradient(to bottom, #c4804a, transparent)",
            animation: "hero-scroll-pulse 2.6s ease-in-out 2s infinite",
          }}
        />
        <span style={{ fontSize: 8, letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(245,237,224,0.38)" }}>
          {t("scrollToDiscover")}
        </span>
      </div>

      {/* ════════════ GLOBAL KEYFRAMES ══════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');

        /* Ken Burns — main */
        @keyframes hero-kenburns {
          0%   { transform: scale(1.03) translate3d(0, 0, 0); }
          100% { transform: scale(1.09) translate3d(-0.6%, -0.5%, 0); }
        }
        .hero-kenburns { animation: hero-kenburns 8s ease-out forwards; }

        /* Ken Burns — side vignettes */
        @keyframes hero-kenburns-side {
          0%   { transform: scale(1.05); }
          100% { transform: scale(1.11) translate3d(0.4%, 0.4%, 0); }
        }
        .hero-kenburns-side { animation: hero-kenburns-side 10s ease-out forwards; }

        /* Badge orbit ring */
        @keyframes hero-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Badge glow pulse */
        @keyframes hero-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.95); }
          50%      { opacity: 1;   transform: scale(1.05); }
        }

        /* Scroll line pulse */
        @keyframes hero-scroll-pulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.65); }
          50%      { opacity: 1;   transform: scaleY(1); }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .hero-kenburns,
          .hero-kenburns-side { animation: none; }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;