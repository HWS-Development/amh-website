/**
 * Public MGH content client.
 *
 * Destinations and experiences come from the official MGH Dashboard public
 * API. Hotel, taxonomy, neighborhood, contact, and booking data come from
 * Centra.
 */

const MGH_PUBLIC_API_URL = 'https://mgh-dashboard.hospitalitywebservices.com/api/public';

const fetchMghPublicData = async (path, { signal } = {}) => {
  const response = await fetch(`${MGH_PUBLIC_API_URL}${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`MGH public API request failed (${response.status})`);
  }

  const payload = await response.json();
  return payload?.data ?? null;
};

// ─── Experiences ───────────────────────────────────────────────────────────

export async function listExperiences({ slugs, limit, signal } = {}) {
  const params = new URLSearchParams();
  if (slugs?.length) params.set('slugs', slugs.join(','));
  params.set('limit', String(limit || 500));

  const data = await fetchMghPublicData(`/experiences?${params}`, { signal });
  return Array.isArray(data) ? data : [];
}

export async function getExperienceBySlug(slug, { signal } = {}) {
  if (!slug) return null;
  return fetchMghPublicData(`/experiences/${encodeURIComponent(slug)}`, { signal });
}

export async function listExperiencesBySlugs(slugs, { signal } = {}) {
  if (!slugs || slugs.length === 0) return [];
  const params = new URLSearchParams({
    slugs: slugs.join(','),
    limit: String(Math.min(slugs.length, 50)),
  });
  const data = await fetchMghPublicData(`/experiences/by-slugs?${params}`, { signal });
  if (!Array.isArray(data)) return [];

  const bySlug = new Map(data.map((experience) => [experience.slug, experience]));
  return slugs.map((slug) => bySlug.get(slug)).filter(Boolean);
}

// ─── Destinations ──────────────────────────────────────────────────────────

export async function listDestinations({ slugs, limit, signal } = {}) {
  const params = new URLSearchParams();
  if (slugs?.length) params.set('slugs', slugs.join(','));
  params.set('limit', String(limit || 500));

  const data = await fetchMghPublicData(`/destinations?${params}`, { signal });
  return Array.isArray(data) ? data : [];
}

export async function getDestinationBySlug(slug, { signal } = {}) {
  if (!slug) return null;
  return fetchMghPublicData(`/destinations/${encodeURIComponent(slug)}`, { signal });
}
