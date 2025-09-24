import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import { getTranslated } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' },
  }),
};

export default function FeaturedQuartiers() {
  const { t, currentLanguage } = useLanguage();
  const [quartiers, setQuartiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prefersReducedMotion = useReducedMotion();

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

  if (loading) {
    return (
      <section className="pb-16 bg-brand-ink/5">
        <div className="content-wrapper flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 text-brand-action animate-spin" aria-label={t('loading')} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pb-16 bg-brand-ink/5">
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
      <section className="pb-16 bg-brand-ink/5">
        <div className="content-wrapper text-center text-muted">
          {t('noFeaturedQuartiers')}
        </div>
      </section>
    );
  }

  return (
    <section className="pb-16 bg-brand-ink/5">
      <div className="content-wrapper">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="h2-style">{t('medinaQuartiersTitle')}</h2>
          <p className="body-text max-w-2xl mx-auto mt-2">{t('medinaQuartiersSubtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quartiers.map((quartier, index) => {
            const name = getTranslated(quartier.name_tr, currentLanguage);
            const shortDesc = getTranslated(quartier.short_desc_tr, currentLanguage);
            const MotionDiv = prefersReducedMotion ? 'div' : motion.div;

            return (
              <MotionDiv
                key={quartier.slug}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={cardVariants}
              >
                <Link
                  to={`/quartiers-medina#${quartier.slug}`}
                  className="group block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-64">
                    {quartier.images?.[0] ? (
                      <img
                        src={quartier.images[0]}
                        alt={t('quartierAlt', { name })}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted animate-pulse" aria-hidden />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6">
                      <h3 className="text-2xl font-bold text-white">{name}</h3>
                      <p className="text-white/90 mt-1">{shortDesc}</p>
                    </div>
                  </div>
                </Link>
              </MotionDiv>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button asChild size="lg" className="btn-action">
            <Link to="/quartiers-medina">
              {t('discoverAllQuartiers')} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
