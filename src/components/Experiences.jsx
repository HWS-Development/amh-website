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

const FALLBACK_EXPERIENCES = [
  {
    slug: "marrakech-caleche",
    title_tr: {
      fr: "Marrakech en calèche",
      en: "Marrakech by horse-drawn carriage",
      es: "Marrakech en calesa",
    },
    short_intro_tr: {
      fr: "Découvrez les ruelles, remparts et jardins de la ville ocre au rythme tranquille d'une calèche traditionnelle.",
      en: "Discover the lanes, ramparts and gardens of the ochre city at the gentle pace of a traditional horse-drawn carriage.",
      es: "Descubra las callejuelas, murallas y jardines de la ciudad ocre al tranquilo ritmo de una calesa tradicional.",
    },
    hero_image_url: "https://images.unsplash.com/photo-1539020140153-e479b8c5b3b3?w=1600&q=80",
    destination: "Marrakech",
    duration_label: "2h",
    sort_order: 1,
  },
  {
    slug: "ouarzazate-ait-ben-haddou",
    title_tr: {
      fr: "Ouarzazate : la Kasbah d'Aït Ben Haddou",
      en: "Ouarzazate: the Aït Ben Haddou Kasbah",
      es: "Ouarzazate: la Kasbah de Aït Ben Haddou",
    },
    short_intro_tr: {
      fr: "Explorez le ksar classé UNESCO d'Aït Ben Haddou, joyau d'architecture berbère en pisé, décor de films mythiques.",
      en: "Explore the UNESCO-listed ksar of Aït Ben Haddou, a jewel of Berber earthen architecture and legendary film set.",
      es: "Explore el ksar Patrimonio de la Humanidad de Aït Ben Haddou, joya de la arquitectura bereber en adobe.",
    },
    hero_image_url: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&q=80",
    destination: "Ouarzazate",
    duration_label: "Day trip",
    sort_order: 2,
  },
  {
    slug: "desert-agafay-dromadaire-quad",
    title_tr: {
      fr: "Désert d'Agafay en dromadaire ou en quad",
      en: "Agafay Desert by camel or quad bike",
      es: "Desierto de Agafay en dromedario o en quad",
    },
    short_intro_tr: {
      fr: "À une heure de Marrakech, traversez les paysages lunaires du désert d'Agafay à dos de dromadaire ou en quad.",
      en: "One hour from Marrakech, cross the lunar landscapes of the Agafay desert on camelback or by quad bike.",
      es: "A una hora de Marrakech, atraviese los paisajes lunares del desierto de Agafay en dromedario o en quad.",
    },
    hero_image_url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1600&q=80",
    destination: "Agafay",
    duration_label: "Half-day",
    sort_order: 3,
  },
  {
    slug: "essaouira-velo",
    title_tr: {
      fr: "Essaouira en vélo",
      en: "Essaouira by bike",
      es: "Essaouira en bicicleta",
    },
    short_intro_tr: {
      fr: "Longez les remparts portugais et la plage d'Essaouira à vélo, entre embruns de l'Atlantique et alizés.",
      en: "Cycle along Essaouira's Portuguese ramparts and beach, between Atlantic spray and trade winds.",
      es: "Recorra en bicicleta las murallas portuguesas y la playa de Essaouira, entre la brisa atlántica y los vientos alisios.",
    },
    hero_image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&q=80",
    destination: "Essaouira",
    duration_label: "3h",
    sort_order: 4,
  },
];

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

      const bySlug = new Map();
      [...FALLBACK_EXPERIENCES, ...(raw || [])].forEach((x) => {
        if (x?.slug) bySlug.set(x.slug, x);
      });

      const mapped = Array.from(bySlug.values())
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
