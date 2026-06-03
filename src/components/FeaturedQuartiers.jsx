import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import { getTranslated } from '@/lib/utils';
import { ArrowUpRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import SectionHeader from '@/components/ui/SectionHeader';
import { gsapEase, duration, stagger } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const CITIES = [
  { id: 'marrakech',  labelKey: 'cityMarrakech',  fallback: 'Marrakech'  },
  { id: 'essaouira',  labelKey: 'cityEssaouira',  fallback: 'Essaouira'  },
  { id: 'ouarzazate', labelKey: 'cityOuarzazate', fallback: 'Ouarzazate' },
];

const PER_CITY = 3;

function QuartierCard({ quartier, index, t, currentLanguage }) {
  const name = getTranslated(quartier.label, currentLanguage);
  const shortDesc = getTranslated(quartier.short_desc_tr, currentLanguage);
  return (
    <Link
      to={`/quartiers-medina#${quartier.id}`}
      className="fq-card group relative block shrink-0 w-[80%] sm:w-[55%] md:w-full snap-start"
    >
      <div className="relative overflow-hidden aspect-[4/5] bg-brand-beige">
        {quartier.images?.[0] ? (
          <OptimizedImage
            src={quartier.images[0]}
            alt={t('quartierAlt', { name })}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-editorial group-hover:scale-[1.08]"
          />
        ) : (
          <div className="w-full h-full bg-brand-ink/5" aria-hidden />
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
}

function CityCarousel({ city, items, t, currentLanguage }) {
  const scrollerRef = useRef(null);
  const cityLabel = t(city.labelKey) || city.fallback;

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector('.fq-card');
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  if (!items.length) return null;

  return (
    <div className="fq-city">
      <div className="flex items-end justify-between gap-4 mb-5 md:mb-6">
        <h3 className="font-display text-brand-ink text-[clamp(1.4rem,2.4vw,2.1rem)] leading-tight tracking-tight">
          <span className="font-display italic text-brand-action/80 mr-2">·</span>
          {cityLabel}
        </h3>
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            aria-label={t('previous') || 'Previous'}
            onClick={() => scrollBy(-1)}
            className="w-10 h-10 grid place-items-center border border-brand-ink/15 text-brand-ink hover:border-brand-action hover:text-brand-action transition-colors duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label={t('next') || 'Next'}
            onClick={() => scrollBy(1)}
            className="w-10 h-10 grid place-items-center border border-brand-ink/15 text-brand-ink hover:border-brand-action hover:text-brand-action transition-colors duration-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="fq-grid grid md:grid-cols-3 gap-5 md:gap-6 flex md:!grid overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((q, i) => (
          <QuartierCard
            key={q.id}
            quartier={q}
            index={i}
            t={t}
            currentLanguage={currentLanguage}
          />
        ))}
      </div>
    </div>
  );
}

export default function FeaturedQuartiers() {
  const { t, currentLanguage } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('mgh_neighborhoods')
        .select('id, label, short_desc_tr, images, display_order, is_featured, city_id')
        .in('city_id', CITIES.map((c) => c.id))
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true, nullsFirst: false });

      if (!isMounted) return;
      if (error) {
        console.error('Error fetching featured quartiers:', error);
        setError(t('somethingWentWrong'));
        setLoading(false);
        return;
      }
      setRows(data || []);
      setLoading(false);
    })();
    return () => { isMounted = false; };
  }, [currentLanguage, t]);

  // Group by city, keep only items with at least one image, take top N per city.
  const byCity = useMemo(() => {
    const map = new Map(CITIES.map((c) => [c.id, []]));
    for (const r of rows) {
      const imgs = Array.isArray(r.images) ? r.images : [];
      if (!imgs.length) continue;
      const bucket = map.get(r.city_id);
      if (bucket && bucket.length < PER_CITY) bucket.push(r);
    }
    return map;
  }, [rows]);

  useEffect(() => {
    if (loading || !rows.length || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.fq-header > *', {
        y: 24, opacity: 0, duration: duration.slow, stagger: stagger.tight,
        ease: gsapEase.editorial,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
      });
      gsap.from('.fq-city', {
        y: 32, opacity: 0, duration: duration.slow, stagger: stagger.base,
        ease: gsapEase.editorial,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, rows]);

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

  const populatedCities = CITIES.filter((c) => (byCity.get(c.id) || []).length > 0);

  if (!populatedCities.length) {
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

        <div className="mt-4 space-y-14 md:space-y-16">
          {populatedCities.map((c) => (
            <CityCarousel
              key={c.id}
              city={c}
              items={byCity.get(c.id) || []}
              t={t}
              currentLanguage={currentLanguage}
            />
          ))}
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
