// sections/Experiences.jsx
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/customSupabaseClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslated } from "@/lib/utils";

export default function Experiences() {
  const { t, currentLanguage } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("mgh_experiences") // 👈 NEW TABLE
        .select("title_tr, slug, hero_image_url, short_intro_tr, sort_order, is_published")
        .eq("is_published", true) // 👈 plays nicely with RLS: allow public read of published rows
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

  return (
    <section className="section-padding bg-white">
      <div className="content-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="h2-style text-brand-ink mb-3">{t("unforgettableExperiences")}</h2>
          <p className="body-text max-w-3xl mx-auto">{t("unforgettableExperiencesDesc")}</p>
        </motion.div>

        <div className="space-y-8">
          {(loading ? Array.from({ length: 3 }) : visible).map((it, i) => (
            <motion.article
              key={it?.href || i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              viewport={{ once: true, amount: 0.3 }}
              className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
            >
              <div className="grid md:grid-cols-2">
                <div className="relative h-64 md:h-80">
                  {loading ? (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                  ) : (
                    <>
                      <img
                        src={it.img}
                        alt={it.title || "Experience"}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-black/10 to-transparent" />
                    </>
                  )}
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="max-w-[46ch]">
                    <h3 className="text-2xl md:text-[28px] font-extrabold text-brand-ink tracking-tight">
                      {loading ? (
                        <span className="inline-block h-7 w-64 bg-gray-200 animate-pulse rounded" />
                      ) : (
                        it.title
                      )}
                    </h3>
                    <p className="mt-3 text-[15px] leading-6 text-brand-ink/70">
                      {loading ? (
                        <span className="inline-block h-4 w-full bg-gray-200 animate-pulse rounded" />
                      ) : (
                        it.desc
                      )}
                    </p>
                    {!loading && (
                      <div className="mt-5">
                        <Link
                          to={it.href}
                          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow hover:shadow-md transition-all"
                        >
                          {t("discoverMore")} <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {!loading && items.length > 3 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-black/5"
            >
              {showAll ? t("viewLess") : t("viewMore")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
