import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getExperienceBySlug } from '@/lib/mghApi';
import { usePartnerHotels } from '@/lib/partnerHotelsApi';
import { usePartnerCatalogs } from '@/lib/partnerCatalogsApi';
import { mapPartnerHotelToRiad } from '@/lib/partnerHotelTransform';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft, ArrowUpRight, CheckCircle, Info, MapPin, Sun, Users, DollarSign,
  Camera, ShieldCheck, Box, Utensils, Coffee, Moon, Mountain, Droplets, Bath,
  Ticket, Wind, Waves, Clock, Accessibility, CalendarRange,
} from 'lucide-react';
import RiadCard from '@/components/RiadCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslated, getTranslatedArray } from '@/lib/utils';
import OptimizedImage from '@/components/ui/OptimizedImage';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsapEase, duration as motionDur, stagger } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const iconMapping = {
  'Best Time to Visit': Sun, 'Dress Code': Users, 'Bargaining': DollarSign,
  'Authenticity': ShieldCheck, 'Shipping': Box, 'Photography': Camera,
  'Street Food': Utensils, 'Mint Tea': Coffee, 'Ramadan': Moon,
  'Mountain Weather': Mountain, 'Hydration': Droplets, 'Hammam Etiquette': Bath,
  'Event Tickets': Ticket, 'Social Scene': Users, 'Respectful Photography': Camera,
  'The Wind': Wind, 'Best Surf Season': Waves, 'Getting There': MapPin,
  default: Info,
};
const renderIcon = (title) => {
  const Cmp = iconMapping[title] || iconMapping.default;
  return <Cmp className="w-4 h-4 text-brand-action" strokeWidth={1.5} />;
};

const ExperiencePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, currentLanguage } = useLanguage();

  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const heroImgRef = useRef(null);
  const heroContentRef = useRef(null);
  const introRef = useRef(null);
  const factsRef = useRef(null);

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: partnerHotels = [] } = usePartnerHotels();
  const { data: partnerCatalogs } = usePartnerCatalogs();
  const recommendedRiads = useMemo(() => {
    const relatedIds = new Set((experience?.related_riads || []).map(String));
    if (relatedIds.size === 0) return [];

    return partnerHotels
      .map((hotel) => ({ hotel, riad: mapPartnerHotelToRiad(hotel, currentLanguage, partnerCatalogs) }))
      .filter(({ hotel, riad }) => [hotel.id, hotel.hotel_id, hotel.hotelId, riad.id]
        .filter(Boolean)
        .some((id) => relatedIds.has(String(id))))
      .map(({ riad }) => riad);
  }, [experience, partnerHotels, currentLanguage, partnerCatalogs]);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchExperience = async () => {
      setLoading(true);
      try {
        const data = await getExperienceBySlug(slug, { signal: abortController.signal });
        if (abortController.signal.aborted) return;
        if (!data) {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not find the requested experience.' });
          navigate('/404', { replace: true });
          return;
        }
        setExperience(data);
      } catch (error) {
        if (abortController.signal.aborted || error?.name === 'AbortError') return;
        console.error('Error fetching experience:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find the requested experience.' });
        navigate('/404', { replace: true });
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };

    if (currentLanguage) fetchExperience();
    return () => abortController.abort();
  }, [slug, navigate, toast, currentLanguage]);

  useEffect(() => {
    if (loading || !experience) return;
    const ctx = gsap.context(() => {
      gsap.from(pageRef.current, { opacity: 0, duration: motionDur.slow });
      if (heroImgRef.current && heroRef.current) {
        gsap.to(heroImgRef.current, {
          yPercent: 25, ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      }
      if (heroContentRef.current) {
        gsap.from(heroContentRef.current.children, {
          y: 32, opacity: 0, duration: motionDur.slow, stagger: stagger.tight,
          ease: gsapEase.editorial, delay: 0.15,
        });
      }
      if (introRef.current) {
        gsap.from(introRef.current.querySelectorAll('.exp-fade'), {
          y: 40, opacity: 0, duration: motionDur.slow, stagger: stagger.base,
          ease: gsapEase.editorial,
          scrollTrigger: { trigger: introRef.current, start: 'top 80%', once: true },
        });
      }
      if (factsRef.current) {
        gsap.from(factsRef.current.children, {
          y: 24, opacity: 0, duration: motionDur.base, stagger: stagger.tight,
          ease: gsapEase.editorial,
          scrollTrigger: { trigger: factsRef.current, start: 'top 85%', once: true },
        });
      }
    }, pageRef);
    return () => ctx.revert();
  }, [loading, experience]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige/40 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-beige border-t-brand-action animate-spin" />
          <span className="font-montserrat text-xs text-brand-ink/40 uppercase tracking-[0.3em]">
            {t('loading')}
          </span>
        </div>
      </div>
    );
  }
  if (!experience) return null;

  const title = getTranslated(experience.title_tr, currentLanguage);
  const subtitle = getTranslated(experience.subtitle_tr, currentLanguage);
  const destinationName = getTranslated(experience.destination_tr, currentLanguage);
  const shortIntro = getTranslated(experience.short_intro_tr, currentLanguage);
  const description_rich = getTranslated(experience.description_rich_tr, currentLanguage);
  const what_to_do = getTranslatedArray(experience.what_to_do_tr, currentLanguage);
  const good_to_know = getTranslatedArray(experience.good_to_know_tr, currentLanguage);
  const bookingCtaLabel = getTranslated(experience.booking_cta_label_tr, currentLanguage);
  const accessibilityNotes = experience.accessibility_notes;
  const seo_title = getTranslated(experience.seo_title_tr, currentLanguage);
  const seo_description = getTranslated(experience.seo_description_tr, currentLanguage);

  const {
    hero_image_url, gallery_urls, map_embed_url,
    recommended_season, duration_hint, approx_budget_hint,
  } = experience;

  const facts = [
    duration_hint && { icon: Clock, label: t('duration') || 'Durée', value: duration_hint },
    recommended_season && { icon: CalendarRange, label: t('bestSeason') || 'Saison idéale', value: recommended_season },
    approx_budget_hint && { icon: DollarSign, label: t('budget') || 'Budget', value: approx_budget_hint },
    destinationName && { icon: MapPin, label: t('destination') || 'Destination', value: destinationName },
  ].filter(Boolean);

  return (
    <>
      <Helmet>
        <title>{seo_title || `${title} · MGH`}</title>
        <meta name="description" content={seo_description || subtitle} />
        <meta property="og:title" content={seo_title || `${title} · MGH`} />
        <meta property="og:description" content={seo_description || subtitle} />
        {hero_image_url && <meta property="og:image" content={hero_image_url} />}
      </Helmet>

      <div ref={pageRef} className="bg-white">
        {/* ─── HERO ─── */}
        <section
          ref={heroRef}
          className="relative h-[88vh] min-h-[620px] flex items-end overflow-hidden"
        >
          <div ref={heroImgRef} className="absolute inset-0 z-0 scale-105">
            {hero_image_url && (
              <OptimizedImage src={hero_image_url} alt={title} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-brand-ink/30 to-brand-ink/10 z-10" />
          <div ref={heroContentRef} className="relative z-20 content-wrapper pb-20 md:pb-28 text-white">
            {destinationName && (
              <p className="font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-white/70 mb-5">
                {destinationName}
              </p>
            )}
            <h1 className="font-display text-white text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.02] tracking-tight max-w-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-6 font-display italic text-white/85 text-[clamp(1.1rem,1.6vw,1.6rem)] max-w-2xl leading-snug">
                {subtitle}
              </p>
            )}
            <div className="mt-8 h-px w-16 bg-brand-action/70" />
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/40">
            <span className="font-montserrat text-[0.55rem] uppercase tracking-[0.35em]">{t('scroll') || 'Scroll'}</span>
            <span className="block w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </section>

        {/* ─── STICKY BACK BAR ─── */}
        <div className="sticky top-[64px] bg-white/95 backdrop-blur z-30 border-b border-brand-ink/5">
          <div className="content-wrapper py-4 flex items-center justify-between">
            <Link
              to="/#experiences"
              className="group inline-flex items-center gap-2 font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-brand-ink/70 hover:text-brand-ink transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              {t('backToExperiences')}
            </Link>
            <Link
              to="/all-riads"
              className="hidden md:inline-flex items-center gap-2 font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-brand-ink hover:text-brand-action transition-colors"
            >
              {t('seeMemberRiads')}
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ─── INTRO (editorial split) ─── */}
        <section ref={introRef} className="relative py-24 md:py-32 bg-white overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-8 -right-6 md:right-10 select-none font-display italic text-[clamp(7rem,18vw,16rem)] leading-none text-brand-action/[0.05] tracking-tight"
          >
            {destinationName || title}
          </div>
          <div className="content-wrapper relative">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-10 items-start">
              <div className="md:col-span-4 md:sticky md:top-32 exp-fade">
                <span className="block font-montserrat uppercase tracking-[0.4em] text-[0.6rem] text-brand-action font-semibold mb-5">
                  {t('overview') || 'Aperçu'}
                </span>
                {shortIntro ? (
                  <p className="font-display italic text-brand-ink/85 text-[clamp(1.3rem,1.9vw,1.9rem)] leading-[1.2] tracking-tight">
                    {shortIntro}
                  </p>
                ) : (
                  <h2 className="font-display italic text-brand-ink/90 text-[clamp(1.3rem,1.9vw,1.9rem)] leading-[1.2] tracking-tight">
                    {subtitle}
                  </h2>
                )}
                <div className="mt-6 h-px w-16 bg-brand-action/50" />
              </div>

              <div className="md:col-span-8 exp-fade">
                {description_rich && (
                  <div
                    className="font-montserrat text-[clamp(1rem,1.25vw,1.1rem)] text-brand-ink/75 leading-[1.95] tracking-[0.005em] space-y-4 [&_h2]:font-display [&_h2]:text-brand-ink [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:tracking-tight"
                    dangerouslySetInnerHTML={{
                      __html: description_rich
                        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                        .replace(/\n\n/g, '</p><p>')
                        .replace(/^/, '<p>')
                        .replace(/$/, '</p>'),
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── FACTS STRIP ─── */}
        {facts.length > 0 && (
          <section className="py-12 md:py-16 bg-brand-beige/40 border-y border-brand-ink/5">
            <div className="content-wrapper">
              <div
                ref={factsRef}
                className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10"
              >
                {facts.map(({ icon: Icon, label, value }, i) => (
                  <div key={i} className="flex flex-col items-start">
                    <Icon className="w-5 h-5 text-brand-action mb-4" strokeWidth={1.4} />
                    <span className="font-montserrat text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-brand-ink/50 mb-2">
                      {label}
                    </span>
                    <span className="font-display text-brand-ink text-lg md:text-xl leading-tight tracking-tight">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── WHAT TO DO + GOOD TO KNOW ─── */}
        <section className="section-padding bg-white">
          <div className="content-wrapper grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-16">
            {what_to_do?.length > 0 && (
              <div className="lg:col-span-7">
                <span className="block font-montserrat uppercase tracking-[0.4em] text-[0.6rem] text-brand-action font-semibold mb-4">
                  {t('whatToDo') || 'À faire'}
                </span>
                <h2 className="font-display text-brand-ink text-[clamp(2rem,3.2vw,3rem)] leading-[1.05] tracking-tight mb-10">
                  {t('experienceHighlights') || 'Au programme'}
                </h2>
                <ul className="space-y-8">
                  {what_to_do.map((item, index) => (
                    <li key={index} className="grid grid-cols-[auto_1fr] gap-5 pb-8 border-b border-brand-ink/10 last:border-0 last:pb-0">
                      <span className="font-display italic text-brand-action/60 text-2xl leading-none pt-1">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="font-display text-brand-ink text-xl md:text-2xl leading-tight tracking-tight mb-2">
                          {item.title}
                        </h3>
                        {item.blurb && (
                          <p className="font-montserrat text-[0.92rem] text-brand-ink/70 leading-[1.85]">
                            {item.blurb}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(good_to_know?.length > 0 || accessibilityNotes) && (
              <aside className="lg:col-span-5">
                <div className="lg:sticky lg:top-32 border-l border-brand-action/40 pl-8">
                  <span className="block font-montserrat uppercase tracking-[0.4em] text-[0.6rem] text-brand-action font-semibold mb-4">
                    {t('goodToKnow') || 'Bon à savoir'}
                  </span>
                  <h3 className="font-display text-brand-ink text-2xl md:text-3xl leading-tight tracking-tight mb-8">
                    {t('practicalTips') || 'Conseils pratiques'}
                  </h3>
                  <ul className="space-y-6">
                    {good_to_know?.map((item, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <span className="mt-1 shrink-0">{renderIcon(item.title)}</span>
                        <div>
                          <h4 className="font-display text-brand-ink text-base mb-1.5 tracking-tight">{item.title}</h4>
                          <p className="font-montserrat text-[0.85rem] text-brand-ink/65 leading-[1.7]">{item.tip}</p>
                        </div>
                      </li>
                    ))}
                    {accessibilityNotes && (
                      <li className="flex items-start gap-4 pt-6 border-t border-brand-ink/10">
                        <span className="mt-1 shrink-0">
                          <Accessibility className="w-4 h-4 text-brand-action" strokeWidth={1.5} />
                        </span>
                        <div>
                          <h4 className="font-display text-brand-ink text-base mb-1.5 tracking-tight">
                            {t('accessibility') || 'Accessibilité'}
                          </h4>
                          <p className="font-montserrat text-[0.85rem] text-brand-ink/65 leading-[1.7]">
                            {accessibilityNotes}
                          </p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </aside>
            )}
          </div>
        </section>

        {/* ─── GALLERY ─── */}
        {gallery_urls?.length > 0 && (
          <section className="section-padding bg-brand-beige/30">
            <div className="content-wrapper-wide">
              <div className="mb-12 md:mb-16">
                <span className="block font-montserrat uppercase tracking-[0.4em] text-[0.6rem] text-brand-action font-semibold mb-4">
                  {t('photoGallery') || 'Galerie'}
                </span>
                <h2 className="font-display text-brand-ink text-[clamp(2rem,3.2vw,3rem)] leading-[1.05] tracking-tight">
                  {title}
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {gallery_urls.map((url, index) => (
                  <div
                    key={index}
                    className={`group relative overflow-hidden bg-brand-beige ${
                      index % 5 === 0 ? 'md:col-span-2 md:row-span-2 aspect-[4/3]' : 'aspect-square'
                    }`}
                  >
                    <OptimizedImage
                      src={url}
                      alt={`${title} — ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-[1400ms] ease-editorial group-hover:scale-[1.06]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── MAP ─── */}
        {map_embed_url && (
          <section className="section-padding-tight bg-white">
            <div className="content-wrapper">
              <div className="mb-10">
                <span className="block font-montserrat uppercase tracking-[0.4em] text-[0.6rem] text-brand-action font-semibold mb-4">
                  {t('location') || 'Emplacement'}
                </span>
                <h2 className="font-display text-brand-ink text-[clamp(1.8rem,2.6vw,2.4rem)] leading-tight tracking-tight">
                  {destinationName || title}
                </h2>
              </div>
              <div className="relative w-full aspect-[16/9] bg-brand-beige overflow-hidden">
                <iframe
                  src={map_embed_url}
                  title={`${title} map`}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>
          </section>
        )}

        {/* ─── RECOMMENDED RIADS ─── */}
        {recommendedRiads.length > 0 && (
          <section className="section-padding bg-brand-beige/40">
            <div className="content-wrapper">
              <div className="mb-12 md:mb-16 text-center">
                <span className="block font-montserrat uppercase tracking-[0.4em] text-[0.6rem] text-brand-action font-semibold mb-4">
                  {t('staySomewhereSpecial') || 'Où séjourner'}
                </span>
                <h2 className="font-display text-brand-ink text-[clamp(2rem,3.2vw,3rem)] leading-[1.05] tracking-tight">
                  {t('recommendedRiads')}
                </h2>
                <div className="mt-6 h-px w-16 bg-brand-action/50 mx-auto" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendedRiads.map((riad) => (
                  <RiadCard key={riad.id} riad={riad} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── CLOSING CTA ─── */}
        <section className="section-padding-tight bg-brand-ink text-white relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-10 select-none font-display italic text-[clamp(10rem,22vw,18rem)] leading-none text-white/[0.04] tracking-tight"
          >
            {destinationName || 'Maroc'}
          </div>
          <div className="content-wrapper relative text-center">
            <p className="font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-brand-action mb-5">
              {t('liveTheExperience') || 'Vivez l\u2019expérience'}
            </p>
            <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.05] tracking-tight max-w-3xl mx-auto">
              {title}
            </h2>
            <Link
              to="/all-riads"
              className="mt-10 inline-flex items-center gap-3 bg-white text-brand-ink px-10 py-4 font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.32em] hover:bg-brand-action hover:text-white transition-colors duration-500 ease-editorial"
            >
              {bookingCtaLabel || t('seeMemberRiads')}
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default ExperiencePage;
