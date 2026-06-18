import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import { getTranslated } from '@/lib/utils';
import { ArrowUpRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import SectionHeader from '@/components/ui/SectionHeader';
import {
  TiltCard,
  Spotlight,
  RevealOnView,
  MagneticButton,
} from '@/components/motion/primitives';

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
    <div className="fq-card group [perspective:1200px] w-full">
      <Link
        to={`/quartiers#${quartier.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-action focus-visible:ring-offset-4"
        aria-label={`${name} — ${t('discoverMore') || 'Discover'}`}
      >
        <TiltCard
          intensity={5}
          className="relative overflow-hidden aspect-[4/5] bg-brand-beige shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] transition-shadow duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:shadow-[0_30px_70px_-25px_rgba(0,0,0,0.45)]"
        >
          {quartier.images?.[0] ? (
            <OptimizedImage
              src={quartier.images[0]}
              alt={t('quartierAlt', { name })}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.09]"
            />
          ) : (
            <div className="w-full h-full bg-brand-ink/5" aria-hidden />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-action/40 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-700 mix-blend-overlay" />
          <Spotlight color="rgba(255,255,255,0.15)" radius={220} />

          <span className="absolute top-5 left-5 font-display italic text-white/95 text-2xl tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            {String(index + 1).padStart(2, '0')}
          </span>

          <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-display text-white text-[clamp(1.5rem,2.3vw,2.1rem)] leading-[1.05] tracking-tight font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                  {name}
                </h3>
                {shortDesc && (
                  <p className="mt-2 text-white/85 text-[0.78rem] font-montserrat leading-relaxed line-clamp-2 max-w-[28ch]">
                    {shortDesc}
                  </p>
                )}
              </div>
              <span
                aria-hidden
                className="shrink-0 grid place-items-center w-11 h-11 rounded-full border border-white/40 bg-white/10 backdrop-blur-md text-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-brand-action group-hover:border-brand-action group-hover:rotate-45 group-hover:shadow-[0_0_24px_rgba(191,103,62,0.55)]"
              >
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4 h-px w-0 bg-gradient-to-r from-white to-transparent transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
          </div>
        </TiltCard>
      </Link>
    </div>
  );
}

function CityCarousel({ city, items, t, currentLanguage, cityIndex }) {
  const scrollerRef = useRef(null);
  const cityLabel = t(city.labelKey) || city.fallback;
  const reduce = useReducedMotion();

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
      <RevealOnView className="flex items-end justify-between gap-4 mb-5 md:mb-6">
        <h3 className="font-display text-brand-ink text-[clamp(1.4rem,2.4vw,2.1rem)] leading-tight tracking-tight flex items-baseline gap-3">
          <span className="font-montserrat text-brand-action text-[0.65rem] font-semibold uppercase tracking-[0.32em]">
            {String(cityIndex + 1).padStart(2, '0')} —
          </span>
          {cityLabel}
        </h3>
        <div className="hidden md:flex items-center gap-2">
          <MagneticButton
            as="button"
            type="button"
            strength={10}
            aria-label={t('previous') || 'Previous'}
            onClick={() => scrollBy(-1)}
            className="w-11 h-11 grid place-items-center rounded-full border border-brand-ink/15 text-brand-ink hover:border-brand-action hover:text-brand-action hover:bg-brand-action/5 transition-colors duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </MagneticButton>
          <MagneticButton
            as="button"
            type="button"
            strength={10}
            aria-label={t('next') || 'Next'}
            onClick={() => scrollBy(1)}
            className="w-11 h-11 grid place-items-center rounded-full border border-brand-ink/15 text-brand-ink hover:border-brand-action hover:text-brand-action hover:bg-brand-action/5 transition-colors duration-300"
          >
            <ChevronRight className="w-4 h-4" />
          </MagneticButton>
        </div>
      </RevealOnView>

      <div
        ref={scrollerRef}
        className="fq-grid flex md:grid md:grid-cols-3 gap-5 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((q, i) => (
          <motion.div
            key={q.id}
            initial={reduce ? false : { opacity: 0, y: 28, filter: 'blur(4px)' }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="fq-card-wrap shrink-0 w-[85%] sm:w-[60%] md:w-full snap-start"
          >
            <QuartierCard
              quartier={q}
              index={i}
              t={t}
              currentLanguage={currentLanguage}
            />
          </motion.div>
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
    <section className="section-padding bg-gradient-to-b from-brand-beige/60 via-brand-beige/30 to-brand-beige/50 relative overflow-hidden">
      {/* Giant decorative wordmark */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute -top-10 -left-10 select-none font-display italic text-[clamp(10rem,24vw,20rem)] leading-none text-brand-action/[0.05] tracking-tight"
      >
        Médina
      </motion.div>

      <div className="content-wrapper-wide relative">
        <RevealOnView>
          <SectionHeader
            eyebrow={t('quartiersEyebrow') || 'Inside the medina'}
            title={t('medinaQuartiersTitle')}
            subtitle={t('medinaQuartiersSubtitle')}
          />
        </RevealOnView>

        <div className="mt-4 space-y-16 md:space-y-20">
          {populatedCities.map((c, idx) => (
            <CityCarousel
              key={c.id}
              city={c}
              items={byCity.get(c.id) || []}
              t={t}
              currentLanguage={currentLanguage}
              cityIndex={idx}
            />
          ))}
        </div>

        <RevealOnView className="mt-16 text-center" delay={0.1}>
          <MagneticButton
            as={Link}
            to="/quartiers"
            strength={14}
            className="group inline-flex items-center gap-3 border border-brand-ink/15 bg-white px-10 py-4 font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-brand-ink hover:border-brand-action hover:text-brand-action hover:bg-brand-action/5 transition-colors duration-500 rounded-full"
          >
            <span className="h-px w-6 bg-brand-ink/30 group-hover:bg-brand-action transition-colors duration-500" />
            {t('discoverAllQuartiers')}
            <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </MagneticButton>
        </RevealOnView>
      </div>
    </section>
  );
}
