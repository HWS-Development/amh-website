#!/usr/bin/env node
/**
 * Populate `hero_image_url` and `gallery_urls` in `mgh_experiences (1).sql`
 * with real, license-friendly images sourced from Wikimedia Commons via the
 * Wikipedia REST summary API. Idempotent and re-runnable.
 *
 * Usage:  node scripts/fill_experiences_images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_PATH  = path.resolve(__dirname, "..", "mgh_experiences (1).sql");

if (!fs.existsSync(SQL_PATH)) {
  console.error(`[fatal] SQL file not found: ${SQL_PATH}`);
  process.exit(1);
}

/* ── Curated Wikipedia article titles per experience.
   First entry → hero_image_url. Remaining → gallery. */
const EXPERIENCE_MAP = {
  "gastronomy":          ["Tajine",          "Couscous",                 "Moroccan_cuisine",        "Pastilla"],
  "sea-surf-essaouira":  ["Essaouira",       "Mogador",                  "Sidi_Kaouki",             "Essaouira_Province"],
  "artisan-crafts":      ["Zellij",          "Marrakesh",                "Berber_carpet",           "Moroccan_leather"],
  "nature-wellness":     ["Atlas_Mountains", "Ourika_Valley",            "Toubkal",                 "Imlil"],
  "culture-heritage":    ["Kutubiyya_Mosque","Bahia_Palace",             "Ben_Youssef_Madrasa",     "Saadian_Tombs"],
  "lifestyle-events":    ["Jardin_Majorelle","Gnawa",                    "Jemaa_el-Fnaa",           "Marrakech_International_Film_Festival"],
};

const UA = "amh-website-image-fill/1.0 (https://amh-voyages.com; contact@amh.example)";

async function fetchSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${title}`);
  const json = await res.json();
  // Prefer originalimage (full res) → thumbnail (640px) fallback
  return json.originalimage?.source || json.thumbnail?.source || null;
}

async function resolveImages(titles) {
  const out = [];
  for (const t of titles) {
    try {
      const src = await fetchSummary(t);
      if (src) {
        out.push(src);
        console.log(`  [ok] ${t} → ${src}`);
      } else {
        console.warn(`  [skip] ${t} → no image`);
      }
    } catch (e) {
      console.warn(`  [err] ${t}: ${e.message}`);
    }
    // Be polite with the Wikipedia API.
    await new Promise((r) => setTimeout(r, 350));
  }
  return out;
}

/* ── Robust row parser for the single big INSERT in the dump.
   Each row tuple begins with `('<uuid>', '<slug>', ` and we splice in the
   first two fields (hero_image_url + gallery_urls) by index. */
function updateSql(text, slugToImages) {
  // Match each row: starts with ('uuid', 'slug', 'hero', 'gallery_json',
  // hero may be a single-quoted string OR NULL; same for gallery.
  // Single-quoted strings may contain escaped quotes (\'), so use a careful regex.
  const ROW_RE =
    /(\(\s*'[0-9a-f-]{36}'\s*,\s*'([a-z0-9-]+)'\s*,\s*)(?:'((?:[^'\\]|\\.)*)'|NULL)\s*,\s*(?:'((?:[^'\\]|\\.)*)'|NULL)/g;

  let replaced = 0;
  const updated = text.replace(ROW_RE, (match, prefix, slug, _hero, _gallery) => {
    const imgs = slugToImages[slug];
    if (!imgs || imgs.length === 0) return match;
    const hero = imgs[0];
    const gallery = JSON.stringify(imgs); // full list (incl. hero) as gallery
    // Re-escape for single-quoted SQL string: ' → '' is MySQL standard, but
    // this dump uses backslash escapes (\'), so escape the same way to stay
    // consistent with the existing data.
    const sqlEscape = (s) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    replaced++;
    return `${prefix}'${sqlEscape(hero)}', '${sqlEscape(gallery)}'`;
  });

  return { updated, replaced };
}

/* ── Main ───────────────────────────────────────────────────────────── */
const slugs = Object.keys(EXPERIENCE_MAP);
console.log(`[info] Resolving images for ${slugs.length} experiences…`);

const slugToImages = {};
for (const slug of slugs) {
  console.log(`\n[exp] ${slug}`);
  slugToImages[slug] = await resolveImages(EXPERIENCE_MAP[slug]);
}

const original = fs.readFileSync(SQL_PATH, "utf8");
const { updated, replaced } = updateSql(original, slugToImages);

if (replaced === 0) {
  console.error("\n[fatal] Did not replace any rows. The ROW_RE may need updating.");
  process.exit(2);
}

fs.writeFileSync(SQL_PATH, updated, "utf8");
console.log(`\n[ok] Updated ${replaced} experience rows in ${path.basename(SQL_PATH)}`);
