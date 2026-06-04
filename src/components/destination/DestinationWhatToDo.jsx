import { useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { Link as RouterLink } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DestinationWhatToDo = ({ whatToDo, sectionRef }) => {
  const { t } = useLanguage();
  const gridRef = useRef(null);

  useEffect(() => {
    if (!whatToDo?.length || !gridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(gridRef.current.children, {
        y: 50,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
          once: true,
        },
      });
    }, gridRef);
    return () => ctx.revert();
  }, [whatToDo]);

  if (!whatToDo || whatToDo.length === 0) return null;

  return (
    <section id="what-to-do" ref={sectionRef} className="py-20 md:py-32 bg-white relative">
      <div className="content-wrapper">
        <div className="max-w-2xl mb-14">
          <span className="font-montserrat uppercase tracking-[0.35em] text-[0.6rem] text-brand-action font-semibold">
            {t("experiences") || "Experiences"}
          </span>
          <h2 className="mt-3 font-display text-brand-ink text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight">
            {t("whatToDo")}
          </h2>
        </div>

        <div ref={gridRef} className="grid gap-8 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
          {whatToDo.map((activity, index) => (
            <div
              key={index}
              className="group bg-white border border-brand-ink/5 overflow-hidden hover:shadow-xl transition-all duration-700"
            >
              <div className="relative h-[260px] overflow-hidden">
                {activity.image_url && (
                  <OptimizedImage
                    src={activity.image_url}
                    alt={activity.title}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
              <div className="p-6 md:p-7">
                <span className="font-montserrat text-[0.55rem] uppercase tracking-[0.3em] text-brand-action font-semibold">
                  {t("discover") || "Discover"}
                </span>
                <h3 className="mt-2 font-display text-[1.3rem] text-brand-ink leading-tight">
                  {activity.title}
                </h3>
                <p className="mt-3 font-montserrat text-[0.82rem] text-brand-ink/60 leading-relaxed">
                  {activity.blurb}
                </p>
                {activity.link_url && (
                  <RouterLink
                    to={activity.link_url}
                    className="mt-5 inline-flex items-center gap-2 font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-action hover:text-brand-ink transition-colors duration-300 group/link"
                  >
                    {t("learnMore")}
                    <ArrowUpRight className="w-3 h-3 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </RouterLink>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationWhatToDo;
