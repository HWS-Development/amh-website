
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Search } from 'lucide-react';
import { getTranslated } from '@/lib/utils';

const FeaturedDestinations = () => {
  const { t, currentLanguage } = useLanguage();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('destinations')
        .select('name_tr, slug, subtitle_tr, hero_image_urls')
        .in('slug', ['marrakech', 'essaouira', 'ouarzazate'])
        .eq('is_published', true)
        .order('sort_order');

      if (error) {
        console.error("Error fetching featured destinations:", error);
      } else {
        setDestinations(data.map(dest => ({
          ...dest,
          name: getTranslated(dest.name_tr, currentLanguage),
          subtitle: getTranslated(dest.subtitle_tr, currentLanguage),
        })));
      }
      setLoading(false);
    };
    fetchDestinations();
  }, [currentLanguage]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <section className="bg-brand-ink/5 section-padding">
      <div className="content-wrapper">
        <div className="text-center mb-12">
          <h2 className="h2-style">{t('exploreOurDestinations')}</h2>
          <p className="body-text mt-2">{t('discoverTheSoulOfMorocco')}</p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-brand-action animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest, index) => (
              <motion.div
                key={dest.slug}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <Link to={`/destinations/${dest.slug}`} className="block group">
                  <div className="relative overflow-hidden h-96">
                    {dest.hero_image_urls && dest.hero_image_urls[0] && (
                      <img 
                        src={dest.hero_image_urls[0]}
                        alt={`View of ${dest.name}`}
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <h3 className="text-3xl font-bold font-display">{dest.name}</h3>
                      <p className="mt-1 text-white/90">{dest.subtitle}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
            <Button asChild size="lg" className="btn-action font-semibold">
              <Link to="/all-riads">
                <Search className="mr-2 h-5 w-5" /> {t('searchAllProperties')}
              </Link>
            </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
