import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Search } from 'lucide-react';
import { getTranslated } from '@/lib/utils';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45 },
  }),
};

export default function FeaturedDestinations() {
  const { t, currentLanguage } = useLanguage();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let isMounted = true;
    const fetchDestinations = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('destinations')
        .select('name_tr, slug, subtitle_tr, hero_image_urls, sort_order, is_published')
        .in('slug', ['marrakech', 'essaouira', 'ouarzazate'])
        .eq('is_published', true)
        .order('sort_order', { ascending: true, nullsFirst: false });

      if (!isMounted) return;

      if (error) {
        console.error('Error fetching featured destinations:', error);
        setError(t('somethingWentWrong'));
        setLoading(false);
        return;
      }

      const mapped = (data || []).map((dest) => ({
        slug: dest.slug,
        name: getTranslated(dest.name_tr, currentLanguage) || '',
        subtitle: getTranslated(dest.subtitle_tr, currentLanguage) || '',
        img: dest.hero_image_urls?.[0] || null,
      }));

      setDestinations(mapped);
      setLoading(false);
    };

    fetchDestinations();
    return () => {
      isMounted = false;
    };
  }, [currentLanguage, t]);

  return (
    <section className="bg-brand-ink/5 section-padding">
      <div className="content-wrapper">
        <div className="text-center mb-12">
          <h2 className="h2-style">{t('exploreOurDestinations')}</h2>
          <p className="body-text mt-2">{t('discoverTheSoulOfMorocco')}</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-brand-action animate-spin" aria-label={t('loading')} />
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-xl rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>
              {t('tryAgain')}
            </Button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((dest, index) => {
                const imgAlt = t('destinationAlt', { name: dest.name }); // e.g. "Vue de {{name}}"
                const MotionDiv = prefersReducedMotion ? 'div' : motion.div;

                return (
                  <MotionDiv
                    key={dest.slug}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                  >
                    <Link to={`/destinations/${dest.slug}`} className="block group">
                      <div className="relative overflow-hidden h-96">
                        {dest.img ? (
                          <img
                            src={dest.img}
                            alt={imgAlt}
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted animate-pulse" aria-hidden />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                          <h3 className="text-3xl text-white/80 font-bold font-display">{dest.name}</h3>
                          <p className="mt-1 text-white/90">{dest.subtitle}</p>
                          <span className="mt-3 inline-flex items-center text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                            {t('explore')} <ArrowRight className="ml-1 h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </MotionDiv>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Button asChild size="lg" className="btn-action font-semibold">
                <Link to="/all-riads">
                  <Search className="mr-2 h-5 w-5" /> {t('searchAllProperties')}
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
