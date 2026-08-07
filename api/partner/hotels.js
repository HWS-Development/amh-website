/**
 * Vercel Serverless Function — GET /api/partner/hotels
 *
 * Returns partner hotel content via the backend app credentials flow.
 * Supports server-side filtering for ultra-fast performance:
 *   ?city_id=xxx
 *   ?property_type_id=xxx
 *   ?amenity_ids=id1,id2,id3   (hotel must have ALL specified amenities)
 *   ?search=text                (matches hotelName, city, neighborhood)
 *
 * Credentials and access tokens never leave the server.
 */
import { fetchPartnerHotels } from '../_lib/partnerClient.js';
import { fetchPartnerHotelById } from '../_lib/partnerClient.js';

function normalize(s = '') {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function applyFilters(hotels, params) {
  const { city_id, property_type_id, amenity_ids, search } = params;
  let filtered = [...hotels];

  if (city_id) {
    const ids = city_id.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length > 0) {
      filtered = filtered.filter(h => ids.includes(h.city_id));
    }
  }

  if (property_type_id) {
    const ids = property_type_id.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length > 0) {
      filtered = filtered.filter(h => ids.includes(h.property_type_id));
    }
  }

  if (amenity_ids) {
    const required = amenity_ids.split(',').map(s => s.trim()).filter(Boolean);
    if (required.length > 0) {
      filtered = filtered.filter(h => {
        const hotelAmenities = Array.isArray(h.amenity_ids) ? h.amenity_ids : [];
        return required.every(id => hotelAmenities.includes(id));
      });
    }
  }

  if (search && search.trim()) {
    const q = normalize(search);
    filtered = filtered.filter(h => {
      const hotelName = normalize(h.hotelName || '');
      const city = normalize(h.city_id ? String(h.city_id) : '');
      const neighborhood = normalize(h.neighborhood_id ? String(h.neighborhood_id) : '');
      return hotelName.includes(q) || city.includes(q) || neighborhood.includes(q);
    });
  }

  return filtered;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const id = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id;

    if (id) {
      const hotel = await fetchPartnerHotelById(
        process.env.API_BASE_URL,
        process.env.PARTNER_APP_CLIENT_ID,
        process.env.PARTNER_APP_CLIENT_SECRET,
        id,
      );
      return res.status(200).json({ success: true, data: hotel });
    }

    const hotels = await fetchPartnerHotels(
      process.env.API_BASE_URL,
      process.env.PARTNER_APP_CLIENT_ID,
      process.env.PARTNER_APP_CLIENT_SECRET,
    );

    const { city_id, property_type_id, amenity_ids, search } = req.query || {};

    const hasFilters = city_id || property_type_id || amenity_ids || (search && search.trim());

    const data = hasFilters ? applyFilters(hotels, { city_id, property_type_id, amenity_ids, search }) : hotels;

    return res.status(200).json({
      success: true,
      data,
      meta: {
        total: Array.isArray(data) ? data.length : 0,
        filtered: hasFilters,
      },
    });
  } catch (err) {
    console.error('[api/partner/hotels] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  }
}
