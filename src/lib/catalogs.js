// src/lib/catalogs.js
import { supabase } from "@/lib/customSupabaseClient";
import { getTranslated } from "@/lib/utils";

export const fetchCatalog = async (table, lang) => {
  const { data, error } = await supabase
    .from(table)
    .select("id, label");

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    label: getTranslated(row.label, lang),
  }));
};
