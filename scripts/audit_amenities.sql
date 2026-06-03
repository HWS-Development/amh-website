-- ============================================================================
-- AMENITIES cleanup (Supabase / PostgreSQL)
-- Target: public.mgh_amenities_catalog
--
-- Identified issues from the live MGH-Dashboard data:
--   1. Merged "garbage" rows that group several amenities into one label:
--        - billiards_table_tennis_table_football_petanque
--        - terrasse_transats_chauffage_climatisation_seche_cheveux_produits
--   2. Duplicate amenities (same meaning, different ids):
--        - boules_court  /  petanque_court     (keep petanque_court)
--        - in_room_tv    /  in_room_tv_kahana_only  (drop the hotel-specific one)
--        - hot_tub       /  heated_hot_tub     (keep heated_hot_tub as more specific)
--   3. French-only / mislabelled:
--        - piscine_chauffee  (already have pool — drop or relabel)
--
-- Run the SELECTs first to confirm, then the UPDATE/DELETE block.
-- ============================================================================

-- 1. Audit ─────────────────────────────────────────────────────────────────
SELECT id, label->>'fr' AS fr
FROM public.mgh_amenities_catalog
WHERE id IN (
  'billiards_table_tennis_table_football_petanque',
  'terrasse_transats_chauffage_climatisation_seche_cheveux_produits',
  'boules_court', 'petanque_court',
  'in_room_tv', 'in_room_tv_kahana_only',
  'hot_tub', 'heated_hot_tub',
  'piscine_chauffee', 'pool'
)
ORDER BY id;

-- 2. Repoint hotel-amenity links before deleting (safe; no-op if table absent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='mgh_hotel_amenities'
  ) THEN
    UPDATE public.mgh_hotel_amenities SET amenity_id = 'petanque_court'
      WHERE amenity_id = 'boules_court';
    UPDATE public.mgh_hotel_amenities SET amenity_id = 'in_room_tv'
      WHERE amenity_id = 'in_room_tv_kahana_only';
    UPDATE public.mgh_hotel_amenities SET amenity_id = 'heated_hot_tub'
      WHERE amenity_id = 'hot_tub';
    UPDATE public.mgh_hotel_amenities SET amenity_id = 'pool'
      WHERE amenity_id = 'piscine_chauffee';
    -- Garbage rows: just drop the links (no clean target)
    DELETE FROM public.mgh_hotel_amenities
      WHERE amenity_id IN (
        'billiards_table_tennis_table_football_petanque',
        'terrasse_transats_chauffage_climatisation_seche_cheveux_produits'
      );
  END IF;
END$$;

-- 3. Delete the catalog rows
DELETE FROM public.mgh_amenities_catalog
WHERE id IN (
  'billiards_table_tennis_table_football_petanque',
  'terrasse_transats_chauffage_climatisation_seche_cheveux_produits',
  'boules_court',
  'in_room_tv_kahana_only',
  'hot_tub',
  'piscine_chauffee'
);

-- 4. Fix the "pool" label translations (CSV shows mojibake)
UPDATE public.mgh_amenities_catalog
SET label = '{"en":"Swimming pool","es":"Piscina","fr":"Piscine"}'::jsonb
WHERE id = 'pool';

UPDATE public.mgh_amenities_catalog
SET label = '{"en":"Heated pool","es":"Piscina climatizada","fr":"Piscine chauffée"}'::jsonb
WHERE id = 'heated_pool';
-- (Insert if missing)
INSERT INTO public.mgh_amenities_catalog (id, label)
VALUES ('heated_pool', '{"en":"Heated pool","es":"Piscina climatizada","fr":"Piscine chauffée"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 5. Sanity check after cleanup
SELECT COUNT(*) AS total_amenities FROM public.mgh_amenities_catalog;
SELECT label->>'fr' AS fr, COUNT(*) AS dup_count
FROM public.mgh_amenities_catalog
GROUP BY label->>'fr'
HAVING COUNT(*) > 1
ORDER BY dup_count DESC;
