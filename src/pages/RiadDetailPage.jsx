import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ExternalLink, Star, MapPin, Check, Shield, Loader2, Wifi, Waves, 
  Utensils, Sun, Phone, Mail, Globe
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { getTranslated } from '@/lib/utils';

const AmenityIcon = ({ amenity }) => {
  const amenityKey = amenity.toLowerCase();
  const iconMap = {
    'pool': <Waves className="w-5 h-5 text-brand-action" />,
    'hammam': <span className="text-xl">🛁</span>,
    'spa': <span className="text-xl">🧖</span>,
    'terrace': <Sun className="w-5 h-5 text-brand-action" />,
    'restaurant': <Utensils className="w-5 h-5 text-brand-action" />,
    'air conditioning': <Check className="w-5 h-5 text-brand-action" />,
    'wifi': <Wifi className="w-5 h-5 text-brand-action" />,
    'family rooms': <Check className="w-5 h-5 text-brand-action" />,
    'room service': <Check className="w-5 h-5 text-brand-action" />,
    'airport shuttle': <Check className="w-5 h-5 text-brand-action" />,
    'television': <Check className="w-5 h-5 text-brand-action" />,
    'pet friendly': <Check className="w-5 h-5 text-brand-action" />,
    'suites': <Check className="w-5 h-5 text-brand-action" />,
    'rooftop': <Sun className="w-5 h-5 text-brand-action" />,
    'accessible': <Check className="w-5 h-5 text-brand-action" />,
    'yoga': <span className="text-xl">🧘</span>,
    'jazz': <span className="text-xl">🎷</span>,
    'luxury': <span className="text-xl">👑</span>,
    'medina': <span className="text-xl">🏘️</span>,
    'tripadvisor': <Star className="w-5 h-5 text-brand-action" />,
    'default': <Check className="w-5 h-5 text-brand-action" />,
  };
  return iconMap[amenityKey] || iconMap.default;
};


const RiadDetailPage = () => {
  const { id } = useParams();
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [riad, setRiad] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiad = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('riads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching riad:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch riad details.",
        });
        setRiad(null);
      } else {
        setRiad(data);
      }
      setLoading(false);
    };

    if (id) {
      fetchRiad();
    }
  }, [id, toast]);

  const handleBackClick = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-16 h-16 text-brand-action animate-spin" />
      </div>
    );
  }

  if (!riad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-ink/5">
        <h1 className="text-3xl font-bold text-brand-ink">{t('riadNotFound')}</h1>
      </div>
    );
  }

  const name = getTranslated(riad.name_tr, currentLanguage, riad.name);
  const propertyType = getTranslated(riad.property_type, currentLanguage);
  const description = getTranslated(riad.description_tr, currentLanguage, riad.description);
  const area = getTranslated(riad.area_tr, currentLanguage, riad.area);

  const heroImage = riad.image_urls && riad.image_urls.length > 0 ? riad.image_urls[0] : "https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png";
  const galleryImages = riad.image_urls?.slice(1, 5) || [];
  const pageDescription = `${description?.substring(0, 160) || `Discover ${name}, a beautiful Riad in Marrakech.`}...`;

  return (
    <>
      <Helmet>
        <title>{`${name} · MGH`}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={`${name} · MGH`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={heroImage} />
      </Helmet>

      <div className="bg-white pt-24 pb-12">
        <div className="content-wrapper">
            <Button
              variant="ghost"
              onClick={handleBackClick}
              className="mb-8 flex items-center space-x-2 text-brand-ink/80 hover:text-brand-ink -ml-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToListings')}</span>
            </Button>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-8 h-[50vh] max-h-[500px]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-none col-span-2 row-span-2"
              >
                <img
                  src={heroImage}
                  alt={`${name} - Main View`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {galleryImages.map((imgSrc, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
                  className="relative overflow-hidden rounded-none"
                >
                  <img
                    src={imgSrc}
                    alt={`${name} - Image ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16">
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    {riad.google_notes && (
                      <div className="flex items-center space-x-1 text-sm text-brand-ink/80">
                          <Star className="w-4 h-4 text-brand-action fill-current" />
                          <span className="font-semibold text-brand-ink">{riad.google_notes}</span>
                          <span className="text-brand-ink/80">({riad.google_reviews_count} {t('reviews')})</span>
                      </div>
                    )}
                  </div>

                  <h1 className="text-4xl font-bold text-brand-ink mb-1">
                    {name}
                  </h1>
                  {propertyType && (
                    <p className="text-xl text-brand-ink/70 font-light mb-4">{propertyType}</p>
                  )}
                   <div className="flex items-center space-x-2 text-brand-ink/80 mb-6">
                        <MapPin className="w-5 h-5 text-brand-ink/80" />
                        <span>{riad.address || area}</span>
                    </div>

                  {description && <p className="text-lg text-brand-ink/80 mb-8 max-w-prose">{description}</p>}

                  {riad.amenities && riad.amenities.length > 0 && (
                    <div className="border-t border-[#E5E8EB] pt-8 mb-8">
                      <h2 className="text-2xl font-bold text-brand-ink mb-4">{t('amenities')}</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {riad.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-3 capitalize">
                            <AmenityIcon amenity={amenity} />
                            <span className="text-brand-ink">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {riad.collections && riad.collections.length > 0 && (
                    <div className="border-t border-[#E5E8EB] pt-8">
                      <h2 className="text-2xl font-bold text-brand-ink mb-4">{t('partOfCollections')}</h2>
                      <div className="flex flex-wrap gap-2">
                        {riad.collections.map((collection, index) => (
                          <Link to={`/collection/${collection}`} key={index}>
                            <Badge variant="secondary" className="capitalize cursor-pointer hover:bg-brand-action hover:text-white transition-colors duration-200">
                              {collection}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                </motion.div>
              </div>

              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="sticky top-28"
                >
                  <Card className="border-[#E5E8EB]">
                    <CardContent className="p-6">
                      {riad.sblink && (
                        <a href={riad.sblink} target="_blank" rel="noopener noreferrer" className="w-full">
                           <Button className="w-full text-lg h-14 btn-action font-bold mb-4">
                              {t('reserveNow')}
                              <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </a>
                      )}

                      <div className="space-y-3 text-sm text-center border-b border-[#E5E8EB] pb-4 mb-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Shield className="w-4 h-4 text-brand-action"/>
                          <span className="text-brand-ink/80">{t('licensedAndSecure')}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold text-brand-ink text-center mb-2">{t('contactInformation')}</h3>
                        {riad.phone && (
                          <a href={`tel:${riad.phone}`} className="flex items-center space-x-3 text-brand-ink/80 hover:text-brand-action">
                            <Phone className="w-4 h-4" />
                            <span>{riad.phone}</span>
                          </a>
                        )}
                        {riad.email && (
                          <a href={`mailto:${riad.email}`} className="flex items-center space-x-3 text-brand-ink/80 hover:text-brand-action">
                            <Mail className="w-4 h-4" />
                            <span>{riad.email}</span>
                          </a>
                        )}
                        {riad.website && (
                          <a href={riad.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-brand-ink/80 hover:text-brand-action">
                            <Globe className="w-4 h-4" />
                            <span>{t('visitWebsite')}</span>
                          </a>
                        )}
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default RiadDetailPage;