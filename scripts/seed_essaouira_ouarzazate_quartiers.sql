-- ============================================================================
-- SEED: 3 quartiers chacun pour Essaouira et Ouarzazate
-- Idempotent : ON CONFLICT (id) DO UPDATE.
-- Run order: APRÈS migrate_quartiers_to_neighborhoods.sql et backfill_city_id.sql
-- ============================================================================

BEGIN;

-- ─── ESSAOUIRA ─────────────────────────────────────────────────────────────

INSERT INTO public.mgh_neighborhoods (
  id, label, short_desc_tr, long_desc_tr, images,
  is_featured, display_order, category_tags, ambiance_tags,
  latitude, longitude, city_id
) VALUES
(
  'essaouira-medina',
  '{"en":"Essaouira Medina","es":"Medina de Essaouira","fr":"Médina d''Essaouira"}'::jsonb,
  '{"en":"A UNESCO-listed walled medina of whitewashed houses and bright blue shutters, where artists, surfers and craftsmen cross paths.","es":"Una medina amurallada Patrimonio de la UNESCO, con casas encaladas y postigos azules, donde se cruzan artistas, surfistas y artesanos.","fr":"Une médina fortifiée classée à l''UNESCO, faite de maisons blanches aux volets bleus, où se croisent artistes, surfeurs et artisans."}'::jsonb,
  '{"en":"Designed by a French engineer in the 18th century, Essaouira''s medina is a perfect grid of bright lanes, art galleries, woodworking ateliers and small riads. Its salt-tinged air, Gnaoua music and laid-back rhythm make it one of Morocco''s most beloved coastal towns.","es":"Diseñada por un ingeniero francés en el siglo XVIII, la medina de Essaouira es una cuadrícula perfecta de callejuelas luminosas, galerías de arte, talleres de marquetería y pequeños riads. Su aire salino, la música gnaoua y su ritmo relajado la convierten en una de las ciudades costeras más queridas de Marruecos.","fr":"Dessinée par un ingénieur français au XVIIIᵉ siècle, la médina d''Essaouira est une grille parfaite de ruelles lumineuses, de galeries d''art, d''ateliers de marqueterie et de petits riads. Son air iodé, sa musique gnaoua et son rythme nonchalant en font l''une des villes côtières les plus aimées du Maroc."}'::jsonb,
  '["https://images.unsplash.com/photo-1539020140153-e479b8c5e8d8?w=1600&q=80","https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=1600&q=80"]'::jsonb,
  true, 1,
  '["souks","artisans"]'::jsonb,
  '["authentique","elegant"]'::jsonb,
  31.5125, -9.7700,
  'essaouira'
),
(
  'essaouira-skala',
  '{"en":"Skala de la Ville","es":"Skala de la Ville","fr":"Skala de la Ville"}'::jsonb,
  '{"en":"The legendary sea-facing ramparts lined with bronze cannons and Orson Welles-era cinema history.","es":"Las legendarias murallas frente al mar, jalonadas de cañones de bronce y con historia cinematográfica de la era de Orson Welles.","fr":"Les célèbres remparts face à l''océan, hérissés de canons en bronze, immortalisés par Orson Welles."}'::jsonb,
  '{"en":"Built atop the old Portuguese fortifications, the Skala offers one of the most cinematic ocean views in Morocco. Walk along the bastion at sunset, watch the Atlantic crash against the rocks, and step into the small marquetry workshops nestled into the ramparts.","es":"Construida sobre las antiguas fortificaciones portuguesas, la Skala ofrece una de las vistas oceánicas más cinematográficas de Marruecos. Pasea por el bastión al atardecer, observa el Atlántico romper contra las rocas y entra en los pequeños talleres de marquetería incrustados en las murallas.","fr":"Bâtie sur les anciennes fortifications portugaises, la Skala offre l''une des vues océaniques les plus cinématographiques du Maroc. Promenez-vous sur le bastion au coucher du soleil, regardez l''Atlantique se briser sur les rochers et poussez la porte des petits ateliers de marqueterie nichés dans les remparts."}'::jsonb,
  '["https://images.unsplash.com/photo-1531219432768-9f540ce7e2ec?w=1600&q=80","https://images.unsplash.com/photo-1517898717281-8e4385a41802?w=1600&q=80"]'::jsonb,
  true, 2,
  '["monuments"]'::jsonb,
  '["historique","calme"]'::jsonb,
  31.5142, -9.7733,
  'essaouira'
),
(
  'essaouira-port',
  '{"en":"Fishing Port","es":"Puerto de pesca","fr":"Port de pêche"}'::jsonb,
  '{"en":"A working harbour of bright blue wooden boats, where the day''s catch is auctioned right off the deck.","es":"Un puerto en plena actividad con barcos de madera azul brillante, donde la pesca del día se subasta directamente desde la cubierta.","fr":"Un port toujours actif aux barques en bois bleu vif, où la pêche du jour se vend à la criée directement sur les pontons."}'::jsonb,
  '{"en":"Essaouira''s port is one of the most photogenic in the country. Wander between piles of nets, swirling seagulls, and stacks of just-landed sardines. Stop at one of the open-air grills for the freshest seafood you''ll ever taste, served on a paper plate facing the sea.","es":"El puerto de Essaouira es uno de los más fotogénicos del país. Pasea entre redes apiladas, gaviotas que revolotean y montones de sardinas recién pescadas. Detente en una de las parrillas al aire libre para probar el marisco más fresco de tu vida, servido en un plato de papel frente al mar.","fr":"Le port d''Essaouira est l''un des plus photogéniques du pays. Promenez-vous au milieu des filets, des mouettes tournoyantes et des cagettes de sardines tout juste débarquées. Arrêtez-vous à l''une des grillades en plein air pour goûter aux poissons les plus frais de votre vie, servis dans une assiette en carton face à l''océan."}'::jsonb,
  '["https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600&q=80","https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1600&q=80"]'::jsonb,
  true, 3,
  '["restaurants"]'::jsonb,
  '["authentique"]'::jsonb,
  31.5106, -9.7747,
  'essaouira'
)
ON CONFLICT (id) DO UPDATE SET
  label          = EXCLUDED.label,
  short_desc_tr  = EXCLUDED.short_desc_tr,
  long_desc_tr   = EXCLUDED.long_desc_tr,
  images         = EXCLUDED.images,
  is_featured    = EXCLUDED.is_featured,
  display_order  = EXCLUDED.display_order,
  category_tags  = EXCLUDED.category_tags,
  ambiance_tags  = EXCLUDED.ambiance_tags,
  latitude       = EXCLUDED.latitude,
  longitude      = EXCLUDED.longitude,
  city_id        = EXCLUDED.city_id;

-- ─── OUARZAZATE ────────────────────────────────────────────────────────────

INSERT INTO public.mgh_neighborhoods (
  id, label, short_desc_tr, long_desc_tr, images,
  is_featured, display_order, category_tags, ambiance_tags,
  latitude, longitude, city_id
) VALUES
(
  'ait-ben-haddou',
  '{"en":"Aït Ben Haddou","es":"Aït Ben Haddou","fr":"Aït Ben Haddou"}'::jsonb,
  '{"en":"A UNESCO-listed earthen ksar that has played the part of Jerusalem, Thebes and Westeros on screen.","es":"Un ksar de tierra Patrimonio de la UNESCO, escenario de Jerusalén, Tebas y Poniente en el cine.","fr":"Un ksar de terre classé à l''UNESCO, qui a tour à tour joué Jérusalem, Thèbes et Westeros à l''écran."}'::jsonb,
  '{"en":"Half an hour from Ouarzazate, the fortified village of Aït Ben Haddou rises out of the desert in stacked towers of pisé. Climb the narrow alleyways to the agadir at the top for a sweeping view of palm groves and ochre mountains. Gladiator, Game of Thrones and dozens of other films were shot here.","es":"A media hora de Ouarzazate, el pueblo fortificado de Aït Ben Haddou se alza en el desierto en torres escalonadas de pisé. Sube por sus callejuelas hasta el agadir de la cumbre para disfrutar de una vista panorámica de los palmerales y las montañas ocres. Aquí se rodaron Gladiator, Juego de Tronos y decenas de otras películas.","fr":"À une demi-heure de Ouarzazate, le ksar fortifié d''Aït Ben Haddou s''élève du désert en tours étagées de pisé. Grimpez les ruelles étroites jusqu''à l''agadir au sommet pour une vue panoramique sur les palmeraies et les montagnes ocres. Gladiator, Game of Thrones et des dizaines d''autres films y ont été tournés."}'::jsonb,
  '["https://images.unsplash.com/photo-1553244830-9bce10288a45?w=1600&q=80","https://images.unsplash.com/photo-1539650116574-75c0c6d73f6f?w=1600&q=80"]'::jsonb,
  true, 1,
  '["monuments"]'::jsonb,
  '["historique"]'::jsonb,
  31.0470, -7.1294,
  'ouarzazate'
),
(
  'taourirt-kasbah',
  '{"en":"Taourirt Kasbah","es":"Kasbah de Taourirt","fr":"Kasbah de Taourirt"}'::jsonb,
  '{"en":"The fortified residence of the Glaoui pashas at the heart of Ouarzazate.","es":"La residencia fortificada de los pashás Glaoui en el corazón de Ouarzazate.","fr":"La résidence fortifiée des pachas Glaoui au cœur de Ouarzazate."}'::jsonb,
  '{"en":"Right inside Ouarzazate, the Taourirt Kasbah is a labyrinth of ornate reception rooms, harem quarters and rooftop terraces that once housed one of the most powerful families of southern Morocco. Its richly painted ceilings and zellige walls give a glimpse of pre-Independence Berber aristocracy.","es":"En el mismo Ouarzazate, la Kasbah de Taourirt es un laberinto de suntuosas salas de recepción, aposentos del harén y terrazas que albergaron a una de las familias más poderosas del sur de Marruecos. Sus techos pintados y sus paredes de zellige ofrecen una visión de la aristocracia bereber anterior a la Independencia.","fr":"En plein cœur de Ouarzazate, la Kasbah de Taourirt est un dédale de salons d''apparat, d''appartements de harem et de terrasses qui ont abrité l''une des familles les plus puissantes du sud marocain. Ses plafonds peints et ses murs de zellige offrent un aperçu de l''aristocratie berbère pré-indépendance."}'::jsonb,
  '["https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&q=80","https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1600&q=80"]'::jsonb,
  true, 2,
  '["monuments","musees"]'::jsonb,
  '["historique","elegant"]'::jsonb,
  30.9189, -6.8967,
  'ouarzazate'
),
(
  'vallee-draa',
  '{"en":"Draâ Valley","es":"Valle del Draa","fr":"Vallée du Draâ"}'::jsonb,
  '{"en":"A 200-km ribbon of palm groves, mudbrick villages and old kasbahs winding from Ouarzazate to the dunes of Zagora.","es":"Una franja de 200 km de palmerales, pueblos de adobe y antiguas kasbahs que serpentea desde Ouarzazate hasta las dunas de Zagora.","fr":"Un ruban de 200 km de palmeraies, de villages en pisé et de vieilles kasbahs serpentant de Ouarzazate aux dunes de Zagora."}'::jsonb,
  '{"en":"Following the Draâ River south of Ouarzazate, this valley is one of Morocco''s great scenic drives. Stop in Agdz, Tamnougalt or Zagora to wander palm groves still tended by berber families, sleep in a restored kasbah, and end the journey on a camel into the Sahara dunes of Tinfou.","es":"Siguiendo el río Draa al sur de Ouarzazate, este valle es una de las rutas escénicas más impresionantes de Marruecos. Detente en Agdz, Tamnougalt o Zagora para recorrer palmerales aún cuidados por familias bereberes, dormir en una kasbah restaurada y terminar el viaje a camello en las dunas saharianas de Tinfou.","fr":"Suivant l''oued Draâ au sud de Ouarzazate, cette vallée offre l''une des plus belles routes panoramiques du Maroc. Arrêtez-vous à Agdz, Tamnougalt ou Zagora pour parcourir des palmeraies encore cultivées par les familles berbères, dormez dans une kasbah restaurée et terminez le périple à dos de chameau dans les dunes sahariennes de Tinfou."}'::jsonb,
  '["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80","https://images.unsplash.com/photo-1489493585363-d69421e0edd3?w=1600&q=80"]'::jsonb,
  true, 3,
  '["monuments"]'::jsonb,
  '["authentique","calme"]'::jsonb,
  30.3500, -6.4500,
  'ouarzazate'
)
ON CONFLICT (id) DO UPDATE SET
  label          = EXCLUDED.label,
  short_desc_tr  = EXCLUDED.short_desc_tr,
  long_desc_tr   = EXCLUDED.long_desc_tr,
  images         = EXCLUDED.images,
  is_featured    = EXCLUDED.is_featured,
  display_order  = EXCLUDED.display_order,
  category_tags  = EXCLUDED.category_tags,
  ambiance_tags  = EXCLUDED.ambiance_tags,
  latitude       = EXCLUDED.latitude,
  longitude      = EXCLUDED.longitude,
  city_id        = EXCLUDED.city_id;

-- Sanity check
-- SELECT city_id, count(*) FILTER (WHERE jsonb_array_length(images) > 0) AS with_images
-- FROM public.mgh_neighborhoods GROUP BY city_id;

COMMIT;
