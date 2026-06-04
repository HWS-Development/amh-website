import { useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DestinationGoodToKnow = ({ goodToKnow, sectionRef }) => {
  const { t } = useLanguage();
  const listRef = useRef(null);

  useEffect(() => {
    if (!goodToKnow?.length || !listRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(listRef.current.children, {
        y: 20,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: listRef.current,
          start: "top 82%",
          once: true,
        },
      });
    }, listRef);
    return () => ctx.revert();
  }, [goodToKnow]);

  if (!goodToKnow || goodToKnow.length === 0) return null;

  return (
    <section
      id="good-to-know"
      ref={sectionRef}
      className="py-20 md:py-32 bg-brand-ink text-white relative overflow-hidden"
    >
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-action/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-brand-action/5 blur-3xl rounded-full pointer-events-none" />

      <div className="content-wrapper relative">
        <div className="max-w-2xl">
          <span className="font-montserrat uppercase tracking-[0.35em] text-[0.6rem] text-brand-action font-semibold">
            {t("insights") || "Insights"}
          </span>
          <h2 className="mt-3 font-display text-white text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight">
            {t("goodToKnow")}
          </h2>
        </div>

        <div
          ref={listRef}
          className="mt-12 grid gap-5 md:grid-cols-2"
        >
          {goodToKnow.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-5 border border-white/10 hover:border-brand-action/30 transition-all duration-500 group"
            >
              <span className="shrink-0 w-8 h-8 rounded-full bg-brand-action/20 flex items-center justify-center group-hover:bg-brand-action/30 transition-colors duration-500">
                <Check className="w-4 h-4 text-brand-action" />
              </span>
              <div>
                <span className="font-montserrat text-sm font-semibold text-white/90 block">
                  {item.title}:
                </span>
                <span className="font-montserrat text-[0.82rem] text-white/50 leading-relaxed mt-1 block">
                  {item.tip}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationGoodToKnow;
