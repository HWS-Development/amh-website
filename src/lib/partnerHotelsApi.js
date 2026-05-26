/**
 * Frontend helper — fetches partner hotels from our own backend API route.
 *
 * The backend handles authentication with the partner API; credentials
 * never reach the browser.
 *
 * Raw fetch functions throw on error (for TanStack Query).
 * React Query hooks provide caching, deduplication, and automatic refetch.
 */
import { useQuery } from '@tanstack/react-query';

function buildFilterParams(filters = {}) {
  const params = new URLSearchParams();
  if (filters.city_id) params.set('city_id', filters.city_id);
  if (filters.property_type_id) params.set('property_type_id', filters.property_type_id);
  if (filters.amenity_ids && filters.amenity_ids.length > 0) {
    params.set('amenity_ids', filters.amenity_ids.join(','));
  }
  if (filters.search && filters.search.trim()) {
    params.set('search', filters.search.trim());
  }
  return params.toString();
}

// ── Raw fetch functions (throw on error) ────────────────────────────

async function fetchAllHotels() {
  console.log('[partnerHotelsApi] Fetching hotels from /api/partner/hotels ...');
  const res = await fetch('/api/partner/hotels');
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const preview = await res.text().catch(() => '');
    throw new Error(
      `Partner API route returned non-JSON (status ${res.status}, content-type: ${contentType}).\n` +
      `  Body preview: ${preview.substring(0, 200)}`
    );
  }
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(
      `Partner API route error (status ${res.status}):\n` +
      `  ${body.error || body.message || JSON.stringify(body)}`
    );
  }
  const count = Array.isArray(body.data) ? body.data.length : 'N/A';
  console.log(`[partnerHotelsApi] OK — received ${count} hotels`);
  return body.data;
}

async function fetchFilteredHotels(filters = {}) {
  const queryString = buildFilterParams(filters);
  const url = `/api/partner/hotels${queryString ? `?${queryString}` : ''}`;
  console.log(`[partnerHotelsApi] Fetching filtered hotels from ${url} ...`);
  const res = await fetch(url);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const preview = await res.text().catch(() => '');
    throw new Error(
      `Partner API route returned non-JSON (status ${res.status}, content-type: ${contentType}).\n` +
      `  Body preview: ${preview.substring(0, 200)}`
    );
  }
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(
      `Partner API route error (status ${res.status}):\n` +
      `  ${body.error || body.message || JSON.stringify(body)}`
    );
  }
  const count = Array.isArray(body.data) ? body.data.length : 'N/A';
  console.log(`[partnerHotelsApi] Filtered OK — received ${count} hotels`);
  return { data: body.data, meta: body.meta };
}

async function fetchHotelById(id) {
  console.log(`[partnerHotelsApi] Fetching hotel ${id} from /api/partner/hotels/${id} ...`);
  const res = await fetch(`/api/partner/hotels/${encodeURIComponent(id)}`);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const preview = await res.text().catch(() => '');
    throw new Error(
      `Partner API route returned non-JSON (status ${res.status}, content-type: ${contentType}).\n` +
      `  Body preview: ${preview.substring(0, 200)}`
    );
  }
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(
      `Partner API route error (status ${res.status}):\n` +
      `  ${body.error || body.message || JSON.stringify(body)}`
    );
  }
  console.log(`[partnerHotelsApi] OK — received hotel ${id}`);
  return body.data;
}

// ── Legacy wrappers (return { data, error } for backward compat) ────

export async function fetchPartnerHotels() {
  try {
    const data = await fetchAllHotels();
    return { data, error: null };
  } catch (err) {
    console.error('[partnerHotelsApi] fetchPartnerHotels error:', err);
    return { data: null, error: err };
  }
}

export async function fetchPartnerHotelById(id) {
  try {
    const data = await fetchHotelById(id);
    return { data, error: null };
  } catch (err) {
    console.error('[partnerHotelsApi] fetchPartnerHotelById error:', err);
    return { data: null, error: err };
  }
}

// ── TanStack Query hooks ────────────────────────────────────────────

/**
 * Hook to fetch all partner hotels with caching.
 */
export function usePartnerHotels() {
  return useQuery({
    queryKey: ['partner-hotels'],
    queryFn: fetchAllHotels,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single partner hotel by ID with caching.
 */
export function usePartnerHotelById(id) {
  return useQuery({
    queryKey: ['partner-hotel', id],
    queryFn: () => fetchHotelById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch partner hotels with server-side filtering.
 * Ultra-performant: filtering happens on the server, not the client.
 *
 * @param {Object} filters
 * @param {string} [filters.city_id] - Filter by city ID(s), comma-separated
 * @param {string} [filters.property_type_id] - Filter by property type ID(s), comma-separated
 * @param {string[]} [filters.amenity_ids] - Filter by amenity IDs (hotel must have ALL)
 * @param {string} [filters.search] - Search text
 * @param {boolean} enabled - Whether the query should run
 */
export function useFilteredHotels(filters = {}, enabled = true) {
  const hasFilters = filters.city_id || filters.property_type_id ||
    (filters.amenity_ids && filters.amenity_ids.length > 0) ||
    (filters.search && filters.search.trim());

  return useQuery({
    queryKey: ['partner-hotels-filtered', filters],
    queryFn: () => fetchFilteredHotels(filters),
    enabled: enabled && hasFilters,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
