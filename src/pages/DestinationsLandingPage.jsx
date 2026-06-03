import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { listDestinations } from '@/lib/mghApi';
import { Loader2, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslated } from '@/lib/utils';
import OptimizedImage from '@/components/ui/OptimizedImage';
import SectionHeader from '@/components/ui/SectionHeader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsapEase, duration, stagger } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const DestinationsLandingPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, currentLanguage } = useLanguage();
  const heroRef = useRef(null);
  const gridRef = useRef(null);

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

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from('.dl-hero > *', {
        y: 32, opacity: 0, duration: duration.slow, stagger: stagger.tight,
        ease: gsapEase.editorial,
      });
      if (gridRef.current) {
        gsap.from(gridRef.current.querySelectorAll('.dl-card'), {
          y: 60, opacity: 0, duration: duration.slow, stagger: stagger.base,
          ease: gsapEase.editorial,
          scrollTrigger: { trigger: gridRef.current, start: 'top 80%', once: true },
        });
      }
    });
    return () => ctx.revert();
  }, [loading, destinations]);

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
        <section
          ref={heroRef}
          className="relative pt-36 md:pt-44 pb-20 md:pb-28 bg-brand-beige/50 overflow-hidden"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-10 select-none font-display italic text-[clamp(10rem,22vw,18rem)] leading-none text-brand-action/[0.05] tracking-tight"
          >
            Maroc
          </div>

          <div className="content-wrapper relative dl-hero">
            <p className="font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-brand-action mb-5">
              {t('destinationsEyebrow') || 'Trois villes, une âme'}
            </p>
            <h1 className="font-display text-brand-ink text-[clamp(2.6rem,6vw,5rem)] leading-[1.02] tracking-tight max-w-4xl">
              {pageTitle}
            </h1>
            <div className="mt-7 h-px w-20 bg-brand-action/60" />
            <p className="mt-7 font-montserrat text-base md:text-lg text-brand-ink/70 max-w-2xl leading-relaxed">
              {pageDescription}
            </p>
          </div>
        </section>

        {/* ─── EDITORIAL GRID ─── */}
        <section className="section-padding bg-white">
          <div className="content-wrapper-wide" ref={gridRef}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-16 md:gap-y-24">
              {destinations.map((dest, index) => {
                const isAlt = index % 2 === 1;
                return (
                  <article
                    key={dest.slug}
                    className={`dl-card md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-6 items-center ${
                      isAlt ? 'md:[direction:rtl]' : ''
                    }`}
                  >
                    <Link
                      to={`/destinations/${dest.slug}`}
                      className="group relative block md:col-span-7 [direction:ltr]"
                    >
                      <div className="relative overflow-hidden aspect-[4/3] md:aspect-[5/4] bg-brand-beige">
                        {dest.hero_image_urls?.[0] && (
                          <OptimizedImage
                            src={dest.hero_image_urls[0]}
                            alt={`${dest.name}`}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1600ms] ease-editorial group-hover:scale-[1.06]"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/40 via-transparent to-transparent" />
                        <span className="absolute top-6 left-6 font-display italic text-white/90 text-[clamp(2rem,3vw,3rem)] tracking-tight leading-none">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </Link>

                    <div className="md:col-span-5 [direction:ltr] md:px-2 lg:px-6">
                      <p className="font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.36em] text-brand-action/80 mb-4">
                        {t('destination') || 'Destination'} · {String(index + 1).padStart(2, '0')}
                      </p>
                      <h2 className="font-display text-brand-ink text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.05] tracking-tight">
                        {dest.name}
                      </h2>
                      {dest.subtitle && (
                        <p className="mt-3 font-display italic text-brand-action/90 text-lg md:text-xl">
                          {dest.subtitle}
                        </p>
                      )}
                      <div className="mt-5 h-px w-12 bg-brand-ink/15" />
                      {dest.intro && (
                        <p className="mt-5 font-montserrat text-[0.92rem] text-brand-ink/70 leading-[1.85] line-clamp-5">
                          {dest.intro}
                        </p>
                      )}

                      <Link
                        to={`/destinations/${dest.slug}`}
                        className="group/cta mt-8 inline-flex items-center gap-3 font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-brand-ink hover:text-brand-action transition-colors duration-500"
                      >
                        <span className="h-px w-6 bg-brand-ink/30 group-hover/cta:w-12 group-hover/cta:bg-brand-action transition-all duration-500 ease-editorial" />
                        {t('exploreDestination') || 'Découvrir la destination'}
                        <ArrowUpRight className="w-4 h-4 transition-transform duration-500 ease-editorial group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── CLOSING CTA ─── */}
        <section className="section-padding-tight bg-brand-ink text-white relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 select-none font-display italic text-[clamp(10rem,22vw,18rem)] leading-none text-white/[0.04] tracking-tight"
          >
            Riads
          </div>
          <div className="content-wrapper relative text-center">
            <p className="font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-brand-action mb-5">
              {t('readyToTravel') || 'Prêt à partir ?'}
            </p>
            <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.05] tracking-tight max-w-3xl mx-auto">
              {t('findYourRiadAcrossMorocco') || 'Trouvez votre riad dans tout le Maroc.'}
            </h2>
            <Link
              to="/all-riads"
              className="mt-10 inline-flex items-center gap-3 bg-white text-brand-ink px-10 py-4 font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.32em] hover:bg-brand-action hover:text-white transition-colors duration-500 ease-editorial"
            >
              {t('searchAllProperties') || 'Voir tous les riads'}
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default DestinationsLandingPage;
