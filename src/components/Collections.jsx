import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { collectionsData } from '@/data/collectionsData';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { getTranslated } from '@/lib/utils';

const Collections = () => {
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

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

    if (currentLanguage) {
      fetchCollections();
    }
  }, [toast, currentLanguage]);

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const itemWidth = carouselRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(newIndex);
    }
  };

  return (
    <section className="section-padding bg-white">
      <div className="content-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="h2-style text-brand-ink mb-4">
            {t('discoverOurCollections')}
          </h2>
          <p className="body-text max-w-2xl mx-auto">
            {t('discoverOurCollectionsSubtitle')}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-brand-action animate-spin" />
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {collections.map((collection, index) => {
                const Icon = collection.icon;
                return (
                  <motion.div
                    key={collection.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full overflow-hidden rounded-none border border-[#E5E8EB] group">
                      <div className="bg-gray-200 h-40 relative">
                        <img
                          src={collection.imageUrl}
                          className="w-full h-full object-cover"
                          alt={collection.name}
                          loading="lazy"
                        />
                      </div>
                      <CardContent className="p-6 flex flex-col">
                        <div className="-mt-12 mb-4 w-16 h-16 rounded-none flex items-center justify-center bg-white text-brand-ink border border-[#E5E8EB] z-10 relative">
                          {Icon && <Icon className="w-8 h-8" />}
                        </div>
                        <h3 className="text-xl font-bold text-brand-ink mb-2">{collection.name}</h3>
                        <p className="text-brand-ink/80 text-sm mb-4 flex-grow">{collection.description}</p>
                        <Link to={`/collection/${collection.slug}`} className="font-semibold text-brand-action flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                          {t('goToCollection')}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="sm:hidden">
              <div ref={carouselRef} onScroll={handleScroll} className="carousel-container">
                {collections.map((collection, index) => {
                  const Icon = collection.icon;
                  return (
                    <div key={collection.slug} className="carousel-item w-full px-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true, amount: 0.5 }}
                      >
                        <Card className="h-full overflow-hidden rounded-none border border-[#E5E8EB] group">
                          <div className="bg-gray-200 h-40 relative">
                            <img
                              src={collection.imageUrl}
                              className="w-full h-full object-cover"
                              alt={collection.name}
                              loading="lazy"
                            />
                          </div>
                          <CardContent className="p-6 flex flex-col">
                            <div className="-mt-12 mb-4 w-16 h-16 rounded-none flex items-center justify-center bg-white text-brand-ink border border-[#E5E8EB] z-10 relative">
                              {Icon && <Icon className="w-8 h-8" />}
                            </div>
                            <h3 className="text-xl font-bold text-brand-ink mb-2">{collection.name}</h3>
                            <p className="text-brand-ink/80 text-sm mb-4 flex-grow">{collection.description}</p>
                            <Link to={`/collection/${collection.slug}`} className="font-semibold text-brand-action flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                              {t('goToCollection')}
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center space-x-2 mt-6">
                {collections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (carouselRef.current) {
                        const itemWidth = carouselRef.current.offsetWidth;
                        carouselRef.current.scrollTo({
                          left: itemWidth * index,
                          behavior: 'smooth',
                        });
                      }
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentIndex === index ? 'bg-brand-action' : 'bg-brand-ink/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Collections;