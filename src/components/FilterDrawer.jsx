import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Waves, Sun, Bath, Utensils, BedDouble, ShieldCheck, Dog, Wifi, AirVent, Tv, Users, 
  ConciergeBell, Star, Loader2, Dumbbell, Music, Crown, Building as HotelIcon, Palmtree, VenetianMask, Sparkles, MapPin
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AmenityIcon = ({ amenity }) => {
  const iconMap = {
    'Pool': <Waves className="w-4 h-4 text-gray-600" />,
    'Hammam': <Bath className="w-4 h-4 text-gray-600" />,
    'Spa': <Sparkles className="w-4 h-4 text-gray-600" />,
    'Terrace': <Sun className="w-4 h-4 text-gray-600" />,
    'Restaurant': <Utensils className="w-4 h-4 text-gray-600" />,
    'Air conditioning': <AirVent className="w-4 h-4 text-gray-600" />,
    'Wifi': <Wifi className="w-4 h-4 text-gray-600" />,
    'Family rooms': <Users className="w-4 h-4 text-gray-600" />,
    'Room service': <ConciergeBell className="w-4 h-4 text-gray-600" />,
    'Airport shuttle': <ConciergeBell className="w-4 h-4 text-gray-600" />,
    'Television': <Tv className="w-4 h-4 text-gray-600" />,
    'Pet Friendly': <Dog className="w-4 h-4 text-gray-600" />,
    'Suites': <BedDouble className="w-4 h-4 text-gray-600" />,
    'Rooftop': <Sun className="w-4 h-4 text-gray-600" />,
    'Accessible': <ShieldCheck className="w-4 h-4 text-gray-600" />,
    'Yoga': <Dumbbell className="w-4 h-4 text-gray-600" />,
    'Jazz': <Music className="w-4 h-4 text-gray-600" />,
    'Luxury': <Crown className="w-4 h-4 text-gray-600" />,
    'Medina': <Palmtree className="w-4 h-4 text-gray-600" />,
    'TripAdvisor': <Star className="w-4 h-4 text-gray-600" />,
    'default': <Star className="w-4 h-4 text-gray-600" />
  };

  return iconMap[amenity] || iconMap['default'];
};

const collectionLabels = {
  'luxuryriads': 'Luxury Riads',
  'poolriads': 'Pool Riads',
  'wellness&hammam': 'Wellness & Hammam',
  'exclusiveuseriads': 'Exclusive-Use Riads',
  'rooftopriads': 'Rooftop Riads',
  'traditionalriads': 'Traditional Riads',
  'gastronomyriads': 'Gastronomy Riads',
  'family-friendlyriads': 'Family-Friendly Riads',
};

const ratingOptions = [
  { label: '4.9 or more', value: '4.9+' },
  { label: '4.5 and more', value: '4.5+' },
  { label: '4.0 and more', value: '4.0+' },
];

const FilterDrawer = ({ filters, onFiltersChange, isOpen, onToggle }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [amenities, setAmenities] = useState([]);
  const [collections, setCollections] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilterData = async () => {
      setLoading(true);
      
      const fetchAmenities = supabase
        .from('riads')
        .select('amenities');
      
      const fetchCollections = supabase
        .from('collections')
        .select('name, slug')
        .order('id');
      
      const fetchCities = supabase
        .from('riads')
        .select('city');

      const [amenitiesRes, collectionsRes, citiesRes] = await Promise.all([fetchAmenities, fetchCollections, fetchCities]);

      if (amenitiesRes.error) {
        console.error('Error fetching amenities:', amenitiesRes.error);
        toast({ title: "Error", description: "Could not fetch amenities.", variant: "destructive" });
      } else {
        const allAmenities = amenitiesRes.data.flatMap(riad => riad.amenities || []);
        const uniqueAmenities = [...new Set(allAmenities)].sort();
        setAmenities(uniqueAmenities);
      }

      if (collectionsRes.error) {
        console.error('Error fetching collections:', collectionsRes.error);
        toast({ title: "Error", description: "Could not fetch collections.", variant: "destructive" });
      } else {
        setCollections(collectionsRes.data);
      }

      if (citiesRes.error) {
        console.error('Error fetching cities:', citiesRes.error);
        toast({ title: "Error", description: "Could not fetch cities.", variant: "destructive" });
      } else {
        const allCities = citiesRes.data.map(item => item.city).filter(Boolean);
        const uniqueCities = [...new Set(allCities)].sort();
        setCities(uniqueCities);
      }

      setLoading(false);
    };

    if (isOpen) {
      fetchFilterData();
    }
  }, [isOpen, toast]);

  const handleAmenityChange = (amenity, checked) => {
    const newAmenities = checked
      ? [...filters.amenities, amenity]
      : filters.amenities.filter(a => a !== amenity);

    onFiltersChange({ ...filters, amenities: newAmenities });
  };
  
  const handleCollectionChange = (collectionSlug, checked) => {
    const newCollections = checked
      ? [...filters.collections, collectionSlug]
      : filters.collections.filter(c => c !== collectionSlug);

    onFiltersChange({ ...filters, collections: newCollections });
  };
  
  const handleCityChange = (city, checked) => {
    const newCities = checked
      ? [...filters.cities, city]
      : filters.cities.filter(c => c !== city);
    onFiltersChange({ ...filters, cities: newCities });
  };

  const handleRatingChange = (ratingValue) => {
    onFiltersChange({
      ...filters,
      rating: filters.rating === ratingValue ? null : ratingValue,
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      amenities: [],
      rating: null,
      collections: [],
      cities: [],
    });
  };

  const FilterContent = () => (
    <div className="space-y-8 p-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">{t('cities')}</h3>
         {loading ? (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="w-8 h-8 text-brand-action animate-spin" />
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cities.map((city) => (
                <div key={city} className="flex items-center space-x-2">
                <Checkbox
                    id={`city-${city}`}
                    checked={filters.cities.includes(city)}
                    onCheckedChange={(checked) => handleCityChange(city, checked)}
                />
                <label
                    htmlFor={`city-${city}`}
                    className="flex items-center space-x-2 text-sm font-medium cursor-pointer"
                >
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span>{city}</span>
                </label>
                </div>
            ))}
            </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-4">{t('collections')}</h3>
        {loading ? (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="w-8 h-8 text-brand-action animate-spin" />
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {collections.map((collection) => (
                <div key={collection.slug} className="flex items-center space-x-2">
                <Checkbox
                    id={`collection-${collection.slug}`}
                    checked={filters.collections.includes(collection.slug)}
                    onCheckedChange={(checked) => handleCollectionChange(collection.slug, checked)}
                />
                <label
                    htmlFor={`collection-${collection.slug}`}
                    className="flex items-center space-x-2 text-sm font-medium cursor-pointer"
                >
                    <span>{collectionLabels[collection.slug] || collection.name}</span>
                </label>
                </div>
            ))}
            </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-4">{t('amenities')}</h3>
        {loading ? (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="w-8 h-8 text-brand-action animate-spin" />
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {amenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                    id={amenity}
                    checked={filters.amenities.includes(amenity)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity, checked)}
                />
                <label
                    htmlFor={amenity}
                    className="flex items-center space-x-2 text-sm font-medium cursor-pointer"
                >
                    <AmenityIcon amenity={amenity} />
                    <span>{t(amenity.toLowerCase().replace(/ /g, '')) || amenity}</span>
                </label>
                </div>
            ))}
            </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-4">{t('guestRating')}</h3>
        <div className="space-y-2">
          {ratingOptions.map((option) => (
            <Button
              key={option.value}
              variant={filters.rating === option.value ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => handleRatingChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex justify-end"
          onClick={onToggle}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative h-full w-full max-w-md bg-white shadow-xl overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">{t('filters')}</h2>
              <Button variant="ghost" size="icon" onClick={onToggle} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-grow">
                <FilterContent />
            </div>
             <div className="p-6 border-t sticky bottom-0 bg-white flex items-center space-x-4">
                <Button variant="outline" className="flex-1" onClick={resetFilters}>Reset</Button>
                <Button className="flex-1 bg-[#912423] hover:bg-[#7a1f1e]" onClick={onToggle}>Show Results</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterDrawer;