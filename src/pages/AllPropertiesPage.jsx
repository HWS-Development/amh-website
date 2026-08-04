import React, { useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RiadCard from '@/components/RiadCard';
import { useToast } from '@/components/ui/use-toast';
import { usePartnerHotels } from '@/lib/partnerHotelsApi';
import { usePartnerCatalogs } from '@/lib/partnerCatalogsApi';
import { mapPartnerHotelToRiad } from '@/lib/partnerHotelTransform';
import gsap from 'gsap';

const AllPropertiesPage = () => {
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const gridRef = useRef(null);
  const { data: hotelsData, isLoading, error } = usePartnerHotels();
  const { data: partnerCatalogs } = usePartnerCatalogs();
  const loading = isLoading;
  const riads = useMemo(
    () => (hotelsData || []).map((hotel) => mapPartnerHotelToRiad(hotel, currentLanguage, partnerCatalogs)),
    [hotelsData, currentLanguage, partnerCatalogs]
  );

  useEffect(() => {
    if (!error) return;
    console.error('Error fetching riads:', error);
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Could not fetch the list of riads.',
    });
  }, [error, toast]);

  useEffect(() => {
    if (loading || !gridRef.current || !gridRef.current.children.length) return;
    gsap.from(gridRef.current.children, { opacity: 0, y: 20, duration: 0.5, stagger: 0.05 });
  }, [loading]);

  return (
    <>
      <Helmet>
        <title>{t('allProperties')} · MGH</title>
        <meta name="description" content={t('exploreAllOurCertifiedRiads')} />
      </Helmet>
      <div className="bg-white">
        <div className="content-wrapper section-padding pt-32">
          <div className="text-center mb-12">
            <h1 className="h1-style text-brand-ink">{t('allProperties')}</h1>
            <p className="body-text mt-2">
              {t('exploreAllOurCertifiedRiads')}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 text-brand-action animate-spin" />
            </div>
          ) : (
            <div ref={gridRef} className="grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {riads.map((riad) => (
                <div key={riad.id}>
                  <RiadCard riad={riad} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AllPropertiesPage;
