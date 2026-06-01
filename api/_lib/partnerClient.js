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
let cachedOrganizationId = null;
let cachedLoginOrganizationFields = null;
let cachedLoginPayloadPreview = null;

function buildLoginPayloadPreview(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const accessToken = typeof payload.accessToken === 'string' ? payload.accessToken : null;

  return {
    ...payload,
    accessTokenPreview: accessToken ? `${accessToken.slice(0, 12)}...` : null,
    accessTokenPresent: Boolean(accessToken),
    accessToken: undefined,
  };
}

function buildHotelDetailDebugInfo(organizationId) {
  return {
    organizationId: organizationId || cachedOrganizationId || null,
    organizationSource: organizationId ? 'fallback' : (cachedOrganizationId ? 'login' : 'none'),
    loginOrganizationId: cachedOrganizationId || null,
    loginOrganizationFields: cachedLoginOrganizationFields,
    loginPayloadPreview: cachedLoginPayloadPreview,
  };
}

function extractOrganizationIdFromLoginPayload(payload) {
  return payload?.organizationId
    || payload?.organization_id
    || payload?.orgId
    || payload?.org_id
    || payload?.app?.orgId
    || payload?.app?.organizationId
    || payload?.app?.org_id
    || payload?.app?.organization_id
    || payload?.organization?.id
    || payload?.org?.id
    || payload?.user?.organizationId
    || payload?.account?.organizationId
    || null;
}

function getLoginOrganizationFields(payload) {
  return {
    organization_id: payload?.organization_id ?? null,
    organizationId: payload?.organizationId ?? null,
    org_id: payload?.org_id ?? null,
    orgId: payload?.orgId ?? null,
    appOrgId: payload?.app?.orgId ?? null,
    appOrganizationId: payload?.app?.organizationId ?? null,
    appOrg_id: payload?.app?.org_id ?? null,
    appOrganization_id: payload?.app?.organization_id ?? null,
    organization: payload?.organization ?? null,
    org: payload?.org ?? null,
    userOrganizationId: payload?.user?.organizationId ?? null,
    accountOrganizationId: payload?.account?.organizationId ?? null,
  };
}

function buildPartnerUrl(apiBaseUrl, endpointPath) {
  const base = String(apiBaseUrl || '').replace(/\/$/, '');
  const endpoint = String(endpointPath || '');

  if (base.endsWith('/api') && endpoint.startsWith('/api/')) {
    return `${base}${endpoint.slice(4)}`;
  }

  return `${base}${endpoint}`;
}

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

  console.log(`[partnerClient] Login response: status=${res.status}, content-type=${contentType}, body=${rawBody}`);

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
  console.log(`[partnerClient] Login response JSON: ${JSON.stringify(body, null, 2)}`);
  console.log(`[partnerClient] Login payload JSON: ${JSON.stringify(payload, null, 2)}`);
  const { accessToken, expiresIn } = payload;
  const loginOrganizationFields = getLoginOrganizationFields(payload);

  if (!accessToken) {
    throw new Error(
      `Login succeeded (${res.status}) but no accessToken in response.\n` +
      `  Response keys: ${JSON.stringify(Object.keys(body))}\n` +
      `  Payload keys: ${JSON.stringify(Object.keys(payload))}\n` +
      `  Full response: ${rawBody.substring(0, 500)}`
    );
  }

  cachedToken = accessToken;
  cachedOrganizationId = extractOrganizationIdFromLoginPayload(payload);
  cachedLoginOrganizationFields = loginOrganizationFields;
  cachedLoginPayloadPreview = buildLoginPayloadPreview(payload);
  tokenExpiresAt = Date.now() + ((expiresIn || 3600) - 60) * 1000;
  console.log(`[partnerClient] Login organization fields: ${JSON.stringify(loginOrganizationFields)}`);
  console.log(`[partnerClient] Login OK — token cached, expires in ${expiresIn || 3600}s, organizationId=${cachedOrganizationId || 'none'}`);

  return cachedToken;
}

/**
 * Return a valid token, logging in if necessary.
 */
export async function getValidToken(apiBaseUrl, clientId, clientSecret) {
  // if (cachedToken && Date.now() < tokenExpiresAt) {
  //   return cachedToken;
  // }
  return appLogin(apiBaseUrl, clientId, clientSecret);
}

/**
 * Invalidate the cached token (e.g. after a 401).
 */
export function invalidateToken() {
  cachedToken = null;
  tokenExpiresAt = 0;
  cachedOrganizationId = null;
  cachedLoginOrganizationFields = null;
  cachedLoginPayloadPreview = null;
}

export function getPartnerAuthDebugInfo(organizationId) {
  return buildHotelDetailDebugInfo(organizationId);
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

  const hotelsUrl = buildPartnerUrl(apiBaseUrl, '/partner/hotels/content?limit=all');
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

/**
 * Fetch a single partner hotel by ID.
 * Handles token acquisition and single retry on 401.
 *
 * @param {string} apiBaseUrl
 * @param {string} clientId
 * @param {string} clientSecret
 * @param {string} hotelId
 * @returns {Promise<object>} hotel object
 */
export async function fetchPartnerHotelById(apiBaseUrl, clientId, clientSecret, hotelId, organizationId) {
  if (!apiBaseUrl || !clientId || !clientSecret) {
    const missing = [
      !apiBaseUrl && 'API_BASE_URL',
      !clientId && 'PARTNER_APP_CLIENT_ID',
      !clientSecret && 'PARTNER_APP_CLIENT_SECRET',
    ].filter(Boolean);
    throw new Error(`Missing partner API configuration: ${missing.join(', ')}. Check your environment variables.`);
  }

  if (!hotelId) {
    throw new Error('Hotel ID is required.');
  }

  let token = await getValidToken(apiBaseUrl, clientId, clientSecret);
  let resolvedOrganizationId = organizationId || cachedOrganizationId;
  const debugInfo = buildHotelDetailDebugInfo(organizationId);

  const hotelUrl = buildPartnerUrl(apiBaseUrl, `/api/partner/hotels/${hotelId}/content`);
  console.log(`[partnerClient] GET ${hotelUrl}`);
  console.log(`[partnerClient] Final x-organization-id for hotel ${hotelId}: ${resolvedOrganizationId || 'none'} (source: ${debugInfo.organizationSource})`);
  console.log(`[partnerClient] Hotel detail headers: ${JSON.stringify({
    Authorization: `Bearer ${String(token).slice(0, 12)}...`,
    'x-organization-id': resolvedOrganizationId || null,
  })}`);

  let res = await fetch(hotelUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(resolvedOrganizationId ? { 'x-organization-id': resolvedOrganizationId } : {}),
    },
  });

  console.log(`[partnerClient] Hotel detail response: status=${res.status}`);

  // If 401, refresh token and retry once
  if (res.status === 401) {
    console.log('[partnerClient] Got 401 — refreshing token and retrying...');
    invalidateToken();
    token = await appLogin(apiBaseUrl, clientId, clientSecret);
    resolvedOrganizationId = organizationId || cachedOrganizationId;
    const retryDebugInfo = buildHotelDetailDebugInfo(organizationId);
    console.log(`[partnerClient] Final retry x-organization-id for hotel ${hotelId}: ${resolvedOrganizationId || 'none'} (source: ${retryDebugInfo.organizationSource})`);
    console.log(`[partnerClient] Hotel detail retry headers: ${JSON.stringify({
      Authorization: `Bearer ${String(token).slice(0, 12)}...`,
      'x-organization-id': resolvedOrganizationId || null,
    })}`);
    res = await fetch(hotelUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(resolvedOrganizationId ? { 'x-organization-id': resolvedOrganizationId } : {}),
      },
    });
    console.log(`[partnerClient] Hotel detail retry response: status=${res.status}`);
  }

  const contentType = res.headers.get('content-type') || '';
  const rawBody = await res.text();

  if (!res.ok) {
    throw new Error(
      `Hotel detail fetch failed — GET ${hotelUrl} returned ${res.status}.\n` +
      `  Content-Type: ${contentType}\n` +
      `  Body: ${rawBody.substring(0, 500)}`
    );
  }

  if (!contentType.includes('application/json')) {
    throw new Error(
      `Hotel detail fetch — GET ${hotelUrl} returned non-JSON response.\n` +
      `  Content-Type: ${contentType}\n` +
      `  Body (first 300 chars): ${rawBody.substring(0, 300)}`
    );
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (parseErr) {
    throw new Error(
      `Hotel detail fetch — could not parse JSON from GET ${hotelUrl}.\n` +
      `  Parse error: ${parseErr.message}\n` +
      `  Body (first 300 chars): ${rawBody.substring(0, 300)}`
    );
  }

  if (!body.success) {
    throw new Error(
      `Hotel detail fetch — API returned success=false.\n` +
      `  Message: ${body.message || 'none'}\n` +
      `  Code: ${body.code || 'none'}\n` +
      `  Full response: ${rawBody.substring(0, 500)}`
    );
  }

  console.log(`[partnerClient] Success — returning hotel ${hotelId}`);

  return body.data;
}
