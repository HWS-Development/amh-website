import { useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import OptimizedImage from "@/components/ui/OptimizedImage";
import gsap from "gsap";

const DestinationHeader = ({ name, subtitle, heroImage }) => {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0.6 },
        { opacity: 0.3, duration: 0.8, ease: "power2.out" }
      );
      gsap.from(textRef.current?.children, {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden px-6 pt-24 pb-28"
    >
      {heroImage && (
        <OptimizedImage
          src={heroImage}
          alt={`Hero image for ${name}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-brand-ink/40 to-brand-ink/35"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-ink/40 pointer-events-none" />

      <div
        ref={textRef}
        className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center justify-center"
      >
        <span className="block font-montserrat uppercase tracking-[0.35em] text-[0.65rem] text-white/90 mb-5 drop-shadow-md">
          {t("destinations") || "Destinations"}
        </span>
        <h1 className="font-display text-white text-[clamp(3rem,6vw,6rem)] leading-none tracking-tight font-medium drop-shadow-lg">
          {name}
        </h1>
        {subtitle && (
          <p className="mt-5 font-montserrat text-white/90 text-[clamp(0.78rem,1.1vw,1rem)] leading-relaxed uppercase tracking-[0.24em] font-medium max-w-2xl mx-auto drop-shadow-md">
            {subtitle}
          </p>
        )}
        <div className="mt-6 flex justify-center">
          <span className="block w-10 h-[2px] bg-brand-action" />
        </div>
      </div>

      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/75">
        <span className="font-montserrat text-[0.5rem] uppercase tracking-[0.35em]">
          {t("scroll") || "Scroll"}
        </span>
        <span className="block w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
};

export default DestinationHeader;
