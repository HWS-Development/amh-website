import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { listDestinations } from "@/lib/mghApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { getTranslated } from "@/lib/utils";
import OptimizedImage from "@/components/ui/OptimizedImage";
import SectionHeader from "@/components/ui/SectionHeader";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsapEase, duration, stagger } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedDestinations() {
  const { t, currentLanguage } = useLanguage();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sectionRef = useRef(null);

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
          name:
            getTranslated(dest.name_tr ?? dest.name, currentLanguage) || "",
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

  useEffect(() => {
    if (loading || destinations.length === 0 || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".dest-header > *", {
        y: 24,
        opacity: 0,
        duration: duration.slow,
        stagger: stagger.tight,
        ease: gsapEase.editorial,
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
      });
      gsap.from(".dest-card", {
        y: 48,
        opacity: 0,
        duration: duration.slow,
        stagger: stagger.base,
        ease: gsapEase.editorial,
        scrollTrigger: { trigger: ".dest-grid", start: "top 82%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, destinations]);

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-white relative overflow-hidden"
    >
      <div className="content-wrapper-wide relative">
        <div className="dest-header">
          <SectionHeader
            eyebrow={t("destinationsEyebrow") || "Three cities, one soul"}
            title={t("exploreOurDestinations")}
            subtitle={t("discoverTheSoulOfMorocco")}
          />
        </div>

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
            <div className="dest-grid grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-2">
              {destinations.map((dest, index) => {
                const imgAlt = t("destinationAlt", { name: dest.name || "" });
                return (
                  <Link
                    key={dest.slug}
                    to={`/destinations/${dest.slug}`}
                    className="dest-card group relative block"
                  >
                    <div className="relative overflow-hidden aspect-[3/4] md:aspect-[4/5] bg-brand-beige">
                      {dest.img ? (
                        <OptimizedImage
                          src={dest.img}
                          alt={imgAlt}
                          fetchPriority="low"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-editorial group-hover:scale-[1.08]"
                        />
                      ) : (
                        <div
                          className="w-full h-full bg-brand-ink/5 animate-pulse"
                          aria-hidden
                        />
                      )}

                      {/* Permanent base gradient for legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/15 to-transparent" />

                      {/* Hover gradient intensifier */}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-editorial" />

                      {/* Top index */}
                      <span className="absolute top-5 left-5 font-display italic text-white/85 text-2xl tracking-tight">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {/* Bottom content */}
                      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                        <div className="flex items-end justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-display text-white text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.05] tracking-tight font-medium">
                              {dest.name}
                            </h3>
                            {dest.subtitle && (
                              <p className="mt-2 text-white/80 text-[0.78rem] font-montserrat leading-relaxed line-clamp-2 max-w-[28ch]">
                                {dest.subtitle}
                              </p>
                            )}
                          </div>
                          <span
                            aria-hidden
                            className="shrink-0 grid place-items-center w-11 h-11 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm text-white transition-all duration-500 ease-editorial group-hover:bg-brand-action group-hover:border-brand-action group-hover:rotate-45"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </span>
                        </div>

                        {/* Hairline accent under hover */}
                        <div className="mt-4 h-px w-0 bg-white/70 transition-all duration-700 ease-editorial group-hover:w-full" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-14 text-center">
              <Link
                to="/all-riads"
                className="group inline-flex items-center gap-3 bg-brand-ink text-white px-9 py-4 font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.32em] hover:bg-brand-action transition-colors duration-500 ease-editorial"
              >
                {t("searchAllProperties")}
                <ArrowUpRight className="w-4 h-4 transition-transform duration-500 ease-editorial group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
