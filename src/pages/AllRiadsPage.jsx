import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import {
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Sparkles,
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

const shuffleArray = (array = []) => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

const normalize = (s = "") =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

const slugify = (s = "") =>
  normalize(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getSlugTokens = (s = "") =>
  slugify(s)
    .split("-")
    .filter(Boolean);

const matchNeighborhoodParam = (entries, value) => {
  if (!value) return null;

  const normalizedValue = normalize(value);
  const exactMatch = entries.find(
    ([id, label]) =>
      id === value ||
      normalize(label) === normalizedValue ||
      slugify(label) === normalizedValue,
  );

  if (exactMatch) return exactMatch[0];

  const valueTokens = getSlugTokens(value);
  if (valueTokens.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  entries.forEach(([id, label]) => {
    const labelTokens = new Set(getSlugTokens(label));
    if (labelTokens.size === 0) return;

    const sharedTokens = valueTokens.filter((token) => labelTokens.has(token));
    const score = sharedTokens.length / valueTokens.length;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = id;
    }
  });

  return bestScore >= 0.5 ? bestMatch : null;
};

const fetchServicesCatalog = async (language) => {
  try {
    return await fetchCatalog("mgh_services_catalog", language);
  } catch {
    return fetchCatalog("mgh_serivces_catalog", language);
  }
};

const hasValidSimpleBookingLink = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const AllRiadsPage = () => {
  const [cities, setCities] = useState({});
  const [neighborhoods, setNeighborhoods] = useState({});
  const [propertyTypes, setPropertyTypes] = useState({});
  const [quartierSlugMap, setQuartierSlugMap] = useState({});

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
    city: null,
    neighborhood: null,
    amenities: [],
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [
          citiesArr,
          neighborhoodsArr,
          propertyTypesArr,
          amenitiesArr,
          servicesArr,
          quartiersArr,
        ] = await Promise.all([
          fetchCatalog("mgh_cities", currentLanguage),
          fetchCatalog("mgh_neighborhoods", currentLanguage),
          fetchCatalog("mgh_property_types", currentLanguage),
          fetchCatalog("mgh_amenities_catalog", currentLanguage),
          fetchServicesCatalog(currentLanguage).catch(() => []),
          supabase.from("amh_quartiers").select("slug, name_tr"),
        ]);

        const citiesMap = Object.fromEntries(
          citiesArr.map((c) => [c.id, c.label]),
        );
        const neighborhoodsMap = Object.fromEntries(
          neighborhoodsArr.map((n) => [n.id, n.label]),
        );
        const propertyTypesMap = Object.fromEntries(
          propertyTypesArr.map((p) => [p.id, p.label]),
        );
        const amenitiesMap = Object.fromEntries(
          amenitiesArr.map((a) => [a.id, a.label]),
        );
        const servicesMap = Object.fromEntries(
          servicesArr.map((service) => [service.id, service.label]),
        );
        const quartiersMap = Object.fromEntries(
          (quartiersArr.data || []).map((quartier) => [
            quartier.slug,
            getTranslated(quartier.name_tr, currentLanguage),
          ]),
        );

        setCities(citiesMap);
        setNeighborhoods(neighborhoodsMap);
        setPropertyTypes(propertyTypesMap);
        setQuartierSlugMap(quartiersMap);

        const mappedRiads = (hotelsData || []).map((r) => ({
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
            amenities: (r.amenity_ids || [])
              .map((id) => amenitiesMap[id])
              .filter(Boolean),
            service_ids: r.service_ids || [],
            services: (r.service_ids || [])
              .map((id) => servicesMap[id])
              .filter(Boolean),
            rating_avg: r.rating_avg,
            reviews_count: r.reviews_count,
            imageUrl:
              Array.isArray(r.image_urls) && r.image_urls.length > 0
                ? r.image_urls[0]
                : null,
            simple_booking_link: r.simple_booking_link,
          }));

        setRiads(shuffleArray(mappedRiads));
      } catch (err) {
        console.error('[AllRiadsPage] fetchData error:', err);
        toast({
          variant: "destructive",
          title: "Error loading riads",
          description: err.message || "Failed to load riads",
        });
        setRiads([]);
      }

      setLoading(false);
    };

    if (hotelsData) {
      fetchData();
    } else if (hotelsError) {
      console.error('[AllRiadsPage] Hotels fetch error:', hotelsError);
      toast({
        variant: "destructive",
        title: "Error loading riads",
        description: hotelsError.message || "Failed to load riads",
      });
      setRiads([]);
      setLoading(false);
    } else if (hotelsLoading) {
      setLoading(true);
    }
  }, [hotelsData, hotelsError, hotelsLoading, currentLanguage, toast]);

  // Animate grid items when paged content changes
  useEffect(() => {
    if (loading || !gridRef.current || !gridRef.current.children.length) return;
    gsap.from(gridRef.current.children, {
      opacity: 0, y: 20, duration: 0.4, stagger: 0.05,
    });
  }, [loading, page, view]);

  // Animate header on mount
  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, { opacity: 0, y: 20, duration: 0.5 });
    }
  }, []);

  /* ===== FILTER + SEARCH ===== */
  const filtered = useMemo(() => {
    let list = [...riads];

    if (search.trim()) {
      const q = normalize(search);
      list = list.filter(
        (r) =>
          normalize(r.name).includes(q) ||
          normalize(r.city).includes(q) ||
          normalize(r.neighborhood).includes(q),
      );
    }

    if (filters.city) {
      list = list.filter((r) => r.city_id === filters.city);
    }

    if (filters.neighborhood) {
      list = list.filter((r) => r.neighborhood_id === filters.neighborhood);
    }

    if (filters.amenities.length) {
      list = list.filter((r) =>
        filters.amenities.every((id) => r.amenity_ids.includes(id)),
      );
    }

    if (filters.rating) {
      list = list.filter((r) => (r.rating_avg || 0) >= filters.rating);
    }

    if (filters.onlyBookable) {
      list = list.filter((r) =>
        hasValidSimpleBookingLink(r.simple_booking_link),
      );
    }

    return list;
  }, [riads, search, filters]);

  /* ===== PAGINATION ===== */
  const paged = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (page > totalPages) setQuery({ page: 1 }, "push");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  useEffect(() => {
    if (!hasPaginatedRef.current) {
      hasPaginatedRef.current = true;
      return;
    }

    listStartRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [page]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityParam = params.get("city");
    const neighborhoodParam =
      params.get("quartier") || params.get("neighborhood");
    const searchParam = params.get("search");
    const ratingParam = params.get("rating");
    const amenitiesParam = params.get("amenities");

    if (
      !cityParam &&
      !neighborhoodParam &&
      !searchParam &&
      !ratingParam &&
      !amenitiesParam
    ) {
      return;
    }

    const matchByIdOrLabel = (entries, value) => {
      const normalizedValue = normalize(value);
      return entries.find(
        ([id, label]) =>
          id === value ||
          normalize(label) === normalizedValue ||
          slugify(label) === normalizedValue,
      )?.[0] || null;
    };

    const matchedCity = cityParam
      ? matchByIdOrLabel(Object.entries(cities), cityParam)
      : null;

    const neighborhoodMap = new Map();
    riads.forEach((riad) => {
      if (!riad.neighborhood_id || !riad.neighborhood) return;
      if (matchedCity && riad.city_id !== matchedCity) return;
      neighborhoodMap.set(riad.neighborhood_id, riad.neighborhood);
    });
    const neighborhoodEntries = Array.from(neighborhoodMap.entries());

    const quartierLabel =
      neighborhoodParam && quartierSlugMap[neighborhoodParam]
        ? quartierSlugMap[neighborhoodParam]
        : neighborhoodParam;

    const matchedNeighborhood = quartierLabel
      ? matchNeighborhoodParam(neighborhoodEntries, quartierLabel)
      : null;

    const validAmenityIds = (amenitiesParam || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .filter((id) => riads.some((riad) => riad.amenity_ids?.includes(id)));

    const nextFilters = {
      city: matchedCity,
      neighborhood: matchedNeighborhood,
      amenities: validAmenityIds,
      rating:
        ratingParam && !Number.isNaN(Number(ratingParam))
          ? Number(ratingParam)
          : null,
      onlyBookable: params.get("bookable") === "true",
    };

    setFilters((prev) => {
      const prevSerialized = JSON.stringify(prev);
      const nextSerialized = JSON.stringify(nextFilters);
      return prevSerialized === nextSerialized ? prev : nextFilters;
    });

    if (typeof searchParam === "string") {
      setSearch((prev) => (prev === searchParam ? prev : searchParam));
    }

    if (page !== 1) {
      setQuery({ page: 1 }, "push");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, cities, neighborhoods, quartierSlugMap, riads, page]);

  const neighborhoodsForCity = useMemo(() => {
    if (!filters.city) return [];

    const map = new Map();

    riads.forEach((r) => {
      if (r.city_id === filters.city && r.neighborhood_id) {
        map.set(r.neighborhood_id, r.neighborhood || r.neighborhood_id);
      }
    });

    return Array.from(map.entries()).map(([id, label]) => ({
      id,
      label,
    }));
  }, [filters.city, riads]);

  return (
    <>
      <Helmet>
        <title>{t("allRiads")} · MGH</title>
        <meta name="description" content={t("exploreAllOurCertifiedRiads")} />
      </Helmet>

      <div className="bg-gradient-to-b from-white via-white to-gray-50 pt-32 section-padding content-wrapper">
        {/* HEADER */}
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row justify-between mb-12 gap-6"
        >
          <div>
            <h1 className="h1-style bg-gradient-to-r from-brand-ink to-brand-action bg-clip-text text-transparent">
              {t("allRiads")}
            </h1>
            <p className="body-text mt-3 text-gray-600">
              {t("exploreAllOurCertifiedRiads")}
            </p>
          </div>

          {/* CONTROLS */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="h-12 px-6 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 border border-gray-200 hover:border-gray-300 flex items-center gap-2 font-semibold text-gray-700 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Filter className="w-5 h-5" />
              {t("filters")}
            </button>

            {/* VIEW TOGGLE */}
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
                >
                  {viewOption === "cards" ? (
                    <LayoutGrid className="w-5 h-5" />
                  ) : (
                    <List className="w-5 h-5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-action/20 to-brand-ink/20 blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100"></div>
            <div className="relative flex items-center bg-white border-2 border-gray-200 hover:border-brand-action/50 transition-all shadow-lg hover:shadow-xl">
              <Search className="w-5 h-5 text-gray-400 ml-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full h-14 bg-transparent px-4 outline-none text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between px-2">
            <span className="text-sm font-semibold text-gray-600">
              {filtered.length}{" "}
              <span className="text-brand-action">{t("results")}</span>
            </span>
            {filtered.length > 0 && (
              <span className="text-xs text-gray-500">
                {t("page")} {page} {t("of")} {totalPages}
              </span>
            )}
          </div>
        </div>

        <div ref={listStartRef} className="scroll-mt-32" />

        {/* CONTENT */}
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
          </div>
        ) : view === "cards" ? (
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
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

        {/* PAGINATION */}
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
              <span className="text-sm font-bold text-gray-700">
                {totalPages}
              </span>
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
        onFiltersChange={(next) => {
          setFilters(next);
          setQuery({ page: 1 }, "push");
        }}
        resultCount={filtered.length}
      />
    </>
  );
};

export default AllRiadsPage;
