import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslated } from '@/lib/utils';
import { getAllNeighborhoodsByCity, NEIGHBORHOOD_CITIES, normalizeNeighborhoodCityId } from '@/lib/neighborhoods';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import TwoFingerMap from '@/components/ui/TwoFingerMap';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useSearchParams } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Loader2, Search, SlidersHorizontal, Clock, Info, Map as MapIcon, ExternalLink, MapPin, ChevronDown } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import gsap from 'gsap';

const leafletCdn = import.meta.env.VITE_LEAFLET_CDN_BASE || 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1';

const customIcon = new L.Icon({
  iconUrl: `${leafletCdn}/images/marker-icon.png`,
  iconRetinaUrl: `${leafletCdn}/images/marker-icon-2x.png`,
  shadowUrl: `${leafletCdn}/images/marker-shadow.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const gmapsUrl = (q) => {
  if (q.lat && q.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${q.lat},${q.lng}`;
  }
  const query = encodeURIComponent(`${q.name || q.label || ''}, Marrakech, Maroc`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

const CITY_MAP_CENTERS = {
  marrakech: [31.6258, -7.9935],
  essaouira: [31.5085, -9.7595],
  ouarzazate: [30.9335, -6.9370],
};

const MedinaQuartiersPage = () => {
  const { t, currentLanguage } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const cityParam = searchParams.get('city') || '';
  const selectedCity = normalizeNeighborhoodCityId(cityParam);

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
  const headerRef = useRef(null);
  const cardsRef = useRef(null);

  const categories = ['souks', 'monuments', 'museums', 'restaurants', 'artisans'];
  const ambiances = ['elegant', 'historic', 'authentic'];

  const cityOptions = useMemo(
    () => NEIGHBORHOOD_CITIES.map((city) => ({
      ...city,
      label: t(city.labelKey) || city.fallback,
    })),
    [t, currentLanguage]
  );

  const updateCityParam = (cityId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (cityId) {
      nextParams.set('city', cityId);
    } else {
      nextParams.delete('city');
    }
    setSearchParams(nextParams);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchQuartiers = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAllNeighborhoodsByCity(selectedCity);
        if (!isMounted) return;
        setQuartiers(data);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching quartiers:', error);
        setError(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchQuartiers();

    return () => { isMounted = false; };
  }, [selectedCity]);

  useEffect(() => {
    setActiveQuartier(null);
  }, [selectedCity]);

  useEffect(() => {
    if (loading || quartiers.length === 0 || !window.location.hash) return;
    const target = decodeURIComponent(window.location.hash.slice(1));
    const el = document.getElementById(target);
    if (!el) return;
    const timer = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => clearTimeout(timer);
  }, [loading, quartiers.length]);

  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current.children, { opacity: 0, y: 20, duration: 0.5, stagger: 0.1 });
    }
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
        const nameMatch = searchTerm
          ? q.name?.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        const proximityMatch =
          q.walking_minutes_from_jemaa != null
            ? q.walking_minutes_from_jemaa <= proximity[0]
            : true;
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
    updateCityParam(null);
  };

  const pageTitle = `${t('medinaQuartiersTitle')} · MGH`;

  const mapCenter = useMemo(() => {
    if (activeQuartier?.lat && activeQuartier?.lng) {
      return [activeQuartier.lat, activeQuartier.lng];
    }
    return CITY_MAP_CENTERS[selectedCity] || CITY_MAP_CENTERS.marrakech;
  }, [activeQuartier, selectedCity]);

  const breadcrumbItems = [
    { label: t('home'), href: '/' },
    { label: t('quartiersMedina') },
  ];

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
            <div ref={headerRef}>
              <h1 className="h1-style mb-2 text-center">
                {t('medinaQuartiersTitle')}
              </h1>
              <p className="body-text max-w-3xl mx-auto text-center">
                {t('medinaQuartiersSubtitle')}
              </p>
            </div>
          </div>
        </header>

        {/* Filters (sticky) */}
        <div className="sticky top-20 z-20 bg-white/80 backdrop-blur-sm py-4 shadow-sm">
          <div className="content-wrapper">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative lg:col-span-2">
                <Input
                  type="text"
                  placeholder={t('searchByName')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 w-full"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <label htmlFor="quartiers-city-filter" className="sr-only">
                  {t('filterByCity')}
                </label>
                <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="quartiers-city-filter"
                  value={selectedCity || ''}
                  onChange={(e) => updateCityParam(e.target.value || null)}
                  className="h-12 w-full appearance-none rounded-md border border-input bg-background pl-10 pr-10 text-sm text-brand-ink shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">{t('allCities')}</option>
                  {cityOptions.map((city) => (
                    <option key={city.id} value={city.id}>{city.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <div className="lg:hidden h-[45vh] overflow-hidden mb-6 shadow-lg border">
                  <TwoFingerMap
                    center={mapCenter}
                    zoom={activeQuartier ? 16 : 14}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ChangeView
                      center={mapCenter}
                      zoom={activeQuartier ? 16 : 14}
                    />
                    {filteredQuartiers.filter((q) => q.lat && q.lng).map((quartier) => (
                      <Marker
                        key={quartier.id}
                        position={[quartier.lat, quartier.lng]}
                        icon={customIcon}
                        eventHandlers={{ click: () => handleMarkerClick(quartier) }}
                      >
                        <Popup>
                          <div className="font-montserrat space-y-1">
                            <strong className="block text-brand-ink">{quartier.name}</strong>
                            <a
                              href={gmapsUrl(quartier)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-brand-action hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {t('viewOnGoogleMaps') || 'Voir sur Google Maps'}
                            </a>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </TwoFingerMap>
                </div>
              )}

              {/* Cards */}
              <div ref={cardsRef} className="space-y-6">
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

                {filteredQuartiers.map((quartier) => (
                  <div
                    id={quartier.id}
                    key={quartier.id}
                    ref={(el) => (quartierRefs.current[quartier.slug] = el)}
                    onMouseEnter={() => handleCardHover(quartier)}
                    className={`transition-all duration-300 overflow-hidden ${
                      activeQuartier?.id === quartier.id
                        ? 'ring-2 ring-brand-action shadow-2xl'
                        : 'shadow-lg bg-white'
                    }`}
                  >
                    <Card className="flex flex-col md:flex-row w-full">
                      <div className="md:w-1/3 xl:w-1/4 bg-brand-beige/50">
                        {quartier.images?.[0] ? (
                          <OptimizedImage
                            src={quartier.images[0]}
                            alt={quartier.name}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 md:h-full flex items-center justify-center text-brand-ink/30 font-display italic text-lg">
                            {quartier.name?.[0] || 'Q'}
                          </div>
                        )}
                      </div>

                      <div className="md:w-2/3 xl:w-3/4 flex flex-col">
                        <CardContent className="p-6 flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                              <h3 className="h3-style !text-xl font-bold min-w-0 break-words">{quartier.name}</h3>
                              {quartier.walking_minutes_from_jemaa != null && (
                                <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
                                  <Clock className="h-3 w-3" />
                                  {quartier.walking_minutes_from_jemaa} min
                                </Badge>
                              )}
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

                          <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:flex-wrap">
                            <Button asChild className="w-full sm:w-auto sm:flex-1 h-auto min-h-10 py-2 whitespace-normal leading-tight text-center">
                              <Link to={`/quartiers/${quartier.slug}`}>
                                <Info className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>{t('moreDetails')}</span>
                              </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full sm:w-auto sm:flex-1 h-auto min-h-10 py-2 whitespace-normal leading-tight text-center">
                              <a href={gmapsUrl(quartier)} target="_blank" rel="noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>{t('viewOnGoogleMaps') || 'Voir sur Google Maps'}</span>
                              </a>
                            </Button>
                            <Button asChild variant="secondary" className="w-full sm:w-auto sm:flex-1 h-auto min-h-10 py-2 whitespace-normal leading-tight text-center">
                              <Link to={`/all-riads?city=${quartier.city_id || 'marrakech'}&quartier=${quartier.slug}`}>
                                <span>{t('viewGuestHousesInThisDistrict')}</span>
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky map (right) */}
            <aside className="hidden lg:block lg:col-span-5">
              <div className="sticky top-28 h-[calc(100vh-8rem)] overflow-hidden shadow-lg border">
                <TwoFingerMap
                  center={mapCenter}
                  zoom={activeQuartier ? 16 : 14}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ChangeView
                    center={mapCenter}
                    zoom={activeQuartier ? 16 : 14}
                  />
                  {filteredQuartiers.filter((q) => q.lat && q.lng).map((quartier) => (
                    <Marker
                      key={quartier.id}
                      position={[quartier.lat, quartier.lng]}
                      icon={customIcon}
                      eventHandlers={{ click: () => handleMarkerClick(quartier) }}
                    >
                       <Popup>
                         <div className="font-montserrat space-y-1">
                           <strong className="block text-brand-ink">{quartier.name}</strong>
                           <a
                             href={gmapsUrl(quartier)}
                             target="_blank"
                             rel="noreferrer"
                             className="inline-flex items-center gap-1 text-xs text-brand-action hover:underline"
                           >
                             <ExternalLink className="h-3 w-3" />
                             {t('viewOnGoogleMaps') || 'Voir sur Google Maps'}
                           </a>
                         </div>
                       </Popup>
                    </Marker>
                  ))}
                </TwoFingerMap>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedinaQuartiersPage;
