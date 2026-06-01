// src/lib/catalogs.js
import { supabase } from "@/lib/customSupabaseClient";
import { getTranslated } from "@/lib/utils";

const catalogCache = new Map();

export const fetchCatalog = async (table, lang) => {
  const key = `${table}:${lang}`;
  if (catalogCache.has(key)) return catalogCache.get(key);

  const { data, error } = await supabase
    .from(table)
    .select("id, label");

  if (error) throw error;

  const result = data.map((row) => ({
    id: row.id,
    label: getTranslated(row.label, lang),
  }));

  catalogCache.set(key, result);
  return result;
};
