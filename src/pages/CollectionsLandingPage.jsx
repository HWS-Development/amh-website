import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { collectionsData } from '@/data/collectionsData';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { getTranslated } from '@/lib/utils';

const CollectionsLandingPage = () => {
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('collections')
        .select('name_tr, slug, short_description_tr, image_url');

      if (error) {
        console.error('Error fetching collections:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch collections.",
        });
        setCollections([]);
      } else {
        const mergedCollections = data.map(dbCollection => {
          const staticData = collectionsData[dbCollection.slug];
          return {
            ...staticData,
            ...dbCollection,
            name: getTranslated(dbCollection.name_tr, currentLanguage),
            description: getTranslated(dbCollection.short_description_tr, currentLanguage),
            imageUrl: dbCollection.image_url,
            slug: dbCollection.slug,
          };
        });
        setCollections(mergedCollections);
      }
      setLoading(false);
    };

    fetchCollections();
  }, [toast, currentLanguage]);

  return (
    <>
      <Helmet>
        <title>{t('riadCollections')} · MGH</title>
        <meta name="description" content={t('collectionsLandingDescription')} />
        <meta property="og:title" content={`${t('riadCollections')} · MGH`} />
        <meta property="og:description" content={t('collectionsLandingDescription')} />
      </Helmet>
      <div className="bg-white min-h-screen">
        <section className="section-padding pt-32 bg-gray-50">
          <div className="content-wrapper">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="h1-style text-gray-800 mb-4">{t('riadCollections')}</h1>
              <p className="body-text text-gray-600 max-w-3xl mx-auto">
                {t('collectionsLandingDescription')}
              </p>
            </motion.div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-12 h-12 text-brand-action animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {collections.map((collection, index) => {
                  const Icon = collection.icon;
                  return (
                    <motion.div
                      key={collection.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <Link
                        to={`/collection/${collection.slug}`}
                        className="block group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col"
                      >
                        <div className="relative overflow-hidden h-48">
                          <img
                            src={collection.imageUrl}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            alt={collection.name}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                          <div className={`-mt-12 mb-4 w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br ${collection.gradient} text-white shadow-lg z-10 relative`}>
                            {Icon && <Icon className="w-8 h-8" />}
                          </div>
                          <h3 className="text-xl font-bold font-display text-gray-800 mb-2">
                            {collection.name}
                          </h3>
                          <p className="text-gray-600 text-sm flex-grow">
                            {collection.description}
                          </p>
                          <div className="mt-4 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#F15A24] to-[#E1252C] group-hover:underline">
                            {t('goToCollection')} →
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default CollectionsLandingPage;