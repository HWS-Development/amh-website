import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import RiadCard from "@/components/RiadCard";
import RiadListItem from "@/components/RiadListItem";
import FilterDrawer from "@/components/FilterDrawer";
import { supabase } from "@/lib/customSupabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { useQueryParams, StringParam, NumberParam } from "use-query-params";
import { getTranslated } from "@/lib/utils";
import { fetchCatalog } from "@/lib/catalogs";

const ITEMS_PER_PAGE = 12;

const normalize = (s = "") =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const AllRiadsPage = () => {
  const [cities, setCities] = useState({});
  const [neighborhoods, setNeighborhoods] = useState({});
  const [propertyTypes, setPropertyTypes] = useState({});
  const [amenitiesCatalog, setAmenitiesCatalog] = useState({});

  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();

  const [riads, setRiads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    city: null,
    neighborhood: null,
    amenities: [],
    rating: null,
  });

  const [query, setQuery] = useQueryParams({
    page: NumberParam,
    view: StringParam,
  });

  const page = query.page || 1;
  const view = query.view === "list" ? "list" : "cards";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // 1️⃣ charger catalogues
        const [
          citiesArr,
          neighborhoodsArr,
          propertyTypesArr,
          amenitiesArr,
          { data, error },
        ] = await Promise.all([
          fetchCatalog("mgh_cities", currentLanguage),
          fetchCatalog("mgh_neighborhoods", currentLanguage),
          fetchCatalog("mgh_property_types", currentLanguage),
          fetchCatalog("mgh_amenities_catalog", currentLanguage),
          supabase.from("mgh_properties_final").select(`
          id,
          name,
          address,
          city_id,
          neighborhood_id,
          property_type_id,
          amenity_ids,
          image_urls,
          rating_avg,
          reviews_count,
            simple_booking_link

        `),
        ]);

        if (error) throw error;

        // 2️⃣ transformer catalogues en map id -> label
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

        setCities(citiesMap);
        setNeighborhoods(neighborhoodsMap);
        setPropertyTypes(propertyTypesMap);
        setAmenitiesCatalog(amenitiesMap);

        // 3️⃣ mapper les riads (MAINTENANT cities existe)
        setRiads(
          (data || []).map((r) => ({
            id: r.id,

            name: getTranslated(r.name, currentLanguage),
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

            rating_avg: r.rating_avg,
            reviews_count: r.reviews_count,

            imageUrl:
              Array.isArray(r.image_urls) && r.image_urls.length > 0
                ? r.image_urls[0]
                : null,
            simple_booking_link: r.simple_booking_link,
          })),
        );
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load riads",
        });
        setRiads([]);
      }

      setLoading(false);
    };

    fetchData();
  }, [currentLanguage, toast]);

  /* ===== FILTER + SEARCH ===== */
  const filtered = useMemo(() => {
    let list = [...riads];

    // SEARCH
    if (search.trim()) {
      const q = normalize(search);
      list = list.filter(
        (r) =>
          normalize(r.name).includes(q) ||
          normalize(r.city).includes(q) ||
          normalize(r.neighborhood).includes(q),
      );
    }

    // CITY
    if (filters.city) {
      list = list.filter((r) => r.city_id === filters.city);
    }

    if (filters.neighborhood) {
      list = list.filter((r) => r.neighborhood_id === filters.neighborhood);
    }

    // AMENITIES
    if (filters.amenities.length) {
      list = list.filter((r) =>
        filters.amenities.every((id) => r.amenity_ids.includes(id)),
      );
    }

    // RATING
    if (filters.rating) {
      list = list.filter((r) => (r.rating_avg || 0) >= filters.rating);
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

      <div className="bg-white pt-32 section-padding content-wrapper">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div>
            <h1 className="h1-style">{t("allRiads")}</h1>
            <p className="body-text mt-2">{t("exploreAllOurCertifiedRiads")}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {t("filters")}
            </Button>

            <div className="flex border rounded-xl overflow-hidden h-11">
              <button
                onClick={() => setQuery({ view: "cards" }, "push")}
                className={`px-3 h-11 ${
                  view === "cards"
                    ? "bg-black text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setQuery({ view: "list" }, "push")}
                className={`px-3 h-11 border-l ${
                  view === "list"
                    ? "bg-black text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-8">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full h-12 border border-gray-200 rounded-2xl px-4 outline-none focus:ring-2 focus:ring-black/10"
          />
          <div className="mt-2 text-sm text-gray-500">
            {filtered.length} {t("results")}
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <p className="text-center py-20">Loading…</p>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paged.map((riad, idx) => (
              <motion.div
                key={riad.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: (idx % 12) * 0.02,
                }}
              >
                <RiadCard riad={riad} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {paged.map((riad, idx) => (
              <motion.div
                key={riad.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: (idx % 12) * 0.015,
                }}
              >
                <RiadListItem riad={riad} />
              </motion.div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <Button
              variant="outline"
              className="h-11 w-11 rounded-xl"
              disabled={page <= 1}
              onClick={() => setQuery({ page: page - 1 }, "push")}
            >
              <ChevronLeft />
            </Button>

            <span className="text-sm text-gray-700">
              {t("page")} {page} {t("of")} {totalPages}
            </span>

            <Button
              variant="outline"
              className="h-11 w-11 rounded-xl"
              disabled={page >= totalPages}
              onClick={() => setQuery({ page: page + 1 }, "push")}
            >
              <ChevronRight />
            </Button>
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
