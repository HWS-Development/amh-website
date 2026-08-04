import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePartnerHotels } from '@/lib/partnerHotelsApi';
import { usePartnerCatalogs } from '@/lib/partnerCatalogsApi';
import { deriveDestinationsFromRiads, deriveNeighborhoodsFromRiads, mapPartnerHotelToRiad } from '@/lib/partnerHotelTransform';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import SectionHeader from '@/components/ui/SectionHeader';
import {
  TiltCard,
  Spotlight,
  RevealOnView,
  MagneticButton,
} from '@/components/motion/primitives';

const PER_CITY = 3;

function QuartierCard({ quartier, index, t }) {
  const name = quartier.name;
  const shortDesc = quartier.shortDescription || `${quartier.hotelCount} ${t('propertiesAvailable') || 'properties'}`;
  return (
    <div className="fq-card group [perspective:1200px] w-full">
      <Link
        to={`/all-riads?city=${encodeURIComponent(quartier.city_id)}&quartier=${encodeURIComponent(quartier.id)}`}
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

function CityCarousel({ city, items, t, cityIndex }) {
  const cityLabel = city.name;
  const reduce = useReducedMotion();

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
        <div className="shrink-0">
          <MagneticButton
            as={Link}
            to={`/quartiers?city=${encodeURIComponent(city.id)}`}
            strength={10}
            aria-label={`${t('seeMore')} - ${cityLabel}`}
            className="group inline-flex items-center gap-2 rounded-full border border-brand-ink/15 bg-white px-5 py-3 font-montserrat text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-brand-ink hover:border-brand-action hover:text-brand-action hover:bg-brand-action/5 transition-colors duration-300"
          >
            {t('seeMore')}
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </MagneticButton>
        </div>
      </RevealOnView>

      <div
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
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function FeaturedQuartiers() {
  const { t, currentLanguage } = useLanguage();
  const { data: hotels = [], isLoading: loading, error } = usePartnerHotels();
  const { data: partnerCatalogs } = usePartnerCatalogs();
  const riads = useMemo(
    () => hotels.map((hotel) => mapPartnerHotelToRiad(hotel, currentLanguage, partnerCatalogs)),
    [hotels, currentLanguage, partnerCatalogs]
  );
  const cities = useMemo(() => deriveDestinationsFromRiads(riads), [riads]);
  const rows = useMemo(() => deriveNeighborhoodsFromRiads(riads), [riads]);

  const byCity = useMemo(() => {
    const map = new Map(cities.map((city) => [city.id, []]));
    const orderedRows = [...rows].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    for (const r of orderedRows) {
      const imgs = Array.isArray(r.images) ? r.images : [];
      if (!imgs.length) continue;
      const bucket = map.get(r.city_id);
      if (bucket && bucket.length < PER_CITY) bucket.push(r);
    }
    return map;
  }, [cities, rows]);

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
          <p className="text-red-700 font-medium text-sm">{t('somethingWentWrong')}</p>
          <button className="mt-3 underline text-sm" onClick={() => window.location.reload()}>
            {t('tryAgain')}
          </button>
        </div>
      </section>
    );
  }

  const populatedCities = cities.filter((city) => (byCity.get(city.id) || []).length > 0);

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
