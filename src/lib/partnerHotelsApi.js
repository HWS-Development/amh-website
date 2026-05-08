/**
 * Frontend helper — fetches partner hotels from our own backend API route.
 *
 * The backend handles authentication with the partner API; credentials
 * never reach the browser.
 *
 * Returns { data, error } to match the Supabase query interface
 * used in the rest of the codebase.
 */
export async function fetchPartnerHotels() {
  try {
    console.log('[partnerHotelsApi] Fetching hotels from /api/partner/hotels ...');
    const res = await fetch('/api/partner/hotels');

    const contentType = res.headers.get('content-type') || '';

    // Guard: if response is not JSON (e.g. HTML fallback), surface a clear error
    if (!contentType.includes('application/json')) {
      const preview = await res.text().catch(() => '');
      const msg =
        `Partner API route returned non-JSON (status ${res.status}, content-type: ${contentType}).\n` +
        `  Body preview: ${preview.substring(0, 200)}`;
      console.error('[partnerHotelsApi]', msg);
      return { data: null, error: new Error(msg) };
    }

    const body = await res.json();

    if (!res.ok || !body.success) {
      const msg =
        `Partner API route error (status ${res.status}):\n` +
        `  ${body.error || body.message || JSON.stringify(body)}`;
      console.error('[partnerHotelsApi]', msg);
      return { data: null, error: new Error(msg) };
    }

    const count = Array.isArray(body.data) ? body.data.length : 'N/A';
    console.log(`[partnerHotelsApi] OK — received ${count} hotels`);
    return { data: body.data, error: null };
  } catch (err) {
    console.error('[partnerHotelsApi] Network/fetch error:', err);
    return { data: null, error: err };
  }
}

/**
 * Fetch a single partner hotel by ID from our backend API route.
 *
 * Returns { data, error } to match the Supabase .single() interface.
 */
export async function fetchPartnerHotelById(id) {
  try {
    console.log(`[partnerHotelsApi] Fetching hotel ${id} from /api/partner/hotels?id=${id} ...`);
    const res = await fetch(`/api/partner/hotels?id=${encodeURIComponent(id)}`);

    const contentType = res.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      const preview = await res.text().catch(() => '');
      const msg =
        `Partner API route returned non-JSON (status ${res.status}, content-type: ${contentType}).\n` +
        `  Body preview: ${preview.substring(0, 200)}`;
      console.error('[partnerHotelsApi]', msg);
      return { data: null, error: new Error(msg) };
    }

    const body = await res.json();

    if (!res.ok || !body.success) {
      const msg =
        `Partner API route error (status ${res.status}):\n` +
        `  ${body.error || body.message || JSON.stringify(body)}`;
      console.error('[partnerHotelsApi]', msg);
      return { data: null, error: new Error(msg) };
    }

    console.log(`[partnerHotelsApi] OK — received hotel ${id}`);
    return { data: body.data, error: null };
  } catch (err) {
    console.error('[partnerHotelsApi] Network/fetch error:', err);
    return { data: null, error: err };
  }
}
