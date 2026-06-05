// Rewrites mgh_neighborhoods_rows.sql, filling the `images` column for each
// quartier with curated Wikimedia Commons URLs (or preserving existing
// Supabase storage URLs). Images were chosen to authentically represent
// the place (Wikipedia main thumbnails when available).
//
// Run: node scripts/fill_neighborhood_images.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_PATH = path.resolve(__dirname, "..", "mgh_neighborhoods_rows.sql");

// id -> array of image URLs (authentic, per-quartier)
const IMAGE_MAP = {
  // ---- Marrakech medina & monuments ----
  "agdal": [
    "https://upload.wikimedia.org/wikipedia/commons/7/78/Agdale_%28retouched%29.jpg",
  ],
  "ait-ben-haddou": [
    "https://upload.wikimedia.org/wikipedia/commons/d/d5/Ksar_A%C3%AFt_Benhaddou%2C_Marocco_%28%D8%A3%D9%8A%D8%AA_%D8%A8%D9%86_%D8%AD%D8%AF%D9%88%D8%8C_%D8%A7%D9%84%D9%85%D8%BA%D8%B1%D8%A8%2C_%E2%B4%B0%E2%B5%A2%E2%B5%9C_%E2%B5%83%E2%B4%B0%E2%B4%B7%E2%B4%B7%E2%B5%93%29.jpg",
  ],
  "bab_doukkala": [
    "https://upload.wikimedia.org/wikipedia/commons/6/68/Bab_doukkala_IMG_3357.jpg",
  ],
  "bab-aghmat": [
    "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/public/quartier_medina/Bab-Ghmat.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b8/Porte_de_ville_sur_les_remparts%2C_personnages_et_%C3%A2nes_sap04_10l00124_p.jpg",
  ],
  "bab-doukkala": [
    "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/public/quartier_medina/bab_doukkala.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/6/68/Bab_doukkala_IMG_3357.jpg",
  ],
  "ben_youssef": [
    "https://upload.wikimedia.org/wikipedia/commons/3/3a/Coranic_School_%28106589859%29.jpeg",
  ],
  "ben-youssef": [
    "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/public/quartier_medina/ben_youssef.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/3a/Coranic_School_%28106589859%29.jpeg",
  ],
  "dar_el_bacha": [
    "https://upload.wikimedia.org/wikipedia/commons/0/0b/Dar_el_Bacha.jpg",
  ],
  "dar-el-bacha-mouassine": [
    "https://upload.wikimedia.org/wikipedia/commons/0/0b/Dar_el_Bacha.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/e/e0/Mouassine_mosque_02.jpg",
  ],
  "derb_dabachi": [
    "https://upload.wikimedia.org/wikipedia/commons/7/79/Djemaa_el_Fna.jpg",
  ],
  "derb_sidi_bou_amar": [
    "https://upload.wikimedia.org/wikipedia/commons/3/3b/Saadian_Tombs_1044-HDR.jpg",
  ],
  "derb-dabachi-riad-zitoun": [
    "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/public/quartier_medina/riad_zitoune.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/7/79/Djemaa_el_Fna.jpg",
  ],
  "desert": [
    "https://upload.wikimedia.org/wikipedia/commons/8/84/Agafay_desert.jpg",
  ],
  "essaouira_exterieurs": [
    "https://upload.wikimedia.org/wikipedia/commons/b/b6/Morocco_-_Essaouira_Part_2_%2831679848385%29.jpg",
  ],
  "essaouira_medina": [
    "https://upload.wikimedia.org/wikipedia/commons/c/c0/Medina_of_Essaouira_%28formerly_Mogador%29-113160.jpg",
  ],
  "essaouira-medina": [
    "https://upload.wikimedia.org/wikipedia/commons/c/c0/Medina_of_Essaouira_%28formerly_Mogador%29-113160.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b6/Morocco_-_Essaouira_Part_2_%2831679848385%29.jpg",
  ],
  "essaouira-port": [
    "https://upload.wikimedia.org/wikipedia/commons/b/b6/Morocco_-_Essaouira_Part_2_%2831679848385%29.jpg",
  ],
  "essaouira-skala": [
    "https://upload.wikimedia.org/wikipedia/commons/c/c0/Medina_of_Essaouira_%28formerly_Mogador%29-113160.jpg",
  ],
  "exterior": [
    "https://upload.wikimedia.org/wikipedia/commons/5/5a/Palmeraie_de_Marrakech.JPG",
  ],
  "gueliz": [
    "https://upload.wikimedia.org/wikipedia/commons/9/9c/Pavillon_Menarag%C3%A4rten.jpg",
  ],
  "hay_essalam": [
    "https://upload.wikimedia.org/wikipedia/commons/7/78/In_the_narrow_streets_of_Mellah_of_Marrakech.jpg",
  ],
  "kasbah": [
    "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/public/quartier_medina/kasbah_marrakech.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/3b/Saadian_Tombs_1044-HDR.jpg",
  ],
  "kennaria": [
    "https://upload.wikimedia.org/wikipedia/commons/7/79/Djemaa_el_Fna.jpg",
  ],
  "mellah": [
    "https://upload.wikimedia.org/wikipedia/commons/7/78/In_the_narrow_streets_of_Mellah_of_Marrakech.jpg",
  ],
  "montagne": [
    "https://upload.wikimedia.org/wikipedia/commons/d/d5/Ksar_A%C3%AFt_Benhaddou%2C_Marocco_%28%D8%A3%D9%8A%D8%AA_%D8%A8%D9%86_%D8%AD%D8%AF%D9%88%D8%8C_%D8%A7%D9%84%D9%85%D8%BA%D8%B1%D8%A8%2C_%E2%B4%B0%E2%B5%A2%E2%B5%9C_%E2%B5%83%E2%B4%B0%E2%B4%B7%E2%B4%B7%E2%B5%93%29.jpg",
  ],
  "mouassine": [
    "https://upload.wikimedia.org/wikipedia/commons/e/e0/Mouassine_mosque_02.jpg",
  ],
  "ouarzazate_exterieurs": [
    "https://upload.wikimedia.org/wikipedia/commons/3/3b/Ksar_of_Taourirt%2C_Ouarzazate%2C_Morocco_%28%D9%82%D8%B5%D8%A8%D8%A9_%D8%AA%D8%A7%D9%88%D8%B1%D9%8A%D8%B1%D8%AA%2C_%E2%B5%9C%E2%B4%B0%E2%B5%A1%E2%B5%94%E2%B5%89%E2%B5%94%E2%B5%9C%29.jpg",
  ],
  "palmeraie": [
    "https://upload.wikimedia.org/wikipedia/commons/5/5a/Palmeraie_de_Marrakech.JPG",
  ],
  "rahba_kedina": [
    "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/public/quartier_medina/the_souks.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/7/79/Djemaa_el_Fna.jpg",
  ],
  "riad_laarous": [
    "https://upload.wikimedia.org/wikipedia/commons/e/e0/Mouassine_mosque_02.jpg",
  ],
  "sidi_ben_slimane": [
    "https://upload.wikimedia.org/wikipedia/commons/e/e0/Mouassine_mosque_02.jpg",
  ],
  "souks": [
    "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/public/quartier_medina/the_souks.jpg",
  ],
  "taourirt-kasbah": [
    "https://upload.wikimedia.org/wikipedia/commons/3/3b/Ksar_of_Taourirt%2C_Ouarzazate%2C_Morocco_%28%D9%82%D8%B5%D8%A8%D8%A9_%D8%AA%D8%A7%D9%88%D8%B1%D9%8A%D8%B1%D8%AA%2C_%E2%B5%9C%E2%B4%B0%E2%B5%A1%E2%B5%94%E2%B5%89%E2%B5%94%E2%B5%9C%29.jpg",
  ],
  "vallee-draa": [
    "https://upload.wikimedia.org/wikipedia/commons/a/ae/Draa_River.jpg",
  ],
  "zaouia-sidi-bel-abbes": [
    "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/public/quartier_medina/zaouia.jpg",
  ],
  "zitoun": [
    "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/public/quartier_medina/riad_zitoune.jpg",
  ],
};

const sql = fs.readFileSync(SQL_PATH, "utf8");

// Each row is a tuple ('id', '{label}', 'created_at', '{shortdesc}', '{longdesc}', '[images]', bool, ...).
// Match each row tuple non-greedily up to the first images array, then to the
// boolean is_featured (true|false), to safely locate the images column.
// We capture the images JSON-as-text inside single-quoted string.
//
// SQL string escaping: '' is an escaped quote inside a SQL string. We must
// match strings that may contain '' sequences.
//
// Pattern per row prefix:
//   ('<id>', '...label...', '<timestamp>', <shortdesc>, <longdesc>, '<imagesArray>', <bool>
const ROW_RE = /\('([a-z0-9_\-]+)',\s*'((?:[^']|'')*)',\s*'([^']+)',\s*(null|'(?:[^']|'')*'),\s*(null|'(?:[^']|'')*'),\s*'((?:[^']|'')*)',\s*(true|false|null)/g;

const replaced = new Set();
const skipped = [];

const updated = sql.replace(ROW_RE, (full, id, label, createdAt, shortDesc, longDesc, imagesStr, isFeatured) => {
  const target = IMAGE_MAP[id];
  if (!target) {
    skipped.push(id);
    return full;
  }
  replaced.add(id);
  const newImages = JSON.stringify(target).replace(/'/g, "''");
  const head = full.substring(0, full.lastIndexOf(`'${imagesStr}'`));
  const tail = full.substring(full.lastIndexOf(`'${imagesStr}'`) + imagesStr.length + 2);
  return `${head}'${newImages}'${tail}`;
});

fs.writeFileSync(SQL_PATH, updated, "utf8");

console.log(`[ok] Updated ${replaced.size} quartier rows.`);
console.log(`     Replaced: ${[...replaced].sort().join(", ")}`);
if (skipped.length) console.log(`     Skipped (no mapping): ${skipped.join(", ")}`);
