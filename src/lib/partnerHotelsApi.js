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
 *
 * - staleTime: 5 min — won't refetch within 5 min of a successful fetch
 * - gcTime: 10 min — keep data in cache for 10 min after last subscriber unmounts
 * - Multiple components using this hook share the same cache entry & single request
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
