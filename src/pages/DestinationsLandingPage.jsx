import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslated } from '@/lib/utils';
import OptimizedImage from '@/components/ui/OptimizedImage';
import gsap from 'gsap';

const DestinationsLandingPage = () => {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t, currentLanguage } = useLanguage();
    const gridRef = useRef(null);

    useEffect(() => {
        const fetchDestinations = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('mgh_destinations')
                .select('name_tr, slug, subtitle_tr, hero_image_urls')
                .eq('is_published', true)
                .order('sort_order');

            if (error) {
                console.error("Error fetching destinations:", error);
            } else {
                setDestinations(data.map(dest => ({
                    ...dest,
                    name: getTranslated(dest.name_tr, currentLanguage),
                    subtitle: getTranslated(dest.subtitle_tr, currentLanguage),
                })));
            }
            setLoading(false);
        };
        fetchDestinations();
    }, [currentLanguage]);

    useEffect(() => {
        if (loading || !gridRef.current || !gridRef.current.children.length) return;
        gsap.from(gridRef.current.children, { opacity: 0, y: 20, duration: 0.5, stagger: 0.1 });
    }, [loading]);

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-12 h-12 text-brand-action animate-spin" />
            </div>
        );
    }
    
    const pageTitle = t('exploreOurDestinations');
    const pageDescription = t('discoverTheSoulOfMorocco');

    return (
        <>
            <Helmet>
                <title>{`${pageTitle} · MGH`}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={`${import.meta.env.VITE_APP_BASE_URL || 'https://amh.ma'}/destinations`} />
                <meta property="og:title" content={`${pageTitle} · MGH`} />
                <meta property="og:description" content={pageDescription} />
            </Helmet>
            <div className="bg-white">
                <section className="pt-32 pb-16 text-center bg-brand-ink/5">
                    <div className="content-wrapper">
                        <h1 className="h1-style text-brand-ink">{pageTitle}</h1>
                        <p className="body-text text-lg mt-4 max-w-3xl mx-auto">
                           {pageDescription}
                        </p>
                    </div>
                </section>

                <section className="section-padding">
                    <div className="content-wrapper">
                        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {destinations.map((dest) => (
                                <div key={dest.slug}>
                                    <Link to={`/destinations/${dest.slug}`} className="block group">
                                        <div className="relative overflow-hidden h-96">
                                            {dest.hero_image_urls && dest.hero_image_urls[0] && (
                                                <OptimizedImage 
                                                    src={dest.hero_image_urls[0]}
                                                    alt={`View of ${dest.name}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            <div className="absolute bottom-0 left-0 p-6 text-white">
                                                <h2 className="text-3xl font-bold font-display">{dest.name}</h2>
                                                <p className="mt-1 text-white/90">{dest.subtitle}</p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default DestinationsLandingPage;
