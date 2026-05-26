import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import { getTranslated } from '@/lib/utils';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import SectionHeader from '@/components/ui/SectionHeader';
import { gsapEase, duration, stagger } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedQuartiers() {
  const { t, currentLanguage } = useLanguage();
  const [quartiers, setQuartiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('amh_quartiers')
        .select('slug, name_tr, short_desc_tr, images, display_order, is_featured')
        .eq('is_featured', true)
        .order('display_order', { ascending: true, nullsFirst: false })
        .limit(3);

      if (!isMounted) return;
      if (error) {
        console.error('Error fetching featured quartiers:', error);
        setError(t('somethingWentWrong'));
        setLoading(false);
        return;
      }
      setQuartiers(data || []);
      setLoading(false);
    })();
    return () => { isMounted = false; };
  }, [currentLanguage, t]);

  useEffect(() => {
    if (loading || !quartiers.length || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.fq-header > *', {
        y: 24, opacity: 0, duration: duration.slow, stagger: stagger.tight,
        ease: gsapEase.editorial,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
      });
      gsap.from('.fq-card', {
        y: 40, opacity: 0, duration: duration.slow, stagger: stagger.base,
        ease: gsapEase.editorial,
        scrollTrigger: { trigger: '.fq-grid', start: 'top 82%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, quartiers]);

  if (loading) {
    return (
      <section className="section-padding-tight bg-brand-beige/40">
        <div className="content-wrapper flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-brand-action animate-spin" aria-label={t('loading')} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-padding-tight bg-brand-beige/40">
        <div className="content-wrapper text-center">
          <p className="text-red-700 font-medium text-sm">{error}</p>
          <button className="mt-3 underline text-sm" onClick={() => window.location.reload()}>
            {t('tryAgain')}
          </button>
        </div>
      </section>
    );
  }

  if (!quartiers.length) {
    return (
      <section className="section-padding-tight bg-brand-beige/40">
        <div className="content-wrapper text-center text-brand-ink/60 text-sm">
          {t('noFeaturedQuartiers')}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="section-padding bg-brand-beige/40 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -left-10 select-none font-display italic text-[clamp(10rem,24vw,20rem)] leading-none text-brand-action/[0.05] tracking-tight"
      >
        Médina
      </div>

      <div className="content-wrapper-wide relative">
        <div className="fq-header">
          <SectionHeader
            eyebrow={t('quartiersEyebrow') || 'Inside the medina'}
            title={t('medinaQuartiersTitle')}
            subtitle={t('medinaQuartiersSubtitle')}
          />
        </div>

        <div className="fq-grid grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-2">
          {quartiers.map((quartier, index) => {
            const name = getTranslated(quartier.name_tr, currentLanguage);
            const shortDesc = getTranslated(quartier.short_desc_tr, currentLanguage);
            return (
              <Link
                key={quartier.slug}
                to={`/quartiers-medina#${quartier.slug}`}
                className="fq-card group relative block"
              >
                <div className="relative overflow-hidden aspect-[4/5] bg-brand-beige">
                  {quartier.images?.[0] ? (
                    <OptimizedImage
                      src={quartier.images[0]}
                      alt={t('quartierAlt', { name })}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-editorial group-hover:scale-[1.08]"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-ink/5 animate-pulse" aria-hidden />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/15 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-editorial" />

                  <span className="absolute top-5 left-5 font-display italic text-white/85 text-2xl tracking-tight">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                    <div className="flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-display text-white text-[clamp(1.4rem,2.2vw,2rem)] leading-[1.05] tracking-tight font-medium">
                          {name}
                        </h3>
                        {shortDesc && (
                          <p className="mt-2 text-white/80 text-[0.78rem] font-montserrat leading-relaxed line-clamp-2 max-w-[28ch]">
                            {shortDesc}
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
                    <div className="mt-4 h-px w-0 bg-white/70 transition-all duration-700 ease-editorial group-hover:w-full" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <Link
            to="/quartiers-medina"
            className="group inline-flex items-center gap-3 border border-brand-ink/15 px-9 py-4 font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-brand-ink hover:border-brand-action hover:text-brand-action transition-all duration-500 ease-editorial"
          >
            <span className="h-px w-6 bg-brand-ink/30 group-hover:bg-brand-action transition-colors duration-500" />
            {t('discoverAllQuartiers')}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
