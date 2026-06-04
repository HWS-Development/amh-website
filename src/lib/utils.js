import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/*
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
*/

function tryParse(value) {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}

function langKey(lang) {
  if (!lang || typeof lang !== 'string') return lang;
  return lang.split('-')[0].toLowerCase();
}

function resolveLang(value, lang, fallbackLang) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const key = langKey(lang);
  const fallbackKey = langKey(fallbackLang);
  return value[key] ?? value[fallbackKey] ?? Object.values(value)[0] ?? value;
}

export const getTranslated = (value, lang, fallbackLang = 'fr') => {
  if (!value) return '';
  const parsed = tryParse(value);
  if (typeof parsed === 'object' && !Array.isArray(parsed)) {
    const resolved = resolveLang(parsed, lang, fallbackLang);
    return typeof resolved === 'string' ? resolved : '';
  }
  return typeof parsed === 'string' ? parsed : '';
};

export function getTranslatedArray(jsonb, lang, fallback = 'en') {
  if (!jsonb) return [];
  const parsed = tryParse(jsonb);
  if (Array.isArray(parsed)) return parsed;
  if (typeof parsed === 'object' && parsed !== null) {
    const resolved = resolveLang(parsed, lang, fallback);
    return Array.isArray(resolved) ? resolved : [];
  }
  return [];
}