/**
 * Vercel Serverless Function — GET /api/partner/hotels/:id
 *
 * Returns a single partner hotel by ID via the backend app credentials flow.
 * Credentials and access tokens never leave the server.
 */
import { fetchPartnerHotelById } from '../../_lib/partnerClient.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing hotel ID' });
  }

  try {
    const hotel = await fetchPartnerHotelById(
      process.env.API_BASE_URL,
      process.env.PARTNER_APP_CLIENT_ID,
      process.env.PARTNER_APP_CLIENT_SECRET,
      id,
    );

    return res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    console.error(`[api/partner/hotels/${id}] Error:`, err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  }
}
