
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, Loader2, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import RiadCard from '@/components/RiadCard';
import FilterDrawer from '@/components/FilterDrawer';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useQueryParams, StringParam, ArrayParam } from 'use-query-params';
import { getTranslated } from '@/lib/utils';

const AllRiadsPage = () => {
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [riads, setRiads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [query, setQuery] = useQueryParams({
    amenities: ArrayParam,
    collections: ArrayParam,
    rating: StringParam,
    cities: ArrayParam,
  });

  const filters = useMemo(() => ({
    amenities: query.amenities || [],
    collections: query.collections || [],
    rating: query.rating || null,
    cities: query.cities || [],
  }), [query]);

  const handleFiltersChange = (newFilters) => {
    setQuery({
      amenities: newFilters.amenities.length > 0 ? newFilters.amenities : undefined,
      collections: newFilters.collections.length > 0 ? newFilters.collections : undefined,
      rating: newFilters.rating || undefined,
      cities: newFilters.cities.length > 0 ? newFilters.cities : undefined,
    }, 'push');
  };

  useEffect(() => {
    const fetchRiads = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('riads').select('*');

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
          name: getTranslated(riad.name_tr, currentLanguage),
          location: getTranslated(riad.area_tr, currentLanguage) || riad.address,
          city: riad.city,
          imageUrl: riad.image_urls && riad.image_urls.length > 0 ? riad.image_urls[0] : 'https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png',
          imageDescription: `Image of ${getTranslated(riad.name_tr, currentLanguage)}`,
          amenities: riad.amenities || [],
          collections: riad.collections || [],
          reviews: riad.google_reviews_count,
          rating: riad.google_notes ? parseFloat(riad.google_notes) : 4.5,
          bookNowLink: riad.sblink,
          category: riad.collections && riad.collections.length > 0 ? riad.collections[0] : 'Certified',
        }));
        setRiads(formattedRiads);
      }
      setLoading(false);
    };

    fetchRiads();
  }, [toast, currentLanguage]);

  const filteredRiads = useMemo(() => {
    return riads.filter((riad) => {
      const amenityMatch =
        filters.amenities.length === 0 ||
        filters.amenities.every((amenity) => riad.amenities.includes(amenity));

      const collectionMatch =
        filters.collections.length === 0 ||
        filters.collections.every((collection) => riad.collections.includes(collection));
      
      const cityMatch = 
        filters.cities.length === 0 ||
        filters.cities.includes(riad.city);

      const ratingMatch = (() => {
        if (!filters.rating) return true;
        const rating = riad.rating;
        switch (filters.rating) {
          case '4.9+':
            return rating >= 4.9;
          case '4.5+':
            return rating >= 4.5;
          case '4.0+':
            return rating >= 4.0;
          default:
            return true;
        }
      })();

      return amenityMatch && ratingMatch && collectionMatch && cityMatch;
    });
  }, [riads, filters]);

  return (
    <div className="bg-white">
      <div className="content-wrapper section-padding">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="text-center md:text-left">
            <h1 className="h1-style text-brand-ink">{t('allRiads')}</h1>
            <p className="body-text mt-2">
              {t('exploreAllOurCertifiedRiads')}
            </p>
          </div>
          <div className="flex items-center justify-center space-x-4 mt-4 md:mt-0">
            <Button
              variant="outline"
              className="flex items-center space-x-2 rounded-sm h-12 min-w-[48px]"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">{t('filters')}</span>
            </Button>
            <FilterDrawer
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-brand-action animate-spin" />
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredRiads.map((riad, index) => (
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
        { !loading && filteredRiads.length === 0 && (
            <div className="text-center py-20 border border-dashed border-gray-300 rounded-lg">
                <XCircle className="w-12 h-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">{t('noRiadsMatchFilters')}</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting or resetting your filters.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AllRiadsPage;
