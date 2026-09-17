import { useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import OptimizedImage from "@/components/ui/OptimizedImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
      gsap.to(sectionRef.current, {
        y: () => -sectionRef.current.offsetHeight * 0.05,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[600px] md:min-h-[700px] flex items-center justify-center"
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
        className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-brand-ink/30 to-brand-ink/20"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-ink/40 pointer-events-none" />

      <div
        ref={textRef}
        className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-0"
      >
        <span className="block font-montserrat uppercase tracking-[0.4em] text-[0.65rem] text-white/60 mb-6 shrink-0">
          {t("destinations") || "Destinations"}
        </span>
        <h1 className="font-display text-white text-[clamp(2.5rem,5.5vw,5.5rem)] leading-[1.05] tracking-tight font-medium shrink-0">
          {name}
        </h1>
        {subtitle && (
          <p className="mt-4 font-montserrat text-white/60 text-[clamp(0.8rem,1.1vw,1rem)] uppercase tracking-[0.3em] font-light max-w-2xl mx-auto shrink-0">
            {subtitle}
          </p>
        )}
        <div className="mt-6 flex justify-center shrink-0">
          <span className="block w-10 h-[2px] bg-brand-action" />
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/40 shrink-0">
        <span className="font-montserrat text-[0.5rem] uppercase tracking-[0.35em]">
          {t("scroll") || "Scroll"}
        </span>
        <span className="block w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
};

export default DestinationHeader;
