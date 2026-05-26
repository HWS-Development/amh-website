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
      try {
        const data = await listExperiences();
        if (cancelled) return;
        const mapped = (data || [])
          .map((x) => ({
            title: getTranslated(x.title_tr, currentLanguage),
            desc: getTranslated(x.short_intro_tr, currentLanguage),
            img: x.hero_image_url,
            href: `/experiences/${x.slug}`,
            sort: x.sort_order ?? 9999,
          }))
          .sort((a, b) => a.sort - b.sort);
        setItems(mapped);
      } catch (error) {
        if (cancelled) return;
        console.error("mgh_experiences fetch error:", error);
        setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
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
