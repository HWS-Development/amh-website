/**
 * Vercel Serverless Function — GET /api/partner/hotels/:id/content
 *
 * Returns a single partner hotel by ID via the backend app credentials flow.
 * Credentials and access tokens never leave the server.
 */
import { fetchPartnerHotelById, fetchPartnerHotels, getPartnerAuthDebugInfo } from '../../../_lib/partnerClient.js';

function extractCentraHotelId(imageUrls = []) {
  const urls = Array.isArray(imageUrls) ? imageUrls : [];
  for (const url of urls) {
    const match = String(url).match(/\/(HT-[A-Z0-9]+)\//i);
    if (match) return match[1];
  }
  return null;
}

function extractCentraOrganizationId(imageUrls = []) {
  const urls = Array.isArray(imageUrls) ? imageUrls : [];
  for (const url of urls) {
    const match = String(url).match(/\/(ORG-[A-Z0-9]+)\//i);
    if (match) return match[1];
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;
  const headerOrganizationId = req.headers['x-partner-organization-id'];
  let organizationId = Array.isArray(headerOrganizationId)
    ? headerOrganizationId[0]
    : (headerOrganizationId || (Array.isArray(req.query?.organizationId) ? req.query.organizationId[0] : req.query?.organizationId));

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing hotel ID' });
  }

  try {
    console.log(`[api/partner/hotels/${id}/content] Request organizationId header: ${organizationId || 'none'}`);
    let hotel;
    let fallbackAttempted = false;
    try {
      console.log(`[api/partner/hotels/${id}/content] Attempting detail fetch with organization source: ${organizationId ? 'request/fallback' : 'login/none'}`);
      hotel = await fetchPartnerHotelById(
        process.env.API_BASE_URL,
        process.env.PARTNER_APP_CLIENT_ID,
        process.env.PARTNER_APP_CLIENT_SECRET,
        id,
        organizationId,
      );
    } catch (err) {
      if (organizationId) {
        throw err;
      }

      fallbackAttempted = true;
      console.log(`[api/partner/hotels/${id}/content] Initial detail fetch failed, attempting organization fallback: ${err.message}`);
      const hotels = await fetchPartnerHotels(
        process.env.API_BASE_URL,
        process.env.PARTNER_APP_CLIENT_ID,
        process.env.PARTNER_APP_CLIENT_SECRET,
      );
      const matchedHotel = hotels.find((item) => extractCentraHotelId(item.image_urls) === id);
      organizationId = matchedHotel ? extractCentraOrganizationId(matchedHotel.image_urls) : undefined;
      console.log(`[api/partner/hotels/${id}/content] Matched hotel from list: ${matchedHotel ? JSON.stringify({
        id: matchedHotel.id,
        centraHotelId: extractCentraHotelId(matchedHotel.image_urls),
        organizationId,
        firstImageUrl: matchedHotel.image_urls?.[0] || null,
      }) : 'not found'}`);
      if (!matchedHotel) {
        throw new Error(`Hotel ${id} not found in listing fallback`);
      }

      console.log(`[api/partner/hotels/${id}/content] Returning hotel from listing data directly (skip detail endpoint to avoid cross-org 403)`);
      hotel = matchedHotel;
    }

    return res.status(200).json({
      success: true,
      data: hotel,
      debug: {
        hotelId: id,
        requestOrganizationId: organizationId || null,
        fallbackAttempted,
        ...getPartnerAuthDebugInfo(organizationId),
      },
    });
  } catch (err) {
    console.error(`[api/partner/hotels/${id}/content] Error:`, err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
      debug: {
        hotelId: id,
        requestOrganizationId: organizationId || null,
        ...getPartnerAuthDebugInfo(organizationId),
      },
    });
  }
}
