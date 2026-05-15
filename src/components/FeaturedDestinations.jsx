import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Search } from 'lucide-react';
import { getTranslated } from '@/lib/utils';
import OptimizedImage from '@/components/ui/OptimizedImage';
import gsap from 'gsap';

export default function FeaturedDestinations() {
  const { t, currentLanguage } = useLanguage();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const gridRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDestinations = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('mgh_destinations')
        .select('name, subtitle, slug, hero_image_urls, sort_order, is_published')
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
        name: getTranslated(dest.name, currentLanguage) || '',
        subtitle: getTranslated(dest.subtitle, currentLanguage) || '',
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

  useEffect(() => {
    if (loading || destinations.length === 0 || !gridRef.current) return;

    const children = gridRef.current.children;
    if (children.length === 0) return;

    gsap.from(children, {
      opacity: 0, y: 20, duration: 0.45, stagger: 0.08
    });
  }, [loading, destinations]);

  return (
    <section className="bg-white section-padding">
      <div className="content-wrapper">
        <div className="text-center mb-12">
          <h2 className="h2-style text-brand-ink">{t('exploreOurDestinations')}</h2>
          <p className="body-text mt-2 text-brand-ink/60">{t('discoverTheSoulOfMorocco')}</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-brand-action animate-spin" aria-label={t('loading')} />
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium text-sm">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>
              {t('tryAgain')}
            </Button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((dest, index) => {
                const imgAlt = t('destinationAlt', { name: dest.name || '' });
                return (
                  <div key={dest.slug}>
                    <Link to={`/destinations/${dest.slug}`} className="block group">
                      <div className="relative overflow-hidden h-80">
                        {dest.img ? (
                          <OptimizedImage
                            src={dest.img}
                            alt={imgAlt}
                            fetchPriority="low"
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted animate-pulse" aria-hidden />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                          <h3 className="text-2xl text-white font-bold font-montserrat">{dest.name}</h3>
                          <p className="mt-1 text-white/85 text-sm">{dest.subtitle}</p>
                          <span className="mt-3 inline-flex items-center text-xs font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100 tracking-wider uppercase">
                            {t('explore')} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Button asChild size="lg" className="bg-brand-action hover:bg-brand-action/90 text-white font-semibold tracking-wide">
                <Link to="/all-riads">
                  <Search className="mr-2 h-4 w-4" /> {t('searchAllProperties')}
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
