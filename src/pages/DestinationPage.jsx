
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, Plane, Train, Bus, Car, Star, Check, Loader2 } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import NotFoundPage from '@/pages/NotFoundPage';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslated, getTranslatedArray } from '@/lib/utils';

const iconMap = {
  plane: Plane,
  train: Train,
  bus: Bus,
  car: Car,
  default: Star,
};

const DestinationPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, currentLanguage } = useLanguage();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const sectionsRef = useRef({});
  const stickyNavRef = useRef(null);

  useEffect(() => {
    const fetchDestination = async () => {
      setLoading(true);
      setError(false);
      
      const { data, error } = await supabase
        .from('destinations')
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
    if (location.hash && destination) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        scrollToSection(id);
      }, 100);
    }
  }, [location.hash, destination]);


  const scrollToSection = (id) => {
    const element = sectionsRef.current[id];
    if (element) {
        const stickyNavHeight = stickyNavRef.current?.offsetHeight || 0;
        const headerHeight = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight - stickyNavHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
  };

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
  
  const name = getTranslated(destination.name_tr, currentLanguage);
  const subtitle = getTranslated(destination.subtitle_tr, currentLanguage);
  const intro_rich = getTranslated(destination.intro_rich_tr, currentLanguage);
  const getting_here = getTranslatedArray(destination.getting_here_tr, currentLanguage);
  const what_to_do = getTranslatedArray(destination.what_to_do_tr, currentLanguage);
  const good_to_know = getTranslatedArray(destination.good_to_know_tr, currentLanguage);
  const when_to_visit = getTranslated(destination.when_to_visit_tr, currentLanguage);
  const faq = getTranslatedArray(destination.faq_tr, currentLanguage);
  const cta_label = getTranslated(destination.cta_label_tr, currentLanguage);
  const seo_title = getTranslated(destination.seo_title_tr, currentLanguage);
  const seo_description = getTranslated(destination.seo_description_tr, currentLanguage);
  
  const { hero_image_urls, gallery_urls, map_embed_url, related_experiences, cta_url } = destination;

  const breadcrumbItems = [
    { label: t('destinations'), href: "/destinations" },
    { label: name },
  ];

  const anchorLinks = [
    getting_here?.length > 0 && { id: 'getting-here', label: 'Getting Here' },
    what_to_do?.length > 0 && { id: 'what-to-do', label: 'What to Do' },
    good_to_know?.length > 0 && { id: 'good-to-know', label: 'Good to Know' },
    when_to_visit && { id: 'when-to-visit', label: 'When to Visit' },
    faq?.length > 0 && { id: 'faq', label: 'FAQ' },
    gallery_urls?.length > 0 && { id: 'gallery', label: 'Gallery' },
  ].filter(Boolean);

  return (
    <>
      <Helmet>
        <title>{seo_title || `${name} | AMH`}</title>
        <meta name="description" content={seo_description || `Explore ${name}, one of Morocco's premier destinations.`} />
        <link rel="canonical" href={`https://yourdomain.com/destinations/${slug}`} />
        <meta property="og:title" content={seo_title || `${name} | AMH`} />
        <meta property="og:description" content={seo_description || `Explore ${name}, one of Morocco's premier destinations.`} />
        {hero_image_urls?.[0] && <meta property="og:image" content={hero_image_urls[0]} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <motion.div
        className="destination-page bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="pt-24 pb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-white overflow-hidden">
          {hero_image_urls?.[0] && (
            <img src={hero_image_urls[0]} alt={`Hero image for ${name}`} className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-brand-ink/40"></div>
          <div className="relative z-10 text-center">
            <h1 className="h1-style font-bold">{name}</h1>
            <p className="text-xl md:text-2xl mt-2 tracking-wide uppercase">{subtitle}</p>
          </div>
        </section>

        <nav ref={stickyNavRef} className="sticky top-[79px] bg-white z-30 shadow-md">
            <div className="content-wrapper">
                <div className="flex justify-center items-center overflow-x-auto no-scrollbar -mx-4">
                    {anchorLinks.map(link => (
                        <button
                            key={link.id}
                            onClick={() => {
                                navigate(`#${link.id}`);
                                scrollToSection(link.id);
                            }}
                            className="flex-shrink-0 px-4 md:px-6 py-4 text-sm font-semibold uppercase tracking-wider text-brand-ink/70 hover:text-brand-action border-b-2 border-transparent hover:border-brand-action focus:outline-none focus:text-brand-action transition-all"
                        >
                            {link.label}
                        </button>
                    ))}
                </div>
            </div>
        </nav>

        <div className="content-wrapper section-padding">
          <div className="text-column text-center">
            <p className="body-text text-lg">{intro_rich}</p>
          </div>
        </div>

        {getting_here?.length > 0 && (
          <section id="getting-here" ref={el => sectionsRef.current['getting-here'] = el} className="bg-brand-ink/5 section-padding">
            <div className="content-wrapper">
              <h2 className="h2-style text-center mb-12">Getting Here</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {getting_here.map((item, index) => {
                  const Icon = iconMap[item.mode] || iconMap.default;
                  return (
                    <div key={index} className="text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-brand-action/10 flex items-center justify-center mb-4">
                        <Icon className="w-8 h-8 text-brand-action" />
                      </div>
                      <h3 className="h3-style text-xl mb-2">{item.title}</h3>
                      <p className="body-text">{item.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {what_to_do?.length > 0 && (
          <section id="what-to-do" ref={el => sectionsRef.current['what-to-do'] = el} className="section-padding">
            <div className="content-wrapper">
              <h2 className="h2-style text-center mb-12">What to Do & See</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {what_to_do.map((activity, index) => (
                  <div key={index} className="bg-white rounded-none border border-[#E5E8EB] overflow-hidden group h-full flex flex-col">
                    <div className="h-48 overflow-hidden relative">
                      {activity.image_url && <img src={activity.image_url} alt={activity.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-bold text-lg mb-2">{activity.title}</h3>
                      <p className="text-sm text-brand-ink/80 flex-grow">{activity.blurb}</p>
                       {activity.link_url && (
                        <RouterLink to={activity.link_url} className="text-sm font-semibold text-brand-action mt-4 inline-flex items-center">
                          Learn More <ArrowRight className="w-4 h-4 ml-1" />
                        </RouterLink>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {good_to_know?.length > 0 && (
          <section id="good-to-know" ref={el => sectionsRef.current['good-to-know'] = el} className="bg-brand-ink/5 section-padding">
            <div className="content-wrapper text-column">
              <h2 className="h2-style text-center mb-12">Good to Know</h2>
              <ul className="space-y-4">
                {good_to_know.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-bold">{item.title}:</span> {item.tip}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
        
        {when_to_visit && (
          <section id="when-to-visit" ref={el => sectionsRef.current['when-to-visit'] = el} className="section-padding">
            <div className="content-wrapper text-column text-center">
              <h2 className="h2-style mb-6">When to Visit</h2>
              <p className="body-text mb-8">{when_to_visit}</p>
              {cta_label && cta_url && (
                <Button asChild size="lg" className="btn-action">
                  <RouterLink to={cta_url}>{cta_label} <ArrowRight className="w-5 h-5 ml-2" /></RouterLink>
                </Button>
              )}
            </div>
          </section>
        )}

        {faq?.length > 0 && (
          <section id="faq" ref={el => sectionsRef.current['faq'] = el} className="bg-brand-ink/5 section-padding">
            <div className="content-wrapper text-column">
              <h2 className="h2-style text-center mb-8">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {faq.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline text-left">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-brand-ink/80 text-base leading-relaxed">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {gallery_urls?.length > 0 && (
          <section id="gallery" ref={el => sectionsRef.current['gallery'] = el} className="section-padding">
            <div className="content-wrapper">
              <h2 className="h2-style text-center mb-12">Photo Gallery</h2>
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {gallery_urls.map((url, index) => (
                  <img key={index} src={url} alt={`${name} gallery image ${index + 1}`} className="w-full h-auto object-cover break-inside-avoid" loading="lazy" />
                ))}
              </div>
            </div>
          </section>
        )}

        {map_embed_url && (
            <section id="map" ref={el => sectionsRef.current['map'] = el} className="section-padding bg-brand-ink/5">
                <div className="content-wrapper">
                    <h2 className="h2-style text-center mb-12">Map</h2>
                    <div className="aspect-video">
                        <iframe
                            src={map_embed_url}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Map of ${name}`}
                        ></iframe>
                    </div>
                </div>
            </section>
        )}
        
        {related_experiences?.length > 0 && (
          <RelatedExperiencesSlider experienceSlugs={related_experiences} />
        )}

      </motion.div>
    </>
  );
};

const RelatedExperiencesSlider = ({ experienceSlugs }) => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('experiences')
        .select('title_tr, slug, hero_image_url, short_intro_tr')
        .in('slug', experienceSlugs);

      if (error) {
        console.error("Error fetching related experiences:", error);
      } else {
        setExperiences(data.map(exp => ({
          ...exp,
          title: getTranslated(exp.title_tr, currentLanguage),
          short_intro: getTranslated(exp.short_intro_tr, currentLanguage),
        })));
      }
      setLoading(false);
    }
    if (currentLanguage) {
      fetchExperiences();
    }
  }, [experienceSlugs, currentLanguage]);

  if(loading || experiences.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="content-wrapper">
        <h2 className="h2-style text-center mb-12">Related Experiences</h2>
        <Carousel
          opts={{
            align: "start",
            loop: experiences.length > 2,
          }}
          className="w-full"
        >
          <CarouselContent>
            {experiences.map((exp) => (
              <CarouselItem key={exp.slug} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <RouterLink to={`/experiences/${exp.slug}`}>
                    <div className="h-96 overflow-hidden rounded-none group relative text-white">
                      <div className="absolute inset-0 z-0">
                        <img
                          src={exp.hero_image_url}
                          alt={exp.title}
                          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                      </div>
                      <div className="relative z-10 flex flex-col justify-end h-full p-6">
                        <div>
                          <h3 className="text-2xl font-bold font-display mb-2">{exp.title}</h3>
                          <p className="text-white/90 text-sm mb-4">{exp.short_intro}</p>
                          <span className="flex items-center gap-2 font-semibold text-white">
                            Discover More
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </RouterLink>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-[-1rem] md:left-[-2rem]" />
          <CarouselNext className="right-[-1rem] md:right-[-2rem]" />
        </Carousel>
      </div>
    </section>
  )
}


export default DestinationPage;
