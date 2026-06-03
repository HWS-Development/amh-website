-- ============================================================================
-- BACKFILL: mgh_neighborhoods.city_id
-- Maps every neighborhood to one of: marrakech, essaouira, ouarzazate.
-- Run in Supabase SQL editor.
-- ============================================================================

BEGIN;

-- Essaouira (any id containing 'essaouira')
UPDATE public.mgh_neighborhoods
SET city_id = 'essaouira'
WHERE id ILIKE '%essaouira%';

-- Ouarzazate (any id containing 'ouarzazate', or the generic 'desert' which
-- is the Sahara/desert region typically reached via Ouarzazate)
UPDATE public.mgh_neighborhoods
SET city_id = 'ouarzazate'
WHERE id ILIKE '%ouarzazate%'
   OR id = 'desert';

-- Marrakech = everything else (medina districts, Gueliz, Agdal, Palmeraie,
-- Mellah, Kasbah, Mouassine, etc., plus generic Marrakech-area zones like
-- 'montagne' (Atlas mountains accessed from Marrakech) and 'exterior').
UPDATE public.mgh_neighborhoods
SET city_id = 'marrakech'
WHERE city_id IS NULL;

-- Sanity check
-- SELECT city_id, count(*) FROM public.mgh_neighborhoods GROUP BY city_id;

COMMIT;
