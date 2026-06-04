import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Shield, CheckCircle, CreditCard, Lock, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedNumber, RevealOnView } from "@/components/motion/primitives";

/**
 * Premium TrustBar — high-conversion social proof strip.
 * Combines trust icons + animated stats + rating proof.
 * Sits directly under the hero on the homepage.
 */
const TrustBar = () => {
  const { t } = useLanguage();
  const reduce = useReducedMotion();

  const trustItems = [
    { icon: Shield, label: t("licensed") || "Licensed" },
    { icon: CheckCircle, label: t("inspected") || "Inspected" },
    { icon: CreditCard, label: t("localTaxes") || "Local taxes included" },
    { icon: Lock, label: t("safe") || "Secure booking" },
  ];

  const stats = [
    { value: 70, suffix: "+", label: t("trustStatRiads") || "Classified riads" },
    { value: 3, suffix: "", label: t("trustStatCities") || "Iconic cities" },
    { value: 100, suffix: "%", label: t("trustStatDirect") || "Direct booking" },
    { value: 0, suffix: "%", label: t("trustStatCommission") || "Commission" },
  ];

  return (
    <section
      aria-label={t("whyBookDirect") || "Why book direct"}
      className="relative bg-gradient-to-b from-brand-beige/70 via-brand-beige/40 to-white border-y border-brand-ink/5 overflow-hidden"
    >
      {/* Decorative hairlines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-action/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-action/10 to-transparent" />

      <div className="content-wrapper py-9 md:py-12">
        {/* Stats row */}
        <RevealOnView className="grid grid-cols-2 md:grid-cols-4 gap-y-7 gap-x-6 md:gap-x-10 mb-8 md:mb-10">
          {stats.map((s, i) => (
            <div key={i} className="text-center md:border-r md:last:border-r-0 md:border-brand-ink/10 md:px-2">
              <div className="font-display text-brand-ink text-[clamp(2rem,4vw,3.25rem)] leading-none font-medium tracking-tight">
                <AnimatedNumber value={s.value} />
                <span className="text-brand-action">{s.suffix}</span>
              </div>
              <p className="mt-2 font-montserrat text-brand-ink/65 text-[0.65rem] uppercase tracking-[0.22em]">
                {s.label}
              </p>
            </div>
          ))}
        </RevealOnView>

        {/* Divider with rating badge */}
        <div className="relative flex items-center justify-center my-4 md:my-6">
          <div className="absolute inset-x-0 h-px bg-brand-ink/10" />
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.85 }}
            whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.34, 1.2, 0.64, 1] }}
            className="relative flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-brand-ink/10 shadow-sm"
          >
            <span className="flex items-center gap-0.5 text-brand-action">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: 4 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </motion.span>
              ))}
            </span>
            <span className="font-montserrat text-brand-ink text-[0.7rem] font-semibold tracking-wide">
              {t("trustRated") || "Rated 4.9 by 2,800+ travellers"}
            </span>
          </motion.div>
        </div>

        {/* Trust items */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8 mt-5">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduce ? undefined : { y: -3 }}
                className="group flex items-center justify-center gap-3 cursor-default"
              >
                <span className="relative grid place-items-center w-9 h-9 rounded-full bg-white border border-brand-action/30 text-brand-action transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-brand-action group-hover:text-white group-hover:border-brand-action group-hover:shadow-[0_8px_24px_-6px_rgba(191,103,62,0.5)]">
                  <Icon className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" />
                  <span className="absolute inset-0 rounded-full ring-2 ring-brand-action/0 group-hover:ring-brand-action/20 transition-all duration-500" />
                </span>
                <span className="font-montserrat font-semibold text-brand-ink text-[0.68rem] uppercase tracking-[0.22em]">
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
