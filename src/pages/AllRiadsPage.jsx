import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import {
  LayoutGrid, List, ChevronLeft, ChevronRight, Filter,
  Search, Sparkles, X,
} from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import RiadCard from "@/components/RiadCard";
import RiadListItem from "@/components/RiadListItem";
import FilterDrawer from "@/components/FilterDrawer";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/customSupabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { useQueryParams, StringParam, NumberParam } from "use-query-params";
import { getTranslated } from "@/lib/utils";
import { fetchCatalog } from "@/lib/catalogs";
import { usePartnerHotels } from "@/lib/partnerHotelsApi";
import gsap from "gsap";

const ITEMS_PER_PAGE = 12;

const normalize = (s = "") =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

const AllRiadsPage = () => {
  const [cities, setCities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);

  const location = useLocation();
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();

  const [riads, setRiads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const listStartRef = useRef(null);
  const hasPaginatedRef = useRef(false);
  const gridRef = useRef(null);
  const headerRef = useRef(null);

  const [filters, setFilters] = useState({
    city_id: null,
    neighborhood_id: null,
    property_type_id: null,
    amenity_ids: [],
    rating: null,
    onlyBookable: false,
  });

  const [query, setQuery] = useQueryParams({
    page: NumberParam,
    view: StringParam,
  });

  const page = query.page || 1;
  const view = query.view === "list" ? "list" : "cards";

  const { data: hotelsData, isLoading: hotelsLoading, error: hotelsError } = usePartnerHotels();

  // Fetch catalog data once
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [citiesArr, neighborhoodsArr, propertyTypesArr, amenitiesArr, servicesArr, quartiersArr] =
          await Promise.all([
            fetchCatalog("mgh_cities", currentLanguage),
            fetchCatalog("mgh_neighborhoods", currentLanguage),
            fetchCatalog("mgh_property_types", currentLanguage),
            fetchCatalog("mgh_amenities_catalog", currentLanguage),
            fetchCatalog("mgh_serivces_catalog", currentLanguage).catch(() =>
              fetchCatalog("mgh_services_catalog", currentLanguage).catch(() => [])
            ),
            supabase.from("amh_quartiers").select("slug, name_tr"),
          ]);

        setCities(citiesArr);
        setNeighborhoods(neighborhoodsArr);
        setPropertyTypes(propertyTypesArr);
        setAmenities(amenitiesArr);
      } catch (err) {
        console.error("[AllRiadsPage] catalog error:", err);
      }
    };
    fetchAll();
  }, [currentLanguage]);

  // Enrich hotels with catalog data
  const riadsMap = useMemo(() => {
    if (!hotelsData || cities.length === 0) return [];
    const citiesMap = Object.fromEntries(cities.map((c) => [c.id, c.label]));
    const neighborhoodsMap = Object.fromEntries(neighborhoods.map((n) => [n.id, n.label]));
    const propertyTypesMap = Object.fromEntries(propertyTypes.map((p) => [p.id, p.label]));
    const amenitiesMap = Object.fromEntries(amenities.map((a) => [a.id, a.label]));

    return (hotelsData || []).map((r) => ({
      id: r.id,
      name: getTranslated(r.name, currentLanguage),
      description: getTranslated(r.description, currentLanguage),
      address: getTranslated(r.address, currentLanguage),
      city_id: r.city_id,
      neighborhood_id: r.neighborhood_id,
      property_type_id: r.property_type_id,
      city: citiesMap[r.city_id] || "",
      neighborhood: neighborhoodsMap[r.neighborhood_id] || "",
      propertyType: propertyTypesMap[r.property_type_id] || "",
      amenity_ids: r.amenity_ids || [],
      amenities: (r.amenity_ids || []).map((id) => amenitiesMap[id]).filter(Boolean),
      service_ids: r.service_ids || [],
      services: (r.service_ids || []).map((id) => amenitiesMap[id]).filter(Boolean),
      rating_avg: r.rating_avg,
      reviews_count: r.reviews_count,
      imageUrl: Array.isArray(r.image_urls) && r.image_urls.length > 0 ? r.image_urls[0] : null,
      simple_booking_link: r.simple_booking_link,
    }));
  }, [hotelsData, cities, neighborhoods, propertyTypes, amenities, currentLanguage]);

  useEffect(() => {
    if (riadsMap.length > 0 && !loading) {
      setRiads(riadsMap);
    }
  }, [riadsMap, loading]);

  // Initial loading state
  useEffect(() => {
    if (hotelsLoading) {
      setLoading(true);
    } else if (hotelsError) {
      toast({
        variant: "destructive",
        title: "Error loading riads",
        description: hotelsError.message || "Failed to load riads",
      });
      setRiads([]);
      setLoading(false);
    } else if (hotelsData && cities.length > 0) {
      setLoading(false);
    }
  }, [hotelsData, hotelsError, hotelsLoading, cities, toast]);

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (filters.city_id) n++;
    if (filters.neighborhood_id) n++;
    if (filters.property_type_id) n++;
    if (filters.rating) n++;
    if (filters.onlyBookable) n++;
    if (filters.amenity_ids?.length) n += filters.amenity_ids.length;
    return n;
  }, [filters]);

  // Client-side search filtering (search is local-only for instant UX)
  const filtered = useMemo(() => {
    let list = [...riads];
    if (search.trim()) {
      const q = normalize(search);
      list = list.filter(
        (r) =>
          normalize(r.name).includes(q) ||
          normalize(r.city).includes(q) ||
          normalize(r.neighborhood).includes(q)
      );
    }
    if (filters.rating) {
      list = list.filter((r) => (r.rating_avg || 0) >= filters.rating);
    }
    if (filters.onlyBookable) {
      list = list.filter((r) => r.simple_booking_link && r.simple_booking_link.trim());
    }
    return list;
  }, [riads, search, filters.rating, filters.onlyBookable]);

  // Server-side filter params: city, neighborhood, property_type, amenities
  const serverFilters = useMemo(() => {
    const sf = {};
    if (filters.city_id) sf.city_id = filters.city_id;
    if (filters.neighborhood_id) sf.neighborhood_id = filters.neighborhood_id;
    if (filters.property_type_id) sf.property_type_id = filters.property_type_id;
    if (filters.amenity_ids?.length > 0) sf.amenity_ids = filters.amenity_ids;
    return sf;
  }, [filters]);

  // When server filters change, re-fetch from API with filter params
  const serverFilterKey = JSON.stringify(serverFilters);
  useEffect(() => {
    const hasServerFilters = Object.keys(serverFilters).length > 0;
    if (!hasServerFilters) {
      if (riadsMap.length > 0) setRiads(riadsMap);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (serverFilters.city_id) params.set("city_id", serverFilters.city_id);
    if (serverFilters.neighborhood_id) params.set("neighborhood_id", serverFilters.neighborhood_id);
    if (serverFilters.property_type_id) params.set("property_type_id", serverFilters.property_type_id);
    if (serverFilters.amenity_ids?.length > 0) params.set("amenity_ids", serverFilters.amenity_ids.join(","));

    const url = `/api/partner/hotels?${params.toString()}`;
    fetch(url)
      .then((r) => r.json())
      .then((body) => {
        if (body.success && Array.isArray(body.data)) {
          const citiesMap = Object.fromEntries(cities.map((c) => [c.id, c.label]));
          const neighborhoodsMap = Object.fromEntries(neighborhoods.map((n) => [n.id, n.label]));
          const propertyTypesMap = Object.fromEntries(propertyTypes.map((p) => [p.id, p.label]));
          const amenitiesMap = Object.fromEntries(amenities.map((a) => [a.id, a.label]));

          const mapped = body.data.map((r) => ({
            id: r.id,
            name: getTranslated(r.name, currentLanguage),
            description: getTranslated(r.description, currentLanguage),
            address: getTranslated(r.address, currentLanguage),
            city_id: r.city_id,
            neighborhood_id: r.neighborhood_id,
            property_type_id: r.property_type_id,
            city: citiesMap[r.city_id] || "",
            neighborhood: neighborhoodsMap[r.neighborhood_id] || "",
            propertyType: propertyTypesMap[r.property_type_id] || "",
            amenity_ids: r.amenity_ids || [],
            amenities: (r.amenity_ids || []).map((id) => amenitiesMap[id]).filter(Boolean),
            service_ids: r.service_ids || [],
            services: (r.service_ids || []).map((id) => amenitiesMap[id]).filter(Boolean),
            rating_avg: r.rating_avg,
            reviews_count: r.reviews_count,
            imageUrl: Array.isArray(r.image_urls) && r.image_urls.length > 0 ? r.image_urls[0] : null,
            simple_booking_link: r.simple_booking_link,
          }));
          setRiads(mapped);
        } else {
          setRiads([]);
        }
      })
      .catch((err) => {
        console.error("[AllRiadsPage] server filter error:", err);
        setRiads([]);
      })
      .finally(() => setLoading(false));
  }, [serverFilterKey, riadsMap, cities, neighborhoods, propertyTypes, amenities, currentLanguage]);

  const neighborhoodsForCity = useMemo(() => {
    if (!filters.city_id) return [];
    const map = new Map();
    riadsMap.forEach((r) => {
      if (r.city_id === filters.city_id && r.neighborhood_id) {
        map.set(r.neighborhood_id, r.neighborhood || r.neighborhood_id);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [filters.city_id, riadsMap]);

  // Pagination
  const paged = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (page > totalPages) setQuery({ page: 1 }, "push");
  }, [totalPages, page, setQuery]);

  useEffect(() => {
    if (!hasPaginatedRef.current) {
      hasPaginatedRef.current = true;
      return;
    }
    listStartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  // Animate grid on change
  useEffect(() => {
    if (loading || !gridRef.current || !gridRef.current.children.length) return;
    gsap.from(gridRef.current.children, {
      opacity: 0, y: 20, duration: 0.4, stagger: 0.05,
    });
  }, [loading, page, view]);

  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, { opacity: 0, y: 20, duration: 0.5 });
    }
  }, []);

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityParam = params.get("city");
    const neighborhoodParam = params.get("quartier") || params.get("neighborhood");
    const searchParam = params.get("search");
    const ratingParam = params.get("rating");
    const amenitiesParam = params.get("amenities");
    const propertyTypeParam = params.get("property_type");

    if (
      !cityParam && !neighborhoodParam && !searchParam &&
      !ratingParam && !amenitiesParam && !propertyTypeParam
    ) return;

    const matchById = (entries, value) => {
      if (!value) return null;
      return entries.find((e) => e.id === value || normalize(e.label) === normalize(value))?.id || null;
    };

    setFilters((prev) => ({
      ...prev,
      city_id: matchById(cities, cityParam),
      neighborhood_id: matchById(neighborhoods, neighborhoodParam),
      property_type_id: matchById(propertyTypes, propertyTypeParam),
      amenity_ids: (amenitiesParam || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      rating: ratingParam && !Number.isNaN(Number(ratingParam)) ? Number(ratingParam) : null,
    }));

    if (typeof searchParam === "string") setSearch(searchParam);
    if (page !== 1) setQuery({ page: 1 }, "push");
  }, [location.search, cities, neighborhoods, propertyTypes, page, setQuery]);

  const handleFiltersChange = useCallback(
    (next) => {
      setFilters(next);
      setQuery({ page: 1 }, "push");
    },
    [setQuery]
  );

  const clearFilters = useCallback(() => {
    setFilters({
      city_id: null,
      neighborhood_id: null,
      property_type_id: null,
      amenity_ids: [],
      rating: null,
      onlyBookable: false,
    });
    setQuery({ page: 1 }, "push");
  }, [setQuery]);

  return (
    <>
      <Helmet>
        <title>{t("allRiads")} · MGH</title>
        <meta name="description" content={t("exploreAllOurCertifiedRiads")} />
      </Helmet>

      <div className="bg-gradient-to-b from-white via-white to-gray-50 pt-32 section-padding content-wrapper">
        <div ref={headerRef} className="flex flex-col md:flex-row justify-between mb-10 gap-6">
          <div>
            <h1 className="h1-style bg-gradient-to-r from-brand-ink to-brand-action bg-clip-text text-transparent">
              {t("allRiads")}
            </h1>
            <p className="body-text mt-3 text-gray-600">
              {t("exploreAllOurCertifiedRiads")}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-end">
            <div className="flex border border-gray-300 overflow-hidden bg-white shadow-sm">
              {["cards", "list"].map((viewOption) => (
                <button
                  key={viewOption}
                  onClick={() => setQuery({ view: viewOption }, "push")}
                  className={`px-4 h-12 font-semibold transition-all active:scale-95 ${
                    view === viewOption
                      ? "bg-gradient-to-r from-brand-action to-brand-action/80 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-label={viewOption}
                >
                  {viewOption === "cards" ? <LayoutGrid className="w-5 h-5" /> : <List className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search + Filter + Quick actions */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
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
              {filters.city_id && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-action/10 text-brand-action text-[0.65rem] font-semibold font-montserrat uppercase tracking-[0.1em]">
                  {cities.find((c) => c.id === filters.city_id)?.label || filters.city_id}
                  <button onClick={() => setFilters((p) => ({ ...p, city_id: null, neighborhood_id: null }))} className="ml-1 hover:text-brand-ink">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.property_type_id && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-action/10 text-brand-action text-[0.65rem] font-semibold font-montserrat uppercase tracking-[0.1em]">
                  {propertyTypes.find((p) => p.id === filters.property_type_id)?.label || filters.property_type_id}
                  <button onClick={() => setFilters((p) => ({ ...p, property_type_id: null }))} className="ml-1 hover:text-brand-ink">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.amenity_ids.map((aid) => (
                <span key={aid} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-action/10 text-brand-action text-[0.65rem] font-semibold font-montserrat uppercase tracking-[0.1em]">
                  {amenities.find((a) => a.id === aid)?.label || aid}
                  <button onClick={() => setFilters((p) => ({ ...p, amenity_ids: p.amenity_ids.filter((x) => x !== aid) }))} className="ml-1 hover:text-brand-ink">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.rating && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-action/10 text-brand-action text-[0.65rem] font-semibold font-montserrat uppercase tracking-[0.1em]">
                  {filters.rating}+
                  <button onClick={() => setFilters((p) => ({ ...p, rating: null }))} className="ml-1 hover:text-brand-ink">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 h-8 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-brand-ink/50 hover:text-brand-action transition-colors font-montserrat"
              >
                {t("resetAll") || "Reset all"}
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between px-1">
            <span className="text-sm font-semibold text-gray-600">
              {filtered.length}{" "}
              <span className="text-brand-action">{t("results")}</span>
              {activeFiltersCount > 0 && (
                <span className="ml-2 text-xs text-brand-ink/55 font-normal">
                  · {activeFiltersCount} {activeFiltersCount > 1 ? t("filtersActivePlural") : t("filtersActive")}
                </span>
              )}
            </span>
            {filtered.length > 0 && (
              <span className="text-xs text-gray-500">
                {t("page")} {page} {t("of")} {totalPages}
              </span>
            )}
          </div>
        </div>

        <div ref={listStartRef} className="scroll-mt-32" />

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-gray-200 border-t-brand-action mx-auto mb-4 animate-spin" />
              <p className="text-gray-600 font-medium">{t("loading")}</p>
            </div>
          </div>
        ) : paged.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{t("noResults")}</p>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="mt-4 text-brand-action hover:underline text-sm font-semibold">
                {t("resetAll") || "Reset all filters"}
              </button>
            )}
          </div>
        ) : view === "cards" ? (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {paged.map((riad) => (
              <div key={riad.id}>
                <RiadCard riad={riad} />
              </div>
            ))}
          </div>
        ) : (
          <div ref={gridRef} className="space-y-5">
            {paged.map((riad) => (
              <div key={riad.id}>
                <RiadListItem riad={riad} />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && paged.length > 0 && (
          <div className="flex justify-center items-center gap-6 mt-16">
            <button
              disabled={page <= 1}
              onClick={() => setQuery({ page: page - 1 }, "push")}
              className="h-12 w-12 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700">
                {t("page")} <span className="text-brand-action">{page}</span>
              </span>
              <span className="text-gray-400">/</span>
              <span className="text-sm font-bold text-gray-700">{totalPages}</span>
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() => setQuery({ page: page + 1 }, "push")}
              className="h-12 w-12 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        )}
      </div>

      <FilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        neighborhoods={neighborhoodsForCity}
        cities={cities}
        propertyTypes={propertyTypes}
        amenities={amenities}
        onFiltersChange={handleFiltersChange}
        resultCount={filtered.length}
        t={t}
      />
    </>
  );
};

export default AllRiadsPage;
