/**
 * Vercel Serverless Function — GET /api/partner/catalogs
 *
 * Returns the authenticated Centra hotel-content catalogs in one response.
 */
import { fetchPartnerCatalogs } from '../_lib/partnerClient.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const catalogs = await fetchPartnerCatalogs(
      process.env.API_BASE_URL,
      process.env.PARTNER_APP_CLIENT_ID,
      process.env.PARTNER_APP_CLIENT_SECRET,
    );

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ success: true, data: catalogs });
  } catch (err) {
    console.error('[api/partner/catalogs] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  }
}
