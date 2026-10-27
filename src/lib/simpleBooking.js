// Place IDs supplied by SimpleBooking for portal 256.
const PLACE_IDS = Object.freeze({ marrakech: '252', essaouira: '251' });

export function getSimpleBookingPlaceId(destination) {
  return Object.hasOwn(PLACE_IDS, destination) ? PLACE_IDS[destination] : null;
}

export function applySimpleBookingDestination(url, destination) {
  const placeId = getSimpleBookingPlaceId(destination);
  if (placeId) url.searchParams.set('placeId', placeId);
  else url.searchParams.delete('placeId');
}
