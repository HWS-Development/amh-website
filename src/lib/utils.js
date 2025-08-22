
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getTranslated(jsonb, lang, fallback = 'en') {
  if (!jsonb) return '';
  if (typeof jsonb === 'string') return jsonb; // Fallback for non-JSONB data
  return jsonb[lang] || jsonb[fallback] || Object.values(jsonb)[0] || '';
}

export function getTranslatedArray(jsonb, lang, fallback = 'en') {
  if (!jsonb) return [];
  if (Array.isArray(jsonb)) return jsonb; // Fallback for non-JSONB data
  return jsonb[lang] || jsonb[fallback] || [];
}
