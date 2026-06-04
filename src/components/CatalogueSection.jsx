import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Loader2, Search, Filter, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/contexts/LanguageContext";
import { extractCentraHotelId, extractCentraOrganizationId, usePartnerHotels } from "@/lib/partnerHotelsApi";
import { fetchCatalog } from "@/lib/catalogs";
import { getTranslated } from "@/lib/utils";
import RiadCard from "@/components/RiadCard";
import SectionHeader from "@/components/ui/SectionHeader";
import FilterDrawer from "@/components/FilterDrawer";
import useEmblaCarousel from "embla-carousel-react";
import { gsapEase, duration, stagger } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const CITY_ORDER = ["marrakech", "essaouira", "ouarzazate"];

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const TriangleArrow = ({ direction }) => {
  if (direction === "left") {
    return (
      <span
        aria-hidden="true"
        className="block h-0 w-0 border-y-[20px] border-y-transparent border-r-[18px] md:border-y-[26px] md:border-r-[24px]"
        style={{ borderRightColor: "#bf673e" }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="block h-0 w-0 border-y-[20px] border-y-transparent border-l-[18px] md:border-y-[26px] md:border-l-[24px]"
      style={{ borderLeftColor: "#bf673e" }}
    />
  );
};

const CityCarousel = ({ cityName, riads, index, totalCities }) => {
  const containerRef = useRef(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    slidesToScroll: 1,
    containScroll: "trimSnaps",
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
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!riads.length || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".city-heading-row > *", {
        y: 20, opacity: 0, duration: duration.slow, stagger: stagger.tight,
        ease: gsapEase.editorial,
        scrollTrigger: { trigger: containerRef.current, start: "top 82%", once: true },
      });
      gsap.from(".carousel-slide", {
        y: 32, opacity: 0, duration: duration.slow, stagger: stagger.tight,
        ease: gsapEase.editorial,
        scrollTrigger: { trigger: containerRef.current, start: "top 82%", once: true },
      });
    }, containerRef);
    return () => ctx.revert();
  }, [riads]);

  return (
    <div ref={containerRef} className="mb-20 last:mb-0">
      <div className="city-heading-row flex items-end justify-between flex-wrap gap-4 mb-10">
        <div className="flex items-baseline gap-5">
          <span className="font-display italic text-brand-action text-[1.5rem] md:text-[1.75rem] leading-none font-medium">
            {String(index + 1).padStart(2, "0")}
            <span className="text-brand-ink/30 ml-1.5 not-italic">/{String(totalCities).padStart(2, "0")}</span>
          </span>
          <h2 className="font-display text-brand-ink text-[clamp(2rem,4.5vw,3.5rem)] leading-[1] tracking-tight font-medium">
            {cityName}
          </h2>
        </div>
        <span className="hidden md:inline-flex items-center gap-3 text-brand-ink/55 font-montserrat text-[0.65rem] uppercase tracking-[0.32em]">
          <span className="h-px w-10 bg-brand-ink/25" />
          {riads.length} {riads.length > 1 ? "maisons" : "maison"}
        </span>
      </div>

      <div className="relative">
        <button
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canScrollPrev}
          className="group/arrow absolute left-[-2.75rem] md:left-[-3.35rem] top-1/2 -translate-y-1/2 z-10 p-2 disabled:opacity-35 disabled:pointer-events-none"
          aria-label="Previous"
        >
          <span className="block transition-transform duration-300 group-hover/arrow:scale-110 group-hover/arrow:drop-shadow-[0_0_12px_rgba(191,103,62,0.5)]">
            <TriangleArrow direction="left" />
          </span>
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canScrollNext}
          className="group/arrow absolute right-[-2.75rem] md:right-[-3.35rem] top-1/2 -translate-y-1/2 z-10 p-2 disabled:opacity-35 disabled:pointer-events-none"
          aria-label="Next"
        >
          <span className="block transition-transform duration-300 group-hover/arrow:scale-110 group-hover/arrow:drop-shadow-[0_0_12px_rgba(191,103,62,0.5)]">
            <TriangleArrow direction="right" />
          </span>
        </button>

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
  const { t, currentLanguage } = useLanguage();
  const { data: hotelsData, isLoading } = usePartnerHotels();

  const [catalogs, setCatalogs] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogArrays, setCatalogArrays] = useState({ cities: [], neighborhoods: [], propertyTypes: [], amenities: [] });

  const [filters, setFilters] = useState({
    city_id: null,
    neighborhood_id: null,
    property_type_id: null,
    amenity_ids: [],
    rating: null,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setCatalogLoading(true);
      try {
        const [citiesArr, neighborhoodsArr, propertyTypesArr, amenitiesArr] = await Promise.all([
          fetchCatalog("mgh_cities", currentLanguage),
          fetchCatalog("mgh_neighborhoods", currentLanguage),
          fetchCatalog("mgh_property_types", currentLanguage),
          fetchCatalog("mgh_amenities_catalog", currentLanguage),
        ]);
        if (!mounted) return;
        setCatalogArrays({ cities: citiesArr, neighborhoods: neighborhoodsArr, propertyTypes: propertyTypesArr, amenities: amenitiesArr });
        setCatalogs({
          cities: Object.fromEntries(citiesArr.map((c) => [c.id, c.label])),
          neighborhoods: Object.fromEntries(neighborhoodsArr.map((n) => [n.id, n.label])),
          propertyTypes: Object.fromEntries(propertyTypesArr.map((p) => [p.id, p.label])),
          amenities: Object.fromEntries(amenitiesArr.map((a) => [a.id, a.label])),
        });
      } catch (err) {
        console.error("CatalogueSection catalog error:", err);
      }
      if (mounted) setCatalogLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [currentLanguage]);

  const loading = isLoading || catalogLoading;

  // Client-side enriched riads map (same approach as AllRiadsPage)
  const riadsMap = useMemo(() => {
    if (!hotelsData || !catalogs) return [];
    return (hotelsData || []).map((r) => ({
      id: extractCentraHotelId(r.image_urls) || r.id,
      organizationId: extractCentraOrganizationId(r.image_urls),
      name: getTranslated(r.name, currentLanguage),
      description: getTranslated(r.description, currentLanguage),
      address: getTranslated(r.address, currentLanguage),
      city_id: r.city_id || r.cityId || null,
      neighborhood_id: r.neighborhood_id || r.neighborhoodId || null,
      property_type_id: r.property_type_id || r.propertyTypeId || null,
      city: catalogs.cities[r.city_id || r.cityId] || "",
      neighborhood: catalogs.neighborhoods[r.neighborhood_id || r.neighborhoodId] || "",
      propertyType: catalogs.propertyTypes[r.property_type_id || r.propertyTypeId] || "",
      amenity_ids: r.amenity_ids || r.amenityIds || [],
      amenities: (r.amenity_ids || r.amenityIds || []).map((id) => catalogs.amenities[id]).filter(Boolean),
      service_ids: r.service_ids || r.serviceIds || [],
      services: (r.service_ids || r.serviceIds || []).map((id) => catalogs.amenities[id]).filter(Boolean),
      rating_avg: r.rating_avg || r.ratingAvg || null,
      reviews_count: r.reviews_count ?? r.reviewsCount ?? null,
      imageUrl: Array.isArray(r.image_urls || r.imageUrls) && (r.image_urls || r.imageUrls).length > 0 ? (r.image_urls || r.imageUrls)[0] : null,
      simple_booking_link: r.simple_booking_link || r.simpleBookingLink || null,
    }));
  }, [hotelsData, catalogs, currentLanguage]);

  const normalize = (s = "") =>
    s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

  // Client-side filtering (same business logic as AllRiadsPage)
  const filtered = useMemo(() => {
    let list = [...riadsMap];
    if (!list.length) return [];

    if (search.trim()) {
      const q = normalize(search);
      list = list.filter(
        (r) =>
          normalize(r.name).includes(q) ||
          normalize(r.city).includes(q) ||
          normalize(r.neighborhood).includes(q)
      );
    }
    if (filters.city_id) {
      list = list.filter((r) => String(r.city_id) === String(filters.city_id));
    }
    if (filters.neighborhood_id) {
      list = list.filter((r) => String(r.neighborhood_id) === String(filters.neighborhood_id));
    }
    if (filters.property_type_id) {
      list = list.filter((r) => String(r.property_type_id) === String(filters.property_type_id));
    }
    if (filters.amenity_ids?.length > 0) {
      list = list.filter((r) =>
        filters.amenity_ids.some((aid) => (r.amenity_ids || []).includes(aid))
      );
    }
    if (filters.rating) {
      list = list.filter((r) => (r.rating_avg || 0) >= filters.rating);
    }
    return list;
  }, [riadsMap, search, filters]);

  // Group filtered results by city for carousel display
  const groupedByCity = useMemo(() => {
    if (!catalogs) return {};
    const groups = {};
    filtered.forEach((r) => {
      const cityLabel = (catalogs.cities[r.city_id] || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      let slug = null;
      for (const s of CITY_ORDER) {
        if (cityLabel.includes(s)) { slug = s; break; }
      }
      if (!slug) return;
      if (!groups[slug]) groups[slug] = [];
      groups[slug].push(r);
    });
    Object.keys(groups).forEach((key) => { groups[key] = shuffleArray(groups[key]); });
    return groups;
  }, [filtered, catalogs]);

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (filters.city_id) n++;
    if (filters.neighborhood_id) n++;
    if (filters.property_type_id) n++;
    if (filters.rating) n++;
    if (filters.amenity_ids?.length) n += filters.amenity_ids.length;
    return n;
  }, [filters]);

  const visibleCities = CITY_ORDER
    .map((slug) => ({ slug, riads: groupedByCity[slug] || [] }))
    .filter((c) => c.riads.length > 0);

  const totalCount = filtered.length;

  const clearFilters = useCallback(() => {
    setFilters({ city_id: null, neighborhood_id: null, property_type_id: null, amenity_ids: [], rating: null });
    setSearch("");
  }, []);

  const removeFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: null }));
  };

  if (loading) {
    return (
      <section className="section-padding bg-white">
        <div className="content-wrapper flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-brand-action animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-brand-beige relative overflow-hidden">
      <div className="section-divider" aria-hidden />
      <div className="content-wrapper-wide relative">
        <SectionHeader
          eyebrow={t("catalogueEyebrow") || "Our collection"}
          title={t("catalogueTitle") || "Riads & maisons d\u2019h\u00f4tes"}
          subtitle={t("catalogueSubtitle") || ""}
        />

        {/* Filter bar — same design as AllRiadsPage */}
        <div className="mb-12 max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative group flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-action/20 to-brand-ink/20 blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative flex items-center bg-white border-2 border-gray-200 hover:border-brand-action/50 focus-within:border-brand-action transition-all shadow-lg hover:shadow-xl h-14">
                <Search className="w-5 h-5 text-gray-400 ml-4" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full h-full bg-transparent px-4 outline-none text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </div>

            <button
              onClick={() => setIsFilterOpen(true)}
              className={`relative h-14 px-7 flex items-center justify-center gap-3 font-bold uppercase tracking-[0.14em] text-sm transition-all shadow-lg hover:shadow-2xl active:scale-95 font-montserrat group overflow-hidden ${
                activeFiltersCount > 0
                  ? "bg-brand-action text-white"
                  : "bg-brand-ink text-white hover:bg-brand-action"
              }`}
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700" />
              <Filter className="relative w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
              <span className="relative">{t("filtersOpen") || "Filters"}</span>
              {activeFiltersCount > 0 && (
                <span className="relative ml-1 w-7 h-7 bg-white text-brand-action rounded-full flex items-center justify-center text-xs font-extrabold shadow-md">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {filters.city_id && catalogArrays.cities.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-action/10 text-brand-action text-[0.65rem] font-semibold font-montserrat uppercase tracking-[0.1em]">
                  {catalogArrays.cities.find((c) => c.id === filters.city_id)?.label || filters.city_id}
                  <button onClick={() => setFilters((p) => ({ ...p, city_id: null, neighborhood_id: null }))} className="ml-1 hover:text-brand-ink"><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.property_type_id && catalogArrays.propertyTypes.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-action/10 text-brand-action text-[0.65rem] font-semibold font-montserrat uppercase tracking-[0.1em]">
                  {catalogArrays.propertyTypes.find((p) => p.id === filters.property_type_id)?.label || filters.property_type_id}
                  <button onClick={() => removeFilter("property_type_id")} className="ml-1 hover:text-brand-ink"><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.amenity_ids.map((aid) => (
                <span key={aid} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-action/10 text-brand-action text-[0.65rem] font-semibold font-montserrat uppercase tracking-[0.1em]">
                  {catalogArrays.amenities.find((a) => a.id === aid)?.label || aid}
                  <button onClick={() => setFilters((p) => ({ ...p, amenity_ids: p.amenity_ids.filter((x) => x !== aid) }))} className="ml-1 hover:text-brand-ink"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {filters.rating && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-action/10 text-brand-action text-[0.65rem] font-semibold font-montserrat uppercase tracking-[0.1em]">
                  {filters.rating}+
                  <button onClick={() => setFilters((p) => ({ ...p, rating: null }))} className="ml-1 hover:text-brand-ink"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="inline-flex items-center gap-1.5 px-3 h-8 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-brand-ink/50 hover:text-brand-action transition-colors font-montserrat">
                {t("resetAll") || "Reset all"}
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between px-1">
            <span className="text-sm font-semibold text-gray-600">
              {totalCount}{" "}
              <span className="text-brand-action">{t("results")}</span>
              {activeFiltersCount > 0 && (
                <span className="ml-2 text-xs text-brand-ink/55 font-normal">
                  · {activeFiltersCount} {activeFiltersCount > 1 ? t("filtersActivePlural") : t("filtersActive")}
                </span>
              )}
            </span>
          </div>
        </div>

        {visibleCities.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-montserrat text-sm text-brand-ink/50">{t("noResults")}</p>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="mt-4 text-brand-action hover:underline text-sm font-semibold">{t("resetAll") || "Reset all filters"}</button>
            )}
          </div>
        ) : (
          visibleCities.map((c, i) => {
            const cityName = c.riads[0]?.city || c.slug.charAt(0).toUpperCase() + c.slug.slice(1);
            return (
              <CityCarousel key={c.slug} cityName={cityName} riads={c.riads} index={i} totalCities={visibleCities.length} />
            );
          })
        )}
      </div>

      <FilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        neighborhoods={catalogArrays.neighborhoods}
        cities={catalogArrays.cities}
        propertyTypes={catalogArrays.propertyTypes}
        amenities={catalogArrays.amenities}
        onFiltersChange={(next) => { setFilters(next); }}
        resultCount={totalCount}
        riadsMap={riadsMap}
        t={t}
      />
    </section>
  );
}
