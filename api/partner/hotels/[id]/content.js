/**
 * Vercel Serverless Function — GET /api/partner/hotels/:id/content
 *
 * Returns a single partner hotel by ID via the backend app credentials flow.
 * Credentials and access tokens never leave the server.
 */
import { fetchPartnerHotelById, fetchPartnerHotels } from '../../../_lib/partnerClient.js';

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
    let upstreamHotelId = id;
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
      fallbackAttempted = true;
      console.log(`[api/partner/hotels/${id}/content] Initial detail fetch failed, attempting organization fallback: ${err.message}`);
      const hotels = await fetchPartnerHotels(
        process.env.API_BASE_URL,
        process.env.PARTNER_APP_CLIENT_ID,
        process.env.PARTNER_APP_CLIENT_SECRET,
      );
      const matchedHotel = hotels.find((item) =>
        String(item.id) === String(id) || extractCentraHotelId(item.image_urls) === id
      );
      organizationId = matchedHotel ? extractCentraOrganizationId(matchedHotel.image_urls) : undefined;
      const centraHotelId = matchedHotel ? extractCentraHotelId(matchedHotel.image_urls) : null;
      console.log(`[api/partner/hotels/${id}/content] Matched hotel from list: ${matchedHotel ? JSON.stringify({
        id: matchedHotel.id,
        centraHotelId,
        organizationId,
        firstImageUrl: matchedHotel.image_urls?.[0] || null,
      }) : 'not found'}`);
      if (!matchedHotel) {
        throw new Error(`Hotel ${id} not found in listing fallback`);
      }

      if (centraHotelId) {
        try {
          upstreamHotelId = centraHotelId;
          console.log(`[api/partner/hotels/${id}/content] Retrying detail with Centra hotel ID ${centraHotelId}`);
          hotel = await fetchPartnerHotelById(
            process.env.API_BASE_URL,
            process.env.PARTNER_APP_CLIENT_ID,
            process.env.PARTNER_APP_CLIENT_SECRET,
            centraHotelId,
            organizationId,
          );
        } catch (retryErr) {
          console.log(`[api/partner/hotels/${id}/content] Centra hotel ID retry failed, returning listing data: ${retryErr.message}`);
          hotel = matchedHotel;
        }
      } else {
        hotel = matchedHotel;
      }
    }

    return res.status(200).json({
      success: true,
      data: hotel,
      debug: {
        hotelId: id,
        upstreamHotelId,
        fallbackAttempted,
      },
    });
  } catch (err) {
    console.error(`[api/partner/hotels/${id}/content] Error:`, err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
      debug: {
        hotelId: id,
      },
    });
  }
}
