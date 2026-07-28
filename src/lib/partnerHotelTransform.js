import { extractCentraHotelId, extractCentraOrganizationId, idToLabel } from "@/lib/partnerHotelsApi";

const FALLBACK_LANGUAGES = ["fr", "en", "es"];

function tryParse(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function languageKey(language) {
  return typeof language === "string" ? language.split("-")[0].toLowerCase() : null;
}

export function resolvePartnerText(value, language) {
  const parsed = tryParse(value);

  if (parsed == null) return "";
  if (typeof parsed === "string" || typeof parsed === "number") {
    return String(parsed).trim();
  }

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      const text = resolvePartnerText(item, language);
      if (text) return text;
    }
    return "";
  }

  if (typeof parsed === "object") {
    const preferredKeys = [
      languageKey(language),
      ...FALLBACK_LANGUAGES,
      "label",
      "name",
      "title",
      "value",
      "id",
    ].filter(Boolean);

    for (const key of preferredKeys) {
      if (!Object.prototype.hasOwnProperty.call(parsed, key)) continue;
      const text = resolvePartnerText(parsed[key], language);
      if (text) return text;
    }

    for (const item of Object.values(parsed)) {
      const text = resolvePartnerText(item, language);
      if (text) return text;
    }
  }

  return "";
}

export function normalizeOptionId(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function firstText(values, language) {
  for (const value of values) {
    const text = resolvePartnerText(value, language);
    if (text) return text;
  }
  return "";
}

function toArray(value, splitString = false) {
  const parsed = tryParse(value);
  if (parsed == null || parsed === "") return [];
  if (Array.isArray(parsed)) return parsed;
  if (splitString && typeof parsed === "string" && parsed.includes(",")) {
    return parsed.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [parsed];
}

function objectId(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value.id || value.code || value.slug || value.key || value.value || null;
}

function optionLabel(item, fallbackId, language) {
  const text = resolvePartnerText(item, language);
  if (text && fallbackId && text !== fallbackId) return text;
  if (fallbackId) return idToLabel(fallbackId);
  if (!text) return "";
  return /^[a-z0-9_]+$/.test(text) ? idToLabel(text) : text;
}

function normalizeOptionList(idsValue, itemsValue, language) {
  const rawIds = toArray(idsValue, true).filter((item) => item != null && item !== "");
  const rawItems = toArray(itemsValue, false).filter((item) => item != null && item !== "");
  const sourceItems = rawItems.length > 0 ? rawItems : rawIds;
  const length = Math.max(rawIds.length, sourceItems.length);
  const seen = new Set();
  const options = [];

  for (let index = 0; index < length; index += 1) {
    const rawId = rawIds[index];
    const item = sourceItems[index] ?? rawId;
    const fallbackId = rawId && typeof rawId !== "object" ? String(rawId).trim() : null;
    const explicitId = objectId(item);
    const label = optionLabel(item, fallbackId || explicitId, language);
    const id = String(fallbackId || explicitId || normalizeOptionId(label)).trim();

    if (!id || !label || seen.has(id)) continue;
    seen.add(id);
    options.push({ id, label });
  }

  return {
    ids: options.map((option) => option.id),
    labels: options.map((option) => option.label),
    options,
  };
}

function firstArrayItem(value) {
  const list = toArray(value, false);
  return list.length > 0 ? list[0] : null;
}

function normalizeRating(value) {
  if (typeof value === "number") return Number.isNaN(value) ? null : value;
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function mapPartnerHotelToRiad(hotel, language, catalogs = {}) {
  const imageUrls = hotel.image_urls || hotel.imageUrls || [];
  const id = extractCentraHotelId(imageUrls) || hotel.id;

  const rawCityId = hotel.city_id || hotel.cityId || null;
  const city = firstText(
    [hotel.city, hotel.cityName, hotel.city_name, catalogs.cities?.[rawCityId], rawCityId],
    language
  );
  const cityId = rawCityId || (city ? normalizeOptionId(city) : null);

  const rawNeighborhood =
    hotel.neighborhood ||
    hotel.neighbourhood ||
    hotel.neighborhoodName ||
    hotel.neighborhood_name ||
    firstArrayItem(hotel.neighborhoods || hotel.neighbourhoods);
  const rawNeighborhoodId =
    hotel.neighborhood_id ||
    hotel.neighborhoodId ||
    hotel.neighbourhood_id ||
    hotel.neighbourhoodId ||
    objectId(rawNeighborhood);
  const neighborhood = firstText(
    [rawNeighborhood, catalogs.neighborhoods?.[rawNeighborhoodId], rawNeighborhoodId],
    language
  );
  const neighborhoodId = rawNeighborhoodId || (neighborhood ? normalizeOptionId(neighborhood) : null);

  const rawPropertyType =
    hotel.property_type ||
    hotel.propertyType ||
    hotel.propertyTypeName ||
    hotel.property_type_name;
  const rawPropertyTypeId = hotel.property_type_id || hotel.propertyTypeId || objectId(rawPropertyType);
  const propertyType = firstText(
    [rawPropertyType, catalogs.propertyTypes?.[rawPropertyTypeId], rawPropertyTypeId],
    language
  );
  const propertyTypeId = rawPropertyTypeId || (propertyType ? normalizeOptionId(propertyType) : null);

  const amenities = normalizeOptionList(
    hotel.amenity_ids || hotel.amenityIds,
    hotel.amenities || hotel.amenityList || hotel.amenity_list,
    language
  );
  const services = normalizeOptionList(
    hotel.service_ids || hotel.serviceIds,
    hotel.services || hotel.serviceList || hotel.service_list,
    language
  );

  return {
    id,
    organizationId: extractCentraOrganizationId(imageUrls),
    name: firstText([hotel.hoteName, hotel.hotelName, hotel.hotel_name, hotel.name, id], language),
    description: firstText([hotel.description], language),
    country: typeof hotel.country === "string" ? hotel.country : null,
    city,
    street: typeof hotel.street === "string" ? hotel.street : null,
    city_id: cityId,
    neighborhood_id: neighborhoodId,
    property_type_id: propertyTypeId,
    neighborhood,
    propertyType,
    amenity_ids: amenities.ids,
    amenities: amenities.labels,
    amenityOptions: amenities.options,
    service_ids: services.ids,
    services: services.labels,
    serviceOptions: services.options,
    rating_avg: normalizeRating(hotel.rating_avg ?? hotel.ratingAvg),
    reviews_count: hotel.reviews_count ?? hotel.reviewsCount ?? null,
    imageUrl: hotel.main_image_url || hotel.mainImageUrl || (Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls[0] : null),
    simple_booking_link: hotel.simple_booking_link || hotel.simpleBookingLink || hotel.be_link || hotel.beLink || null,
  };
}

function normalizeCatalogOptions(options = []) {
  return options
    .map((option) => ({
      ...option,
      id: option.id != null ? String(option.id) : "",
      label: option.label || idToLabel(option.id),
      city_id: option.city_id != null ? String(option.city_id) : option.city_id,
    }))
    .filter((option) => option.id && option.label);
}

function sortOptions(options) {
  return [...options].sort((a, b) => String(a.label).localeCompare(String(b.label)));
}

function localizeAvailableOptions(availableOptions, catalogOptions = []) {
  const localizedCatalog = normalizeCatalogOptions(catalogOptions);
  if (availableOptions.length === 0) return localizedCatalog;

  const localizedById = new Map(localizedCatalog.map((option) => [option.id, option.label]));
  return sortOptions(availableOptions.map((option) => ({
    ...option,
    label: localizedById.get(String(option.id)) || option.label,
  })));
}

function addOption(map, id, label, extra = {}) {
  const optionId = id != null ? String(id) : "";
  const optionLabel = String(label || "").trim();
  if (!optionId || !optionLabel || map.has(optionId)) return;
  map.set(optionId, { id: optionId, label: optionLabel, ...extra });
}

function addFeatureOptions(map, ids = [], labels = [], options = []) {
  if (options.length > 0) {
    options.forEach((option) => addOption(map, option.id, option.label));
    return;
  }

  ids.forEach((id, index) => addOption(map, id, labels[index] || idToLabel(id)));
}

export function deriveFilterOptionsFromRiads(riads = []) {
  const cities = new Map();
  const neighborhoods = new Map();
  const propertyTypes = new Map();
  const amenities = new Map();
  const services = new Map();

  riads.forEach((riad) => {
    addOption(cities, riad.city_id, riad.city || idToLabel(riad.city_id));
    addOption(neighborhoods, riad.neighborhood_id, riad.neighborhood || idToLabel(riad.neighborhood_id), {
      city_id: riad.city_id != null ? String(riad.city_id) : null,
    });
    addOption(propertyTypes, riad.property_type_id, riad.propertyType || idToLabel(riad.property_type_id));
    addFeatureOptions(amenities, riad.amenity_ids, riad.amenities, riad.amenityOptions);
    addFeatureOptions(services, riad.service_ids, riad.services, riad.serviceOptions);
  });

  return {
    cities: sortOptions(Array.from(cities.values())),
    neighborhoods: sortOptions(Array.from(neighborhoods.values())),
    propertyTypes: sortOptions(Array.from(propertyTypes.values())),
    amenities: sortOptions(Array.from(amenities.values())),
    services: sortOptions(Array.from(services.values())),
  };
}

export function getAvailableFilterOptions(riads = [], fallback = {}) {
  const derived = deriveFilterOptionsFromRiads(riads);

  return {
    cities: derived.cities.length > 0 ? derived.cities : normalizeCatalogOptions(fallback.cities),
    neighborhoods: derived.neighborhoods.length > 0 ? derived.neighborhoods : normalizeCatalogOptions(fallback.neighborhoods),
    propertyTypes: derived.propertyTypes.length > 0 ? derived.propertyTypes : normalizeCatalogOptions(fallback.propertyTypes),
    amenities: localizeAvailableOptions(derived.amenities, fallback.amenities),
    services: localizeAvailableOptions(derived.services, fallback.services),
  };
}
