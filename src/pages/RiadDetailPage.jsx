import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ExternalLink, Star, MapPin, Check, Shield, Loader2, Wifi, Waves,
  Utensils, Sun, Phone, Mail, Globe, MessageCircle, Share2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { getTranslated } from '@/lib/utils';

/* ---------- Icons for amenities ---------- */
const AmenityIcon = ({ amenity }) => {
  const amenityKey = String(amenity || '').toLowerCase();
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

/* ---------- Leaflet marker icon ---------- */
const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const RiadDetailPage = () => {
  const { id } = useParams();
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [riad, setRiad] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- Fetch property ---------- */
  useEffect(() => {
    const fetchRiad = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('mgh_properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching riad:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch riad details.',
        });
        setRiad(null);
      } else {
        setRiad(data);
      }
      setLoading(false);
    };

    if (id) fetchRiad();
  }, [id, toast]);

  const handleBackClick = () => window.history.back();

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

  /* ---------- Derived fields & content ---------- */
  const name = getTranslated(riad.name_tr, currentLanguage, riad.name);
  const propertyType = getTranslated(riad.property_type, currentLanguage);
  const description = getTranslated(riad.description_tr, currentLanguage, riad.description);
  const area = getTranslated(riad.area_tr, currentLanguage, riad.area);

  const heroImage =
    riad.image_urls && riad.image_urls.length > 0
      ? riad.image_urls[0]
      : 'https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png';

  const galleryImages = riad.image_urls?.slice(1, 5) || [];
  const pageDescription = `${description?.substring(0, 160) || `Discover ${name}, a beautiful Riad in Marrakech.`}...`;

  const center = (riad.lat && riad.lng) ? [riad.lat, riad.lng] : null;

  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: `${name} · MGH`,
        text: t('shareText', { name }),
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

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
          {/* Back */}
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="mb-8 flex items-center space-x-2 text-brand-ink/80 hover:text-brand-ink -ml-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToListings')}</span>
          </Button>

          {/* Content + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16">
            <div className="lg:col-span-2">
          {/* Gallery */}
          <div className="grid  gap-2 mb-8 h-[50vh] max-h-[500px]">
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
            {/* Main */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Ratings */}
                <div className="flex items-center space-x-3 mb-2">
                  {riad.google_rating && (
                    <div className="flex items-center space-x-1 text-sm text-brand-ink/80">
                      <Star className="w-4 h-4 text-brand-action fill-current" />
                      <span className="font-semibold text-brand-ink">{riad.google_rating}</span>
                      <span className="text-brand-ink/80">
                        ({riad.google_reviews_count} {t('reviews')})
                      </span>
                    </div>
                  )}
                </div>

                {/* Title + Type */}
                <h1 className="text-4xl font-bold text-brand-ink mb-1">{name}</h1>
                {propertyType && (
                  <p className="text-xl text-brand-ink/70 font-light mb-4">{propertyType}</p>
                )}

                {/* Location */}
                <div className="flex items-center space-x-2 text-brand-ink/80 mb-6">
                  <MapPin className="w-5 h-5 text-brand-ink/80" />
                  <span>{riad.address || area}</span>
                </div>

                {/* Description */}
                {description && (
                  <p className="text-lg text-brand-ink/80 mb-8 max-w-prose">{description}</p>
                )}

                {/* Amenities */}
                {Array.isArray(riad.amenities) && riad.amenities.length > 0 && (
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

                {/* Collections */}
                {Array.isArray(riad.collections) && riad.collections.length > 0 && (
                  <div className="border-t border-[#E5E8EB] pt-8">
                    <h2 className="text-2xl font-bold text-brand-ink mb-4">{t('partOfCollections')}</h2>
                    <div className="flex flex-wrap gap-2">
                      {riad.collections.map((collection, index) => (
                        <Link to={`/collection/${collection}`} key={index}>
                          <Badge
                            variant="secondary"
                            className="capitalize cursor-pointer hover:bg-brand-action hover:text-white transition-colors duration-200"
                          >
                            {collection}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            </div>


            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-28"
              >
                <Card className="border-[#E5E8EB] overflow-hidden">
                  <CardContent className="p-6 space-y-5">
                    {/* Primary CTA */}
                    {riad.sblink && (
                      <a href={riad.sblink} target="_blank" rel="noopener noreferrer" className="block">
                        <Button className="w-full text-lg h-14 btn-action font-bold">
                          {t('reserveNow')}
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </a>
                    )}

                    {/* Trust + ratings */}
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-center gap-2 text-emerald-700">
                        <Shield className="w-4 h-4" />
                        <span className="font-semibold">{t('licensedAndSecure')}</span>
                      </div>
                      {riad.google_rating && (
                        <div className="flex items-center justify-center gap-1 text-brand-ink/80">
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                          <span className="font-semibold text-brand-ink">{riad.google_rating}</span>
                          <span className="text-brand-ink/70">
                            ({riad.google_reviews_count} {t('reviews')})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick info badges */}
                    <div className="flex flex-wrap gap-2">
                      {(riad.address || area) && (
                        <Badge variant="secondary" className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {riad.address || area}
                        </Badge>
                      )}
                      {Array.isArray(riad.amenities) &&
                        riad.amenities.slice(0, 4).map((a) => (
                          <Badge key={a} variant="outline" className="text-xs capitalize">
                            {a}
                          </Badge>
                        ))}
                    </div>

                    {/* Contact + actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={share}>
                        <Share2 className="mr-2 w-4 h-4" />
                        {t('share')}
                      </Button>

                      {riad.phone && (
                        <a href={`tel:${riad.phone}`} className="contents">
                          <Button variant="outline">
                            <Phone className="mr-2 w-4 h-4" />
                            {t('call')}
                          </Button>
                        </a>
                      )}

                      {riad.whatsapp && (
                        <a
                          href={`https://wa.me/${riad.whatsapp}?text=${encodeURIComponent(
                            t('whatsappHello', { name })
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="col-span-2"
                        >
                          <Button variant="secondary" className="w-full">
                            <MessageCircle className="mr-2 w-4 h-4" />
                            WhatsApp
                          </Button>
                        </a>
                      )}

                      {riad.email && (
                        <a
                          href={`mailto:${riad.email}`}
                          className="col-span-2 inline-flex items-center justify-center text-sm text-brand-ink/80 hover:text-brand-action"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {riad.email}
                        </a>
                      )}

                      {riad.website && (
                        <a
                          href={riad.website}
                          target="_blank"
                          rel="noreferrer"
                          className="col-span-2 inline-flex items-center justify-center text-sm text-brand-ink/80 hover:text-brand-action"
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          {t('visitWebsite')}
                        </a>
                      )}
                    </div>

                    {/* Mini map */}
                    {center && (
                      <div className="rounded-md border overflow-hidden">
                        <div className="h-56">
                          <MapContainer
                            center={center}
                            zoom={16}
                            scrollWheelZoom={false}
                            className="h-full w-full"
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={center} icon={markerIcon}>
                              <Popup>{name}</Popup>
                            </Marker>
                          </MapContainer>
                        </div>
                        <div className="p-3 border-t text-center">
                          <Link
                            to={`/quartiers/${riad.quartier_slug || 'medina'}?focus=${riad.slug || riad.id}`}
                            className="text-sm font-medium hover:underline inline-flex items-center"
                          >
                            {t('viewOnMap')}
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </Link>
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
                      </div>
                    )}
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
