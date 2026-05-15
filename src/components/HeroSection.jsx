import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { useLanguage } from "@/contexts/LanguageContext";
import BookingStrip from "@/components/BookingStrip";

const HeroSection = () => {
  const { t, date, onDateChange } = useLanguage();
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const stripRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(titleRef.current, { y: 40, opacity: 0, duration: 0.8 })
        .from(subtitleRef.current, { y: 30, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(stripRef.current, { y: 20, opacity: 0, duration: 0.5 }, "-=0.3");
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full bg-brand-action overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 flex flex-col justify-center items-center px-4 pt-36 md:pt-44 pb-10 md:pb-14">
        <div className="text-center max-w-5xl mx-auto mb-8 md:mb-10">
          <h1 ref={titleRef} className="text-white font-bold italic uppercase whitespace-nowrap text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-none tracking-[0.06em] font-montserrat mb-3 md:mb-4">
            {t('heroTitle')}
          </h1>
          <p ref={subtitleRef} className="text-white/80 text-[11px] sm:text-xs md:text-sm lg:text-base font-montserrat leading-relaxed max-w-3xl mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>

        <div ref={stripRef} className="w-full max-w-[920px] px-2 md:px-4">
          <BookingStrip
            date={date}
            onDateChange={onDateChange}
            isMobile={false}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
