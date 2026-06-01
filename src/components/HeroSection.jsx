import React, { useRef, useLayoutEffect, useState, useEffect, useCallback, useMemo } from "react";
import gsap from "gsap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Parallax, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

import { useLanguage } from "@/contexts/LanguageContext";
import BookingStrip from "@/components/BookingStrip";
import { Sparkles, MapPin, ChevronDown } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────
   Destination × Activity slides
   Iconic locations paired with an emblematic activity, as requested.
   Images come from the existing Supabase `rotative` bucket (already used
   site-wide) so we don't add new asset dependencies. Activity icons are
   inline SVGs — crisp at any size, recolorable, zero extra HTTP.
   ──────────────────────────────────────────────────────────────────────── */
const storageBase =
  import.meta.env.VITE_SUPABASE_STORAGE_BASE ||
  "https://dzuwwfttnigeisicqyto.supabase.co";

const rota = (file) =>
  `${storageBase}/storage/v1/object/public/amhimages/rotative/${file}`;

/* Inline activity glyphs — each ~24×24, monoline, premium-feeling */
const SidecarIcon = (p) => (
  <svg viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="14" cy="24" r="6" /><circle cx="48" cy="24" r="6" />
    <path d="M14 24h12l6-10h10l4 10" /><path d="M26 14l4-6h8l4 6" />
    <path d="M44 24h-8a4 4 0 0 1-4-4v-2h14v2a4 4 0 0 1-2 4z" />
  </svg>
);
const BikeIcon = (p) => (
  <svg viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="14" cy="24" r="6" /><circle cx="50" cy="24" r="6" />
    <path d="M14 24l10-12h12l6 12M24 12h6M36 12l-4 12" /><path d="M44 6h6" />
  </svg>
);
const CarriageIcon = (p) => (
  <svg viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="20" cy="24" r="6" /><circle cx="40" cy="24" r="6" />
    <path d="M14 24h-2M14 18v6h32v-6a4 4 0 0 0-4-4H18a4 4 0 0 0-4 4z" />
    <path d="M46 18l8-6 4 2-4 8" /><path d="M58 14l4-2" />
  </svg>
);
const JeepIcon = (p) => (
  <svg viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="16" cy="24" r="5" /><circle cx="48" cy="24" r="5" />
    <path d="M6 24v-8l6-6h28l8 8h6v6M22 10v8M34 10v8M16 18v-2h-6M48 18v-2h6" />
  </svg>
);

/* ────────────────────────────────────────────────────────────────────────
   Round "Réservez en Direct / Meilleurs Tarifs Garantis" badge button.
   Uses the official PNG asset and links to the SimpleBooking portal.
   – Subtle floating animation + hover lift + rotating accent ring
   ──────────────────────────────────────────────────────────────────────── */
const BOOK_DIRECT_URL =
  `${import.meta.env.VITE_SIMPLEBOOKING_BASE || "https://www.simplebooking.it/portal/256"}?lang=EN&cur=EUR`;

const RoundBadge = ({ t, size = "md" }) => {
  const dims =
    size === "sm"
      ? "w-[112px] h-[112px]"
      : "w-[150px] h-[150px] sm:w-[170px] sm:h-[170px] md:w-[190px] md:h-[190px]";

  return (
    <a
      href={BOOK_DIRECT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${t("badgeBookDirect")} — ${t("badgeBestPrices")} ${t("badgeGuaranteed")}`}
      className={`group relative inline-block ${dims} select-none rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-action focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`}
    >
      {/* Soft glowing halo */}
      <span
        aria-hidden
        className="absolute -inset-3 rounded-full bg-brand-action/30 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500"
      />

      {/* Rotating accent ring (slow continuous spin) */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full ring-1 ring-white/15 hero-badge-spin"
      />

      {/* The badge image itself */}
      <img
        src="/images/Badge-reservez-en-direct.png"
        alt=""
        draggable={false}
        className="relative z-[1] w-full h-full object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out group-hover:scale-[1.06] group-active:scale-[0.98] hero-badge-float"
      />
    </a>
  );
};

/* ─────────────────────────────────────────────────────────── HERO ──── */
const HeroSection = () => {
  const { t, currentLanguage, date, onDateChange } = useLanguage();

  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const stripRef = useRef(null);
  const eyebrowRef = useRef(null);
  const badgeRef = useRef(null);
  const slideMetaRef = useRef(null);

  const [activeIdx, setActiveIdx] = useState(0);

  /* Slides — translated, image + activity icon */
  const slides = useMemo(
    () => [
      {
        key: "marrakech",
        image: rota("Marrakech_rota1.jpg"),
        title: t("heroSliderMarrakech"),
        desc: t("heroSliderMarrakechDesc"),
        place: t("marrakech"),
        Icon: SidecarIcon,
      },
      {
        key: "essaouira",
        image: rota("Essaouira_rota1.jpg"),
        title: t("heroSliderEssaouira"),
        desc: t("heroSliderEssaouiraDesc"),
        place: t("essaouira"),
        Icon: BikeIcon,
      },
      {
        key: "ouarzazate",
        image: rota("Ouarzazate_rota1.jpeg"),
        title: t("heroSliderOuarzazate"),
        desc: t("heroSliderOuarzazateDesc"),
        place: t("ouarzazate"),
        Icon: CarriageIcon,
      },
      {
        key: "agafay",
        // re-use Marrakech rota as a temporary stand-in for Agafay until a
        // dedicated photo is uploaded to /rotative/Agafay_rota1.jpg
        image: rota("Marrakech_rota1.jpg"),
        title: t("heroSliderAgafay"),
        desc: t("heroSliderAgafayDesc"),
        place: t("marrakech"),
        Icon: JeepIcon,
      },
    ],
    [t, currentLanguage]
  );

  /* GSAP entrance choreography */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(eyebrowRef.current, { y: 14, opacity: 0, duration: 0.55 })
        .from(titleRef.current, { y: 36, opacity: 0, duration: 0.85 }, "-=0.3")
        .from(subtitleRef.current, { y: 22, opacity: 0, duration: 0.65 }, "-=0.45")
        .from(stripRef.current, { y: 24, opacity: 0, duration: 0.7 }, "-=0.35")
        .from(badgeRef.current, { scale: 0.6, opacity: 0, rotate: -20, duration: 0.8, ease: "elastic.out(1,0.6)" }, "-=0.5");
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* Animate slide meta (title + desc + icon) on slide change */
  const animateMeta = useCallback(() => {
    if (!slideMetaRef.current) return;
    gsap.fromTo(
      slideMetaRef.current.querySelectorAll(".meta-line"),
      { y: 18, opacity: 0, filter: "blur(6px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.7, stagger: 0.08, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    animateMeta();
  }, [activeIdx, animateMeta]);

  const ActiveIcon = slides[activeIdx]?.Icon;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#0e0c0a] text-white"
      style={{ height: "min(100svh, 900px)", minHeight: "640px" }}
    >
      {/* ════════ Fullscreen cinematic slider ════════ */}
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Parallax, Keyboard]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1100}
        loop
        autoplay={{ delay: 5400, disableOnInteraction: false, pauseOnMouseEnter: true }}
        keyboard={{ enabled: true }}
        parallax
        pagination={{
          el: ".hero-pagination",
          clickable: true,
          bulletClass: "hero-bullet",
          bulletActiveClass: "hero-bullet-active",
          renderBullet: (i, cls) => `<button class="${cls}" aria-label="Slide ${i + 1}"></button>`,
        }}
        onSlideChange={(s) => setActiveIdx(s.realIndex)}
        className="absolute inset-0 w-full h-full"
      >
        {slides.map((s, i) => (
          <SwiperSlide key={s.key + i} className="!w-full !h-full">
            {({ isActive }) => (
              <div className="relative w-full h-full overflow-hidden">
                {/* Ken-Burns animated background image */}
                <img
                  src={s.image}
                  alt={s.title}
                  className={`absolute inset-0 w-full h-full object-cover will-change-transform ${
                    isActive ? "hero-kenburns" : ""
                  }`}
                  draggable={false}
                  loading={i === 0 ? "eager" : "lazy"}
                />
                {/* Cinematic dual gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.55)_55%,rgba(0,0,0,0.85)_100%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c0a] via-[#0e0c0a]/35 to-transparent" />
                {/* Vignette */}
                <div className="absolute inset-0 [box-shadow:inset_0_0_220px_60px_rgba(0,0,0,0.55)] pointer-events-none" />
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ════════ Foreground content ════════ */}
      <div className="relative z-10 h-full w-full flex flex-col">
        {/* Top spacer to clear fixed header (header is ~96px) */}
        <div className="h-[100px] md:h-[120px] shrink-0" />

        {/* Main centered content */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8">
          <div className="w-full max-w-[1200px] grid lg:grid-cols-12 gap-10 items-center">
            {/* LEFT: Text block */}
            <div className="lg:col-span-8 text-center lg:text-left">
              {/* Eyebrow */}
              <div
                ref={eyebrowRef}
                className="inline-flex items-center gap-3 mb-5 mx-auto lg:mx-0"
              >
                <span className="h-px w-8 bg-brand-action" />
                <span className="font-montserrat uppercase tracking-[0.4em] text-[0.62rem] sm:text-[0.7rem] text-white/85 font-medium">
                  {t("heroEyebrow")}
                </span>
                <span className="h-px w-8 bg-brand-action lg:hidden" />
              </div>

              {/* Main headline */}
              <h1
                ref={titleRef}
                className="font-montserrat font-extrabold uppercase leading-[1.08] tracking-[0.01em] text-white text-[clamp(1.55rem,4.6vw,3.6rem)] [text-shadow:0_4px_30px_rgba(0,0,0,0.45)]"
              >
                {t("heroTitle")}
              </h1>

              {/* Subtitle */}
              <p
                ref={subtitleRef}
                className="mt-5 max-w-2xl mx-auto lg:mx-0 text-white font-montserrat text-[0.92rem] sm:text-base md:text-[1.05rem] leading-[1.7]"
              >
                {t("heroSubtitle")}
              </p>

              {/* Active slide meta (place × activity) */}
              <div
                ref={slideMetaRef}
                className="mt-7 flex items-center justify-center lg:justify-start gap-4 flex-wrap"
              >
                <div className="meta-line inline-flex items-center gap-2.5 px-3.5 py-2 bg-white/10 backdrop-blur-md border border-white/20">
                  <MapPin className="w-3.5 h-3.5 text-brand-action" />
                  <span className="font-montserrat uppercase tracking-[0.22em] text-[0.7rem] text-white/95 font-semibold">
                    {slides[activeIdx]?.place}
                  </span>
                </div>
                <div className="meta-line inline-flex items-center gap-3 px-4 py-2 bg-brand-action/95 border border-brand-action shadow-[0_10px_30px_-10px_rgba(191,103,62,0.7)]">
                  {ActiveIcon && <ActiveIcon className="w-6 h-4 text-white" />}
                  <span className="font-montserrat uppercase tracking-[0.22em] text-[0.7rem] text-white font-semibold">
                    {slides[activeIdx]?.title}
                  </span>
                </div>
                <span className="meta-line hidden md:block font-montserrat text-[0.75rem] text-white/65 italic">
                  {slides[activeIdx]?.desc}
                </span>
              </div>

              {/* Booking strip — glassmorphism panel */}
              <div ref={stripRef} className="mt-8">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-action/30 via-white/5 to-brand-action/30 blur-xl opacity-50 pointer-events-none" />
                  <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 p-3 sm:p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]">
                    <BookingStrip
                      date={date}
                      onDateChange={onDateChange}
                      isMobile={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Round badge (desktop) */}
            <div className="hidden lg:flex lg:col-span-4 items-center justify-center">
              <div ref={badgeRef} className="relative">
                <div className="absolute -inset-4 bg-brand-action/25 blur-3xl rounded-full pointer-events-none" />
                <div className="relative">
                  <RoundBadge t={t} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom controls bar */}
        <div className="shrink-0 pb-6 sm:pb-8 px-5 sm:px-8">
          <div className="max-w-[1200px] mx-auto flex items-end justify-between gap-6">
            {/* Pagination dots */}
            <div className="hero-pagination flex items-center gap-3" />

            {/* Slide counter */}
            <div className="hidden md:flex items-center gap-4 text-white/75 font-montserrat">
              <span className="text-[0.7rem] tracking-[0.3em] text-brand-action font-semibold">
                {String(activeIdx + 1).padStart(2, "0")}
              </span>
              <span className="h-px w-12 bg-white/30" />
              <span className="text-[0.7rem] tracking-[0.3em] text-white/55">
                {String(slides.length).padStart(2, "0")}
              </span>
            </div>

            {/* Mobile badge — small floating version */}
            <div className="lg:hidden">
              <RoundBadge t={t} size="sm" />
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-2 hidden sm:flex flex-col items-center gap-1 text-white/55 pointer-events-none hero-scroll-hint"
        >
          <span className="font-montserrat uppercase tracking-[0.32em] text-[0.55rem]">
            {t("scrollToDiscover")}
          </span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
        </div>
      </div>

      {/* ════════ Local CSS for Ken-Burns + pagination ════════ */}
      <style>{`
        @keyframes heroKenburns {
          0%   { transform: scale(1.08) translate3d(0,0,0); }
          100% { transform: scale(1.18) translate3d(-1.5%, -1%, 0); }
        }
        .hero-kenburns { animation: heroKenburns 7s ease-out forwards; }

        .hero-pagination { z-index: 20; }
        .hero-bullet {
          display: inline-block;
          width: 28px; height: 2px;
          background: rgba(255,255,255,0.3);
          border: none; padding: 0; margin: 0;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(.2,.9,.25,1);
        }
        .hero-bullet:hover { background: rgba(255,255,255,0.65); }
        .hero-bullet-active {
          width: 56px;
          background: #bf673e;
          box-shadow: 0 0 16px rgba(191,103,62,0.7);
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-kenburns { animation: none; }
        }

        /* Round badge: gentle float + slow accent ring rotation */
        @keyframes heroBadgeFloat {
          0%, 100% { transform: translateY(0) }
          50%      { transform: translateY(-6px) }
        }
        .hero-badge-float { animation: heroBadgeFloat 5.5s ease-in-out infinite; }

        @keyframes heroBadgeSpin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .hero-badge-spin { animation: heroBadgeSpin 28s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .hero-badge-float, .hero-badge-spin { animation: none; }
        }

        @keyframes heroScrollHintIn {
          0%   { opacity: 0; transform: translate(-50%, -10px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .hero-scroll-hint { animation: heroScrollHintIn 0.6s ease-out 1.6s both; }
      `}</style>
    </section>
  );
};

export default HeroSection;
