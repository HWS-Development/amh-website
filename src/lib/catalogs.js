// src/lib/catalogs.js
import { supabase } from "@/lib/customSupabaseClient";

export const fetchCatalog = async (table, lang) => {
  const { data, error } = await supabase
    .from(table)
    .select("id, label");

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    label: row.label?.[lang] || row.id,
  }));
};
