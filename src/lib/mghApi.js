/**
 * MGH-Dashboard public API client.
 *
 * Talks to the read-only `/api/public/*` endpoints exposed by the Laravel
 * MGH-Dashboard backend (MySQL). Used by the public AMH-Website to fetch
 * experiences and destinations.
 *
 * Configure the base URL via `VITE_MGH_API_URL` in .env, e.g.:
 *   VITE_MGH_API_URL=http://localhost:8000/api
 */

const RAW_BASE = import.meta.env.VITE_MGH_API_URL || 'http://localhost:8000/api';
const API_BASE = RAW_BASE.replace(/\/+$/, '');

async function request(path, { params, signal } = {}) {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, Array.isArray(v) ? v.join(',') : String(v));
      }
    });
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch { /* ignore */ }
    const err = new Error(`MGH API ${res.status} ${res.statusText}: ${detail}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

// ─── Experiences ───────────────────────────────────────────────────────────

export async function listExperiences({ slugs, limit, signal } = {}) {
  const json = await request('/public/experiences', {
    params: { slugs, limit },
    signal,
  });
  return json.data || [];
}

export async function getExperienceBySlug(slug, { signal } = {}) {
  const json = await request(`/public/experiences/${encodeURIComponent(slug)}`, { signal });
  return json.data || null;
}

export async function listExperiencesBySlugs(slugs, { signal } = {}) {
  if (!slugs || slugs.length === 0) return [];
  const json = await request('/public/experiences/by-slugs', {
    params: { slugs: slugs.join(',') },
    signal,
  });
  return json.data || [];
}

// ─── Destinations ──────────────────────────────────────────────────────────

export async function listDestinations({ slugs, limit, signal } = {}) {
  const json = await request('/public/destinations', {
    params: { slugs, limit },
    signal,
  });
  return json.data || [];
}

export async function getDestinationBySlug(slug, { signal } = {}) {
  const json = await request(`/public/destinations/${encodeURIComponent(slug)}`, { signal });
  return json.data || null;
}
