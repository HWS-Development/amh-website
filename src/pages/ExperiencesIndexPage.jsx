import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import {
  ArrowUpRight,
  MapPin,
  Clock,
  Sparkles,
  Compass,
  Filter,
  Loader2,
} from 'lucide-react';
import { listExperiences } from '@/lib/mghApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslated } from '@/lib/utils';
import OptimizedImage from '@/components/ui/OptimizedImage';
import {
  TiltCard,
  Spotlight,
  RevealOnView,
  MagneticButton,
  ShimmerText,
  FloatingOrbs,
  AnimatedNumber,
} from '@/components/motion/primitives';

const ExperiencesIndexPage = () => {
  const { t, currentLanguage } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -60]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let raw = [];
      try {
        raw = await listExperiences();
      } catch (error) {
        console.error('listExperiences error:', error);
      }
      if (cancelled) return;

      const mapped = (raw || [])
        .map((x) => ({
          slug: x.slug,
          title: getTranslated(x.title_tr, currentLanguage),
          desc: getTranslated(x.short_intro_tr, currentLanguage),
          img: x.hero_image_url,
          href: `/experiences/${x.slug}`,
          destination: x.destination || getTranslated(x.destination_tr, currentLanguage),
          duration: x.duration_label || getTranslated(x.duration_tr, currentLanguage),
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

  const destinations = useMemo(() => {
    const set = new Set();
    items.forEach((i) => i.destination && set.add(i.destination));
    return ['all', ...Array.from(set)];
  }, [items]);

  const visible = useMemo(
    () =>
      activeFilter === 'all'
        ? items
        : items.filter((i) => i.destination === activeFilter),
    [items, activeFilter]
  );

  const pageTitle = t('experiencesPageTitle') || 'Experiences across Morocco';
  const pageDescription =
    t('experiencesPageDesc') ||
    'Curated journeys through Marrakech, Ouarzazate, Agafay and Essaouira — handpicked by your host.';

  return (
    <>
      <Helmet>
        <title>{`${pageTitle} · MGH`}</title>
        <meta name="description" content={pageDescription} />
        <link
          rel="canonical"
          href={`${import.meta.env.VITE_APP_BASE_URL || 'https://amh.ma'}/experiences`}
        />
        <meta property="og:title" content={`${pageTitle} · MGH`} />
        <meta property="og:description" content={pageDescription} />
      </Helmet>

      <div className="bg-white">
        {/* ─── HERO ─── */}
        <section className="relative pt-32 md:pt-40 pb-20 md:pb-28 bg-gradient-to-br from-brand-beige/70 via-brand-beige/40 to-white overflow-hidden">
          <FloatingOrbs count={3} />

          <motion.div
            aria-hidden
            style={{ y: reduce ? 0 : heroY }}
            className="pointer-events-none absolute -top-16 -right-10 select-none font-display italic text-[clamp(10rem,22vw,18rem)] leading-none text-brand-action/[0.07] tracking-tight"
          >
            Voyages
          </motion.div>

          <div className="content-wrapper relative">
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-brand-action mb-6 inline-flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('experiencesEyebrow') || 'Curated journeys'}
            </motion.p>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 30 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="font-display text-brand-ink text-[clamp(2.4rem,6vw,5.2rem)] leading-[1.02] tracking-tight max-w-4xl font-medium"
            >
              <ShimmerText delay={0.4}>{pageTitle}</ShimmerText>
            </motion.h1>

            <motion.div
              initial={reduce ? false : { scaleX: 0 }}
              animate={reduce ? undefined : { scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 h-px w-24 bg-brand-action origin-left"
            />

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-7 font-montserrat text-base md:text-lg text-brand-ink/70 max-w-2xl leading-relaxed"
            >
              {pageDescription}
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-12 flex flex-wrap items-center gap-8 md:gap-12 pt-8 border-t border-brand-ink/10"
            >
              {[
                { value: items.length || 4, label: t('experiences') || 'Experiences' },
                { value: 3, label: t('destinations') || 'Destinations' },
                { value: 100, suffix: '%', label: t('curatedByHost') || 'Curated by host' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="font-display text-brand-ink text-3xl md:text-4xl font-medium leading-none">
                    <AnimatedNumber value={s.value} />
                    {s.suffix && <span className="text-brand-action">{s.suffix}</span>}
                  </div>
                  <p className="mt-1 font-montserrat text-brand-ink/55 text-[0.62rem] uppercase tracking-[0.24em]">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── FILTER BAR ─── */}
        {!loading && destinations.length > 2 && (
          <section className="sticky top-[64px] z-30 bg-white/85 backdrop-blur-xl border-y border-brand-ink/10">
            <div className="content-wrapper py-3 flex items-center gap-4 overflow-x-auto no-scrollbar">
              <span className="flex items-center gap-2 text-brand-ink/55 text-[0.62rem] font-montserrat font-semibold uppercase tracking-[0.28em] shrink-0">
                <Filter className="w-3.5 h-3.5" />
                {t('filterBy') || 'Filter'}
              </span>
              {destinations.map((d) => {
                const isActive = activeFilter === d;
                const label = d === 'all' ? t('all') || 'All' : d;
                return (
                  <button
                    key={d}
                    onClick={() => setActiveFilter(d)}
                    className={`shrink-0 px-4 py-1.5 rounded-full font-montserrat text-[0.62rem] font-semibold uppercase tracking-[0.24em] transition-all duration-300 ${
                      isActive
                        ? 'bg-brand-ink text-white'
                        : 'border border-brand-ink/15 text-brand-ink/70 hover:border-brand-action hover:text-brand-action'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── EXPERIENCES GRID ─── */}
        <section className="section-padding bg-white">
          <div className="content-wrapper-wide">
            {loading ? (
              <div className="flex items-center justify-center h-72">
                <Loader2 className="w-8 h-8 text-brand-action animate-spin" />
              </div>
            ) : visible.length === 0 ? (
              <p className="text-center text-brand-ink/55 py-20">
                {t('noResults') || 'No experiences found'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {visible.map((exp, i) => (
                  <motion.div
                    key={exp.slug}
                    initial={reduce ? false : { opacity: 0, y: 40 }}
                    whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, delay: (i % 6) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="group [perspective:1200px]"
                  >
                    <Link
                      to={exp.href}
                      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-action focus-visible:ring-offset-4"
                      aria-label={`${exp.title} — ${t('discoverMore') || 'Discover'}`}
                    >
                      <TiltCard
                        intensity={6}
                        className="relative overflow-hidden aspect-[4/5] bg-brand-beige shadow-[0_15px_45px_-20px_rgba(0,0,0,0.3)] transition-shadow duration-700 group-hover:shadow-[0_35px_90px_-25px_rgba(0,0,0,0.5)]"
                      >
                        <OptimizedImage
                          src={exp.img}
                          alt={exp.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/25 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-action/30 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-700 mix-blend-overlay" />
                        <Spotlight color="rgba(255,255,255,0.18)" radius={240} />

                        {/* Top meta */}
                        <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
                          <span className="font-display italic text-white/95 text-2xl tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div className="flex flex-col gap-1.5 items-end">
                            {exp.destination && (
                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white/95 text-[0.55rem] font-montserrat font-semibold uppercase tracking-[0.22em]">
                                <MapPin className="w-2.5 h-2.5" />
                                {exp.destination}
                              </span>
                            )}
                            {exp.duration && (
                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-action/85 text-white text-[0.55rem] font-montserrat font-semibold uppercase tracking-[0.22em]">
                                <Clock className="w-2.5 h-2.5" />
                                {exp.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom content */}
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <h3 className="font-display text-white text-[clamp(1.3rem,2vw,1.8rem)] leading-[1.1] tracking-tight font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                            {exp.title}
                          </h3>
                          {exp.desc && (
                            <p className="mt-2 text-white/80 text-[0.72rem] font-montserrat leading-relaxed line-clamp-2">
                              {exp.desc}
                            </p>
                          )}

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="h-px w-0 bg-gradient-to-r from-white to-transparent transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full flex-1 max-w-[60%]" />
                            <span
                              aria-hidden
                              className="shrink-0 grid place-items-center w-10 h-10 rounded-full border border-white/40 bg-white/10 backdrop-blur-md text-white transition-all duration-500 group-hover:bg-brand-action group-hover:border-brand-action group-hover:rotate-45 group-hover:shadow-[0_0_24px_rgba(191,103,62,0.55)]"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </TiltCard>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── CLOSING CTA — luxurious cream ─── */}
        <section className="section-padding-tight relative overflow-hidden bg-gradient-to-br from-brand-beige via-brand-beige/70 to-white">
          <FloatingOrbs count={3} />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 -left-10 select-none font-display italic text-[clamp(8rem,18vw,16rem)] leading-none text-brand-action/[0.08] tracking-tight"
          >
            Voyages
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-10 select-none font-display italic text-[clamp(8rem,18vw,16rem)] leading-none text-brand-ink/[0.05] tracking-tight"
          >
            Riads
          </div>
          <div aria-hidden className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-action/50 to-transparent" />
          <div aria-hidden className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-action/50 to-transparent" />

          <div className="content-wrapper relative text-center">
            <RevealOnView>
              <p className="font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-brand-action mb-6 inline-flex items-center gap-2 justify-center">
                <Compass className="w-3.5 h-3.5" />
                {t('planYourTrip') || 'Plan your trip'}
              </p>
              <h2 className="font-display text-brand-ink text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.05] tracking-tight max-w-3xl mx-auto font-medium">
                {t('stayWithCertifiedHosts') ||
                  'Stay with certified hosts. Live the experience.'}
              </h2>
              <div className="mx-auto mt-7 h-px w-20 bg-brand-action" />
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <MagneticButton
                  as={Link}
                  to="/all-riads"
                  strength={16}
                  className="group inline-flex items-center gap-3 bg-brand-ink text-white pl-10 pr-3 h-14 rounded-full font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.32em] hover:bg-brand-action transition-colors duration-500 shadow-[0_20px_60px_-15px_rgba(29,29,27,0.5)]"
                >
                  {t('browseAllRiads') || 'Browse all riads'}
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-brand-action group-hover:bg-white text-white group-hover:text-brand-action transition-colors duration-500">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  to="/destinations"
                  strength={14}
                  className="inline-flex items-center gap-3 border border-brand-ink/20 bg-white/60 backdrop-blur-md text-brand-ink px-10 h-14 rounded-full font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.32em] hover:border-brand-action hover:text-brand-action transition-colors duration-500"
                >
                  {t('exploreOurDestinations') || 'Explore destinations'}
                </MagneticButton>
              </div>
            </RevealOnView>
          </div>
        </section>
      </div>
    </>
  );
};

export default ExperiencesIndexPage;
