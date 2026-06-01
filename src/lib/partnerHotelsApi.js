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

const PARTNER_ORG_CACHE_KEY = 'partnerHotelOrganizations';

export function extractCentraHotelId(imageUrls = []) {
  const urls = Array.isArray(imageUrls) ? imageUrls : [];
  for (const url of urls) {
    const match = String(url).match(/\/(HT-[A-Z0-9]+)\//i);
    if (match) return match[1];
  }
  return null;
}

export function extractCentraOrganizationId(imageUrls = []) {
  const urls = Array.isArray(imageUrls) ? imageUrls : [];
  for (const url of urls) {
    const match = String(url).match(/\/(ORG-[A-Z0-9]+)\//i);
    if (match) return match[1];
  }
  return null;
}

export function buildRiadDetailHref(id) {
  return `/riad/${id}`;
}

function readOrganizationCache() {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(PARTNER_ORG_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeOrganizationCache(cache) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(PARTNER_ORG_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage failures; detail fetch still has a server fallback.
  }
}

function cacheHotelOrganizations(hotels = []) {
  const nextCache = { ...readOrganizationCache() };
  let changed = false;

  for (const hotel of Array.isArray(hotels) ? hotels : []) {
    const hotelId = extractCentraHotelId(hotel?.image_urls) || hotel?.id;
    const organizationId = extractCentraOrganizationId(hotel?.image_urls);
    if (!hotelId || !organizationId || nextCache[hotelId] === organizationId) continue;
    nextCache[hotelId] = organizationId;
    changed = true;
  }

  if (changed) {
    writeOrganizationCache(nextCache);
  }
}

function getCachedOrganizationId(hotelId) {
  return readOrganizationCache()[hotelId];
}

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
  cacheHotelOrganizations(body.data);
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
  cacheHotelOrganizations(body.data);
  console.log(`[partnerHotelsApi] Filtered OK — received ${count} hotels`);
  return { data: body.data, meta: body.meta };
}

async function fetchHotelById(id) {
  console.log(`[partnerHotelsApi] Fetching hotel ${id} from /api/partner/hotels/${id}/content ...`);
  const cachedOrganizationId = getCachedOrganizationId(id);
  const res = await fetch(`/api/partner/hotels/${id}/content`, {
    headers: cachedOrganizationId
      ? { 'x-partner-organization-id': cachedOrganizationId }
      : undefined,
  });
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const preview = await res.text().catch(() => '');
    throw new Error(
      `Partner API route returned non-JSON (status ${res.status}, content-type: ${contentType}).\n` +
      `  Body preview: ${preview.substring(0, 200)}`
    );
  }
  const body = await res.json();
  console.log(`[BODY BODY] Received response for hotel ${id}:`, body);
  console.log(`[BODY BODY JSON] Hotel ${id} response JSON:\n${JSON.stringify(body, null, 2)}`);
  if (!res.ok || !body.success) {
    throw new Error(
      `Partner API route error (status ${res.status}):\n` +
      `  ${body.error || body.message || JSON.stringify(body)}`
    );
  }
  console.log(`[partnerHotelsApi] OK — received hotel ${id}`);
  cacheHotelOrganizations([body.data]);
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
