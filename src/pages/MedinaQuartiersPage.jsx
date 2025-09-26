import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import { getTranslated } from '@/lib/utils';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Loader2, Search, SlidersHorizontal, Clock, Info, Map as MapIcon } from 'lucide-react';

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MedinaQuartiersPage = () => {
  const { t, currentLanguage } = useLanguage();

  const [quartiers, setQuartiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [proximity, setProximity] = useState([30]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAmbiance, setSelectedAmbiance] = useState([]);
  const [activeQuartier, setActiveQuartier] = useState(null);

  const [showMapMobile, setShowMapMobile] = useState(false);

  const quartierRefs = useRef({});

  const categories = ['souks', 'monuments', 'museums', 'restaurants', 'artisans'];
  const ambiances = ['elegant', 'historic', 'authentic'];

  useEffect(() => {
    const fetchQuartiers = async () => {
      setLoading(true);
      let { data, error } = await supabase
        .from('amh_quartiers')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching quartiers:', error);
        setError(error);
      } else {
        setQuartiers(data);
      }
      setLoading(false);
    };

    fetchQuartiers();
  }, []);

  const handleMarkerClick = (quartier) => {
    setActiveQuartier(quartier);
    quartierRefs.current[quartier.slug]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const handleCardHover = (quartier) => {
    setActiveQuartier(quartier);
  };

  const filteredQuartiers = useMemo(() => {
    return quartiers
      .map((q) => ({
        ...q,
        name: getTranslated(q.name_tr, currentLanguage),
        short_desc: getTranslated(q.short_desc_tr, currentLanguage),
        seo_title: getTranslated(q.seo_title_tr, currentLanguage),
        seo_desc: getTranslated(q.seo_desc_tr, currentLanguage),
      }))
      .filter((q) => {
        const nameMatch = q.name.toLowerCase().includes(searchTerm.toLowerCase());
        const proximityMatch = q.walking_minutes_from_jemaa <= proximity[0];
        const categoryMatch =
          selectedCategories.length === 0 ||
          selectedCategories.some((cat) => q.category_tags?.includes(cat));
        const ambianceMatch =
          selectedAmbiance.length === 0 ||
          selectedAmbiance.some((amb) => q.ambiance_tags?.includes(amb));
        return nameMatch && proximityMatch && categoryMatch && ambianceMatch;
      });
  }, [quartiers, searchTerm, proximity, selectedCategories, selectedAmbiance, currentLanguage]);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleAmbianceChange = (ambiance) => {
    setSelectedAmbiance((prev) =>
      prev.includes(ambiance) ? prev.filter((a) => a !== ambiance) : [...prev, ambiance]
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setProximity([30]);
    setSelectedCategories([]);
    setSelectedAmbiance([]);
  };

  const pageTitle = `${t('medinaQuartiersTitle')} · MGH`;

  const breadcrumbItems = [
    { label: t('home'), href: '/' },
    { label: t('quartiersMedina') },
  ];

  // default map center (Jemaa el-Fna vicinity)
  const DEFAULT_CENTER = [31.6258, -7.9935];

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={t('medinaQuartiersSubtitle')} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={t('medinaQuartiersSubtitle')} />
      </Helmet>

      <div className="pt-20 bg-white">
        {/* Page header */}
        <header className="py-8 bg-brand-ink/5">
          <div className="content-wrapper">
            <div className="pb-4">
              <Breadcrumb items={breadcrumbItems} />
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h1-style mb-2 text-center"
            >
              {t('medinaQuartiersTitle')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="body-text max-w-3xl mx-auto text-center"
            >
              {t('medinaQuartiersSubtitle')}
            </motion.p>
          </div>
        </header>

        {/* Filters (sticky) */}
        <div className="sticky top-20 z-20 bg-white/80 backdrop-blur-sm py-4 shadow-sm">
          <div className="content-wrapper">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative md:col-span-2 lg:col-span-2">
                <Input
                  type="text"
                  placeholder={t('searchByName')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 w-full"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 w-full md:col-span-2 lg:col-span-2 justify-start font-normal"
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    {t('filterAndSearch')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-screen max-w-sm sm:max-w-md lg:max-w-lg p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="font-semibold">{t('proximity')}</label>
                      <div className="flex items-center space-x-4 mt-2">
                        <Slider value={proximity} onValueChange={setProximity} max={30} step={1} />
                        <span className="text-sm font-bold w-32 text-right">
                          {proximity[0]} {t('walkingMinutesFromJemaa')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold">{t('categories')}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {categories.map((cat) => (
                          <div key={cat} className="flex items-center space-x-2">
                            <Checkbox
                              id={`cat-${cat}`}
                              checked={selectedCategories.includes(cat)}
                              onCheckedChange={() => handleCategoryChange(cat)}
                            />
                            <label htmlFor={`cat-${cat}`} className="text-sm capitalize">
                              {t(cat)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold">{t('ambiance')}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {ambiances.map((amb) => (
                          <div key={amb} className="flex items-center space-x-2">
                            <Checkbox
                              id={`amb-${amb}`}
                              checked={selectedAmbiance.includes(amb)}
                              onCheckedChange={() => handleAmbianceChange(amb)}
                            />
                            <label htmlFor={`amb-${amb}`} className="text-sm capitalize">
                              {t(amb)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" onClick={resetFilters}>
                        {t('resetFilters')}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Mobile: map toggle */}
            <div className="mt-3 lg:hidden">
              <Button variant="secondary" className="w-full" onClick={() => setShowMapMobile((v) => !v)}>
                <MapIcon className="mr-2 h-4 w-4" />
                {showMapMobile ? t('hideMap') : t('showMap')}
              </Button>
            </div>
          </div>
        </div>

        {/* Content area: list + sticky map */}
        <div className="content-wrapper section-padding">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* List (left) */}
            <div className="lg:col-span-7">
              {/* Mobile inline map (collapsible) */}
              {showMapMobile && (
                <div className="lg:hidden h-[45vh] rounded-lg overflow-hidden mb-6 shadow-lg border">
                  <MapContainer
                    center={activeQuartier ? [activeQuartier.lat, activeQuartier.lng] : DEFAULT_CENTER}
                    zoom={activeQuartier ? 16 : 14}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ChangeView
                      center={activeQuartier ? [activeQuartier.lat, activeQuartier.lng] : DEFAULT_CENTER}
                      zoom={activeQuartier ? 16 : 14}
                    />
                    {filteredQuartiers.map((quartier) => (
                      <Marker
                        key={quartier.id}
                        position={[quartier.lat, quartier.lng]}
                        icon={customIcon}
                        eventHandlers={{ click: () => handleMarkerClick(quartier) }}
                      >
                        <Popup>{quartier.name}</Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              )}

              {/* Cards */}
              <div className="space-y-6">
                {loading && (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 text-brand-action animate-spin" />
                    <span className="ml-4">{t('loadingQuartiers')}</span>
                  </div>
                )}
                {error && <div className="text-red-500">{error.message}</div>}

                {!loading && !error && filteredQuartiers.length === 0 && (
                  <div className="text-center py-16">
                    <p className="font-semibold">{t('noQuartiersFound')}</p>
                  </div>
                )}

                {filteredQuartiers.map((quartier, index) => (
                  <motion.div
                    key={quartier.id}
                    ref={(el) => (quartierRefs.current[quartier.slug] = el)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    onMouseEnter={() => handleCardHover(quartier)}
                    className={`transition-all duration-300 rounded-lg overflow-hidden ${
                      activeQuartier?.id === quartier.id
                        ? 'ring-2 ring-brand-action shadow-2xl'
                        : 'shadow-lg bg-white'
                    }`}
                  >
                    <Card className="flex flex-col md:flex-row w-full">
                      <div className="md:w-1/3 xl:w-1/4">
                        <img
                          src={quartier.images[0]}
                          alt={quartier.name}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>

                      <div className="md:w-2/3 xl:w-3/4 flex flex-col">
                        <CardContent className="p-6 flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                              <h3 className="h3-style !text-xl font-bold">{quartier.name}</h3>
                              <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
                                <Clock className="h-3 w-3" />
                                {quartier.walking_minutes_from_jemaa} min
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {quartier.category_tags?.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {t(tag)}
                                </Badge>
                              ))}
                              {quartier.ambiance_tags?.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {t(tag)}
                                </Badge>
                              ))}
                            </div>

                            <p className="text-sm text-brand-ink/80">{quartier.short_desc}</p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 mt-4">
                            <Button asChild className="w-full sm:w-auto">
                              <Link to={`/quartiers/${quartier.slug}`}>
                                <Info className="mr-2 h-4 w-4" />
                                {t('moreDetails')}
                              </Link>
                            </Button>
                            <Button asChild variant="secondary" className="w-full sm:w-auto">
                              <Link to={`/all-riads?quartier=${quartier.slug}`}>
                                {t('viewGuestHousesInThisDistrict')}
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sticky map (right) */}
            <aside className="hidden lg:block lg:col-span-5">
              <div className="sticky top-28 h-[calc(100vh-8rem)] rounded-lg overflow-hidden shadow-lg border">
                <MapContainer
                  center={activeQuartier ? [activeQuartier.lat, activeQuartier.lng] : DEFAULT_CENTER}
                  zoom={activeQuartier ? 16 : 14}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ChangeView
                    center={activeQuartier ? [activeQuartier.lat, activeQuartier.lng] : DEFAULT_CENTER}
                    zoom={activeQuartier ? 16 : 14}
                  />
                  {filteredQuartiers.map((quartier) => (
                    <Marker
                      key={quartier.id}
                      position={[quartier.lat, quartier.lng]}
                      icon={customIcon}
                      eventHandlers={{ click: () => handleMarkerClick(quartier) }}
                    >
                      <Popup>{quartier.name}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedinaQuartiersPage;
