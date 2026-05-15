import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/customSupabaseClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslated } from "@/lib/utils";
import OptimizedImage from '@/components/ui/OptimizedImage';

gsap.registerPlugin(ScrollTrigger);

export default function Experiences() {
  const { t, currentLanguage } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("mgh_experiences")
        .select("title_tr, slug, hero_image_url, short_intro_tr, sort_order, is_published")
        .eq("is_published", true)
        .order("sort_order", { ascending: true, nullsFirst: false });

      if (error) {
        console.error("mgh_experiences fetch error:", error);
        setItems([]);
      } else {
        const mapped = (data || []).map((x) => ({
          title: getTranslated(x.title_tr, currentLanguage),
          desc: getTranslated(x.short_intro_tr, currentLanguage),
          img: x.hero_image_url,
          href: `/experiences/${x.slug}`,
          sort: x.sort_order ?? 9999,
        }));
        setItems(mapped);
      }

      setLoading(false);
    })();
  }, [currentLanguage]);

  const visible = useMemo(() => (showAll ? items : items.slice(0, 3)), [items, showAll]);

  useEffect(() => {
    if (loading || !visible.length || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.exp-header', {
        y: 16, opacity: 0, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      gsap.from('.exp-article', {
        y: 18, opacity: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out',
        scrollTrigger: { trigger: '.exp-list', start: 'top 85%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, visible]);

  return (
    <section ref={sectionRef} className="section-padding bg-white">
      <div className="content-wrapper">
        <div className="exp-header text-center mb-12">
          <h2 className="h2-style text-brand-ink mb-3">{t("unforgettableExperiences")}</h2>
          <p className="body-text max-w-3xl mx-auto text-brand-ink/60">{t("unforgettableExperiencesDesc")}</p>
        </div>

        <div className="exp-list space-y-6">
          {(loading ? Array.from({ length: 3 }) : visible).map((it, i) => (
            <article
              key={it?.href || i}
              className="exp-article group relative overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="grid md:grid-cols-2">
                <div className="relative h-56 md:h-72">
                  {loading ? (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                  ) : (
                    <>
                      <OptimizedImage
                        src={it.img}
                        alt={it.title || "Experience"}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-black/10 to-transparent" />
                    </>
                  )}
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="max-w-[46ch]">
                    <h3 className="text-xl md:text-2xl font-bold text-brand-ink tracking-tight font-montserrat">
                      {loading ? (
                        <span className="inline-block h-6 w-56 bg-gray-200 animate-pulse" />
                      ) : (
                        it.title
                      )}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-brand-ink/60">
                      {loading ? (
                        <span className="inline-block h-4 w-full bg-gray-200 animate-pulse" />
                      ) : (
                        it.desc
                      )}
                    </p>
                    {!loading && (
                      <div className="mt-5">
                        <Link
                          to={it.href}
                          className="inline-flex items-center gap-2 bg-brand-action px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wider shadow-sm hover:bg-brand-action/90 transition-all duration-300"
                        >
                          {t("discoverMore")} <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!loading && items.length > 3 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex items-center justify-center border border-brand-ink/15 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-brand-ink hover:bg-brand-beige hover:border-brand-action/30 transition-all duration-300"
            >
              {showAll ? t("viewLess") : t("viewMore")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
