import { supabase } from "@/lib/customSupabaseClient";

export const NEIGHBORHOOD_CITIES = [
  { id: "marrakech", labelKey: "cityMarrakech", fallback: "Marrakech" },
  { id: "essaouira", labelKey: "cityEssaouira", fallback: "Essaouira" },
  { id: "ouarzazate", labelKey: "cityOuarzazate", fallback: "Ouarzazate" },
];

const CITY_ALIASES = {
  marrakesh: "marrakech",
  marakech: "marrakech",
  esauira: "essaouira",
  essouira: "essaouira",
  ouarzazat: "ouarzazate",
  warzazat: "ouarzazate",
};

const slugifyCity = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const normalizeNeighborhoodCityId = (city) => {
  const slug = slugifyCity(city);
  if (!slug || slug === "all" || slug === "tous" || slug === "todos") return null;
  return CITY_ALIASES[slug] || slug;
};

const normalizeNeighborhoodRow = (row) => ({
  ...row,
  city_id: row.city_id == null ? null : String(row.city_id),
  slug: row.id,
  name_tr: row.label,
  lat: row.lat ?? row.latitude ?? null,
  lng: row.lng ?? row.longitude ?? null,
});

export const getAllNeighborhoodsByCity = async (city) => {
  const cityIds = Array.isArray(city)
    ? [...new Set(city.map(normalizeNeighborhoodCityId).filter(Boolean))]
    : normalizeNeighborhoodCityId(city);

  if (Array.isArray(city) && cityIds.length === 0) return [];

  let query = supabase.from("mgh_neighborhoods").select("*");

  if (Array.isArray(cityIds) && cityIds.length > 0) {
    query = query.in("city_id", cityIds);
  } else if (cityIds) {
    query = query.eq("city_id", cityIds);
  }

  const { data, error } = await query
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) throw error;

  return (data || []).map(normalizeNeighborhoodRow);
};
