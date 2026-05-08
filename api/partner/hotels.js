/**
 * Vercel Serverless Function — GET /api/partner/hotels
 *
 * Returns partner hotel content via the backend app credentials flow.
 * Credentials and access tokens never leave the server.
 */
import { fetchPartnerHotels } from '../_lib/partnerClient.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const hotels = await fetchPartnerHotels(
      process.env.API_BASE_URL,
      process.env.PARTNER_APP_CLIENT_ID,
      process.env.PARTNER_APP_CLIENT_SECRET,
    );

    return res.status(200).json({ success: true, data: hotels });
  } catch (err) {
    console.error('[api/partner/hotels] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  }
}
