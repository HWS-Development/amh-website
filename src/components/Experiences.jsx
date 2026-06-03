import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { listExperiences } from "@/lib/mghApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslated } from "@/lib/utils";
import OptimizedImage from "@/components/ui/OptimizedImage";
import SectionHeader from "@/components/ui/SectionHeader";
import { gsapEase, duration, stagger } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

// ─── Static fallback experiences (used when backend returns 0 or fails) ─────
// Keeps the home section populated with the 4 curated experiences requested
// by the client. Slugs match the SQL seed in scripts/seed_experiences.sql.
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
    sort_order: 4,
  },
];

export default function Experiences() {
  const { t, currentLanguage } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const sectionRef = useRef(null);

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

      // Merge backend results with static fallback (backend wins on slug match)
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

  useEffect(() => {
    if (loading || !visible.length || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".exp-header > *", {
        y: 24,
        opacity: 0,
        duration: duration.slow,
        stagger: stagger.tight,
        ease: gsapEase.editorial,
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
      });
      gsap.from(".exp-article", {
        y: 40,
        opacity: 0,
        duration: duration.slow,
        stagger: stagger.base,
        ease: gsapEase.editorial,
        scrollTrigger: { trigger: ".exp-list", start: "top 82%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, visible]);

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-brand-beige/40 relative overflow-hidden"
    >
      {/* Decorative serif background numeral — luxury editorial cue */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 select-none font-display text-[clamp(12rem,28vw,24rem)] leading-none text-brand-action/[0.04] tracking-tight"
      >
        02
      </div>

      <div className="content-wrapper relative">
        <div className="exp-header">
          <SectionHeader
            eyebrow={t("experiencesEyebrow") || "Curated journeys"}
            title={
              <>
                {t("unforgettableExperiences")}
              </>
            }
            subtitle={t("unforgettableExperiencesDesc")}
          />
        </div>

        <div className="exp-list space-y-16 md:space-y-24 mt-4">
          {(loading ? Array.from({ length: 3 }) : visible).map((it, i) => {
            const reversed = i % 2 === 1;
            return (
              <article
                key={it?.href || i}
                className="exp-article group grid md:grid-cols-12 gap-6 md:gap-10 items-center"
              >
                {/* Image */}
                <div
                  className={`relative md:col-span-7 ${
                    reversed ? "md:order-2" : ""
                  }`}
                >
                  <div className="relative aspect-[4/3] md:aspect-[16/11] overflow-hidden bg-brand-beige">
                    {loading ? (
                      <div className="absolute inset-0 animate-pulse bg-brand-ink/5" />
                    ) : (
                      <>
                        <OptimizedImage
                          src={it.img}
                          alt={it.title || "Experience"}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-editorial group-hover:scale-[1.06]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-ink/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      </>
                    )}
                  </div>

                  {/* Index numeral overlay */}
                  {!loading && (
                    <span
                      aria-hidden
                      className={`absolute -top-3 ${
                        reversed ? "-right-2 md:-right-6" : "-left-2 md:-left-6"
                      } font-display text-[clamp(3.5rem,7vw,6rem)] leading-none text-brand-action/80 italic font-medium select-none`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>

                {/* Text */}
                <div
                  className={`md:col-span-5 ${
                    reversed ? "md:order-1 md:pr-4" : "md:pl-4"
                  }`}
                >
                  <div className="max-w-[44ch]">
                    <span className="eyebrow-ink mb-4 inline-block">
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
                    <p className="body-text text-brand-ink/65">
                      {loading ? (
                        <span className="inline-block h-4 w-full bg-brand-ink/10 animate-pulse rounded-sm" />
                      ) : (
                        it.desc
                      )}
                    </p>
                    {!loading && (
                      <div className="mt-7">
                        <Link
                          to={it.href}
                          className="group/btn inline-flex items-center gap-2 font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-brand-ink hover:text-brand-action transition-colors duration-500 ease-editorial"
                        >
                          <span className="relative pb-1">
                            {t("discoverMore")}
                            <span className="absolute left-0 -bottom-0 h-px w-full bg-brand-ink/30 group-hover/btn:bg-brand-action transition-colors duration-500" />
                          </span>
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-editorial group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {!loading && items.length > 3 && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="group inline-flex items-center gap-3 border border-brand-ink/15 px-7 py-3.5 font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-brand-ink hover:border-brand-action hover:text-brand-action transition-all duration-500 ease-editorial"
            >
              <span className="h-px w-6 bg-brand-ink/30 group-hover:bg-brand-action transition-colors duration-500" />
              {showAll ? t("viewLess") : t("viewMore")}
              <span className="h-px w-6 bg-brand-ink/30 group-hover:bg-brand-action transition-colors duration-500" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
