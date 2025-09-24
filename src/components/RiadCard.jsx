import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wifi, MapPin, Star, Waves, Utensils, Bath, Sun, Wind, Tv, Users, ConciergeBell, Dog, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { getTranslated } from '@/lib/utils';

const AmenityIcon = ({ amenity, className = "w-4 h-4" }) => {
  const iconMap = {
    'Pool': <Waves className={className} />,
    'Piscine': <Waves className={className} />,
    'Hammam': <Bath className={className} />,
    'Spa': <Star className={className} />,
    'Terrace': <Sun className={className} />,
    'Terrasse': <Sun className={className} />,
    'Restaurant': <Utensils className={className} />,
    'Air conditioning': <Wind className={className} />,
    'Climatisation': <Wind className={className} />,
    'Wifi': <Wifi className={className} />,
    'Family rooms': <Users className={className} />,
    'Chambres familiales': <Users className={className} />,
    'Room service': <ConciergeBell className={className} />,
    'Airport shuttle': <ConciergeBell className={className} />,
    'Navette aéroport': <ConciergeBell className={className} />,
    'Television': <Tv className={className} />,
    'Pet Friendly': <Dog className={className} />,
    'Animaux acceptés': <Dog className={className} />,
    'Rooftop': <Sun className={className} />,
    'Toit-terrasse': <Sun className={className} />,
    'Garden': <Sun className={className} />,
    'Jardin': <Sun className={className} />,
    'Luxury': <Star className={className} />,
    'Luxe': <Star className={className} />,
    'Families': <Users className={className} />,
    'Familles': <Users className={className} />,
    'Yoga': <Users className={className} />,
    'Bar': <Utensils className={className} />,
  };

  const normalizedAmenity = Object.keys(iconMap).find(key => 
    amenity.toLowerCase().includes(key.toLowerCase())
  );

  return iconMap[normalizedAmenity] || <Star className={className} />;
};


const normalizeQuartier = (quartier) => {
  if (!quartier) return '';
  try {
    const parsed = JSON.parse(quartier);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
  } catch (e) {}
  return quartier.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const RiadCard = ({ riad }) => {
  const { t, currentLanguage } = useLanguage();
  const slug = riad.id;
  const locationParts = [normalizeQuartier(riad.quartier), riad.area, riad.city].filter(Boolean).join(', ');
  const displayedAmenities = riad.amenities ? riad.amenities.slice(0, 6) : [];
  const hiddenAmenitiesCount = riad.amenities ? riad.amenities.length - displayedAmenities.length : 0;
  
  const rating = riad.google_notes ? parseFloat(riad.google_notes) : null;
  const reviewCount = riad.google_reviews_count || null;
  const propertyType = getTranslated(riad.property_type, currentLanguage);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden h-full flex flex-col transition-shadow duration-300 hover:shadow-xl group">
      <div className="relative">
        <Link to={`/riad/${slug}`}>
          <img
            className="w-full h-56 object-cover transform transition-transform duration-500 group-hover:scale-105"
            alt={riad.name}
            src={riad.imageUrl || "https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png"}
          />
        </Link>
        {rating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 text-sm shadow">
              <Star className="w-4 h-4 text-red-500" fill="currentColor" />
              <span className="font-semibold text-brand-ink">{rating.toFixed(1)}</span>
              {reviewCount && <span className="text-brand-ink/60">({reviewCount})</span>}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-brand-ink mb-1 truncate">
          <Link to={`/riad/${slug}`} className="hover:text-brand-action transition-colors">
            {riad.name}
          </Link>
        </h3>

        {propertyType && (
          <p className="text-sm font-medium text-brand-ink/60 mb-2 capitalize">{propertyType}</p>
        )}

        <div className="text-xs text-brand-ink/60 mb-3 flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span className="truncate">{locationParts}</span>
        </div>

        {riad.amenities && riad.amenities.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
              {displayedAmenities.map(amenity => (
                  <div key={amenity} title={amenity}>
                    <AmenityIcon amenity={amenity} className="w-5 h-5 text-brand-ink/70" />
                  </div>
              ))}
              {hiddenAmenitiesCount > 0 && (
                 <div className="text-xs font-medium text-brand-ink/70">
                   +{hiddenAmenitiesCount}
                 </div>
              )}
          </div>
        )}
        
        <div className="mt-auto grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="w-full font-semibold col-span-1">
                <Link to={`/riad/${slug}`}>{t('moreDetails')}</Link>
            </Button>
            {riad.sblink && (
                 <Button asChild className="w-full font-semibold col-span-1 bg-brand-action hover:bg-brand-action/90">
                    <a href={riad.sblink} target="_blank" rel="noopener noreferrer">{t('reserveNow')}</a>
                </Button>
            )}
             {!riad.sblink && (
                 <div className="col-span-1"></div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RiadCard;