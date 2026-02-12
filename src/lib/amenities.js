// src/lib/amenities.js

export const normalizeText = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/⁠/g, "")
    .trim();

/**
 * 👉 Pour FilterDrawer
 * Retourne les labels visibles selon la langue
 */
export const extractAmenities = (amenitiesJson, lang = "fr") => {
  if (!amenitiesJson || !amenitiesJson[lang]) return [];

  return amenitiesJson[lang]
    .split(",")
    .map((a) => a.replace(/⁠/g, "").trim())
    .filter(Boolean);
};

/**
 * 👉 Pour le filtrage interne (keys stables)
 * Génère une liste UNIQUE de clés normalisées
 */
export const extractAmenityItems = (amenitiesJson) => {
  if (!amenitiesJson) return [];

  const set = new Set();

  ["fr", "en", "es"].forEach((lang) => {
    if (!amenitiesJson[lang]) return;

    amenitiesJson[lang]
      .split(",")
      .map((a) => normalizeText(a))
      .filter(Boolean)
      .forEach((k) => set.add(k));
  });

  return Array.from(set).map((key) => ({ key }));
};

/**
 */
export const getAmenityLabel = (item, lang = "fr", amenitiesJson = {}) => {
  if (!item?.key) return "";

  const raw = amenitiesJson?.[lang]?.split(",") || [];
  const found = raw.find((a) => normalizeText(a) === item.key);

  return found?.trim() || "";
};
