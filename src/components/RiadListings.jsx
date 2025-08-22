
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import RiadCard from '@/components/RiadCard';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { getTranslated } from '@/lib/utils';

const RiadListings = () => {
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  const [riads, setRiads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiads = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('riads')
        .select('*')
        .limit(3);

      if (error) {
        console.error('Error fetching riads:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch recommended riads.",
        });
        setRiads([]);
      } else {
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
          category: riad.collections && riad.collections.length > 0 ? riad.collections[0] : 'Recommended'
        }));
        setRiads(formattedRiads);
      }
      setLoading(false);
    };

    fetchRiads();
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="text-center md:text-left">
            <h2 className="h2-style text-brand-ink">
              {t('recommendedRiads')}
            </h2>
            <p className="body-text mt-2">
              {t('recommendedRiadsSubtitle')}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-brand-action animate-spin" />
          </div>
        ) : (
          <>
            <div className="hidden md:grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12">
              {riads.map((riad, index) => (
                <motion.div
                  key={riad.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <RiadCard riad={riad} />
                </motion.div>
              ))}
            </div>

            <div className="md:hidden mb-12">
              <div ref={carouselRef} onScroll={handleScroll} className="carousel-container">
                {riads.map((riad) => (
                  <div key={riad.id} className="carousel-item w-full px-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true, amount: 0.5 }}
                    >
                      <RiadCard riad={riad} />
                    </motion.div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center space-x-2 mt-6">
                {riads.map((_, index) => (
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            asChild
            size="lg"
            className="btn-action font-semibold px-8 h-12 w-full md:w-auto"
          >
            <Link to="/all-riads">
              <Search className="w-5 h-5 mr-2" />
              {t('searchAllProperties')}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default RiadListings;
