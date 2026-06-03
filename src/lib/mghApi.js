/**
 * Experiences & destinations client.
 *
 * Reads directly from Supabase (PostgreSQL) — same DB the Laravel
 * MGH-Dashboard backend uses. This removes the runtime dependency on the
 * Laravel `/api/public/*` proxy: as soon as a row is added in Supabase, it
 * appears on the public site.
 *
 * If you need to fall back to the Laravel proxy (e.g. row-level security
 * restricts the anon key), set VITE_MGH_API_URL and the legacy `request`
 * helper below will be used instead.
 */

import { supabase } from '@/lib/customSupabaseClient';

const RAW_BASE = import.meta.env.VITE_MGH_API_URL || '';
// Normalize: strip trailing slash AND a trailing "/public" so the env var can be
// set as either `https://host/api` or `https://host/api/public` without breaking.
const API_BASE = RAW_BASE.replace(/\/+$/, '').replace(/\/public$/, '');
const USE_PROXY = Boolean(API_BASE);

// ─── Legacy proxy helper (used only when VITE_MGH_API_URL is set) ───────────
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
  if (USE_PROXY) {
    const json = await request('/public/experiences', { params: { slugs, limit }, signal });
    return json.data || [];
  }
  let q = supabase.from('mgh_experiences').select('*').eq('is_published', true);
  if (slugs?.length) q = q.in('slug', slugs);
  q = q.order('sort_order', { ascending: true, nullsFirst: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getExperienceBySlug(slug, { signal } = {}) {
  if (USE_PROXY) {
    const json = await request(`/public/experiences/${encodeURIComponent(slug)}`, { signal });
    return json.data || null;
  }
  const { data, error } = await supabase
    .from('mgh_experiences')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function listExperiencesBySlugs(slugs, { signal } = {}) {
  if (!slugs || slugs.length === 0) return [];
  if (USE_PROXY) {
    const json = await request('/public/experiences/by-slugs', { params: { slugs: slugs.join(',') }, signal });
    return json.data || [];
  }
  const { data, error } = await supabase
    .from('mgh_experiences')
    .select('*')
    .in('slug', slugs)
    .eq('is_published', true);
  if (error) throw error;
  return data || [];
}

// ─── Destinations ──────────────────────────────────────────────────────────

export async function listDestinations({ slugs, limit, signal } = {}) {
  if (USE_PROXY) {
    const json = await request('/public/destinations', { params: { slugs, limit }, signal });
    return json.data || [];
  }
  let q = supabase.from('mgh_destinations').select('*').eq('is_published', true);
  if (slugs?.length) q = q.in('slug', slugs);
  q = q.order('sort_order', { ascending: true, nullsFirst: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getDestinationBySlug(slug, { signal } = {}) {
  if (USE_PROXY) {
    const json = await request(`/public/destinations/${encodeURIComponent(slug)}`, { signal });
    return json.data || null;
  }
  const { data, error } = await supabase
    .from('mgh_destinations')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}
