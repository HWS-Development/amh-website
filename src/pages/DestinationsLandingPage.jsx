import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { listDestinations } from '@/lib/mghApi';
import { Loader2, ArrowUpRight, MapPin, Sparkles, Compass } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslated } from '@/lib/utils';
import { usePartnerHotels } from '@/lib/partnerHotelsApi';
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

const DestinationsLandingPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, currentLanguage } = useLanguage();
  const { data: partnerHotels = [] } = usePartnerHotels();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.4]);

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        const data = await listDestinations();
        setDestinations((data || []).map((dest) => ({
          ...dest,
          name: getTranslated(dest.name_tr ?? dest.name, currentLanguage),
          subtitle: getTranslated(dest.subtitle_tr ?? dest.subtitle, currentLanguage),
          intro: getTranslated(dest.intro_rich ?? dest.intro_rich_tr, currentLanguage),
        })));
      } catch (error) {
        console.error('Error fetching destinations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, [currentLanguage]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-brand-beige/40">
        <Loader2 className="w-10 h-10 text-brand-action animate-spin" />
      </div>
    );
  }

  const pageTitle = t('exploreOurDestinations');
  const pageDescription = t('discoverTheSoulOfMorocco');

  return (
    <>
      <Helmet>
        <title>{`${pageTitle} · MGH`}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`${import.meta.env.VITE_APP_BASE_URL || 'https://amh.ma'}/destinations`} />
        <meta property="og:title" content={`${pageTitle} · MGH`} />
        <meta property="og:description" content={pageDescription} />
      </Helmet>

      <div className="bg-white">
        {/* ─── HERO ─── */}
        <section className="relative pt-32 md:pt-40 pb-24 md:pb-32 bg-gradient-to-br from-brand-beige/70 via-brand-beige/40 to-white overflow-hidden">
          <FloatingOrbs count={3} />

          <motion.div
            aria-hidden
            style={{ y: reduce ? 0 : heroY, opacity: reduce ? 1 : heroOpacity }}
            className="pointer-events-none absolute -top-16 -right-10 select-none font-display italic text-[clamp(10rem,22vw,18rem)] leading-none text-brand-action/[0.07] tracking-tight"
          >
            Maroc
          </motion.div>

          <div className="content-wrapper relative">
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-brand-action mb-6 inline-flex items-center gap-2"
            >
              <Compass className="w-3.5 h-3.5" />
              {t('destinationsEyebrow') || 'Trois villes, une âme'}
            </motion.p>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 30 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-brand-ink text-[clamp(2.6rem,6.5vw,5.5rem)] leading-[1.02] tracking-tight max-w-4xl font-medium"
            >
              <ShimmerText delay={0.4}>{pageTitle}</ShimmerText>
            </motion.h1>

            <motion.div
              initial={reduce ? false : { scaleX: 0 }}
              animate={reduce ? undefined : { scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 h-px w-24 bg-brand-action origin-left"
            />

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 font-montserrat text-base md:text-lg text-brand-ink/70 max-w-2xl leading-relaxed"
            >
              {pageDescription}
            </motion.p>

            {/* Stats strip */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-12 flex flex-wrap items-center gap-8 md:gap-12 pt-8 border-t border-brand-ink/10"
            >
              {[
                { value: destinations.length || 3, label: t('destinations') || 'Destinations' },
                { value: partnerHotels.length, label: t('classifiedRiads') || 'Classified riads' },
                { value: 100, suffix: '%', label: t('directBooking') || 'Direct booking' },
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

        {/* ─── EDITORIAL GRID ─── */}
        <section className="section-padding bg-white relative">
          <div className="content-wrapper-wide">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-20 md:gap-y-28">
              {destinations.map((dest, index) => {
                const isAlt = index % 2 === 1;
                return (
                  <motion.article
                    key={dest.slug}
                    initial={reduce ? false : { opacity: 0, y: 60 }}
                    whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                    className={`md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6 items-center ${
                      isAlt ? 'md:[direction:rtl]' : ''
                    }`}
                  >
                    <Link
                      to={`/destinations/${dest.slug}`}
                      className="group relative block md:col-span-7 [direction:ltr] [perspective:1400px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-action focus-visible:ring-offset-4"
                      aria-label={`${dest.name} — ${t('exploreDestination') || 'Explore destination'}`}
                    >
                      <TiltCard
                        intensity={5}
                        className="relative overflow-hidden aspect-[4/3] md:aspect-[5/4] bg-brand-beige shadow-[0_20px_50px_-25px_rgba(0,0,0,0.4)] transition-shadow duration-700 group-hover:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.55)]"
                      >
                        {dest.hero_image_urls?.[0] && (
                          <OptimizedImage
                            src={dest.hero_image_urls[0]}
                            alt={`${dest.name}`}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/50 via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-action/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay" />
                        <Spotlight color="rgba(255,255,255,0.2)" radius={320} />

                        <span className="absolute top-6 left-6 font-display italic text-white/95 text-[clamp(2rem,3vw,3rem)] tracking-tight leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <span className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white/95 text-[0.6rem] font-montserrat font-semibold uppercase tracking-[0.22em]">
                          <MapPin className="w-3 h-3" />
                          {t('morocco') || 'Morocco'}
                        </span>

                        {/* Reveal panel on hover */}
                        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] bg-gradient-to-t from-brand-ink/95 to-brand-ink/0 pt-12 pb-6 px-7">
                          <p className="font-montserrat text-white text-[0.7rem] uppercase tracking-[0.32em] font-semibold flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-brand-action" />
                            {t('exploreDestination') || 'Explore destination'}
                          </p>
                        </div>
                      </TiltCard>
                    </Link>

                    <div className="md:col-span-5 [direction:ltr] md:px-2 lg:px-6">
                      <p className="font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.36em] text-brand-action/90 mb-4 inline-flex items-center gap-2">
                        <span className="w-6 h-px bg-brand-action/60" />
                        {t('destination') || 'Destination'} · {String(index + 1).padStart(2, '0')}
                      </p>
                      <h2 className="font-display text-brand-ink text-[clamp(2rem,3.8vw,3.6rem)] leading-[1.05] tracking-tight font-medium">
                        {dest.name}
                      </h2>
                      {dest.subtitle && (
                        <p className="mt-3 font-display italic text-brand-action/90 text-lg md:text-xl">
                          {dest.subtitle}
                        </p>
                      )}
                      <div className="mt-6 h-px w-16 bg-brand-ink/15" />
                      {dest.intro && (
                        <p className="mt-6 font-montserrat text-[0.92rem] text-brand-ink/70 leading-[1.85] line-clamp-5">
                          {dest.intro}
                        </p>
                      )}

                      <div className="mt-9 flex flex-wrap items-center gap-5">
                        <MagneticButton
                          as={Link}
                          to={`/destinations/${dest.slug}`}
                          strength={14}
                          className="group/cta inline-flex items-center gap-3 bg-brand-ink text-white px-7 py-3.5 rounded-full font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.28em] hover:bg-brand-action transition-colors duration-500 shadow-[0_15px_40px_-15px_rgba(29,29,27,0.5)]"
                        >
                          {t('exploreDestination') || 'Explore'}
                          <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1" />
                        </MagneticButton>
                        <Link
                          to={`/all-riads?city=${dest.slug}`}
                          className="group/link font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-brand-ink/55 hover:text-brand-action transition-colors duration-500"
                        >
                          <span className="relative pb-1">
                            {t('viewRiads') || 'View riads'}
                            <span className="absolute left-0 -bottom-0 h-px w-full bg-brand-action origin-left scale-x-0 group-hover/link:scale-x-100 transition-transform duration-500" />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── CLOSING CTA — luxurious cream ─── */}
        <section className="section-padding-tight relative overflow-hidden bg-gradient-to-br from-brand-beige via-brand-beige/70 to-white">
          <FloatingOrbs count={3} />
          {/* Decorative serif backdrop */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 -left-10 select-none font-display italic text-[clamp(8rem,18vw,16rem)] leading-none text-brand-action/[0.08] tracking-tight"
          >
            Maroc
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-10 select-none font-display italic text-[clamp(8rem,18vw,16rem)] leading-none text-brand-ink/[0.05] tracking-tight"
          >
            Riads
          </div>
          {/* Gold hairline frame */}
          <div aria-hidden className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-action/50 to-transparent" />
          <div aria-hidden className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-action/50 to-transparent" />

          <div className="content-wrapper relative text-center">
            <RevealOnView>
              <p className="font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-brand-action mb-6 inline-flex items-center gap-2 justify-center">
                <Sparkles className="w-3.5 h-3.5" />
                {t('readyToTravel') || 'Prêt à partir ?'}
              </p>
              <h2 className="font-display text-brand-ink text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.05] tracking-tight max-w-3xl mx-auto font-medium">
                {t('findYourRiadAcrossMorocco') || 'Trouvez votre riad dans tout le Maroc.'}
              </h2>
              <div className="mx-auto mt-7 h-px w-20 bg-brand-action" />
              <div className="mt-10">
                <MagneticButton
                  as={Link}
                  to="/all-riads"
                  strength={16}
                  className="group inline-flex items-center gap-3 bg-brand-ink text-white pl-10 pr-3 h-14 rounded-full font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.32em] hover:bg-brand-action transition-colors duration-500 shadow-[0_20px_60px_-15px_rgba(29,29,27,0.5)]"
                >
                  {t('searchAllProperties') || 'Voir tous les riads'}
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-brand-action group-hover:bg-white text-white group-hover:text-brand-action transition-colors duration-500">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </MagneticButton>
              </div>
            </RevealOnView>
          </div>
        </section>
      </div>
    </>
  );
};

export default DestinationsLandingPage;
