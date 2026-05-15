import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import NotFoundPage from '@/pages/NotFoundPage';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslated, getTranslatedArray } from '@/lib/utils';
import DestinationHeader from '@/components/destination/DestinationHeader';
import DestinationNav from '@/components/destination/DestinationNav';
import DestinationGettingHere from '@/components/destination/DestinationGettingHere';
import DestinationWhatToDo from '@/components/destination/DestinationWhatToDo';
import DestinationGoodToKnow from '@/components/destination/DestinationGoodToKnow';
import DestinationWhenToVisit from '@/components/destination/DestinationWhenToVisit';
import DestinationFAQ from '@/components/destination/DestinationFAQ';
import DestinationGallery from '@/components/destination/DestinationGallery';
import DestinationMap from '@/components/destination/DestinationMap';
import RelatedExperiencesSlider from '@/components/destination/RelatedExperiencesSlider';
import gsap from 'gsap';

const DestinationPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { t, currentLanguage } = useLanguage();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const pageRef = useRef(null);

  const sectionsRef = useRef({});
  const stickyNavRef = useRef(null);

  useEffect(() => {
    const fetchDestination = async () => {
      setLoading(true);
      setError(false);

      const { data, error } = await supabase
        .from('mgh_destinations')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error || !data) {
        console.error('Error fetching destination:', error);
        setError(true);
      } else {
        setDestination(data);
      }
      setLoading(false);
    };

    if (currentLanguage) {
      fetchDestination();
    }
  }, [slug, currentLanguage]);

  useEffect(() => {
    if (loading || !destination || !pageRef.current) return;
    gsap.from(pageRef.current, { opacity: 0, duration: 0.8 });
  }, [loading, destination]);

  const scrollToSection = (id) => {
    const element = sectionsRef.current[id];
    if (element) {
      const stickyNavHeight = stickyNavRef.current?.offsetHeight || 0;
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight - stickyNavHeight;

      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (location.hash && destination) {
      const id = location.hash.substring(1);
      setTimeout(() => scrollToSection(id), 100);
    }
  }, [location.hash, destination]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-action animate-spin" />
      </div>
    );
  }

  if (error || !destination) {
    return <NotFoundPage />;
  }

  const name = getTranslated(destination.name, currentLanguage);
  const subtitle = getTranslated(destination.subtitle, currentLanguage);
  const intro_rich = getTranslated(destination.intro_rich, currentLanguage);

  const getting_here = getTranslatedArray(destination.getting_here, currentLanguage);
  const what_to_do = getTranslatedArray(destination.what_to_do, currentLanguage);
  const good_to_know = getTranslatedArray(destination.good_to_know, currentLanguage);
  const when_to_visit = getTranslated(destination.when_to_visit, currentLanguage);
  const faq = getTranslatedArray(destination.faq, currentLanguage);

  const cta_label = getTranslated(destination.cta_label, currentLanguage);
  const seo_title = getTranslated(destination.seo_title, currentLanguage);
  const seo_description = getTranslated(destination.seo_description, currentLanguage);

  const { hero_image_urls, gallery_urls, map_embed_url, related_experiences, cta_url } = destination;

  const breadcrumbItems = [
    { label: t('destinations'), href: '/destinations' },
    { label: name },
  ];

  return (
    <>
      <Helmet>
        <title>{seo_title || `${name} · MGH`}</title>
        <meta
          name="description"
          content={seo_description || `Explore ${name}, one of Morocco's premier destinations.`}
        />
        <link rel="canonical" href={`${import.meta.env.VITE_APP_BASE_URL || 'https://amh.ma'}/destinations/${slug}`} />
        <meta property="og:title" content={seo_title || `${name} · MGH`} />
        <meta
          property="og:description"
          content={seo_description || `Explore ${name}, one of Morocco's premier destinations.`}
        />
        {hero_image_urls?.[0] && <meta property="og:image" content={hero_image_urls[0]} />}
      </Helmet>

      <div ref={pageRef} className="destination-page bg-white">
        <div className="pt-24 pb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <DestinationHeader name={name} subtitle={subtitle} heroImage={hero_image_urls?.[0]} />

        <div className="content-wrapper section-padding">
          <div className="text-column text-center">
            <p className="body-text text-lg">{intro_rich}</p>
          </div>
        </div>

        <DestinationGettingHere gettingHere={getting_here} sectionRef={(el) => (sectionsRef.current['getting-here'] = el)} />
        <DestinationWhatToDo whatToDo={what_to_do} sectionRef={(el) => (sectionsRef.current['what-to-do'] = el)} />
        <DestinationGoodToKnow goodToKnow={good_to_know} sectionRef={(el) => (sectionsRef.current['good-to-know'] = el)} />
        <DestinationWhenToVisit
          whenToVisit={when_to_visit}
          ctaLabel={cta_label}
          ctaUrl={cta_url}
          sectionRef={(el) => (sectionsRef.current['when-to-visit'] = el)}
        />
        <DestinationFAQ faq={faq} sectionRef={(el) => (sectionsRef.current['faq'] = el)} />
        <DestinationGallery gallery={gallery_urls} destinationName={name} sectionRef={(el) => (sectionsRef.current['gallery'] = el)} />
        <DestinationMap mapUrl={map_embed_url} destinationName={name} sectionRef={(el) => (sectionsRef.current['map'] = el)} />
        <RelatedExperiencesSlider experienceSlugs={related_experiences} />
      </div>
    </>
  );
};

export default DestinationPage;
