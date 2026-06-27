import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import {
  LayoutGrid, List, ChevronLeft, ChevronRight, Filter,
  Search, Sparkles, X, Compass,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import RiadCard from "@/components/RiadCard";
import RiadListItem from "@/components/RiadListItem";
import FilterDrawer from "@/components/FilterDrawer";
import { useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useQueryParams, StringParam, NumberParam } from "use-query-params";
import { fetchCatalog } from "@/lib/catalogs";
import { usePartnerHotels } from "@/lib/partnerHotelsApi";
import { getAvailableFilterOptions, mapPartnerHotelToRiad } from "@/lib/partnerHotelTransform";
import gsap from "gsap";

const ITEMS_PER_PAGE = 12;

const normalize = (s = "") =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

const AllRiadsPage = () => {
  const [cities, setCities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [services, setServices] = useState([]);

  const location = useLocation();
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const listStartRef = useRef(null);
  const hasPaginatedRef = useRef(false);
  const gridRef = useRef(null);
  const reduce = useReducedMotion();

  // Stable random seed per session — drives the random display order so the
  // list is shuffled once per visit but not on every re-render.
  const shuffleSeedRef = useRef(Math.floor(Math.random() * 1e9));

  // Debounce search input (250ms) — avoids re-filtering on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const [filters, setFilters] = useState({
    city_id: null,
    neighborhood_id: null,
    property_type_id: null,
    amenity_ids: [],
    service_ids: [],
    rating: null,
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
        const [citiesArr, neighborhoodsArr, propertyTypesArr, amenitiesArr, servicesArr] =
          await Promise.all([
            fetchCatalog("mgh_cities", currentLanguage),
            fetchCatalog("mgh_neighborhoods", currentLanguage),
            fetchCatalog("mgh_property_types", currentLanguage),
            fetchCatalog("mgh_amenities_catalog", currentLanguage),
            fetchCatalog("mgh_services_catalog", currentLanguage),
          ]);

        setCities(citiesArr);
        setNeighborhoods(neighborhoodsArr);
        setPropertyTypes(propertyTypesArr);
        setAmenities(amenitiesArr);
        setServices(servicesArr);
      } catch (err) {
        console.error("[AllRiadsPage] catalog error:", err);
      }
    };
    fetchAll();
  }, [currentLanguage]);

  // Enrich hotels with catalog data
  const riadsMap = useMemo(() => {
    if (!hotelsData) return [];
    const citiesMap = Object.fromEntries(cities.map((c) => [c.id, c.label]));
    const neighborhoodsMap = Object.fromEntries(neighborhoods.map((n) => [n.id, n.label]));
    const propertyTypesMap = Object.fromEntries(propertyTypes.map((p) => [p.id, p.label]));

    // Deterministic pseudo-random hash (seed + id) so the order is stable
    // across re-renders within a session but random across sessions.
    const seed = shuffleSeedRef.current;
    const hash = (str) => {
      let h = seed >>> 0;
      const s = String(str);
      for (let i = 0; i < s.length; i++) {
        h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
      }
      return h;
    };

    const mapped = (hotelsData || []).map((r) => mapPartnerHotelToRiad(r, currentLanguage, {
      cities: citiesMap,
      neighborhoods: neighborhoodsMap,
      propertyTypes: propertyTypesMap,
    }));

    // Random display order (stable per session via seed)
    return mapped.sort((a, b) => hash(a.id) - hash(b.id));
  }, [hotelsData, cities, neighborhoods, propertyTypes, currentLanguage]);

  const filterOptions = useMemo(
    () => getAvailableFilterOptions(riadsMap, { cities, neighborhoods, propertyTypes, amenities, services }),
    [riadsMap, cities, neighborhoods, propertyTypes, amenities, services]
  );
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
      setLoading(false);
    } else if (hotelsData) {
      setLoading(false);
    }
  }, [hotelsData, hotelsError, hotelsLoading, toast]);

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (filters.city_id) n++;
    if (filters.neighborhood_id) n++;
    if (filters.property_type_id) n++;
    if (filters.rating) n++;
    if (filters.amenity_ids?.length) n += filters.amenity_ids.length;
    if (filters.service_ids?.length) n += filters.service_ids.length;
    return n;
  }, [filters]);

  // Client-side filtering: all filters applied instantly on the full dataset
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
    if (filters.service_ids?.length > 0) {
      list = list.filter((r) =>
        filters.service_ids.some((sid) => (r.service_ids || []).includes(sid))
      );
    }
    if (filters.rating) {
      list = list.filter((r) => (r.rating_avg || 0) >= filters.rating);
    }
    return list;
  }, [riadsMap, search, filters]);

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
      opacity: 0, y: 20, duration: 0.4, stagger: 0.05, clearProps: "all",
    });
  }, [loading, page, view]);

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityParam = params.get("city");
    const neighborhoodParam = params.get("quartier") || params.get("neighborhood");
    const searchParam = params.get("search");
    const ratingParam = params.get("rating");
    const amenitiesParam = params.get("amenities");
    const servicesParam = params.get("services");
    const propertyTypeParam = params.get("property_type");

    if (
      !cityParam && !neighborhoodParam && !searchParam &&
      !ratingParam && !amenitiesParam && !servicesParam && !propertyTypeParam
    ) return;

    const matchById = (entries, value) => {
      if (!value) return null;
      return entries.find((e) => e.id === value || normalize(e.label) === normalize(value))?.id || null;
    };

    setFilters((prev) => ({
      ...prev,
      city_id: matchById(filterOptions.cities, cityParam),
      neighborhood_id: matchById(filterOptions.neighborhoods, neighborhoodParam),
      property_type_id: matchById(filterOptions.propertyTypes, propertyTypeParam),
      amenity_ids: (amenitiesParam || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      service_ids: (servicesParam || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      rating: ratingParam && !Number.isNaN(Number(ratingParam)) ? Number(ratingParam) : null,
    }));

    if (typeof searchParam === "string") {
      setSearchInput(searchParam);
      setSearch(searchParam);
    }
    if (page !== 1) setQuery({ page: 1 }, "push");
  }, [location.search, filterOptions, page, setQuery]);

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
      service_ids: [],
      rating: null,
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
        {/* ─── PREMIUM HEADER ─── */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-10 overflow-hidden rounded-[28px] border border-brand-ink/10 bg-gradient-to-br from-brand-beige/80 via-brand-beige/40 to-white p-7 md:p-10 shadow-[0_25px_70px_-30px_rgba(29,29,27,0.25)]"
        >
          {/* Decorative serif wordmark */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-8 -right-6 select-none font-display italic text-[clamp(7rem,16vw,13rem)] leading-none text-brand-action/[0.07] tracking-tight"
          >
            Riads
          </span>
          {/* Decorative hairline orbs */}
          <span aria-hidden className="pointer-events-none absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-brand-action/10 blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.36em] text-brand-action mb-5">
                <Compass className="w-3.5 h-3.5" />
                {t("certifiedCollection") || "Collection certifiée"}
              </p>
              <h1 className="font-display text-brand-ink text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.02] tracking-tight font-medium">
                {t("allRiads")}
              </h1>
              <div className="mt-5 h-px w-16 bg-brand-action" />
              <p className="mt-5 font-montserrat text-brand-ink/70 text-base md:text-lg leading-relaxed">
                {t("exploreAllOurCertifiedRiads")}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
              <div className="inline-flex items-center rounded-full border border-brand-ink/15 bg-white/90 backdrop-blur-md p-1 shadow-[0_10px_30px_-15px_rgba(29,29,27,0.3)]">
                {["cards", "list"].map((viewOption) => {
                  const active = view === viewOption;
                  return (
                    <button
                      key={viewOption}
                      onClick={() => setQuery({ view: viewOption }, "push")}
                      className={`relative inline-flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 ${
                        active
                          ? "bg-brand-ink text-white shadow-[0_8px_24px_-8px_rgba(29,29,27,0.55)]"
                          : "text-brand-ink/55 hover:text-brand-action"
                      }`}
                      aria-label={viewOption}
                      aria-pressed={active}
                    >
                      {viewOption === "cards"
                        ? <LayoutGrid className="w-4 h-4" />
                        : <List className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search + Filter + Quick actions */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <div className="relative group flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-action/20 to-brand-ink/20 blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative flex items-center bg-white border-2 border-gray-200 hover:border-brand-action/50 focus-within:border-brand-action transition-all shadow-lg hover:shadow-xl h-14">
                <Search className="w-5 h-5 text-gray-400 ml-4" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
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
                  {filterOptions.cities.find((c) => c.id === filters.city_id)?.label || filters.city_id}
                  <button onClick={() => setFilters((p) => ({ ...p, city_id: null, neighborhood_id: null }))} className="ml-1 hover:text-brand-ink">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.property_type_id && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-action/10 text-brand-action text-[0.65rem] font-semibold font-montserrat uppercase tracking-[0.1em]">
                  {filterOptions.propertyTypes.find((p) => p.id === filters.property_type_id)?.label || filters.property_type_id}
                  <button onClick={() => setFilters((p) => ({ ...p, property_type_id: null }))} className="ml-1 hover:text-brand-ink">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.amenity_ids.map((aid) => (
                <span key={aid} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-action/10 text-brand-action text-[0.65rem] font-semibold font-montserrat uppercase tracking-[0.1em]">
                  {filterOptions.amenities.find((a) => a.id === aid)?.label || aid}
                  <button onClick={() => setFilters((p) => ({ ...p, amenity_ids: p.amenity_ids.filter((x) => x !== aid) }))} className="ml-1 hover:text-brand-ink">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {(filters.service_ids || []).map((sid) => (
                <span key={sid} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-action/10 text-brand-action text-[0.65rem] font-semibold font-montserrat uppercase tracking-[0.1em]">
                  {filterOptions.services.find((s) => s.id === sid)?.label || sid}
                  <button onClick={() => setFilters((p) => ({ ...p, service_ids: (p.service_ids || []).filter((x) => x !== sid) }))} className="ml-1 hover:text-brand-ink">
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
        cities={filterOptions.cities}
        neighborhoods={filterOptions.neighborhoods}
        propertyTypes={filterOptions.propertyTypes}
        amenities={filterOptions.amenities}
        services={filterOptions.services}
        onFiltersChange={handleFiltersChange}
        resultCount={filtered.length}
        riadsMap={riadsMap}
        t={t}
      />
    </>
  );
};

export default AllRiadsPage;
