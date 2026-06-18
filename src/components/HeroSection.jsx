import React, { useRef, useLayoutEffect, useState, useEffect, useCallback, useMemo } from "react";
import gsap from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Keyboard } from "swiper/modules";
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

/* ─── Framer variants ─────────────────────────────────────────────────── */
const expVariants = {
  hidden:  { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -6, filter: "blur(3px)", transition: { duration: 0.3, ease: "easeIn" } },
};

/* ═══════════════════════════════════════════════════════════ HERO ══════ */
const HeroSection = () => {
  const { t, currentLanguage, date, onDateChange } = useLanguage();

  const sectionRef  = useRef(null);
  const topBarRef   = useRef(null);
  const bottomRef   = useRef(null);
  const mainImgRef  = useRef(null);
  const cornersRef  = useRef([]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [slideKey,  setSlideKey]  = useState(0);
  const [isMobile,  setIsMobile]  = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* One slide per experience — order from the brief. */
  const slides = useMemo(() => [
    {
      key: "marrakech",
      image: "/images/hero_koutoubia.webp",
      experienceTitle: t("heroSliderMarrakech"),
      experienceDesc:  t("heroSliderMarrakechDesc"),
      dest: t("marrakech"),
    },
    {
      key: "ouarzazate",
      image: "/images/hero_ouarzazate.webp",
      experienceTitle: t("heroSliderOuarzazate"),
      experienceDesc:  t("heroSliderOuarzazateDesc"),
      dest: t("ouarzazate"),
    },
    {
      key: "essaouira",
      image: "/images/hero_essaouira.webp",
      experienceTitle: t("heroSliderEssaouira"),
      experienceDesc:  t("heroSliderEssaouiraDesc"),
      dest: t("essaouira"),
    },
  ], [t, currentLanguage]);

  const current = slides[activeIdx];

  const handleSlideChange = useCallback((swiper) => {
    setActiveIdx(swiper.realIndex);
    setSlideKey((k) => k + 1);
  }, []);

  /* ── Entrance choreography ─────────────────────────────────────────── */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(topBarRef.current, { y: -28, opacity: 0, duration: 0.7 }, 0.1)
        .from(cornersRef.current, {
          scale: 0, opacity: 0, duration: 0.5, stagger: 0.12, ease: "back.out(2)",
        }, 0.3)
        .from(bottomRef.current, { y: 28, opacity: 0, duration: 0.65 }, 0.7);
    }, sectionRef);
    return () => ctx.revert();
  }, []);

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
      {/* ════════════ FULL-BLEED MAIN IMAGE ═════════════════════════════ */}
      <div className="absolute inset-0" ref={mainImgRef}>
        <Swiper
          modules={[Autoplay, EffectFade, Keyboard]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1100}
          loop
          autoplay={{ delay: 6200, disableOnInteraction: false, pauseOnMouseEnter: true }}
          keyboard={{ enabled: true }}
          onSlideChange={handleSlideChange}
          className="absolute inset-0 w-full h-full"
        >
          {slides.map((s, i) => (
            <SwiperSlide key={s.key + i} className="!w-full !h-full">
              {({ isActive }) => (
                <img
                  src={s.image}
                  alt={s.dest}
                  className={`absolute inset-0 w-full h-full object-cover ${isActive ? "hero-kenburns" : ""}`}
                  style={{ filter: "contrast(1.2) brightness(1.0) saturate(1.05)" }}
                  draggable={false}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Subtle dark overlays for readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(10,8,4,0.25) 0%, rgba(10,8,4,0.05) 35%, rgba(10,8,4,0.18) 100%)", zIndex: 2 }}
        />
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{ height: "48%", background: "linear-gradient(to top, rgba(10,8,4,0.42) 0%, transparent 100%)", zIndex: 3 }}
        />
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
      <div className="relative z-10 h-full flex flex-col hero-content" style={{ padding: "0 32px" }}>

        {/* ── Top bar ── */}
        <div
          ref={topBarRef}
          className="flex items-center justify-between"
          style={{ paddingTop: 24, paddingBottom: 0 }}
        >
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 17, letterSpacing: "0.28em", color: "#f5ede0", textTransform: "uppercase" }}>
            AMH <span style={{ color: "#c4804a" }}>·</span> Voyages
          </div>
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

        {/* ── CENTERED Headline ── */}
        <div className="flex-1 flex items-center justify-center text-center">
          <div style={{ width: "100%", maxWidth: "100%" }}>
            {/* Eyebrow — brand-action pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginBottom: 22, display: "flex", justifyContent: "center" }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: "#bf673e",
                  color: "#fff",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: 9.5,
                  letterSpacing: "0.38em",
                  textTransform: "uppercase",
                  padding: "5px 16px",
                  lineHeight: 1.4,
                }}
              >
                {t("heroEyebrow") || "Royaume du Maroc"}
              </span>
            </motion.div>

            {/* Fixed main title — one line, white bold sans-serif */}
            <motion.h1
              initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
              transition={{ delay: 0.55, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="hero-title"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(20px, 3.4vw, 44px)",
                lineHeight: 1.1,
                letterSpacing: "0.012em",
                textTransform: "uppercase",
                color: "#fff",
                margin: 0,
                whiteSpace: "nowrap",
                textShadow: "0 2px 22px rgba(0,0,0,0.45)",
              }}
            >
              {t("heroTitle")}
            </motion.h1>

            {/* Fixed subtitle — no background box */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginTop: 18, display: "flex", justifyContent: "center" }}
            >
              <p
                className="hero-subtitle"
                style={{
                  display: "inline-block",
                  background: "transparent",
                  color: "#fff",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: "clamp(11px, 1.05vw, 14px)",
                  letterSpacing: "0.025em",
                  lineHeight: 1.4,
                  margin: 0,
                  padding: "10px 26px",
                  whiteSpace: "nowrap",
                  textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                }}
              >
                {t("heroSubtitle")}
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── Bottom-left: experience + slide indicators (padded to clear FAB + booking strip) ── */}
        <div ref={bottomRef} className="hero-bottom" style={{ paddingBottom: isMobile ? 420 : 240 }}>

          {/* ── EXPERIENCE block (bottom-left, above progress) — desktop only ── */}
          <div className="hidden md:block" style={{ marginBottom: 10, maxWidth: 620 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`exp-${slideKey}`}
                variants={expVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative inline-flex items-center gap-3"
              >
                <span
                  aria-hidden
                  style={{ width: 32, height: 2, background: "#c4804a", flexShrink: 0 }}
                />
                <div className="flex flex-col leading-tight">
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.4em",
                      textTransform: "uppercase",
                      color: "#c4804a",
                      fontWeight: 800,
                      marginBottom: 6,
                      textShadow: "0 1px 10px rgba(0,0,0,0.5)",
                    }}
                  >
                    {t("liveTheExperience") || "Vivez l'expérience"} · {current?.dest}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: 20,
                      lineHeight: 1.25,
                      color: "#f5ede0",
                      letterSpacing: "0.005em",
                      textShadow: "0 1px 14px rgba(0,0,0,0.55)",
                    }}
                  >
                    {current?.experienceTitle}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide indicators + counter */}
          <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* ════════════ FULL-WIDTH BOOKING STRIP + DISCOVER MORE ═════════ */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="px-5 sm:px-8 md:px-14 lg:px-20 py-7 sm:py-8 md:py-10 lg:py-12 bg-gradient-to-t from-black/60 via-black/35 to-transparent backdrop-blur-[2px]">
          <div className="max-w-7xl mx-auto">
            <BookingStrip date={date} onDateChange={onDateChange} isMobile={isMobile} />

            {/* Discover-more indicator — just below the booking bar */}
            <a
              href="#discover"
              onClick={(e) => {
                e.preventDefault();
                const next = sectionRef.current?.nextElementSibling;
                if (next?.scrollIntoView) next.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="hero-discover mt-6 md:mt-8 flex flex-col items-center justify-center gap-2 text-white/85 hover:text-white transition-colors group"
              aria-label={t("discoverMore") || "Discover more"}
            >
              <span className="font-montserrat text-[0.6rem] sm:text-[0.68rem] md:text-[0.72rem] uppercase tracking-[0.3em] sm:tracking-[0.32em] font-semibold">
                {t("discoverMore") || "Discover more"}
              </span>
              <svg
                width="36"
                height="20"
                viewBox="0 0 36 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="hero-discover-zig"
                aria-hidden
              >
                <polyline
                  points="2,4 9,11 18,4 27,11 34,4"
                  stroke="#c4804a"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <polyline
                  points="6,12 18,18 30,12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.7"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ════════════ SCROLL HINT (legacy desktop side cue, kept hidden — new "Discover more" CTA below booking strip replaces it) ════ */}
      <div
        className="hero-scroll-hint absolute left-8 bottom-5 hidden items-center gap-2 pointer-events-none"
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600;700;800&display=swap');

        @keyframes hero-kenburns {
          0%   { transform: scale(1.03) translate3d(0, 0, 0); }
          100% { transform: scale(1.09) translate3d(-0.6%, -0.5%, 0); }
        }
        .hero-kenburns { animation: hero-kenburns 8s ease-out forwards; }

        @keyframes hero-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes hero-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.95); }
          50%      { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes hero-scroll-pulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.65); }
          50%      { opacity: 1;   transform: scaleY(1); }
        }

        /* Bouncing zigzag chevron for the "Discover more" CTA */
        @keyframes hero-discover-bounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(6px); }
        }
        .hero-discover-zig { animation: hero-discover-bounce 1.8s ease-in-out infinite; }
        .hero-discover:hover .hero-discover-zig { animation-duration: 0.9s; }

        /* Allow title/subtitle to wrap on small screens (avoid overflow) */
        @media (max-width: 768px) {
          .hero-title    { white-space: normal !important; }
          .hero-subtitle { white-space: normal !important; }
        }

        /* Reserve left space on desktop so FloatingBookButton (96px, left-5/6)
           doesn't overlap the experience block + booking strip. */
        @media (min-width: 768px) {
          .hero-bottom { padding-left: 124px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-kenburns { animation: none; }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
