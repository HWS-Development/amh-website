import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePartnerHotels } from '@/lib/partnerHotelsApi';
import { fetchCatalog } from '@/lib/catalogs';
import { getTranslated } from '@/lib/utils';
import RiadCard from '@/components/RiadCard';
import useEmblaCarousel from 'embla-carousel-react';

gsap.registerPlugin(ScrollTrigger);

const CITY_ORDER = ['marrakech', 'essaouira', 'ouarzazate'];

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const TriangleArrow = ({ direction }) => {
  if (direction === 'left') {
    return (
      <span
        aria-hidden="true"
        className="block h-0 w-0 border-y-[20px] border-y-transparent border-r-[18px] md:border-y-[26px] md:border-r-[24px]"
        style={{ borderRightColor: '#bf673e' }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="block h-0 w-0 border-y-[20px] border-y-transparent border-l-[18px] md:border-y-[26px] md:border-l-[24px]"
      style={{ borderLeftColor: '#bf673e' }}
    />
  );
};

const CityCarousel = ({ cityName, riads }) => {
  const containerRef = useRef(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!riads.length || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.city-heading', {
        x: -20, opacity: 0, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.carousel-slide', {
        y: 24, opacity: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 85%', once: true },
      });
    }, containerRef);
    return () => ctx.revert();
  }, [riads]);

  return (
    <div ref={containerRef} className="mb-16 last:mb-0">
      <h2 className="city-heading text-2xl md:text-3xl lg:text-4xl font-bold text-brand-ink font-montserrat tracking-wider mb-8">
        {cityName}
      </h2>

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canScrollPrev}
          className="absolute left-[-2.75rem] md:left-[-3.35rem] top-1/2 -translate-y-1/2 z-10 p-2 disabled:opacity-35 disabled:pointer-events-none"
          aria-label="Previous"
        >
          <TriangleArrow direction="left" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canScrollNext}
          className="absolute right-[-2.75rem] md:right-[-3.35rem] top-1/2 -translate-y-1/2 z-10 p-2 disabled:opacity-35 disabled:pointer-events-none"
          aria-label="Next"
        >
          <TriangleArrow direction="right" />
        </button>

        {/* Carousel */}
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex -ml-5 md:-ml-6">
            {riads.map((riad) => (
              <div
                key={riad.id}
                className="carousel-slide min-w-0 shrink-0 grow-0 basis-[85%] sm:basis-1/2 lg:basis-1/3 pl-5 md:pl-6"
              >
                <RiadCard riad={riad} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CatalogueSection() {
  const { currentLanguage } = useLanguage();
  const { data: hotelsData, isLoading } = usePartnerHotels();
  const [catalogs, setCatalogs] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setCatalogLoading(true);
      try {
        const [citiesArr, neighborhoodsArr, propertyTypesArr, amenitiesArr] = await Promise.all([
          fetchCatalog('mgh_cities', currentLanguage),
          fetchCatalog('mgh_neighborhoods', currentLanguage),
          fetchCatalog('mgh_property_types', currentLanguage),
          fetchCatalog('mgh_amenities_catalog', currentLanguage),
        ]);
        if (!mounted) return;
        setCatalogs({
          cities: Object.fromEntries(citiesArr.map(c => [c.id, c.label])),
          neighborhoods: Object.fromEntries(neighborhoodsArr.map(n => [n.id, n.label])),
          propertyTypes: Object.fromEntries(propertyTypesArr.map(p => [p.id, p.label])),
          amenities: Object.fromEntries(amenitiesArr.map(a => [a.id, a.label])),
        });
      } catch (err) {
        console.error('CatalogueSection catalog error:', err);
      }
      if (mounted) setCatalogLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [currentLanguage]);

  const groupedByCity = useMemo(() => {
    if (!hotelsData || !catalogs) return {};

    const groups = {};
    hotelsData.forEach(r => {
      const cityLabel = (catalogs.cities[r.city_id] || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let slug = null;
      for (const s of CITY_ORDER) {
        if (cityLabel.includes(s)) { slug = s; break; }
      }
      if (!slug) return;

      const mapped = {
        id: r.id,
        name: getTranslated(r.name, currentLanguage),
        description: getTranslated(r.description, currentLanguage),
        city: catalogs.cities[r.city_id] || '',
        neighborhood: catalogs.neighborhoods[r.neighborhood_id] || '',
        propertyType: catalogs.propertyTypes[r.property_type_id] || '',
        amenity_ids: r.amenity_ids || [],
        amenities: (r.amenity_ids || []).map(id => catalogs.amenities[id]).filter(Boolean),
        rating_avg: r.rating_avg,
        reviews_count: r.reviews_count,
        imageUrl: Array.isArray(r.image_urls) && r.image_urls.length > 0 ? r.image_urls[0] : null,
        simple_booking_link: r.simple_booking_link,
      };

      if (!groups[slug]) groups[slug] = [];
      groups[slug].push(mapped);
    });

    Object.keys(groups).forEach(key => {
      groups[key] = shuffleArray(groups[key]);
    });

    return groups;
  }, [hotelsData, catalogs, currentLanguage]);

  const loading = isLoading || catalogLoading;

  if (loading) {
    return (
      <section className="bg-brand-beige py-16 md:py-24">
        <div className="content-wrapper flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 text-brand-action animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-brand-beige py-16 md:py-24">
      <div className="content-wrapper">
        {CITY_ORDER.map(slug => {
          const riads = groupedByCity[slug];
          if (!riads || riads.length === 0) return null;
          const cityName = riads[0]?.city || slug.charAt(0).toUpperCase() + slug.slice(1);
          return (
            <CityCarousel
              key={slug}
              cityName={cityName.toUpperCase()}
              riads={riads}
            />
          );
        })}
      </div>
    </section>
  );
}
