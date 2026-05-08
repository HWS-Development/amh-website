/**
 * Partner API client — server-side only.
 *
 * Handles app-credential login, token caching with proactive refresh,
 * and partner hotel content retrieval.
 *
 * Token lifecycle:
 *   - Login once on first use (or after expiry / 401).
 *   - Reuse the same access token until it expires.
 *   - Refresh proactively 60 s before expiry.
 *   - On 401 from hotel request, login again and retry once.
 */

// ── Module-level token cache (persists across warm invocations) ──────────
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Authenticate with the partner API using app credentials.
 */
export async function appLogin(apiBaseUrl, clientId, clientSecret) {
  const loginUrl = `${apiBaseUrl}/apps/login`;
  console.log(`[partnerClient] POST ${loginUrl}  (clientId: ${clientId.substring(0, 16)}...)`);

  const res = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
  });

  const contentType = res.headers.get('content-type') || '';
  const rawBody = await res.text();

  console.log(`[partnerClient] Login response: status=${res.status}, content-type=${contentType}, body=${rawBody.substring(0, 300)}`);

  if (!res.ok) {
    throw new Error(
      `Login failed — POST ${loginUrl} returned ${res.status}.\n` +
      `  Content-Type: ${contentType}\n` +
      `  Body: ${rawBody.substring(0, 500)}`
    );
  }

  if (!contentType.includes('application/json')) {
    throw new Error(
      `Login failed — POST ${loginUrl} returned non-JSON response.\n` +
      `  Content-Type: ${contentType}\n` +
      `  Body (first 300 chars): ${rawBody.substring(0, 300)}`
    );
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (parseErr) {
    throw new Error(
      `Login failed — could not parse JSON from POST ${loginUrl}.\n` +
      `  Parse error: ${parseErr.message}\n` +
      `  Body (first 300 chars): ${rawBody.substring(0, 300)}`
    );
  }

  const payload = body.data ?? body;
  const { accessToken, expiresIn } = payload;

  if (!accessToken) {
    throw new Error(
      `Login succeeded (${res.status}) but no accessToken in response.\n` +
      `  Response keys: ${JSON.stringify(Object.keys(body))}\n` +
      `  Payload keys: ${JSON.stringify(Object.keys(payload))}\n` +
      `  Full response: ${rawBody.substring(0, 500)}`
    );
  }

  cachedToken = accessToken;
  tokenExpiresAt = Date.now() + ((expiresIn || 3600) - 60) * 1000;
  console.log(`[partnerClient] Login OK — token cached, expires in ${expiresIn || 3600}s`);

  return cachedToken;
}

/**
 * Return a valid token, logging in if necessary.
 */
export async function getValidToken(apiBaseUrl, clientId, clientSecret) {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  return appLogin(apiBaseUrl, clientId, clientSecret);
}

/**
 * Invalidate the cached token (e.g. after a 401).
 */
export function invalidateToken() {
  cachedToken = null;
  tokenExpiresAt = 0;
}

/**
 * Fetch all partner hotels.
 * Handles token acquisition and single retry on 401.
 */
export async function fetchPartnerHotels(apiBaseUrl, clientId, clientSecret) {
  if (!apiBaseUrl || !clientId || !clientSecret) {
    const missing = [
      !apiBaseUrl && 'API_BASE_URL',
      !clientId && 'PARTNER_APP_CLIENT_ID',
      !clientSecret && 'PARTNER_APP_CLIENT_SECRET',
    ].filter(Boolean);
    throw new Error(`Missing partner API configuration: ${missing.join(', ')}. Check your environment variables.`);
  }

  let token = await getValidToken(apiBaseUrl, clientId, clientSecret);

  const hotelsUrl = `${apiBaseUrl}/partner/hotels/content?limit=all`;
  console.log(`[partnerClient] GET ${hotelsUrl}`);

  let res = await fetch(hotelsUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`[partnerClient] Hotels response: status=${res.status}`);

  // If 401, token is invalid / expired — login again and retry once
  if (res.status === 401) {
    console.log('[partnerClient] Got 401 — refreshing token and retrying...');
    invalidateToken();
    token = await appLogin(apiBaseUrl, clientId, clientSecret);
    res = await fetch(hotelsUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`[partnerClient] Hotels retry response: status=${res.status}`);
  }

  const contentType = res.headers.get('content-type') || '';
  const rawBody = await res.text();

  if (!res.ok) {
    throw new Error(
      `Hotel fetch failed — GET ${hotelsUrl} returned ${res.status}.\n` +
      `  Content-Type: ${contentType}\n` +
      `  Body: ${rawBody.substring(0, 500)}`
    );
  }

  if (!contentType.includes('application/json')) {
    throw new Error(
      `Hotel fetch failed — GET ${hotelsUrl} returned non-JSON response.\n` +
      `  Content-Type: ${contentType}\n` +
      `  Body (first 300 chars): ${rawBody.substring(0, 300)}`
    );
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (parseErr) {
    throw new Error(
      `Hotel fetch — could not parse JSON from GET ${hotelsUrl}.\n` +
      `  Parse error: ${parseErr.message}\n` +
      `  Body (first 300 chars): ${rawBody.substring(0, 300)}`
    );
  }

  if (!body.success) {
    throw new Error(
      `Hotel fetch — API returned success=false.\n` +
      `  Message: ${body.message || 'none'}\n` +
      `  Code: ${body.code || 'none'}\n` +
      `  Full response: ${rawBody.substring(0, 500)}`
    );
  }

  const count = Array.isArray(body.data) ? body.data.length : 'N/A';
  console.log(`[partnerClient] Success — returning ${count} hotels`);

  return body.data;
}
