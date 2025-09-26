import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import RiadCard from '@/components/RiadCard';
import { collectionsData } from '@/data/collectionsData';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { getTranslated } from '@/lib/utils';

const CollectionPage = () => {
  const { type } = useParams();
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();

  const [riads, setRiads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectionInfo, setCollectionInfo] = useState(null);

  const staticCollectionData = collectionsData[type] || {};
  const CollectionIcon = staticCollectionData.icon;

  useEffect(() => {
    const fetchCollectionData = async () => {
      setLoading(true);
      
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('name_tr, long_description_tr, short_description_tr')
        .eq('slug', type)
        .single();

      if (collectionError) {
        console.error('Error fetching collection details:', collectionError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch collection details.",
        });
        setCollectionInfo({
          name: t(staticCollectionData.titleKey),
          long_description: t(staticCollectionData.descriptionKey) || "No description available.",
        });
      } else if (collectionData) {
        setCollectionInfo({
          name: getTranslated(collectionData.name_tr, currentLanguage),
          long_description: getTranslated(collectionData.long_description_tr, currentLanguage),
          short_description: getTranslated(collectionData.short_description_tr, currentLanguage),
        });
      }

      const { data, error } = await supabase
        .from('mgh_properties')
        .select('*')
        .contains('collections', [type]);

      if (error) {
        console.error('Error fetching riads:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch riads for this collection.",
        });
      } else if (data) {
        const formattedRiads = data.map(riad => ({
          id: riad.id,
          name: getTranslated(riad.name_tr, currentLanguage),
          location: getTranslated(riad.area_tr, currentLanguage) || riad.address,
          city: riad.city,
          imageUrl: riad.image_urls && riad.image_urls.length > 0 ? riad.image_urls[0] : "https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png",
          imageDescription: `Image of ${getTranslated(riad.name_tr, currentLanguage)}`,
          amenities: riad.amenities || [],
          reviews: riad.google_reviews_count,
          rating: riad.google_notes ? parseFloat(riad.google_notes) : 4.5,
          bookNowLink: riad.sblink,
          category: 'Recommended'
        }));
        setRiads(formattedRiads);
      }
      setLoading(false);
    };

    if (currentLanguage) {
      fetchCollectionData();
    }
  }, [type, toast, t, currentLanguage, staticCollectionData.titleKey, staticCollectionData.descriptionKey]);

  const pageTitle = collectionInfo ? collectionInfo.name : t(staticCollectionData.titleKey);
  const pageDescription = collectionInfo ? collectionInfo.long_description || collectionInfo.short_description : t(staticCollectionData.descriptionKey);

  return (
    <>
      <Helmet>
        <title>{`${pageTitle} · MGH`}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={`${pageTitle} · MGH`} />
        <meta property="og:description" content={pageDescription} />
      </Helmet>

      <div className="min-h-screen bg-white">
        
        <section className="pt-32 pb-16 bg-gray-50">
          <div className="content-wrapper">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button asChild variant="ghost" className="mb-8 flex items-center space-x-2 text-brand-ink/80 hover:text-brand-ink">
                <Link to="/collections">
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('allCollections')}</span>
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-none flex items-center justify-center border border-[#E5E8EB]">
                {CollectionIcon && <CollectionIcon className="w-10 h-10 text-brand-ink" />}
              </div>

              <h1 className="h1-style text-brand-ink mb-4">
                {pageTitle}
              </h1>
              <p className="body-text max-w-2xl mx-auto">
                {pageDescription}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding">
          <div className="content-wrapper">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-12 h-12 text-brand-action animate-spin" />
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <p className="body-text">
                    {riads.length} {t('riadsInThisCollection')}
                  </p>
                </div>
                {riads.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {riads.map((riad, index) => (
                      <motion.div
                        key={riad.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <RiadCard riad={riad} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 border border-dashed border-[#E5E8EB] rounded-none">
                    <h3 className="text-xl font-semibold text-brand-ink">No Riads Found</h3>
                    <p className="text-brand-ink/80 mt-2">There are currently no riads listed in this collection.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

      </div>
    </>
  );
};

export default CollectionPage;