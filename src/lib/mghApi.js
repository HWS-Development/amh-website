/**
 * Temporary experiences and destinations client.
 *
 * These are the only public-site entities still read from Supabase. Hotel,
 * taxonomy, neighborhood, contact, and booking data come from Centra.
 */

import { supabase } from '@/lib/customSupabaseClient';

// ─── Experiences ───────────────────────────────────────────────────────────

export async function listExperiences({ slugs, limit, signal } = {}) {
  let q = supabase.from('mgh_experiences').select('*').eq('is_published', true);
  if (slugs?.length) q = q.in('slug', slugs);
  q = q.order('sort_order', { ascending: true, nullsFirst: false });
  if (limit) q = q.limit(limit);
  if (signal) q = q.abortSignal(signal);
  const { data, error } = await q;
  if (signal?.aborted) return [];
  if (error) throw error;
  return data || [];
}

export async function getExperienceBySlug(slug, { signal } = {}) {
  let q = supabase
    .from('mgh_experiences')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true);
  if (signal) q = q.abortSignal(signal);
  const { data, error } = await q.maybeSingle();
  if (signal?.aborted) return null;
  if (error) throw error;
  return data || null;
}

export async function listExperiencesBySlugs(slugs, { signal } = {}) {
  if (!slugs || slugs.length === 0) return [];
  let q = supabase
    .from('mgh_experiences')
    .select('*')
    .in('slug', slugs)
    .eq('is_published', true);
  if (signal) q = q.abortSignal(signal);
  const { data, error } = await q;
  if (signal?.aborted) return [];
  if (error) throw error;
  return data || [];
}

// ─── Destinations ──────────────────────────────────────────────────────────

export async function listDestinations({ slugs, limit, signal } = {}) {
  let q = supabase.from('mgh_destinations').select('*').eq('is_published', true);
  if (slugs?.length) q = q.in('slug', slugs);
  q = q.order('sort_order', { ascending: true, nullsFirst: false });
  if (limit) q = q.limit(limit);
  if (signal) q = q.abortSignal(signal);
  const { data, error } = await q;
  if (signal?.aborted) return [];
  if (error) throw error;
  return data || [];
}

export async function getDestinationBySlug(slug, { signal } = {}) {
  let q = supabase
    .from('mgh_destinations')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true);
  if (signal) q = q.abortSignal(signal);
  const { data, error } = await q.maybeSingle();
  if (signal?.aborted) return null;
  if (error) throw error;
  return data || null;
}
