import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { listDestinations } from "@/lib/mghApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowUpRight, Loader2, MapPin } from "lucide-react";
import { getTranslated } from "@/lib/utils";
import OptimizedImage from "@/components/ui/OptimizedImage";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  TiltCard,
  Spotlight,
  RevealOnView,
  StaggerGroup,
  MagneticButton,
} from "@/components/motion/primitives";

export default function FeaturedDestinations() {
  const { t, currentLanguage } = useLanguage();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listDestinations({
          slugs: ["marrakech", "essaouira", "ouarzazate"],
        });
        if (!isMounted) return;
        const mapped = (data || []).map((dest) => ({
          slug: dest.slug,
          name: getTranslated(dest.name_tr ?? dest.name, currentLanguage) || "",
          subtitle:
            getTranslated(dest.subtitle_tr ?? dest.subtitle, currentLanguage) ||
            "",
          img: dest.hero_image_urls?.[0] || null,
        }));
        setDestinations(mapped);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching featured destinations:", err);
        setError(t("somethingWentWrong"));
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [currentLanguage, t]);

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      <div className="section-divider" aria-hidden />
      <div className="content-wrapper-wide relative">
        <RevealOnView>
          <SectionHeader
            eyebrow={t("destinationsEyebrow") || "Three cities, one soul"}
            title={t("exploreOurDestinations")}
            subtitle={t("discoverTheSoulOfMorocco")}
          />
        </RevealOnView>

        {loading && (
          <div className="flex justify-center items-center h-72">
            <Loader2
              className="w-8 h-8 text-brand-action animate-spin"
              aria-label={t("loading")}
            />
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-xl border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
            <p className="font-medium">{error}</p>
            <button
              className="mt-3 underline text-sm"
              onClick={() => window.location.reload()}
            >
              {t("tryAgain")}
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7 mt-2" stagger={0.12}>
              {destinations.map((dest, index) => {
                const imgAlt = t("destinationAlt", { name: dest.name || "" });
                return (
                  <div key={dest.slug} className="group [perspective:1200px]">
                    <Link
                      to={`/destinations/${dest.slug}`}
                      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-action focus-visible:ring-offset-4"
                      aria-label={`${dest.name} — ${t("exploreDestination") || "Explore destination"}`}
                    >
                      <TiltCard
                        intensity={6}
                        className="relative overflow-hidden aspect-[3/4] md:aspect-[4/5] bg-brand-beige shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] transition-shadow duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:shadow-[0_30px_80px_-25px_rgba(0,0,0,0.5)]"
                      >
                        {dest.img ? (
                          <OptimizedImage
                            src={dest.img}
                            alt={imgAlt}
                            fetchPriority="low"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.09]"
                          />
                        ) : (
                          <div className="w-full h-full bg-brand-ink/5 animate-pulse" aria-hidden />
                        )}

                        {/* Gradient base */}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/20 to-transparent" />
                        {/* Action gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-action/40 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-700 mix-blend-overlay" />
                        {/* Spotlight follows cursor */}
                        <Spotlight color="rgba(255,255,255,0.18)" radius={260} />

                        {/* Top-left numeral with hairline */}
                        <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
                          <span className="font-display italic text-white/95 text-2xl tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="flex items-center gap-1 text-white/70 text-[0.6rem] font-montserrat uppercase tracking-[0.24em]">
                            <MapPin className="w-3 h-3" />
                            {t("morocco") || "Morocco"}
                          </span>
                        </div>

                        {/* Bottom content */}
                        <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                          <div className="flex items-end justify-between gap-4">
                            <div className="min-w-0">
                              <motion.h3
                                initial={reduce ? false : { opacity: 0, y: 6 }}
                                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="font-display text-white text-[clamp(1.6rem,2.5vw,2.4rem)] leading-[1.05] tracking-tight font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
                              >
                                {dest.name}
                              </motion.h3>
                              {dest.subtitle && (
                                <p className="mt-2 text-white/85 text-[0.8rem] font-montserrat leading-relaxed line-clamp-2 max-w-[28ch]">
                                  {dest.subtitle}
                                </p>
                              )}
                            </div>
                            <span
                              aria-hidden
                              className="shrink-0 grid place-items-center w-12 h-12 rounded-full border border-white/40 bg-white/10 backdrop-blur-md text-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-brand-action group-hover:border-brand-action group-hover:rotate-45 group-hover:shadow-[0_0_28px_rgba(191,103,62,0.6)]"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </span>
                          </div>

                          {/* Animated CTA underline */}
                          <div className="mt-5 flex items-center gap-3">
                            <div className="h-px w-0 bg-gradient-to-r from-white to-transparent transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
                            <span className="font-montserrat text-white/0 group-hover:text-white/90 text-[0.6rem] uppercase tracking-[0.28em] font-semibold transition-all duration-500 whitespace-nowrap">
                              {t("exploreDestination") || "Explore"}
                            </span>
                          </div>
                        </div>
                      </TiltCard>
                    </Link>
                  </div>
                );
              })}
            </StaggerGroup>

            <RevealOnView className="mt-16 flex flex-col items-center" delay={0.2}>
              <MagneticButton
                as={Link}
                to="/all-riads"
                strength={14}
                className="group inline-flex items-center gap-3 bg-brand-ink text-white px-10 py-4 font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.32em] hover:bg-brand-action transition-colors duration-500 shadow-[0_20px_50px_-15px_rgba(29,29,27,0.45)] rounded-full"
              >
                {t("searchAllProperties")}
                <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </MagneticButton>
            </RevealOnView>
          </>
        )}
      </div>
    </section>
  );
}
