import { extractCentraHotelId, extractCentraOrganizationId, idToLabel } from "@/lib/partnerHotelsApi";

const FALLBACK_LANGUAGES = ["fr", "en", "es"];
const CITY_ALIASES = {
  marrakesh: "marrakech",
  marakech: "marrakech",
  esauira: "essaouira",
  essouira: "essaouira",
  ouarzazat: "ouarzazate",
  warzazat: "ouarzazate",
};
const NON_IMAGE_EXTENSION = /\.(?:heic|mp4|mov|webm)(?:$|[?#])/i;
const CATALOG_LOOKUP_CACHE = new WeakMap();

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

function getCatalogEntries(catalogs, key) {
  return Array.isArray(catalogs?.[key]) ? catalogs[key] : [];
}

function getCatalogLookup(entries) {
  if (!Array.isArray(entries)) return new Map();
  const cached = CATALOG_LOOKUP_CACHE.get(entries);
  if (cached) return cached;

  const lookup = new Map();
  entries.forEach((entry) => {
    const id = String(entry?.id || "").trim();
    if (!id) return;
    lookup.set(id, entry);
    const normalizedId = normalizeOptionId(id);
    if (normalizedId && !lookup.has(normalizedId)) lookup.set(normalizedId, entry);
  });
  CATALOG_LOOKUP_CACHE.set(entries, lookup);
  return lookup;
}

function findCatalogEntry(entries, id) {
  const value = String(id || "").trim();
  if (!value) return null;
  const lookup = getCatalogLookup(entries);
  return lookup.get(value) || lookup.get(normalizeOptionId(value)) || null;
}

function optionLabel(item, fallbackId, language) {
  const text = resolvePartnerText(item, language);
  if (text && fallbackId && text !== fallbackId) return text;
  if (fallbackId) return idToLabel(fallbackId);
  if (!text) return "";
  return /^[a-z0-9_-]+$/.test(text) ? idToLabel(text) : text;
}

function normalizeOptionList(idsValue, itemsValue, language, catalogEntries = []) {
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
    const knownId = String(fallbackId || explicitId || "").trim();
    const catalogEntry = findCatalogEntry(catalogEntries, knownId);
    const catalogLabel = resolvePartnerText(catalogEntry?.label, language);
    const label = catalogLabel || optionLabel(item, knownId, language);
    const id = knownId || String(catalogEntry?.id || "").trim() || normalizeOptionId(label);

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

function normalizeCityId(value) {
  const id = normalizeOptionId(value);
  return CITY_ALIASES[id] || id || null;
}

function displayCentraLabel(value, id, language) {
  const text = resolvePartnerText(value, language);
  if (!text) return id ? idToLabel(id) : "";
  if (id && normalizeOptionId(text) === normalizeOptionId(id)) return idToLabel(id);
  return text;
}

export function isPartnerImageUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url) && !NON_IMAGE_EXTENSION.test(url);
}

function uniquePartnerImages(hotel) {
  const images = [
    hotel.mainImageUrl ?? hotel.main_image_url,
    ...toArray(hotel.imageUrls ?? hotel.image_urls),
  ].filter(isPartnerImageUrl);
  return [...new Set(images)];
}

export function mapPartnerHotelToRiad(hotel, language, catalogs) {
  const rawImageUrls = hotel.imageUrls ?? hotel.image_urls ?? [];
  const imageUrls = uniquePartnerImages(hotel);
  const id = hotel.id || extractCentraHotelId(rawImageUrls);

  const rawNeighborhood =
    hotel.neighborhood ||
    hotel.neighbourhood ||
    hotel.neighborhoodName ||
    hotel.neighborhood_name ||
    firstArrayItem(hotel.neighborhoods || hotel.neighbourhoods);
  const rawNeighborhoodId =
    hotel.neighborhoodId ??
    hotel.neighborhood_id ??
    hotel.neighbourhoodId ??
    hotel.neighbourhood_id ??
    objectId(rawNeighborhood);
  const neighborhoodCatalog = findCatalogEntry(
    getCatalogEntries(catalogs, "neighborhoods"),
    rawNeighborhoodId
  );

  const rawCityId = hotel.cityId ?? hotel.city_id ?? neighborhoodCatalog?.cityId ?? null;
  const cityId = rawCityId || normalizeCityId(hotel.city || hotel.cityName || hotel.city_name);
  const city = displayCentraLabel(
    firstText([hotel.city, hotel.cityName, hotel.city_name], language),
    cityId,
    language
  );

  const neighborhood = resolvePartnerText(neighborhoodCatalog?.label, language) || displayCentraLabel(
    rawNeighborhood,
    rawNeighborhoodId,
    language
  );
  const neighborhoodId = rawNeighborhoodId || neighborhoodCatalog?.id || (neighborhood ? normalizeOptionId(neighborhood) : null);

  const rawPropertyType =
    hotel.property_type ||
    hotel.propertyType ||
    hotel.propertyTypeName ||
    hotel.property_type_name;
  const rawPropertyTypeId = hotel.propertyTypeId ?? hotel.property_type_id ?? objectId(rawPropertyType);
  const propertyType = displayCentraLabel(rawPropertyType, rawPropertyTypeId, language);
  const propertyTypeId = rawPropertyTypeId || (propertyType ? normalizeOptionId(propertyType) : null);

  const amenities = normalizeOptionList(
    hotel.amenityIds ?? hotel.amenity_ids,
    hotel.amenities || hotel.amenityList || hotel.amenity_list,
    language,
    getCatalogEntries(catalogs, "amenities")
  );
  const services = normalizeOptionList(
    hotel.serviceIds ?? hotel.service_ids,
    hotel.services || hotel.serviceList || hotel.service_list,
    language,
    getCatalogEntries(catalogs, "services")
  );
  const bookingConditions = normalizeOptionList(
    hotel.bookingConditionIds ?? hotel.booking_condition_ids,
    hotel.booking_conditions || hotel.bookingConditions || hotel.booking_condition_list,
    language,
    getCatalogEntries(catalogs, "bookingConditions")
  );
  const neighborhoodDetails = neighborhoodCatalog ? {
    id: neighborhoodId,
    catalogId: String(neighborhoodCatalog.id),
    label: neighborhood,
    city_id: neighborhoodCatalog.cityId || cityId,
    shortDescription: resolvePartnerText(neighborhoodCatalog.shortDescTr, language),
    longDescription: resolvePartnerText(neighborhoodCatalog.longDescTr, language),
    images: toArray(neighborhoodCatalog.images).filter(isPartnerImageUrl),
    isFeatured: Boolean(neighborhoodCatalog.isFeatured),
    displayOrder: neighborhoodCatalog.displayOrder ?? null,
    walkingMinutesFromJemaa: neighborhoodCatalog.walkingMinutesFromJemaa ?? null,
    categoryTags: toArray(neighborhoodCatalog.categoryTags),
    ambianceTags: toArray(neighborhoodCatalog.ambianceTags),
    latitude: neighborhoodCatalog.latitude ?? null,
    longitude: neighborhoodCatalog.longitude ?? null,
  } : null;

  return {
    id,
    organizationId: extractCentraOrganizationId(rawImageUrls),
    name: firstText([hotel.hoteName, hotel.hotelName, hotel.hotel_name, hotel.name, id], language),
    description: firstText([hotel.description], language),
    address: firstText([hotel.address], language),
    country: hotel.country === "MA" ? "Morocco" : (typeof hotel.country === "string" ? hotel.country : null),
    city,
    street: typeof hotel.street === "string" ? hotel.street : null,
    city_id: cityId,
    neighborhood_id: neighborhoodId,
    property_type_id: propertyTypeId,
    neighborhood,
    neighborhoodDetails,
    propertyType,
    amenity_ids: amenities.ids,
    amenities: amenities.labels,
    amenityOptions: amenities.options,
    service_ids: services.ids,
    services: services.labels,
    serviceOptions: services.options,
    booking_condition_ids: bookingConditions.ids,
    bookingConditions: bookingConditions.labels,
    bookingConditionOptions: bookingConditions.options,
    rating_avg: normalizeRating(hotel.ratingAvg ?? hotel.rating_avg),
    reviews_count: hotel.reviewsCount ?? hotel.reviews_count ?? null,
    main_image_url: isPartnerImageUrl(hotel.mainImageUrl ?? hotel.main_image_url)
      ? (hotel.mainImageUrl ?? hotel.main_image_url)
      : null,
    image_urls: imageUrls,
    imageUrl: imageUrls[0] || null,
    phone: hotel.phone || hotel.phone_number || hotel.phoneNumber || null,
    whatsapp_number: hotel.whatsappNumber || hotel.whatsapp_number || null,
    simple_booking_link: hotel.beLink || hotel.be_link || hotel.simpleBookingLink || hotel.simple_booking_link || null,
  };
}

function sortOptions(options) {
  return [...options].sort((a, b) => String(a.label).localeCompare(String(b.label)));
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

export function getAvailableFilterOptions(riads = []) {
  return deriveFilterOptionsFromRiads(riads);
}

export function deriveDestinationsFromRiads(riads = []) {
  const destinations = new Map();

  riads.forEach((riad) => {
    if (!riad.city_id || !riad.city) return;
    const id = String(riad.city_id);
    const current = destinations.get(id) || {
      id,
      slug: id,
      name: riad.city,
      image: null,
      hero_image_urls: [],
      hotelCount: 0,
    };
    current.hotelCount += 1;
    if (!current.image && riad.imageUrl) {
      current.image = riad.imageUrl;
      current.hero_image_urls = [riad.imageUrl];
    }
    destinations.set(id, current);
  });

  return sortOptions(Array.from(destinations.values()).map((destination) => ({
    ...destination,
    label: destination.name,
  })));
}

export function deriveNeighborhoodsFromRiads(riads = []) {
  const neighborhoods = new Map();

  riads.forEach((riad) => {
    if (!riad.neighborhood_id || !riad.neighborhood) return;
    const id = String(riad.neighborhood_id);
    const details = riad.neighborhoodDetails || {};
    const catalogImages = Array.isArray(details.images) ? details.images : [];
    const current = neighborhoods.get(id) || {
      id,
      slug: id,
      name: riad.neighborhood,
      label: riad.neighborhood,
      city_id: details.city_id || (riad.city_id ? String(riad.city_id) : null),
      city: riad.city || "",
      image: catalogImages[0] || null,
      images: catalogImages.slice(0, 5),
      shortDescription: details.shortDescription || "",
      longDescription: details.longDescription || "",
      isFeatured: Boolean(details.isFeatured),
      displayOrder: details.displayOrder ?? null,
      walkingMinutesFromJemaa: details.walkingMinutesFromJemaa ?? null,
      categoryTags: details.categoryTags || [],
      ambianceTags: details.ambianceTags || [],
      latitude: details.latitude ?? null,
      longitude: details.longitude ?? null,
      hotelCount: 0,
    };
    current.hotelCount += 1;
    if (riad.imageUrl && current.images.length < 5 && !current.images.includes(riad.imageUrl)) {
      current.images.push(riad.imageUrl);
      current.image ||= riad.imageUrl;
    }
    neighborhoods.set(id, current);
  });

  return Array.from(neighborhoods.values()).sort((a, b) => {
    const cityOrder = String(a.city).localeCompare(String(b.city));
    if (cityOrder) return cityOrder;
    const displayOrder = (a.displayOrder ?? Number.MAX_SAFE_INTEGER) - (b.displayOrder ?? Number.MAX_SAFE_INTEGER);
    return displayOrder || String(a.name).localeCompare(String(b.name));
  });
}
