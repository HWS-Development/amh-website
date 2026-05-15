import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import { getTranslated } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedQuartiers() {
  const { t, currentLanguage } = useLanguage();
  const [quartiers, setQuartiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchQuartiers = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('amh_quartiers')
        .select('slug, name_tr, short_desc_tr, images, display_order, is_featured')
        .eq('is_featured', true)
        .order('display_order', { ascending: true, nullsFirst: false })
        .limit(3);

      if (!isMounted) return;

      if (error) {
        console.error('Error fetching featured quartiers:', error);
        setError(t('somethingWentWrong'));
        setLoading(false);
        return;
      }

      setQuartiers(data || []);
      setLoading(false);
    };

    fetchQuartiers();
    return () => {
      isMounted = false;
    };
  }, [currentLanguage, t]);

  useEffect(() => {
    if (loading || !quartiers.length || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.fq-header', {
        y: -20, opacity: 0, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      gsap.from('.fq-card', {
        y: 20, opacity: 0, duration: 0.45, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.fq-grid', start: 'top 85%', once: true },
      });
      gsap.from('.fq-cta', {
        opacity: 0, duration: 0.5, delay: 0.3, ease: 'power2.out',
        scrollTrigger: { trigger: '.fq-cta', start: 'top 90%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, quartiers]);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="content-wrapper flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 text-brand-action animate-spin" aria-label={t('loading')} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="content-wrapper text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>
            {t('tryAgain')}
          </Button>
        </div>
      </section>
    );
  }

  if (!loading && quartiers.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="content-wrapper text-center text-muted">
          {t('noFeaturedQuartiers')}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white">
      <div className="content-wrapper">
        <div className="fq-header text-center mb-12">
          <h2 className="h2-style text-brand-ink">{t('medinaQuartiersTitle')}</h2>
          <p className="body-text max-w-2xl mx-auto mt-2 text-brand-ink/60">{t('medinaQuartiersSubtitle')}</p>
        </div>

        <div className="fq-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quartiers.map((quartier) => {
            const name = getTranslated(quartier.name_tr, currentLanguage);
            const shortDesc = getTranslated(quartier.short_desc_tr, currentLanguage);

            return (
              <div key={quartier.slug} className="fq-card">
                <Link
                  to={`/quartiers-medina#${quartier.slug}`}
                  className="group block overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-64">
                    {quartier.images?.[0] ? (
                      <OptimizedImage
                        src={quartier.images[0]}
                        alt={t('quartierAlt', { name })}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted animate-pulse" aria-hidden />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6">
                      <h3 className="text-2xl font-bold text-white font-montserrat">{name}</h3>
                      <p className="text-white/85 mt-1 text-sm">{shortDesc}</p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="fq-cta text-center mt-12">
          <Button asChild size="lg" className="bg-brand-action hover:bg-brand-action/90 text-white font-semibold tracking-wide">
            <Link to="/quartiers-medina">
              {t('discoverAllQuartiers')} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
