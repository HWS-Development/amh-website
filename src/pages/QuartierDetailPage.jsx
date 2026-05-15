import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import { getTranslated } from '@/lib/utils';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
    Loader2, ArrowLeft, ExternalLink, MapPin, Clock, Ticket, Globe,
    Building, Landmark, School, Church as Mosque, Palette, Utensils, Brush, Gem, ShoppingCart, Home, TreePine, Coffee, ShoppingBag, Hammer, Church as Synagogue, Theater as Museum
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/Breadcrumb';
import NotFoundPage from '@/pages/NotFoundPage';
import OptimizedImage from '@/components/ui/OptimizedImage';
import gsap from 'gsap';

const poiIcons = {
    museum: Museum, monument: Landmark, souk: ShoppingBag, restaurant: Utensils,
    cafe: Coffee, artisan: Brush, religious: Mosque, market: ShoppingCart, other: MapPin, default: MapPin
};

const leafletCdn = import.meta.env.VITE_LEAFLET_CDN_BASE || 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1';

const customIcon = new L.Icon({
    iconUrl: `${leafletCdn}/images/marker-icon.png`,
    iconRetinaUrl: `${leafletCdn}/images/marker-icon-2x.png`,
    shadowUrl: `${leafletCdn}/images/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const poiIcon = (type) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${type === 'quartier' ? 'red' : 'blue'}.png`,
    shadowUrl: `${leafletCdn}/images/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const QuartierDetailPage = () => {
    const { slug } = useParams();
    const { t, currentLanguage } = useLanguage();
    const [quartier, setQuartier] = useState(null);
    const [pois, setPois] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const headerRef = useRef(null);

    useEffect(() => {
        const fetchQuartierData = async () => {
            setLoading(true);
            setError(null);
            const { data: quartierData, error: quartierError } = await supabase
                .from('amh_quartiers')
                .select('*')
                .eq('slug', slug)
                .single();

            if (quartierError || !quartierData) {
                console.error('Error fetching quartier:', quartierError);
                setError(quartierError || new Error('Quartier not found'));
                setLoading(false);
                return;
            }

            const { data: poisData, error: poisError } = await supabase
                .from('amh_pois')
                .select('*')
                .eq('quartier_id', quartierData.id)
                .order('display_order');
            
            if (poisError) {
                console.error('Error fetching POIs:', poisError);
            }

            setQuartier(quartierData);
            setPois(poisData || []);
            setLoading(false);
        };

        fetchQuartierData();
    }, [slug]);

    useEffect(() => {
        if (loading || !headerRef.current) return;
        gsap.from(headerRef.current.children, { opacity: 0, y: 20, duration: 0.5, stagger: 0.1 });
    }, [loading]);

    const translatedQuartier = useMemo(() => {
        if (!quartier) return null;
        return {
            ...quartier,
            name: getTranslated(quartier.name_tr, currentLanguage),
            short_desc: getTranslated(quartier.short_desc_tr, currentLanguage),
            long_desc: getTranslated(quartier.long_desc_tr, currentLanguage),
            seo_title: getTranslated(quartier.seo_title_tr, currentLanguage),
            seo_desc: getTranslated(quartier.seo_desc_tr, currentLanguage)
        };
    }, [quartier, currentLanguage]);

    const translatedPois = useMemo(() => {
        return pois.map(poi => ({
            ...poi,
            name: getTranslated(poi.name_tr, currentLanguage),
            short_desc: getTranslated(poi.short_desc_tr, currentLanguage),
            long_desc: getTranslated(poi.long_desc_tr, currentLanguage),
        }));
    }, [pois, currentLanguage]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-16 h-16 text-brand-action animate-spin" /></div>;
    }

    if (error || !translatedQuartier) {
        return <NotFoundPage />;
    }

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('quartiersMedina'), href: '/quartiers-medina' },
        { label: translatedQuartier.name },
    ];
    
    const pageTitle = `${translatedQuartier.name} · ${t('quartiersMedina')}`;
    const seoDesc = translatedQuartier.seo_desc || translatedQuartier.short_desc;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={seoDesc} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={seoDesc} />
                {translatedQuartier.images?.[0] && <meta property="og:image" content={translatedQuartier.images[0]} />}
            </Helmet>

            <div className="pt-20 bg-white">
                <div className="section-padding content-wrapper">
                    <div className="pb-8">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-12">
                            <header ref={headerRef}>
                                <h1 className="h1-style mb-2">
                                    {translatedQuartier.name}
                                </h1>
                                <p className="body-text max-w-2xl">
                                    {translatedQuartier.short_desc}
                                </p>
                            </header>

                            {/* Gallery */}
                            {translatedQuartier.images && translatedQuartier.images.length > 0 && (
                                <section>
                                    <h2 className="h2-style mb-6">{t('gallery')}</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <OptimizedImage src={translatedQuartier.images[0]} alt={translatedQuartier.name} className="w-full h-auto object-cover aspect-video"/>
                                        </div>
                                        {translatedQuartier.images.slice(1, 5).map((img, idx) => (
                                            <div key={idx} className="col-span-1">
                                                 <OptimizedImage src={img} alt={`${translatedQuartier.name} ${idx + 2}`} className="w-full h-auto object-cover aspect-square"/>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                            
                            {/* Description */}
                            <section>
                                <div className="prose max-w-none text-brand-ink/90" dangerouslySetInnerHTML={{ __html: translatedQuartier.long_desc }} />
                            </section>

                            {/* Points of Interest */}
                            {translatedPois.length > 0 && (
                                <section>
                                    <h2 className="h2-style mb-6">{t('pointsOfInterest')}</h2>
                                    <div className="space-y-8">
                                        {translatedPois.map(poi => {
                                            const PoiIcon = poiIcons[poi.type] || poiIcons.default;
                                            return (
                                                <div key={poi.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border">
                                                    <div className="md:col-span-1">
                                                        {poi.images && poi.images.length > 0 && (
                                                          <OptimizedImage src={poi.images[0]} alt={poi.name} className="w-full h-40 object-cover" />
                                                        )}
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <h3 className="font-bold text-lg flex items-center gap-2 mb-2"><PoiIcon className="h-5 w-5 text-brand-action" /> {poi.name}</h3>
                                                        <p className="text-sm text-brand-ink/80 mb-4">{poi.long_desc}</p>
                                                        <div className="text-xs space-y-2 text-brand-ink/70">
                                                          {poi.address && <p className="flex items-start gap-2"><MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" /> <span>{poi.address}</span></p>}
                                                          {poi.hours && <p className="flex items-center gap-2"><Clock className="h-4 w-4 flex-shrink-0" /> <span>{getTranslated(poi.hours, currentLanguage, '')}</span></p>}
                                                          {poi.price && <p className="flex items-center gap-2"><Ticket className="h-4 w-4 flex-shrink-0" /> <span>{getTranslated(poi.price, currentLanguage, '')}</span></p>}
                                                          {poi.website && <a href={poi.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-action hover:underline"><Globe className="h-4 w-4 flex-shrink-0" /> <span>{t('visitWebsite')}</span></a>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sticky Sidebar */}
                        <aside className="lg:col-span-1">
                            <div className="sticky top-28 space-y-6">
                                <div className="h-64 lg:h-80 w-full overflow-hidden shadow-md">
                                    <MapContainer center={[translatedQuartier.lat, translatedQuartier.lng]} zoom={15} scrollWheelZoom={false} className="h-full w-full">
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker position={[translatedQuartier.lat, translatedQuartier.lng]} icon={poiIcon('red')}>
                                            <Popup>{translatedQuartier.name}</Popup>
                                        </Marker>
                                        {translatedPois.map(poi => poi.lat && poi.lng && (
                                            <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={poiIcon('blue')}>
                                                <Popup>{poi.name}</Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                </div>
                                <div className="space-y-2">
                                     <Button asChild className="w-full btn-action">
                                        <Link to={`/all-riads?quartier=${slug}`}>{t('viewGuestHousesInThisDistrict')}</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link to="/quartiers-medina">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            {t('backToAllQuartiers')}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
};

export default QuartierDetailPage;
