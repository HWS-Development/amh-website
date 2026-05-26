import { useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plane, Train, Bus, Car, Star } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const iconMap = {
  plane: Plane,
  train: Train,
  bus: Bus,
  car: Car,
  default: Star,
};

const DestinationGettingHere = ({ gettingHere, sectionRef }) => {
  const { t } = useLanguage();
  const cardsRef = useRef(null);

  useEffect(() => {
    if (!gettingHere?.length || !cardsRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current.children, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 80%",
          once: true,
        },
      });
    }, cardsRef);
    return () => ctx.revert();
  }, [gettingHere]);

  if (!gettingHere || gettingHere.length === 0) return null;

  return (
    <section
      id="getting-here"
      ref={sectionRef}
      className="py-20 md:py-32 bg-[#faf9f7] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-beige/50 to-transparent pointer-events-none" />

      <div className="content-wrapper relative">
        <div className="max-w-2xl">
          <span className="font-montserrat uppercase tracking-[0.35em] text-[0.6rem] text-brand-action font-semibold">
            {t("gettingThere") || "Getting there"}
          </span>
          <h2 className="mt-3 font-display text-brand-ink text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight">
            {t("gettingHere")}
          </h2>
          <p className="mt-4 font-montserrat text-sm text-brand-ink/50 max-w-md">
            {t("gettingHereSubtitle") || "Every journey to us is part of the experience."}
          </p>
        </div>

        <div
          ref={cardsRef}
          className="mt-12 grid gap-6 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]"
        >
          {gettingHere.map((item, index) => {
            const Icon = iconMap[item.mode] || iconMap.default;
            return (
              <div
                key={index}
                className="group bg-white border border-brand-ink/5 p-7 hover:border-brand-action/20 hover:shadow-lg transition-all duration-500"
              >
                <div className="w-12 h-12 bg-brand-beige flex items-center justify-center group-hover:bg-brand-action/10 transition-colors duration-500">
                  <Icon className="w-5 h-5 text-brand-action" />
                </div>
                <h3 className="mt-5 font-display text-xl text-brand-ink">
                  {item.title}
                </h3>
                <p className="mt-2 font-montserrat text-[0.82rem] text-brand-ink/60 leading-relaxed">
                  {item.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DestinationGettingHere;
