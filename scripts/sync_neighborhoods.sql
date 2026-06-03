-- Sync neighborhoods from local DB to remote Supabase (PostgreSQL)
-- Target table: public.mgh_neighborhoods

-- 1. Clear existing (if re-running)
TRUNCATE TABLE public.mgh_neighborhoods;

-- 2. Insert all neighborhoods (data provided from local MySQL)
INSERT INTO public.mgh_neighborhoods (id, label) VALUES
  ('agdal',               '{"en":"Agdal","es":"Agdal","fr":"Agdal"}'),
  ('bab_doukkala',       '{"en":"Bab Doukkala","es":"Bab Doukkala","fr":"Bab Doukkala"}'),
  ('ben_youssef',        '{"en":"Ben Youssef","es":"Ben Youssef","fr":"Ben Youssef"}'),
  ('dar_el_bacha',       '{"en":"Dar El Bacha","es":"Dar El Bacha","fr":"Dar El Bacha"}'),
  ('derb_dabachi',       '{"en":"Derb Dabachi","es":"Derb Dabachi","fr":"Derb Dabachi"}'),
  ('derb_sidi_bou_amar', '{"en":"Derb Sidi Bou Amar","es":"Derb Sidi Bou Amar","fr":"Derb Sidi Bou Amar"}'),
  ('desert',             '{"en":"Désert","es":"Désert","fr":"Désert"}'),
  ('essaouira_exterieurs','{"en":"Essaouira Exterieurs","es":"Essaouira Exterieurs","fr":"Essaouira Exterieurs"}'),
  ('essaouira_medina',   '{"en":"Essaouira Medina","es":"Essaouira Medina","fr":"Essaouira Medina"}'),
  ('exterior',           '{"en":"Exterior","es":"Exterior","fr":"Exterieur"}'),
  ('gueliz',             '{"en":"Gueliz","es":"Gueliz","fr":"Gueliz"}'),
  ('hay_essalam',        '{"en":"Hay Essalam","es":"Hay Essalam","fr":"Hay Essalam"}'),
  ('kasbah',             '{"en":"Kasbah","es":"Kasbah","fr":"Kasbah"}'),
  ('kennaria',           '{"en":"Kennaria","es":"Kennaria","fr":"Kennaria"}'),
  ('mellah',             '{"en":"Mellah","es":"Mellah","fr":"Mellah"}'),
  ('montagne',           '{"en":"Montagne","es":"Montagne","fr":"Montagne"}'),
  ('mouassine',          '{"en":"Mouassine","es":"Mouassine","fr":"Mouassine"}'),
  ('ouarzazate_exterieurs','{"en":"Ouarzazate Exterieurs","es":"Ouarzazate Exterieurs","fr":"Ouarzazate Exterieurs"}'),
  ('palmeraie',          '{"en":"Palmeraie","es":"Palmeraie","fr":"Palmeraie"}'),
  ('rahba_kedina',       '{"en":"Rahba Kedina","es":"Rahba Kedina","fr":"Rahba Kedina"}'),
  ('riad_laarous',       '{"en":"Riad Laarous","es":"Riad Laarous","fr":"Riad Laarous"}'),
  ('sidi_ben_slimane',   '{"en":"Sidi Ben Slimane","es":"Sidi Ben Slimane","fr":"Sidi Ben Slimane"}'),
  ('zitoun',             '{"en":"Zitoun","es":"Zitoun","fr":"Zitoun"}');

-- 3. Add missing medina entries for Essaouira and Ouarzazate
INSERT INTO public.mgh_neighborhoods (id, label) VALUES
  ('essaouira_medina', '{"en":"Essaouira Medina","es":"Essaouira Medina","fr":"Médina d''Essaouira"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.mgh_neighborhoods (id, label) VALUES
  ('ouarzazate_medina', '{"en":"Ouarzazate Medina","es":"Ouarzazate Medina","fr":"Médina de Ouarzazate"}')
ON CONFLICT (id) DO NOTHING;

-- If you have a table named 'mgh_serivces_catalog' (typo), rename it:
ALTER TABLE IF EXISTS public.mgh_serivces_catalog RENAME TO mgh_services_catalog;

-- 5. Fix property type spelling: "Maison d'hôte" -> "Maison d'Hôtes"
-- Real current value (from MGH-Dashboard CSV): id='guesthouse', fr='Maison d''hôte'
UPDATE public.mgh_property_types
SET label = jsonb_set(
  label::jsonb,
  '{fr}',
  '"Maison d''Hôtes"'::jsonb
)
WHERE id = 'guesthouse';
