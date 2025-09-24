import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getTranslated(jsonb, lang, fallbackValue = '') {
  if (!jsonb) return fallbackValue;
  if (typeof jsonb === 'string') {
    try {
      const parsed = JSON.parse(jsonb);
      return parsed[lang] || parsed['en'] || Object.values(parsed)[0] || fallbackValue;
    } catch (e) {
      return jsonb;
    }
  }
  return jsonb[lang] || jsonb['en'] || Object.values(jsonb)[0] || fallbackValue;
}

export function getTranslatedArray(jsonb, lang, fallback = 'en') {
  if (!jsonb) return [];
  if (Array.isArray(jsonb)) return jsonb; // Fallback for non-JSONB data
  return jsonb[lang] || jsonb[fallback] || [];
}