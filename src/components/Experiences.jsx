import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Sparkles, Clock, MapPin } from "lucide-react";
import { listExperiences } from "@/lib/mghApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslated } from "@/lib/utils";
import OptimizedImage from "@/components/ui/OptimizedImage";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  TiltCard,
  Spotlight,
  RevealOnView,
  MagneticButton,
} from "@/components/motion/primitives";

export default function Experiences() {
  const { t, currentLanguage } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let raw = [];
      try {
        raw = await listExperiences();
      } catch (error) {
        console.error("mgh_experiences fetch error:", error);
      }
      if (cancelled) return;

      const mapped = (raw || [])
        .map((x) => ({
          slug: x.slug,
          title: getTranslated(x.title_tr, currentLanguage),
          desc: getTranslated(x.short_intro_tr, currentLanguage),
          img: x.hero_image_url,
          href: `/experiences/${x.slug}`,
          destination: x.destination || getTranslated(x.destination_tr, currentLanguage),
          duration: x.duration_label || getTranslated(x.duration_tr, currentLanguage),
          sort: x.sort_order ?? 9999,
        }))
        .sort((a, b) => a.sort - b.sort);

      setItems(mapped);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  const visible = useMemo(
    () => (showAll ? items : items.slice(0, 3)),
    [items, showAll]
  );

  return (
    <section className="section-padding bg-gradient-to-b from-brand-beige/50 via-white to-brand-beige/30 relative overflow-hidden">
      {/* Decorative serif background numeral */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute -top-10 -right-10 select-none font-display text-[clamp(12rem,28vw,24rem)] leading-none text-brand-action/[0.04] tracking-tight"
      >
        02
      </motion.div>

      <div className="section-divider" aria-hidden />
      <div className="content-wrapper relative">
        <RevealOnView>
          <SectionHeader
            eyebrow={t("experiencesEyebrow") || "Curated journeys"}
            title={t("unforgettableExperiences")}
            subtitle={t("unforgettableExperiencesDesc")}
          />
        </RevealOnView>

        <div className="exp-list space-y-20 md:space-y-28 mt-6">
          {(loading ? Array.from({ length: 3 }) : visible).map((it, i) => {
            const reversed = i % 2 === 1;
            return (
              <motion.article
                key={it?.href || i}
                initial={reduce ? false : { opacity: 0, y: 50 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="exp-article group grid md:grid-cols-12 gap-6 md:gap-12 items-center"
              >
                {/* Image */}
                <div className={`relative md:col-span-7 [perspective:1200px] ${reversed ? "md:order-2" : ""}`}>
                  {!loading && (
                    <TiltCard
                      intensity={6}
                      className="relative aspect-[4/3] md:aspect-[16/11] overflow-hidden bg-brand-beige shadow-[0_15px_45px_-20px_rgba(0,0,0,0.3)] transition-shadow duration-700 group-hover:shadow-[0_35px_90px_-25px_rgba(0,0,0,0.45)]"
                    >
                      <OptimizedImage
                        src={it.img}
                        alt={it.title || "Experience"}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-ink/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <Spotlight color="rgba(255,255,255,0.18)" radius={300} />

                      {/* Floating meta chips */}
                      {(it.destination || it.duration) && (
                        <div className="absolute bottom-5 left-5 flex gap-2 flex-wrap">
                          {it.destination && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-brand-ink text-[0.6rem] font-montserrat font-semibold uppercase tracking-[0.18em] shadow-sm">
                              <MapPin className="w-3 h-3 text-brand-action" />
                              {it.destination}
                            </span>
                          )}
                          {it.duration && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-brand-ink text-[0.6rem] font-montserrat font-semibold uppercase tracking-[0.18em] shadow-sm">
                              <Clock className="w-3 h-3 text-brand-action" />
                              {it.duration}
                            </span>
                          )}
                        </div>
                      )}
                    </TiltCard>
                  )}
                  {loading && (
                    <div className="relative aspect-[4/3] md:aspect-[16/11] overflow-hidden bg-brand-ink/5 animate-pulse" />
                  )}

                  {/* Index numeral overlay */}
                  {!loading && (
                    <motion.span
                      aria-hidden
                      initial={reduce ? false : { opacity: 0, scale: 0.7, rotate: -10 }}
                      whileInView={reduce ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.2, ease: [0.34, 1.2, 0.64, 1] }}
                      className={`absolute -top-4 ${
                        reversed ? "-right-2 md:-right-8" : "-left-2 md:-left-8"
                      } font-display text-[clamp(3.5rem,7.5vw,6.5rem)] leading-none text-brand-action italic font-medium select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)]`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </motion.span>
                  )}
                </div>

                {/* Text */}
                <div className={`md:col-span-5 ${reversed ? "md:order-1 md:pr-4" : "md:pl-4"}`}>
                  <div className="max-w-[44ch]">
                    <span className="eyebrow-ink mb-4 inline-flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-brand-action" />
                      {loading ? "—" : t("experienceLabel") || `Experience ${String(i + 1).padStart(2, "0")}`}
                    </span>
                    <h3 className="h3-style text-brand-ink mt-2 mb-4">
                      {loading ? (
                        <span className="inline-block h-7 w-64 max-w-full bg-brand-ink/10 animate-pulse rounded-sm" />
                      ) : (
                        it.title
                      )}
                    </h3>
                    <div className="hairline-ink w-12 mb-5" />
                    <p className="body-text text-brand-ink/70">
                      {loading ? (
                        <span className="inline-block h-4 w-full bg-brand-ink/10 animate-pulse rounded-sm" />
                      ) : (
                        it.desc
                      )}
                    </p>
                    {!loading && (
                      <div className="mt-8 flex flex-wrap items-center gap-5">
                        <Link
                          to="/all-riads"
                          className="group/btn inline-flex items-center gap-3 bg-brand-ink text-white px-7 py-3.5 rounded-full font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.28em] hover:bg-brand-action transition-all duration-500 shadow-md hover:shadow-xl"
                        >
                          {t("bookARiadNearby") || "Book a riad nearby"}
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {!loading && items.length > 3 && (
          <RevealOnView className="mt-16 text-center" delay={0.1}>
            <MagneticButton
              as="button"
              onClick={() => setShowAll((v) => !v)}
              strength={10}
              className="group inline-flex items-center gap-3 border border-brand-ink/15 bg-white px-9 py-3.5 rounded-full font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-brand-ink hover:border-brand-action hover:text-brand-action hover:bg-brand-action/5 transition-colors duration-500"
            >
              <span className="h-px w-6 bg-brand-ink/30 group-hover:bg-brand-action transition-colors duration-500" />
              {showAll ? t("viewLess") : t("viewMore")}
              <span className="h-px w-6 bg-brand-ink/30 group-hover:bg-brand-action transition-colors duration-500" />
            </MagneticButton>
          </RevealOnView>
        )}
      </div>
    </section>
  );
}
