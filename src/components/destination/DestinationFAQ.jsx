import { useRef, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_FAQ = {
  fes: [
    {
      q: "Fès est-elle sûre pour les touristes ?",
      a: "Oui, Fès est généralement très sûre. Comme dans toute grande ville, restez vigilant dans les zones très fréquentées."
    },
    {
      q: "Combien de temps prévoir pour visiter Fès ?",
      a: "Deux à trois jours suffisent pour découvrir la médina, les médersas, les tanneries et les souks principaux."
    },
    {
      q: "Quelle est la meilleure période pour visiter Fès ?",
      a: "Le printemps (mars-mai) et l'automne (septembre-novembre) offrent les températures les plus agréables."
    }
  ]
};

const DestinationFAQ = ({ faq, sectionRef, slug }) => {
  const { t, currentLanguage } = useLanguage();
  const headerRef = useRef(null);

  const resolvedFaq = (faq && faq.length > 0)
    ? faq
    : (FALLBACK_FAQ[slug] || []);

  useEffect(() => {
    if (!resolvedFaq?.length || !headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: 30,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 82%",
          once: true,
        },
      });
    }, headerRef);
    return () => ctx.revert();
  }, [resolvedFaq]);

  if (!resolvedFaq || resolvedFaq.length === 0) return null;

  return (
    <section id="faq" ref={sectionRef} className="py-20 md:py-32 bg-white relative">
      <div className="content-wrapper max-w-3xl mx-auto">
        <div ref={headerRef} className="text-center mb-14">
          <span className="font-montserrat uppercase tracking-[0.35em] text-[0.6rem] text-brand-action font-semibold">
            {t("questions") || "Questions"}
          </span>
          <h2 className="mt-3 font-display text-brand-ink text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight">
            {t("freqAskedQuestions")}
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full border-t border-brand-ink/8">
          {faq.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-brand-ink/8"
            >
              <AccordionTrigger className="font-montserrat text-sm md:text-base font-semibold text-brand-ink hover:text-brand-action py-5 hover:no-underline transition-colors duration-300 text-left">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="font-montserrat text-[0.88rem] text-brand-ink/60 leading-relaxed pb-6">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default DestinationFAQ;
