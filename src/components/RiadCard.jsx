
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wifi, MapPin, Star, Waves, Utensils, Mountain, Bath, Sun, Wind, Tv, Users, ConciergeBell, Dog, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AmenityIcon = ({ amenity }) => {
  const defaultIcon = <Star className="w-4 h-4 text-brand-ink" />;
  const icons = {
    'Yoga': '🧘',
    'Spa': '🧖',
    'Rooftop': '🍹',
    'Jazz': '🎷',
    'Luxury': '👑',
    'Medina': '🏘️',
    'Restaurant': '🍴',
    'Pool': '🏊',
    'TripAdvisor': '🦉',
    'Hammam': <Bath className="w-4 h-4 text-brand-ink" />,
    'Terrace': <Sun className="w-4 h-4 text-brand-ink" />,
    'Air conditioning': <Wind className="w-4 h-4 text-brand-ink" />,
    'Wifi': <Wifi className="w-4 h-4 text-brand-ink" />,
    'Family rooms': <Users className="w-4 h-4 text-brand-ink" />,
    'Room service': <ConciergeBell className="w-4 h-4 text-brand-ink" />,
    'Airport shuttle': <ConciergeBell className="w-4 h-4 text-brand-ink" />,
    'Television': <Tv className="w-4 h-4 text-brand-ink" />,
    'Pet Friendly': <Dog className="w-4 h-4 text-brand-ink" />,
    'Suites': <Users className="w-4 h-4 text-brand-ink" />,
    'Accessible': <ShieldCheck className="w-4 h-4 text-brand-ink" />,
  };

  const icon = icons[amenity];

  if (typeof icon === 'string') {
    return <span className="text-base leading-none">{icon}</span>;
  }
  return icon || defaultIcon;
};

const RiadCard = ({ riad }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-none border border-[#E5E8EB] h-full flex flex-col transition-all duration-300">
      <div className="relative">
        <Link to={`/riad/${riad.id}`}>
          <img
            className="w-full h-56 object-cover"
            alt={riad.imageDescription}
            src={riad.imageUrl || "https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png"} />
        </Link>
        {riad.category && (
        <div className="absolute top-3 left-3 px-3 py-1 rounded-sm text-xs font-semibold bg-brand-action/20 text-brand-action">
          {riad.category}
        </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-brand-ink">
            <Link to={`/riad/${riad.id}`} className="hover:text-brand-action transition-colors">
              {riad.name}
            </Link>
          </h3>
          {riad.rating && (
            <div className="flex items-center space-x-1 text-sm text-brand-ink/80 flex-shrink-0 ml-2">
                <Star className="w-4 h-4 text-brand-action" fill="currentColor" />
                <span className="font-semibold text-brand-ink">{riad.rating}</span>
                <span className="text-brand-ink/80">({riad.reviews})</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 text-brand-ink/80 text-sm mb-4">
          <MapPin className="w-4 h-4" />
          <span>{riad.location}, {riad.city}</span>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-brand-ink mb-4 border-t border-b border-[#E5E8EB] py-3">
            {riad.amenities && riad.amenities.map(amenity => (
                <div key={amenity} className="flex items-center gap-1.5 capitalize px-2 py-1 rounded-sm bg-brand-ink/10">
                    <AmenityIcon amenity={amenity} />
                    <span className="text-sm font-medium">{amenity}</span>
                </div>
            ))}
        </div>
        
        <div className="flex justify-between items-center mt-auto space-x-2">
            {riad.bookNowLink ? (
              <>
                <Button asChild variant="outline" className="flex-1 font-semibold">
                  <Link to={`/riad/${riad.id}`}>{t('details')}</Link>
                </Button>
                <Button asChild className="btn-action flex-1 font-semibold">
                  <a href={riad.bookNowLink} target="_blank" rel="noopener noreferrer">{t('reserve')}</a>
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" className="w-full font-semibold">
                <Link to={`/riad/${riad.id}`}>{t('details')}</Link>
              </Button>
            )}
        </div>
      </div>
    </div>
  );
};

export default RiadCard;
