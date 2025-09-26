import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RiadCard from '@/components/RiadCard';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { getTranslated } from '@/lib/utils';

const AllPropertiesPage = () => {
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [riads, setRiads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiads = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('mgh_properties')
        .select(`
          id,
          name,
          name_tr,
          city,
          area,
          area_tr,
          quartier,
          google_reviews_count,
          image_urls,
          amenities,
          sblink,
          property_type
        `);

      if (error) {
        console.error('Error fetching riads:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch the list of riads.',
        });
        setRiads([]);
      } else {
        const formattedRiads = data.map((riad) => ({
          id: riad.id,
          name: getTranslated(riad.name_tr, currentLanguage) || riad.name,
          area: getTranslated(riad.area_tr, currentLanguage) || riad.area,
          city: riad.city,
          quartier: riad.quartier,
          imageUrl: riad.image_urls && riad.image_urls.length > 0 ? riad.image_urls[0] : 'https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png',
          amenities: riad.amenities || [],
          google_rating: riad.google_rating,
          google_reviews_count: riad.google_reviews_count,
          sblink: riad.sblink,
          property_type: riad.property_type,
        }));
        setRiads(formattedRiads);
      }
      setLoading(false);
    };

    fetchRiads();
  }, [toast, currentLanguage]);

  return (
    <>
      <Helmet>
        <title>{t('allProperties')} · MGH</title>
        <meta name="description" content={t('exploreAllOurCertifiedRiads')} />
      </Helmet>
      <div className="bg-white">
        <div className="content-wrapper section-padding pt-32">
          <div className="text-center mb-12">
            <h1 className="h1-style text-brand-ink">{t('allProperties')}</h1>
            <p className="body-text mt-2">
              {t('exploreAllOurCertifiedRiads')}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 text-brand-action animate-spin" />
            </div>
          ) : (
            <div className="grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {riads.map((riad, index) => (
                <motion.div
                  key={riad.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <RiadCard riad={riad} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AllPropertiesPage;