-- ============================================================================
-- SEED: 4 curated experiences for Supabase PostgreSQL (mgh_experiences)
-- Run via Supabase SQL editor.
-- Matches the existing schema (UUID id, JSONB *_tr columns, is_published bool).
-- ============================================================================

INSERT INTO public.mgh_experiences (
  id, slug, hero_image_url, gallery_urls,
  is_published, sort_order,
  title_tr, subtitle_tr, destination_tr,
  short_intro_tr, description_rich_tr,
  what_to_do_tr, good_to_know_tr, booking_cta_label_tr,
  created_at, updated_at
) VALUES
-- ── 1. Marrakech en calèche ────────────────────────────────────────────────
(
  gen_random_uuid(),
  'marrakech-caleche',
  'https://images.unsplash.com/photo-1539020140153-e479b8c5b3b3?w=1600&q=80',
  '[]'::jsonb,
  true, 10,
  '{"en":"Marrakech by Horse-Drawn Carriage","es":"Marrakech en calesa","fr":"Marrakech en calèche"}'::jsonb,
  '{"en":"A timeless ride through the Ochre City","es":"Un paseo atemporal por la ciudad ocre","fr":"Une balade hors du temps dans la ville ocre"}'::jsonb,
  '{"en":"Marrakech","es":"Marrakech","fr":"Marrakech"}'::jsonb,
  '{"en":"Discover the lanes, ramparts and gardens of the Ochre City at the gentle pace of a traditional horse-drawn carriage.","es":"Descubra las callejuelas, murallas y jardines de la ciudad ocre al tranquilo ritmo de una calesa tradicional.","fr":"Découvrez les ruelles, remparts et jardins de la ville ocre au rythme tranquille d''une calèche traditionnelle."}'::jsonb,
  '{"en":"## A Royal Way to See Marrakech\n\nA two-horse carriage takes you along the medina ramparts, past the Koutoubia, the Menara gardens and the Hivernage district. A timeless interlude, ideal in late afternoon when the light gilds the walls.","es":"## Una manera real de ver Marrakech\n\nUna calesa tirada por dos caballos le lleva a lo largo de las murallas de la medina, pasando por la Koutoubia, los jardines de la Menara y el barrio de Hivernage.","fr":"## Une manière royale de découvrir Marrakech\n\nUne calèche tirée par deux chevaux vous emmène le long des remparts de la médina, en passant par la Koutoubia, les jardins de la Menara et le quartier de l''Hivernage. Une parenthèse hors du temps, idéale en fin de journée lorsque la lumière dore les murailles."}'::jsonb,
  '{"en":"- Circuit of the medina ramparts\n- Koutoubia mosque viewpoint\n- Menara gardens loop\n- Hivernage & Hotel La Mamounia","es":"- Circuito de las murallas\n- Mirador de la Koutoubia\n- Jardines de la Menara\n- Hivernage y La Mamounia","fr":"- Tour des remparts de la médina\n- Point de vue sur la Koutoubia\n- Boucle des jardins de la Menara\n- Hivernage et La Mamounia"}'::jsonb,
  '{"en":"Carriages depart from Place Jemaa el-Fna and Place de la Liberté. Best at sunset. Negotiate the fare before boarding (around 150–250 MAD for one hour).","es":"Las calesas salen de la plaza Jemaa el-Fna y de la plaza de la Liberté. Mejor al atardecer.","fr":"Les calèches partent de la place Jemaa el-Fna et de la place de la Liberté. Préférez la fin de journée. Négociez le tarif avant le départ (environ 150 à 250 MAD pour une heure)."}'::jsonb,
  '{"en":"Book a carriage ride","es":"Reservar un paseo en calesa","fr":"Réserver une balade en calèche"}'::jsonb,
  NOW(), NOW()
),
-- ── 2. Ouarzazate — Kasbah d'Aït Ben Haddou ────────────────────────────────
(
  gen_random_uuid(),
  'ouarzazate-ait-ben-haddou',
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&q=80',
  '[]'::jsonb,
  true, 11,
  '{"en":"Ouarzazate — Aït Ben Haddou Kasbah","es":"Ouarzazate — Kasbah de Aït Ben Haddou","fr":"Ouarzazate — Kasbah d''Aït Ben Haddou"}'::jsonb,
  '{"en":"A UNESCO ksar at the gates of the Sahara","es":"Un ksar Patrimonio de la Humanidad","fr":"Un ksar UNESCO aux portes du Sahara"}'::jsonb,
  '{"en":"Ouarzazate","es":"Ouarzazate","fr":"Ouarzazate"}'::jsonb,
  '{"en":"Explore the UNESCO-listed ksar of Aït Ben Haddou, a jewel of Berber earthen architecture and legendary film set.","es":"Explore el ksar Patrimonio de la Humanidad de Aït Ben Haddou, joya de la arquitectura bereber en adobe.","fr":"Explorez le ksar classé UNESCO d''Aït Ben Haddou, joyau d''architecture berbère en pisé et décor de films mythiques."}'::jsonb,
  '{"en":"## A Cinematic Berber Citadel\n\nNestled at the foot of the High Atlas, the ksar of Aït Ben Haddou is one of the finest examples of earthen architecture in southern Morocco. A UNESCO World Heritage Site since 1987, it has served as a backdrop for cult films (Gladiator, Game of Thrones, The Mummy, Lawrence of Arabia).","es":"## Una ciudadela bereber de cine\n\nEnclavado al pie del Alto Atlas, el ksar de Aït Ben Haddou es uno de los mejores ejemplos de arquitectura de tierra del sur de Marruecos. Patrimonio de la Humanidad de la UNESCO desde 1987.","fr":"## Une citadelle berbère de cinéma\n\nNiché au pied du Haut Atlas, le ksar d''Aït Ben Haddou est l''un des plus beaux exemples d''architecture en terre crue du sud marocain. Inscrit au patrimoine mondial de l''UNESCO depuis 1987, il a servi de décor à de nombreux films cultes (Gladiator, Game of Thrones, La Momie, Lawrence d''Arabie)."}'::jsonb,
  '{"en":"- Cross the river to the fortified ksar\n- Climb to the agadir for panoramic views\n- Tea on a rooftop facing the kasbah\n- Visit the Atlas Film Studios in Ouarzazate","es":"- Cruzar el río hasta el ksar fortificado\n- Subir al agadir para vistas panorámicas\n- Té en una terraza frente a la kasbah\n- Visitar los Atlas Studios","fr":"- Traverser la rivière jusqu''au ksar fortifié\n- Monter à l''agadir pour la vue panoramique\n- Thé sur une terrasse face à la kasbah\n- Visite des Atlas Studios à Ouarzazate"}'::jsonb,
  '{"en":"4 hours by road from Marrakech via the Tizi n''Tichka pass. Best at golden hour. Wear sturdy shoes — the ascent is unpaved.","es":"4 horas por carretera desde Marrakech por el paso Tizi n''Tichka. Mejor a la hora dorada. Lleve calzado resistente.","fr":"4 h de route depuis Marrakech par le col du Tizi n''Tichka. Préférez la lumière dorée. Prévoyez des chaussures de marche, la montée est non pavée."}'::jsonb,
  '{"en":"Plan an excursion","es":"Planificar una excursión","fr":"Planifier une excursion"}'::jsonb,
  NOW(), NOW()
),
-- ── 3. Désert d'Agafay en dromadaire ou en quad ───────────────────────────
(
  gen_random_uuid(),
  'desert-agafay-dromadaire-quad',
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1600&q=80',
  '[]'::jsonb,
  true, 12,
  '{"en":"Agafay Desert — Camel or Quad Bike","es":"Desierto de Agafay — Dromedario o quad","fr":"Désert d''Agafay — Dromadaire ou quad"}'::jsonb,
  '{"en":"Lunar landscapes one hour from Marrakech","es":"Paisajes lunares a una hora de Marrakech","fr":"Paysages lunaires à une heure de Marrakech"}'::jsonb,
  '{"en":"Agafay","es":"Agafay","fr":"Agafay"}'::jsonb,
  '{"en":"One hour from Marrakech, cross the lunar landscapes of the Agafay desert on camelback or by quad bike.","es":"A una hora de Marrakech, atraviese los paisajes lunares del desierto de Agafay en dromedario o en quad.","fr":"À une heure de Marrakech, traversez les paysages lunaires du désert d''Agafay à dos de dromadaire ou en quad."}'::jsonb,
  '{"en":"## Stone Desert with Atlas Views\n\nThe Agafay desert offers, just 40 km from Marrakech, spectacular mineral expanses framed by the snow-capped Atlas peaks. Choose between a sunset camel ride, a quad-bike adventure across ochre tracks, or a Berber dinner under the stars in a luxury camp.","es":"## Desierto pedregoso con vistas al Atlas\n\nEl desierto de Agafay ofrece, a solo 40 km de Marrakech, espectaculares extensiones minerales con las cumbres nevadas del Atlas como telón de fondo.","fr":"## Un désert minéral face à l''Atlas\n\nLe désert d''Agafay offre, à seulement 40 km de Marrakech, des étendues minérales spectaculaires avec, en toile de fond, les sommets enneigés de l''Atlas. Au choix : balade à dos de dromadaire au coucher du soleil, virée en quad à travers les pistes ocre, ou dîner berbère sous les étoiles dans un camp de luxe."}'::jsonb,
  '{"en":"- Sunset camel trek (1–2 h)\n- Guided quad bike tour\n- Hot-air balloon flight at dawn\n- Berber dinner & music under the stars","es":"- Paseo en dromedario al atardecer\n- Tour guiado en quad\n- Vuelo en globo al amanecer\n- Cena bereber y música bajo las estrellas","fr":"- Balade en dromadaire au coucher du soleil\n- Sortie quad encadrée\n- Vol en montgolfière à l''aube\n- Dîner berbère et musique sous les étoiles"}'::jsonb,
  '{"en":"45 min by road from Marrakech. Bring sun protection, scarf and closed shoes. Camps offer day-pass with pool & lunch.","es":"45 min en coche desde Marrakech. Lleve protección solar, pañuelo y zapatos cerrados.","fr":"45 min de route depuis Marrakech. Prévoyez protection solaire, chèche et chaussures fermées. Les camps proposent un day-pass avec piscine et déjeuner."}'::jsonb,
  '{"en":"Reserve a desert escape","es":"Reservar una escapada al desierto","fr":"Réserver une escapade dans le désert"}'::jsonb,
  NOW(), NOW()
),
-- ── 4. Essaouira en vélo ───────────────────────────────────────────────────
(
  gen_random_uuid(),
  'essaouira-velo',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&q=80',
  '[]'::jsonb,
  true, 13,
  '{"en":"Essaouira by Bike","es":"Essaouira en bicicleta","fr":"Essaouira en vélo"}'::jsonb,
  '{"en":"Atlantic breeze, ramparts and argan forests","es":"Brisa atlántica, murallas y arganes","fr":"Embruns atlantiques, remparts et arganiers"}'::jsonb,
  '{"en":"Essaouira","es":"Essaouira","fr":"Essaouira"}'::jsonb,
  '{"en":"Cycle along Essaouira''s Portuguese ramparts and beach, between Atlantic spray and trade winds.","es":"Recorra en bicicleta las murallas portuguesas y la playa de Essaouira, entre la brisa atlántica y los vientos alisios.","fr":"Longez les remparts portugais et la plage d''Essaouira à vélo, entre embruns de l''Atlantique et alizés."}'::jsonb,
  '{"en":"## A Coastal Ride at Your Own Pace\n\nStarting from the medina, follow the coast southwards via Sidi Kaouki beach and the argan forests. A flat, accessible route punctuated by stops at beach cafés, fishermen''s villages and argan-oil cooperatives run by women.","es":"## Un paseo costero a tu ritmo\n\nPartiendo de la medina, siga la costa hacia el sur pasando por la playa de Sidi Kaouki y los bosques de argán.","fr":"## Une virée côtière à votre rythme\n\nAu départ de la médina, suivez la côte vers le sud en passant par la plage de Sidi Kaouki et les forêts d''arganiers. Un parcours plat et accessible, ponctué d''arrêts dans des cafés de plage, des villages de pêcheurs et chez les coopératives d''huile d''argan tenues par des femmes."}'::jsonb,
  '{"en":"- Loop the Portuguese ramparts\n- Ride down to Sidi Kaouki beach\n- Stop at an argan cooperative\n- Fresh seafood lunch at the harbour","es":"- Recorrer las murallas portuguesas\n- Bajar a la playa de Sidi Kaouki\n- Visita a una cooperativa de argán\n- Almuerzo de mariscos en el puerto","fr":"- Boucler les remparts portugais\n- Descendre jusqu''à la plage de Sidi Kaouki\n- Halte dans une coopérative d''argan\n- Déjeuner de fruits de mer au port"}'::jsonb,
  '{"en":"Bike rental in the medina from 80 MAD/day. The trade winds make afternoon rides demanding — go in the morning.","es":"Alquiler de bicicletas en la medina desde 80 MAD/día. Los vientos alisios son fuertes por la tarde, mejor por la mañana.","fr":"Location de vélo dans la médina à partir de 80 MAD/jour. Les alizés rendent les après-midi exigeants : préférez la matinée."}'::jsonb,
  '{"en":"Plan your bike day","es":"Planificar su jornada en bici","fr":"Planifier votre journée vélo"}'::jsonb,
  NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title_tr             = EXCLUDED.title_tr,
  subtitle_tr          = EXCLUDED.subtitle_tr,
  destination_tr       = EXCLUDED.destination_tr,
  short_intro_tr       = EXCLUDED.short_intro_tr,
  description_rich_tr  = EXCLUDED.description_rich_tr,
  what_to_do_tr        = EXCLUDED.what_to_do_tr,
  good_to_know_tr      = EXCLUDED.good_to_know_tr,
  booking_cta_label_tr = EXCLUDED.booking_cta_label_tr,
  hero_image_url       = EXCLUDED.hero_image_url,
  is_published         = EXCLUDED.is_published,
  sort_order           = EXCLUDED.sort_order,
  updated_at           = NOW();
