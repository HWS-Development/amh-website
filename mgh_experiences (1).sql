-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Régénéré : conserve uniquement les 3 expériences présentes en HeroSection
-- (Marrakech en calèche / Ouarzazate entre Kasbah et Oasis / Essaouira en vélo)
-- avec des images réelles scrappées depuis Wikimedia Commons, parfaitement
-- alignées avec le texte de chaque expérience.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `u877729207_mgh_dashboard`
--

-- --------------------------------------------------------

--
-- Structure de la table `mgh_experiences`
--

CREATE TABLE IF NOT EXISTS `mgh_experiences` (
  `id` char(36) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `hero_image_url` text DEFAULT NULL,
  `gallery_urls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gallery_urls`)),
  `map_embed_url` text DEFAULT NULL,
  `recommended_season` varchar(255) DEFAULT NULL,
  `duration_hint` varchar(255) DEFAULT NULL,
  `accessibility_notes` text DEFAULT NULL,
  `approx_budget_hint` varchar(255) DEFAULT NULL,
  `related_riads` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`related_riads`)),
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `title_tr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`title_tr`)),
  `subtitle_tr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`subtitle_tr`)),
  `destination_tr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`destination_tr`)),
  `short_intro_tr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`short_intro_tr`)),
  `description_rich_tr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`description_rich_tr`)),
  `what_to_do_tr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`what_to_do_tr`)),
  `good_to_know_tr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`good_to_know_tr`)),
  `booking_cta_label_tr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`booking_cta_label_tr`)),
  `seo_title_tr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`seo_title_tr`)),
  `seo_description_tr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`seo_description_tr`)),
  `seo_keywords_tr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`seo_keywords_tr`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Purge puis seed des 3 expériences alignées sur le HeroSection.
--
DELETE FROM `mgh_experiences`;

INSERT INTO `mgh_experiences` (`id`, `slug`, `hero_image_url`, `gallery_urls`, `map_embed_url`, `recommended_season`, `duration_hint`, `accessibility_notes`, `approx_budget_hint`, `related_riads`, `is_published`, `sort_order`, `title_tr`, `subtitle_tr`, `destination_tr`, `short_intro_tr`, `description_rich_tr`, `what_to_do_tr`, `good_to_know_tr`, `booking_cta_label_tr`, `seo_title_tr`, `seo_description_tr`, `seo_keywords_tr`, `created_at`, `updated_at`) VALUES

-- ── 1. Marrakech en calèche ──────────────────────────────────────────────────
('a1c1d1e1-1111-4111-8111-111111111111', 'marrakech-caleche',
 'https://upload.wikimedia.org/wikipedia/commons/3/39/Cal%C3%A8che_typique_de_Marrakech.jpg',
 '[\"https://upload.wikimedia.org/wikipedia/commons/3/39/Cal%C3%A8che_typique_de_Marrakech.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/7/7c/Ouazrariyassine2.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/6/6d/Moulay_El_Yazid_Mosque_in_Marrakech.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/3/3c/Caleche_in_Marrakech_%282902168814%29.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/b/bb/Caleches_in_Marrakech_%282901397989%29.jpg\"]',
 NULL, 'all_year', '1h - 2h', NULL, '150 - 250 MAD', NULL, 1, 10,
 '{\"en\": \"Marrakech by Horse-Drawn Carriage\", \"es\": \"Marrakech en calesa\", \"fr\": \"Marrakech en calèche\"}',
 '{\"en\": \"A timeless ride through the Ochre City\", \"es\": \"Un paseo atemporal por la ciudad ocre\", \"fr\": \"Une balade hors du temps dans la ville ocre\"}',
 '{\"en\": \"Marrakech\", \"es\": \"Marrakech\", \"fr\": \"Marrakech\"}',
 '{\"en\": \"Discover the lanes, ramparts and gardens of the Ochre City at the gentle pace of a traditional horse-drawn carriage.\", \"es\": \"Descubra las callejuelas, murallas y jardines de la ciudad ocre al tranquilo ritmo de una calesa tradicional.\", \"fr\": \"Découvrez les ruelles, remparts et jardins de la ville ocre au rythme tranquille d\'une calèche traditionnelle.\"}',
 '{\"en\": \"## A Royal Way to See Marrakech\\n\\nA two-horse carriage takes you along the medina ramparts, past the Koutoubia, the Menara gardens and the Hivernage district. A timeless interlude, ideal in late afternoon when the light gilds the walls.\", \"es\": \"## Una manera real de ver Marrakech\\n\\nUna calesa tirada por dos caballos le lleva a lo largo de las murallas de la medina, pasando por la Koutoubia, los jardines de la Menara y el barrio de Hivernage.\", \"fr\": \"## Une manière royale de découvrir Marrakech\\n\\nUne calèche tirée par deux chevaux vous emmène le long des remparts de la médina, en passant par la Koutoubia, les jardins de la Menara et le quartier de l\'Hivernage. Une parenthèse hors du temps, idéale en fin de journée lorsque la lumière dore les murailles.\"}',
 '{\"en\": [\"Circuit of the medina ramparts\", \"Koutoubia mosque viewpoint\", \"Menara gardens loop\", \"Hivernage & Hotel La Mamounia\"], \"es\": [\"Circuito de las murallas\", \"Mirador de la Koutoubia\", \"Jardines de la Menara\", \"Hivernage y La Mamounia\"], \"fr\": [\"Tour des remparts de la médina\", \"Point de vue sur la Koutoubia\", \"Boucle des jardins de la Menara\", \"Hivernage et La Mamounia\"]}',
 '{\"en\": \"Carriages depart from Place Jemaa el-Fna and Place de la Liberté. Best at sunset. Negotiate the fare before boarding (around 150–250 MAD for one hour).\", \"es\": \"Las calesas salen de la plaza Jemaa el-Fna y de la plaza de la Liberté. Mejor al atardecer. Negocie la tarifa antes de subir (unos 150–250 MAD por una hora).\", \"fr\": \"Les calèches partent de la place Jemaa el-Fna et de la place de la Liberté. Préférez la fin de journée. Négociez le tarif avant le départ (environ 150 à 250 MAD pour une heure).\"}',
 '{\"en\": \"Book a carriage ride\", \"es\": \"Reservar un paseo en calesa\", \"fr\": \"Réserver une balade en calèche\"}',
 '{\"en\": \"Marrakech by Horse-Drawn Carriage | AMH Voyages\", \"es\": \"Marrakech en calesa | AMH Voyages\", \"fr\": \"Marrakech en calèche | AMH Voyages\"}',
 '{\"en\": \"A traditional horse-drawn carriage ride through the ramparts, Koutoubia and Menara gardens of Marrakech.\", \"es\": \"Un paseo en calesa tradicional por las murallas, la Koutoubia y los jardines de la Menara de Marrakech.\", \"fr\": \"Une balade en calèche traditionnelle le long des remparts, de la Koutoubia et des jardins de la Menara.\"}',
 '{\"en\": [\"Marrakech\", \"horse carriage\", \"caleche\", \"Koutoubia\", \"Menara\"], \"es\": [\"Marrakech\", \"calesa\", \"Koutoubia\", \"Menara\"], \"fr\": [\"Marrakech\", \"calèche\", \"Koutoubia\", \"Menara\", \"médina\"]}',
 NOW(), NOW()),

-- ── 2. Ouarzazate entre Kasbah et Oasis ─────────────────────────────────────
('a2c2d2e2-2222-4222-8222-222222222222', 'ouarzazate-kasbah-oasis',
 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Ksar_A%C3%AFt_Benhaddou%2C_Marocco_%28%D8%A3%D9%8A%D8%AA_%D8%A8%D9%86_%D8%AD%D8%AF%D9%88%D8%8C_%D8%A7%D9%84%D9%85%D8%BA%D8%B1%D8%A8%2C_%E2%B4%B0%E2%B5%A2%E2%B5%9C_%E2%B5%83%E2%B4%B0%E2%B4%B7%E2%B4%B7%E2%B5%93%29.jpg',
 '[\"https://upload.wikimedia.org/wikipedia/commons/d/d5/Ksar_A%C3%AFt_Benhaddou%2C_Marocco_%28%D8%A3%D9%8A%D8%AA_%D8%A8%D9%86_%D8%AD%D8%AF%D9%88%D8%8C_%D8%A7%D9%84%D9%85%D8%BA%D8%B1%D8%A8%2C_%E2%B4%B0%E2%B5%A2%E2%B5%9C_%E2%B5%83%E2%B4%B0%E2%B4%B7%E2%B4%B7%E2%B5%93%29.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/8/8e/Ait_Ben_Haddou_%2816112394620%29.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/3/3f/Ksar_Ait_Benhaddou_DSC_0078_%2840858312145%29.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/8/83/A%C3%AFt_Benhaddou%2C_a_Kasbah.JPG\"]',
 NULL, 'spring,autumn', 'Day trip', NULL, '900 - 1500 MAD', NULL, 1, 20,
 '{\"en\": \"Ouarzazate, between Kasbah and Oasis\", \"es\": \"Ouarzazate, entre Kasbah y Oasis\", \"fr\": \"Ouarzazate, entre Kasbah et Oasis\"}',
 '{\"en\": \"Aït Ben Haddou ksar & Drâa palm groves\", \"es\": \"Ksar de Aït Ben Haddou y palmerales del Draa\", \"fr\": \"Ksar d\'Aït Ben Haddou et palmeraies du Drâa\"}',
 '{\"en\": \"Ouarzazate\", \"es\": \"Ouarzazate\", \"fr\": \"Ouarzazate\"}',
 '{\"en\": \"Cross the Atlas to discover the UNESCO-listed earthen ksar of Aït Ben Haddou and the green oases dotting the desert plains around Ouarzazate.\", \"es\": \"Cruce el Atlas para descubrir el ksar de adobe de Aït Ben Haddou, Patrimonio de la UNESCO, y los oasis verdes que salpican las llanuras desérticas de Ouarzazate.\", \"fr\": \"Traversez l\'Atlas pour découvrir le ksar en pisé d\'Aït Ben Haddou, classé UNESCO, et les oasis verdoyantes qui parsèment les plaines désertiques d\'Ouarzazate.\"}',
 '{\"en\": \"## A Cinematic Berber Citadel & its Oases\\n\\nNestled at the foot of the High Atlas, the ksar of Aït Ben Haddou is one of the finest examples of earthen architecture in southern Morocco. A UNESCO World Heritage Site since 1987, it has served as a backdrop for cult films (Gladiator, Game of Thrones, The Mummy, Lawrence of Arabia). Around Ouarzazate stretch the lush palm groves of the Drâa, the largest oasis valley in Morocco — a stark, magnificent contrast to the surrounding desert.\", \"es\": \"## Una ciudadela bereber de cine y sus oasis\\n\\nEnclavado al pie del Alto Atlas, el ksar de Aït Ben Haddou es uno de los mejores ejemplos de arquitectura de tierra del sur de Marruecos. Patrimonio de la Humanidad de la UNESCO desde 1987. Alrededor de Ouarzazate se extienden los exuberantes palmerales del Draa, el mayor valle oasis de Marruecos.\", \"fr\": \"## Une citadelle berbère de cinéma et ses oasis\\n\\nNiché au pied du Haut Atlas, le ksar d\'Aït Ben Haddou est l\'un des plus beaux exemples d\'architecture en terre crue du sud marocain. Inscrit au patrimoine mondial de l\'UNESCO depuis 1987, il a servi de décor à de nombreux films cultes (Gladiator, Game of Thrones, La Momie, Lawrence d\'Arabie). Autour de Ouarzazate s\'étendent les palmeraies luxuriantes de la vallée du Drâa, la plus grande oasis du Maroc — un contraste saisissant et magnifique avec le désert environnant.\"}',
 '{\"en\": [\"Cross the river to the fortified ksar\", \"Climb to the agadir for panoramic views\", \"Tea on a rooftop facing the kasbah\", \"Visit the Atlas Film Studios in Ouarzazate\", \"Stroll through the Drâa Valley palm groves\"], \"es\": [\"Cruzar el río hasta el ksar fortificado\", \"Subir al agadir para vistas panorámicas\", \"Té en una terraza frente a la kasbah\", \"Visitar los Atlas Studios\", \"Pasear por los palmerales del valle del Draa\"], \"fr\": [\"Traverser la rivière jusqu\'au ksar fortifié\", \"Monter à l\'agadir pour la vue panoramique\", \"Thé sur une terrasse face à la kasbah\", \"Visite des Atlas Studios à Ouarzazate\", \"Balade dans les palmeraies de la vallée du Drâa\"]}',
 '{\"en\": \"4 hours by road from Marrakech via the Tizi n\'Tichka pass. Best at golden hour. Wear sturdy shoes — the ascent is unpaved.\", \"es\": \"4 horas por carretera desde Marrakech por el paso Tizi n\'Tichka. Mejor a la hora dorada. Lleve calzado resistente.\", \"fr\": \"4 h de route depuis Marrakech par le col du Tizi n\'Tichka. Préférez la lumière dorée. Prévoyez des chaussures de marche, la montée est non pavée.\"}',
 '{\"en\": \"Plan an excursion\", \"es\": \"Planificar una excursión\", \"fr\": \"Planifier une excursion\"}',
 '{\"en\": \"Ouarzazate, Aït Ben Haddou & Drâa Oasis | AMH Voyages\", \"es\": \"Ouarzazate, Aït Ben Haddou y oasis del Draa | AMH Voyages\", \"fr\": \"Ouarzazate, Aït Ben Haddou et oasis du Drâa | AMH Voyages\"}',
 '{\"en\": \"Discover the UNESCO ksar of Aït Ben Haddou and the Drâa palm groves around Ouarzazate.\", \"es\": \"Descubra el ksar UNESCO de Aït Ben Haddou y los palmerales del Draa alrededor de Ouarzazate.\", \"fr\": \"Découvrez le ksar UNESCO d\'Aït Ben Haddou et les palmeraies du Drâa autour de Ouarzazate.\"}',
 '{\"en\": [\"Ouarzazate\", \"Ait Ben Haddou\", \"Kasbah\", \"Draa\", \"oasis\", \"UNESCO\"], \"es\": [\"Ouarzazate\", \"Ait Ben Haddou\", \"Kasbah\", \"Draa\", \"oasis\"], \"fr\": [\"Ouarzazate\", \"Aït Ben Haddou\", \"Kasbah\", \"Drâa\", \"oasis\", \"UNESCO\"]}',
 NOW(), NOW()),

-- ── 3. Essaouira en vélo ─────────────────────────────────────────────────────
('a3c3d3e3-3333-4333-8333-333333333333', 'essaouira-velo',
 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Morocco_-_Essaouira_Part_2_%2831679848385%29.jpg',
 '[\"https://upload.wikimedia.org/wikipedia/commons/b/b6/Morocco_-_Essaouira_Part_2_%2831679848385%29.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/a/ae/Essaouira_beach.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/d/db/EssaouiraRamparts.JPG\",\"https://upload.wikimedia.org/wikipedia/commons/c/c2/City_Walls_%2C_Essaouira_-_panoramio_%2824%29.jpg\"]',
 NULL, 'spring,summer,autumn', '2h - 4h', NULL, '80 - 150 MAD', NULL, 1, 30,
 '{\"en\": \"Essaouira by Bike\", \"es\": \"Essaouira en bicicleta\", \"fr\": \"Essaouira en vélo\"}',
 '{\"en\": \"Atlantic breeze, ramparts and argan forests\", \"es\": \"Brisa atlántica, murallas y arganes\", \"fr\": \"Embruns atlantiques, remparts et arganiers\"}',
 '{\"en\": \"Essaouira\", \"es\": \"Essaouira\", \"fr\": \"Essaouira\"}',
 '{\"en\": \"Cycle along Essaouira\'s Portuguese ramparts and beach, between Atlantic spray and trade winds.\", \"es\": \"Recorra en bicicleta las murallas portuguesas y la playa de Essaouira, entre la brisa atlántica y los vientos alisios.\", \"fr\": \"Longez les remparts portugais et la plage d\'Essaouira à vélo, entre embruns de l\'Atlantique et alizés.\"}',
 '{\"en\": \"## A Coastal Ride at Your Own Pace\\n\\nStarting from the medina, follow the coast southwards via Sidi Kaouki beach and the argan forests. A flat, accessible route punctuated by stops at beach cafés, fishermen\'s villages and argan-oil cooperatives run by women.\", \"es\": \"## Un paseo costero a tu ritmo\\n\\nPartiendo de la medina, siga la costa hacia el sur pasando por la playa de Sidi Kaouki y los bosques de argán. Una ruta plana y accesible, jalonada por cafés de playa, pueblos de pescadores y cooperativas de aceite de argán gestionadas por mujeres.\", \"fr\": \"## Une virée côtière à votre rythme\\n\\nAu départ de la médina, suivez la côte vers le sud en passant par la plage de Sidi Kaouki et les forêts d\'arganiers. Un parcours plat et accessible, ponctué d\'arrêts dans des cafés de plage, des villages de pêcheurs et chez les coopératives d\'huile d\'argan tenues par des femmes.\"}',
 '{\"en\": [\"Loop the Portuguese ramparts\", \"Ride down to Sidi Kaouki beach\", \"Stop at an argan cooperative\", \"Fresh seafood lunch at the harbour\"], \"es\": [\"Recorrer las murallas portuguesas\", \"Bajar a la playa de Sidi Kaouki\", \"Visita a una cooperativa de argán\", \"Almuerzo de mariscos en el puerto\"], \"fr\": [\"Boucler les remparts portugais\", \"Descendre jusqu\'à la plage de Sidi Kaouki\", \"Halte dans une coopérative d\'argan\", \"Déjeuner de fruits de mer au port\"]}',
 '{\"en\": \"Bike rental in the medina from 80 MAD/day. The trade winds make afternoon rides demanding — go in the morning.\", \"es\": \"Alquiler de bicicletas en la medina desde 80 MAD/día. Los vientos alisios son fuertes por la tarde, mejor por la mañana.\", \"fr\": \"Location de vélo dans la médina à partir de 80 MAD/jour. Les alizés rendent les après-midi exigeants : préférez la matinée.\"}',
 '{\"en\": \"Plan your bike day\", \"es\": \"Planificar su jornada en bici\", \"fr\": \"Planifier votre journée vélo\"}',
 '{\"en\": \"Essaouira by Bike | AMH Voyages\", \"es\": \"Essaouira en bicicleta | AMH Voyages\", \"fr\": \"Essaouira en vélo | AMH Voyages\"}',
 '{\"en\": \"Cycle the Portuguese ramparts, Atlantic beaches and argan forests of Essaouira.\", \"es\": \"Recorra en bici las murallas portuguesas, las playas atlánticas y los bosques de argán de Essaouira.\", \"fr\": \"Pédalez le long des remparts portugais, des plages atlantiques et des forêts d\'arganiers d\'Essaouira.\"}',
 '{\"en\": [\"Essaouira\", \"bike\", \"ramparts\", \"argan\", \"Sidi Kaouki\"], \"es\": [\"Essaouira\", \"bicicleta\", \"murallas\", \"argán\", \"Sidi Kaouki\"], \"fr\": [\"Essaouira\", \"vélo\", \"remparts\", \"argan\", \"Sidi Kaouki\"]}',
 NOW(), NOW())

ON DUPLICATE KEY UPDATE
  `hero_image_url`       = VALUES(`hero_image_url`),
  `gallery_urls`         = VALUES(`gallery_urls`),
  `recommended_season`   = VALUES(`recommended_season`),
  `duration_hint`        = VALUES(`duration_hint`),
  `approx_budget_hint`   = VALUES(`approx_budget_hint`),
  `is_published`         = VALUES(`is_published`),
  `sort_order`           = VALUES(`sort_order`),
  `title_tr`             = VALUES(`title_tr`),
  `subtitle_tr`          = VALUES(`subtitle_tr`),
  `destination_tr`       = VALUES(`destination_tr`),
  `short_intro_tr`       = VALUES(`short_intro_tr`),
  `description_rich_tr`  = VALUES(`description_rich_tr`),
  `what_to_do_tr`        = VALUES(`what_to_do_tr`),
  `good_to_know_tr`      = VALUES(`good_to_know_tr`),
  `booking_cta_label_tr` = VALUES(`booking_cta_label_tr`),
  `seo_title_tr`         = VALUES(`seo_title_tr`),
  `seo_description_tr`   = VALUES(`seo_description_tr`),
  `seo_keywords_tr`      = VALUES(`seo_keywords_tr`),
  `updated_at`           = NOW();

--
-- Index pour les tables déchargées
--
ALTER TABLE `mgh_experiences`
  ADD PRIMARY KEY IF NOT EXISTS (`id`),
  ADD UNIQUE KEY IF NOT EXISTS `mgh_experiences_slug_unique` (`slug`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
