// src/lib/catalogs.js
import { supabase } from "@/lib/customSupabaseClient";
import { getTranslated } from "@/lib/utils";

const catalogCache = new Map();

// Client-side label overrides to defend against DB typos / inconsistent casing
const LABEL_OVERRIDES = {
  mgh_property_types: {
    guesthouse: { fr: "Maison d'Hôtes", en: "Guesthouse", es: "Casa de Huéspedes" },
    // also catch alternate id spellings
    maison_d_hotes: { fr: "Maison d'Hôtes", en: "Guesthouse", es: "Casa de Huéspedes" },
    maison_dhotes: { fr: "Maison d'Hôtes", en: "Guesthouse", es: "Casa de Huéspedes" },
  },
};

const applyOverride = (table, id, label, lang) => {
  const o = LABEL_OVERRIDES[table]?.[id];
  if (!o) return label;
  return o[lang] || o.fr || label;
};

// Normalize common French property-type misspellings in any label
const normalizeFrPropertyTypeLabel = (s) => {
  if (typeof s !== "string") return s;
  // "Maison d'hôtes" / "Maison d'hotes" / "Maison D'Hotes" -> "Maison d'Hôtes"
  return s.replace(/maison\s*d['’]?\s*h[oô]tes/gi, "Maison d'Hôtes");
};

// Tables that need extra columns surfaced in the catalog shape
const EXTRA_COLUMNS = {
  mgh_neighborhoods: ["city_id"],
};

export const fetchCatalog = async (table, lang) => {
  const key = `${table}:${lang}`;
  if (catalogCache.has(key)) return catalogCache.get(key);

  const extras = EXTRA_COLUMNS[table] || [];
  const selectCols = ["id", "label", ...extras].join(", ");

  const { data, error } = await supabase
    .from(table)
    .select(selectCols);

  if (error) throw error;

  let result = data.map((row) => {
    let label = getTranslated(row.label, lang);
    label = applyOverride(table, row.id, label, lang);
    if (table === "mgh_property_types") label = normalizeFrPropertyTypeLabel(label);
    const out = { id: row.id, label };
    extras.forEach((col) => { out[col] = row[col] ?? null; });
    return out;
  });

  // Deduplicate: collapse rows that share the same id OR the same
  // normalized label (defends against amenity grouping issues in the DB).
  const seenId = new Set();
  const seenLabel = new Set();
  result = result.filter(({ id, label }) => {
    const lkey = (label || "").trim().toLowerCase();
    if (seenId.has(id) || (lkey && seenLabel.has(lkey))) return false;
    seenId.add(id);
    if (lkey) seenLabel.add(lkey);
    return true;
  });

  catalogCache.set(key, result);
  return result;
};
