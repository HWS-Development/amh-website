import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import {
  Filter,
  XCircle,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutGrid,
  List
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import RiadCard from '@/components/RiadCard';
import FilterDrawer from '@/components/FilterDrawer';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useQueryParams, StringParam, ArrayParam, NumberParam } from 'use-query-params';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_PAGE = 12;

/* ===== Skeletons ===== */
const RiadCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div className="w-full h-56 bg-gray-200 animate-pulse"></div>
    <div className="p-4">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
    </div>
  </div>
);

const RiadListSkeleton = () => (
  <div className="flex items-stretch gap-4 p-4 border border-gray-200 rounded-xl bg-white">
    <div className="h-28 w-36 md:h-32 md:w-40 bg-gray-200 animate-pulse rounded-lg" />
    <div className="flex-1">
      <div className="h-5 w-2/3 bg-gray-200 animate-pulse rounded mb-2" />
      <div className="h-4 w-1/5 bg-gray-200 animate-pulse rounded mb-3" />
      <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-4" />
      <div className="h-9 w-28 bg-gray-200 animate-pulse rounded" />
    </div>
  </div>
);

/* ===== List item for list view ===== */
const RiadListItem = ({ riad }) => {
  return (
    <div className="group flex flex-col md:flex-row items-stretch gap-4 p-4 border border-gray-200 rounded-xl bg-white hover:shadow-md transition">
      <div className="relative shrink-0">
        <img
          src={riad.imageUrl}
          alt={riad.name}
          className="h-40 w-full md:h-32 md:w-48 rounded-lg object-cover"
          loading="lazy"
        />
        {riad.google_rating ? (
          <div className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-xs font-semibold shadow">
            ★ {Number(riad.google_rating).toFixed(1)} {riad.google_reviews_count ? `(${riad.google_reviews_count})` : ''}
          </div>
        ) : null}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{riad.name}</h3>
          {riad.property_type && (
            <span className="text-xs rounded-md border px-2 py-1 text-gray-600">{riad.property_type}</span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600">
          {[riad.quartier, riad.area, riad.city].filter(Boolean).join(' · ')}
        </p>

        {!!(riad.amenities && riad.amenities.length) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {riad.amenities.slice(0, 5).map((a, i) => (
              <span key={i} className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-700">
                {a}
              </span>
            ))}
            {riad.amenities.length > 5 && (
              <span className="text-xs text-gray-500">+{riad.amenities.length - 5}</span>
            )}
          </div>
        )}

        <div className="mt-3">
          {riad.sblink ? (
            <a
              href={riad.sblink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-gray-50"
            >
              View details
            </a>
          ) : (
            <span className="inline-flex h-9 items-center rounded-md border px-3 text-sm text-gray-400">
              Details
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const AllRiadsPage = () => {
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();

  // data
  const [riadsAll, setRiadsAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // ui state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [q, setQ] = useState('');
  const isSearching = q.trim().length > 0;

  // url params (server-side filters + sort + page + view)
  const [query, setQuery] = useQueryParams({
    amenities: ArrayParam,
    cities: ArrayParam,
    areas: ArrayParam,
    quartiers: ArrayParam,
    rating: StringParam,
    sort: StringParam,
    page: NumberParam,
    view: StringParam
  });

  const view = (query.view === 'list' || query.view === 'cards') ? query.view : 'cards';

  const filters = useMemo(() => ({
    amenities: query.amenities || [],
    cities: query.cities || [],
    areas: query.areas || [],
    quartiers: query.quartiers || [],
    rating: query.rating || null,
  }), [query]);

  const sort = query.sort || 'rating_desc';
  const page = query.page || 1;

  const setView = (v) => setQuery({ view: v }, 'push');

  const handleFiltersChange = useCallback((newFilters) => {
    setQuery({
      ...newFilters,
      amenities: newFilters.amenities?.length ? newFilters.amenities : undefined,
      cities:    newFilters.cities?.length    ? newFilters.cities    : undefined,
      areas:     newFilters.areas?.length     ? newFilters.areas     : undefined,
      quartiers: newFilters.quartiers?.length ? newFilters.quartiers : undefined,
      rating:    newFilters.rating || undefined,
      page: 1,
    }, 'push');
  }, [setQuery]);

  const handleSortChange = (newSort) => setQuery({ sort: newSort, page: 1 }, 'push');
  const handlePageChange = (newPage) => { setQuery({ page: newPage }); window.scrollTo(0, 0); };

  // fetch ALL for current filters (so search works across all)
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const rpcParams = {
        p_cities:    filters.cities.length    ? filters.cities    : null,
        p_areas:     filters.areas.length     ? filters.areas     : null,
        p_quartiers: filters.quartiers.length ? filters.quartiers : null,
        p_amenities: filters.amenities.length ? filters.amenities : null,
        p_rating:    filters.rating ? parseFloat(filters.rating) : null,
        p_sort: sort,
        p_page: 1,
        p_page_size: 1000,
        p_lang: currentLanguage
      };

      const { data, error } = await supabase.rpc('filter_riads', rpcParams);

      if (error) {
        console.error('Error fetching riads:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch the list of riads.' });
        setRiadsAll([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      // optional: enrich with property_type
      const { data: types } = await supabase
        .from('mgh_properties')
        .select('id, property_type')
        .in('id', data.map(r => r.id));

      const typeMap = (types || []).reduce((acc, it) => { acc[it.id] = it.property_type; return acc; }, {});

      const formatted = (data || []).map((r) => ({
        id: r.id,
        slug: r.name.toLowerCase().replace(/\s+/g, '-'),
        name: r.name,
        area: r.area,
        city: r.city,
        quartier: r.quartier,
        imageUrl: r.image_urls?.length ? r.image_urls[0]
          : 'https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png',
        amenities: r.amenities || [],
        google_rating: r.google_rating,
        google_reviews_count: r.google_reviews_count,
        sblink: r.sblink,
        property_type: typeMap[r.id] || null,
      }));

      setRiadsAll(formatted);
      setTotalCount(data[0]?.total_count || formatted.length);
      setLoading(false);
    };

    fetchAll();
  }, [filters, sort, currentLanguage, toast]);

  // client search over full set
  const norm = (s = '') => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const filteredAll = useMemo(() => {
    if (!isSearching) return riadsAll;
    const n = norm(q);
    return riadsAll.filter(r => {
      const name = norm(r.name || '');
      const city = norm(r.city || '');
      const quartier = norm(r.quartier || '');
      return name.includes(n) || city.includes(n) || quartier.includes(n);
    });
  }, [isSearching, q, riadsAll]);

  // derive page slice only when NOT searching
  const paged = useMemo(() => {
    if (isSearching) return filteredAll;
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredAll.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAll, page, isSearching]);

  const totalPages = Math.ceil(filteredAll.length / ITEMS_PER_PAGE);

  const ActiveFiltersDisplay = () => {
    const active = Object.entries(filters).flatMap(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) return value.map(v => ({ key, value: v, label: v }));
      if (typeof value === 'string' && value) return [{ key, value, label: `${t('guestRating')} ${value}+` }];
      return [];
    });
    if (active.length === 0) return null;

    return (
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        {active.map(({ key, value, label }, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1.5">
            <span className="capitalize">{label}</span>
            <button onClick={() => {
              const newValues = key === 'rating' ? null : filters[key].filter(v => v !== value);
              handleFiltersChange({ ...filters, [key]: newValues });
            }}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Button
          variant="link"
          size="sm"
          onClick={() => handleFiltersChange({ cities: [], areas: [], quartiers: [], amenities: [], rating: null })}
        >
          {t('resetFilters')}
        </Button>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{t('allRiads')} · MGH</title>
        <meta name="description" content={t('exploreAllOurCertifiedRiads')} />
      </Helmet>

      <div className="bg-white">
        <div className="content-wrapper section-padding pt-32">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="h1-style text-brand-ink">{t('allRiads')}</h1>
              <p className="body-text mt-2">{t('exploreAllOurCertifiedRiads')}</p>
            </div>

            <div className="flex items-center justify-center gap-3">
              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 w-48 justify-between">
                    <span>{t(`sort_${sort}`)}</span>
                    {sort.endsWith('_asc') ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleSortChange('rating_desc')}>{t('sort_rating_desc')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('name_asc')}>{t('sort_name_asc')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('name_desc')}>{t('sort_name_desc')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Filters */}
              <Button
                variant="outline"
                className="flex items-center space-x-2 rounded-sm h-12 min-w-[48px]"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">{t('filters')}</span>
              </Button>

              {/* View toggle */}
              <div className="flex rounded-md border overflow-hidden">
                <button
                  aria-label="Cards view"
                  className={`inline-flex items-center gap-1 px-3 h-12 text-sm ${view === 'cards' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setView('cards')}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden md:inline">{t('cardsView')}</span>
                </button>
                <button
                  aria-label="List view"
                  className={`inline-flex items-center gap-1 px-3 h-12 text-sm border-l ${view === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setView('list')}
                >
                  <List className="h-4 w-4" />
                  <span className="hidden md:inline">{t('listView')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 🔍 search bar */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="relative w-full max-w-xl">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('searchPlaceholder') || 'Search by name, city, quartier…'}
                className="w-full h-12 rounded-xl border px-4 outline-none"
              />
              {q && (
                <button
                  onClick={() => setQ('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500"
                >
                  {t('clear')}
                </button>
              )}
            </div>
            <div className="text-sm text-neutral-500">
              {isSearching
                ? `${filteredAll.length} ${t('results') || 'results'}`
                : `${Math.min(paged.length, ITEMS_PER_PAGE)}/${filteredAll.length} ${t('onThisPageTotal') || 'on this page · total'}`}
            </div>
          </div>

          <ActiveFiltersDisplay />

          {loading ? (
            view === 'cards' ? (
              <div className="grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => <RiadCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => <RiadListSkeleton key={i} />)}
              </div>
            )
          ) : (
            <>
              {view === 'cards' ? (
                <div className="grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                  {(isSearching ? filteredAll : paged).map((riad, index) => (
                    <motion.div
                      key={riad.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: (index % ITEMS_PER_PAGE) * 0.05 }}
                    >
                      <RiadCard riad={riad} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(isSearching ? filteredAll : paged).map((riad, index) => (
                    <motion.div
                      key={riad.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: (index % ITEMS_PER_PAGE) * 0.03 }}
                    >
                      <RiadListItem riad={riad} />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && (isSearching ? filteredAll.length === 0 : paged.length === 0) && (
                <div className="text-center py-20 border border-dashed border-gray-300 rounded-lg col-span-full">
                  <XCircle className="w-12 h-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">{t('noRiadsMatchFilters')}</h3>
                  <p className="mt-1 text-sm text-gray-500">{t('tryAdjustingFilters')}</p>
                </div>
              )}

              {/* hide pagination while searching */}
              {!isSearching && totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {t('page')} {page} {t('of')} {totalPages}
                  </span>
                  <Button variant="outline" size="icon" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <FilterDrawer
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          resultCount={filteredAll.length}
        />
      </div>
    </>
  );
};

export default AllRiadsPage;
