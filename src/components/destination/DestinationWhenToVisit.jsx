import { useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link as RouterLink } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DestinationWhenToVisit = ({ whenToVisit, ctaLabel, ctaUrl, sectionRef }) => {
  const { t } = useLanguage();
  const contentRef = useRef(null);

  useEffect(() => {
    if (!whenToVisit || !contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 80%",
          once: true,
        },
      });
    }, contentRef);
    return () => ctx.revert();
  }, [whenToVisit]);

  if (!whenToVisit) return null;

  return (
    <section
      id="when-to-visit"
      ref={sectionRef}
      className="py-20 md:py-32 bg-[#faf9f7] relative"
    >
      <div className="content-wrapper">
        <div
          ref={contentRef}
          className="max-w-3xl mx-auto text-center"
        >
          <span className="block font-montserrat uppercase tracking-[0.35em] text-[0.6rem] text-brand-action font-semibold">
            {t("bestTime") || "Best time"}
          </span>
          <h2 className="mt-3 font-display text-brand-ink text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight">
            {t("whenToVisit")}
          </h2>
          <div className="mt-8 mx-auto max-w-2xl">
            <p className="font-montserrat text-[0.92rem] text-brand-ink/65 leading-[1.85]">
              {whenToVisit}
            </p>
          </div>
          {ctaLabel && ctaUrl && (
            <div className="mt-10">
              <RouterLink
                to={ctaUrl}
                className="group inline-flex items-center gap-3 bg-brand-action text-white px-8 py-4 font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.25em] hover:bg-brand-ink transition-all duration-500"
              >
                {ctaLabel}
                <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
              </RouterLink>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DestinationWhenToVisit;
