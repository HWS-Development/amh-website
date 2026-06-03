-- ============================================================================
-- MIGRATION: amh_quartiers → mgh_neighborhoods
-- Goal: make mgh_neighborhoods the single source of truth for districts.
--       Copy rich content (images, descriptions, geo, tags) from amh_quartiers,
--       then drop amh_quartiers.
-- Run order: AFTER scripts/sync_neighborhoods.sql
-- ============================================================================

BEGIN;

-- 1. Extend mgh_neighborhoods schema with all rich attributes
ALTER TABLE public.mgh_neighborhoods
  ADD COLUMN IF NOT EXISTS short_desc_tr           jsonb,
  ADD COLUMN IF NOT EXISTS long_desc_tr            jsonb,
  ADD COLUMN IF NOT EXISTS images                  jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_featured             boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order           integer,
  ADD COLUMN IF NOT EXISTS walking_minutes_from_jemaa integer,
  ADD COLUMN IF NOT EXISTS category_tags           jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ambiance_tags           jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS latitude                numeric(10,7),
  ADD COLUMN IF NOT EXISTS longitude               numeric(10,7),
  ADD COLUMN IF NOT EXISTS city_id                 text,
  ADD COLUMN IF NOT EXISTS meta                    jsonb DEFAULT '{}'::jsonb;

-- 2. Backfill from amh_quartiers (skips silently if amh_quartiers absent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='amh_quartiers'
  ) THEN
    -- Insert neighborhoods that exist in amh_quartiers but not yet in mgh_neighborhoods
    INSERT INTO public.mgh_neighborhoods (
      id, label, short_desc_tr, long_desc_tr, images,
      is_featured, display_order, walking_minutes_from_jemaa,
      category_tags, ambiance_tags, latitude, longitude
    )
    SELECT
      q.slug,
      q.name_tr,
      q.short_desc_tr,
      q.long_desc_tr,
      COALESCE(to_jsonb(q.images), '[]'::jsonb),
      COALESCE(q.is_featured, false),
      q.display_order,
      q.walking_minutes_from_jemaa,
      COALESCE(to_jsonb(q.category_tags), '[]'::jsonb),
      COALESCE(to_jsonb(q.ambiance_tags), '[]'::jsonb),
      q.latitude,
      q.longitude
    FROM public.amh_quartiers q
    ON CONFLICT (id) DO NOTHING;

    -- Update existing rows with rich content from amh_quartiers
    UPDATE public.mgh_neighborhoods n
    SET short_desc_tr              = COALESCE(n.short_desc_tr, q.short_desc_tr),
        long_desc_tr               = COALESCE(n.long_desc_tr, q.long_desc_tr),
        images                     = CASE WHEN jsonb_array_length(COALESCE(n.images,'[]'::jsonb)) = 0
                                          THEN COALESCE(to_jsonb(q.images),'[]'::jsonb) ELSE n.images END,
        is_featured                = COALESCE(q.is_featured, n.is_featured),
        display_order              = COALESCE(n.display_order, q.display_order),
        walking_minutes_from_jemaa = COALESCE(n.walking_minutes_from_jemaa, q.walking_minutes_from_jemaa),
        category_tags              = CASE WHEN jsonb_array_length(COALESCE(n.category_tags,'[]'::jsonb)) = 0
                                          THEN COALESCE(to_jsonb(q.category_tags),'[]'::jsonb) ELSE n.category_tags END,
        ambiance_tags              = CASE WHEN jsonb_array_length(COALESCE(n.ambiance_tags,'[]'::jsonb)) = 0
                                          THEN COALESCE(to_jsonb(q.ambiance_tags),'[]'::jsonb) ELSE n.ambiance_tags END,
        latitude                   = COALESCE(n.latitude, q.latitude),
        longitude                  = COALESCE(n.longitude, q.longitude)
    FROM public.amh_quartiers q
    WHERE n.id = q.slug;

    -- Repoint amh_pois.quartier_id → mgh_neighborhoods.id (slug)
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name='amh_pois'
    ) THEN
      ALTER TABLE public.amh_pois
        ADD COLUMN IF NOT EXISTS neighborhood_id text;
      UPDATE public.amh_pois p
      SET neighborhood_id = q.slug
      FROM public.amh_quartiers q
      WHERE p.quartier_id = q.id AND p.neighborhood_id IS NULL;
    END IF;
  END IF;
END$$;

-- 3. (Optional) Set city_id heuristics for known prefixes
UPDATE public.mgh_neighborhoods SET city_id = 'essaouira'
  WHERE city_id IS NULL AND id LIKE 'essaouira%';
UPDATE public.mgh_neighborhoods SET city_id = 'ouarzazate'
  WHERE city_id IS NULL AND id LIKE 'ouarzazate%';

-- 4. Drop legacy table (uncomment after verifying the migration succeeded)
-- DROP TABLE IF EXISTS public.amh_quartiers CASCADE;

COMMIT;
