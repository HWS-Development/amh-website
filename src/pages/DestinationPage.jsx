import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { getDestinationBySlug } from "@/lib/mghApi";
import { Loader2 } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import NotFoundPage from "@/pages/NotFoundPage";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslated, getTranslatedArray } from "@/lib/utils";
import DestinationHeader from "@/components/destination/DestinationHeader";
import DestinationNav from "@/components/destination/DestinationNav";
import DestinationGettingHere from "@/components/destination/DestinationGettingHere";
import DestinationWhatToDo from "@/components/destination/DestinationWhatToDo";
import DestinationGoodToKnow from "@/components/destination/DestinationGoodToKnow";
import DestinationWhenToVisit from "@/components/destination/DestinationWhenToVisit";
import DestinationFAQ from "@/components/destination/DestinationFAQ";
import DestinationGallery from "@/components/destination/DestinationGallery";
import DestinationMap from "@/components/destination/DestinationMap";
import RelatedExperiencesSlider from "@/components/destination/RelatedExperiencesSlider";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DestinationPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { t, currentLanguage } = useLanguage();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const pageRef = useRef(null);
  const introRef = useRef(null);
  const sectionsRef = useRef({});
  const stickyNavRef = useRef(null);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchDestination = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await getDestinationBySlug(slug, { signal: abortController.signal });
        if (abortController.signal.aborted) return;
        if (!data) {
          setError(true);
        } else {
          setDestination(data);
        }
      } catch (err) {
        if (err?.name === 'AbortError') return;
        console.error("Error fetching destination:", err);
        setError(true);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };
    if (currentLanguage) {
      fetchDestination();
    }
    return () => abortController.abort();
  }, [slug, currentLanguage]);

  useEffect(() => {
    if (loading || !destination || !pageRef.current) return;
    gsap.from(pageRef.current, { opacity: 0, duration: 0.8 });
    // Force ScrollTrigger to recalculate after async content (all sections) is rendered.
    // Without this, sections rendered after initial mount can stay invisible
    // because ScrollTrigger's positions were computed before layout shifted.
    const refreshTimers = [
      setTimeout(() => ScrollTrigger.refresh(), 100),
      setTimeout(() => ScrollTrigger.refresh(), 500),
      setTimeout(() => ScrollTrigger.refresh(), 1500),
    ];
    return () => refreshTimers.forEach(clearTimeout);
  }, [loading, destination]);

  useEffect(() => {
    if (loading || !destination || !introRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(introRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: introRef.current,
          start: "top 80%",
          once: true,
        },
      });
    }, introRef);
    return () => ctx.revert();
  }, [loading, destination]);

  const scrollToSection = (id) => {
    const element = sectionsRef.current[id];
    if (element) {
      const stickyNavHeight = stickyNavRef.current?.offsetHeight || 0;
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerHeight - stickyNavHeight;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (location.hash && destination) {
      const id = location.hash.substring(1);
      setTimeout(() => scrollToSection(id), 300);
    }
  }, [location.hash, destination]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-beige border-t-brand-action animate-spin" />
          <span className="font-montserrat text-xs text-brand-ink/40 uppercase tracking-[0.3em]">
            {t("loading")}
          </span>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return <NotFoundPage />;
  }

  const name = getTranslated(destination.name, currentLanguage);
  const subtitle = getTranslated(destination.subtitle, currentLanguage);
  const intro_rich = getTranslated(destination.intro_rich, currentLanguage);

  const getting_here = getTranslatedArray(
    destination.getting_here,
    currentLanguage
  );
  const what_to_do = getTranslatedArray(
    destination.what_to_do,
    currentLanguage
  );
  const good_to_know = getTranslatedArray(
    destination.good_to_know,
    currentLanguage
  );
  const when_to_visit = getTranslated(
    destination.when_to_visit,
    currentLanguage
  );
  const faq = getTranslatedArray(destination.faq, currentLanguage);

  const cta_label = getTranslated(destination.cta_label, currentLanguage);
  const seo_title = getTranslated(destination.seo_title, currentLanguage);
  const seo_description = getTranslated(
    destination.seo_description,
    currentLanguage
  );
  const seo_keywords = destination.seo_keywords?.[currentLanguage]
    ? destination.seo_keywords[currentLanguage].join(', ')
    : '';

  const {
    hero_image_urls,
    gallery_urls,
    map_embed_url,
    related_experiences,
    related_collections,
    cta_url,
    best_months,
  } = destination;

  const bestMonthsList = Array.isArray(best_months)
    ? best_months
    : (typeof best_months === 'object' && best_months !== null
        ? getTranslatedArray(best_months, currentLanguage)
        : []);

  const breadcrumbItems = [
    { label: t("home") || "Home", href: "/" },
    { label: t("destinations"), href: "/destinations" },
    { label: name },
  ];

  return (
    <>
      <Helmet>
        <title>{seo_title || `${name} · MGH`}</title>
        <meta
          name="description"
          content={
            seo_description ||
            `Explore ${name}, one of Morocco's premier destinations.`
          }
        />
        <link
          rel="canonical"
          href={`${
            import.meta.env.VITE_APP_BASE_URL || "https://amh.ma"
          }/destinations/${slug}`}
        />
        <meta
          property="og:title"
          content={seo_title || `${name} · MGH`}
        />
        <meta
          property="og:description"
          content={
            seo_description ||
            `Explore ${name}, one of Morocco's premier destinations.`
          }
        />
        {hero_image_urls?.[0] && (
          <meta property="og:image" content={hero_image_urls[0]} />
        )}
        {seo_keywords && <meta name="keywords" content={seo_keywords} />}
      </Helmet>

      <div ref={pageRef} className="bg-white">
        <DestinationHeader
          name={name}
          subtitle={subtitle}
          heroImage={hero_image_urls?.[0]}
        />

        <div className="py-6 px-[6%] md:px-[5%] max-w-[1280px] mx-auto">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <DestinationNav
          destination={destination}
          stickyNavRef={stickyNavRef}
          scrollToSection={scrollToSection}
        />

        {intro_rich && (
          <section
            className="relative py-24 md:py-32 bg-white overflow-hidden"
            ref={introRef}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 -right-6 md:right-10 select-none font-display italic text-[clamp(7rem,18vw,16rem)] leading-none text-brand-action/[0.05] tracking-tight"
            >
              {name}
            </div>
            <div className="content-wrapper relative">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-8 items-start">
                <div className="md:col-span-4 md:sticky md:top-32">
                  <span className="block font-montserrat uppercase tracking-[0.4em] text-[0.6rem] text-brand-action font-semibold mb-5">
                    {t("introduction") || "Introduction"}
                  </span>
                  <h2 className="font-display italic text-brand-ink/90 text-[clamp(1.6rem,2.2vw,2.2rem)] leading-[1.15] tracking-tight">
                    {subtitle || name}
                  </h2>
                  <div className="mt-6 h-px w-16 bg-brand-action/50" />
                  {bestMonthsList.length > 0 && (
                    <div className="mt-8">
                      <span className="block font-montserrat uppercase tracking-[0.3em] text-[0.55rem] text-brand-ink/40 font-semibold mb-3">
                        {t("bestMonths") || "Meilleure période"}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {bestMonthsList.map((m, i) => (
                          <span
                            key={i}
                            className="font-montserrat text-[0.65rem] uppercase tracking-[0.2em] text-brand-ink/70 border border-brand-ink/15 px-3 py-1.5"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="md:col-span-8">
                  <p className="font-montserrat text-[clamp(1rem,1.3vw,1.15rem)] text-brand-ink/75 leading-[1.95] tracking-[0.005em]">
                    {intro_rich}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <DestinationGettingHere
          gettingHere={getting_here}
          sectionRef={(el) => (sectionsRef.current["getting-here"] = el)}
        />
        <DestinationWhatToDo
          slug={slug}
          whatToDo={what_to_do}
          sectionRef={(el) => (sectionsRef.current["what-to-do"] = el)}
        />
        <DestinationGoodToKnow
          goodToKnow={good_to_know}
          sectionRef={(el) => (sectionsRef.current["good-to-know"] = el)}
        />
        <DestinationWhenToVisit
          whenToVisit={when_to_visit}
          ctaLabel={cta_label}
          ctaUrl={cta_url}
          sectionRef={(el) => (sectionsRef.current["when-to-visit"] = el)}
        />
        <DestinationFAQ
          faq={faq}
          sectionRef={(el) => (sectionsRef.current["faq"] = el)}
        />
        <DestinationGallery
          slug={slug}
          gallery={gallery_urls}
          destinationName={name}
          sectionRef={(el) => (sectionsRef.current["gallery"] = el)}
        />
        <DestinationMap
          mapUrl={map_embed_url}
          destinationName={name}
          sectionRef={(el) => (sectionsRef.current["map"] = el)}
        />
        <RelatedExperiencesSlider experienceSlugs={related_experiences} />
      </div>
    </>
  );
};

export default DestinationPage;
