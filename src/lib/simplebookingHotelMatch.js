import { resolvePartnerText } from '@/lib/partnerHotelTransform';

// Names in the two official catalogs occasionally differ. These associations
// have been checked against property names and street addresses in both feeds.
const centraIdsByBookingId = {
  '11012': '487e439b-9d08-4e28-af44-520bb87e1c83', // Jardin des Sens
  '11565': '9f3b47fe-47af-4606-8f0e-5601a51bcf94', // Ksar Agdid
  '11593': '43271fc7-8427-4ddd-991f-8e036d1073fd', // Khol Bohemia
  '11614': 'a7c70bd0-d3ef-4ef1-ab35-1e55893ffcb7', // Anaqa
  '11704': '87c5fd94-84fd-4c91-acab-4940cc213d1e', // Adika
  '11706': 'e8341922-9ca7-4bdf-9ac1-ec6c1b3759ef', // Ayadina
  '11709': 'd318a346-93ca-4907-b21d-349d0da77552', // Étoile d’Orient
  '11779': '40c901c0-b0bb-44af-b7f6-124b5ace430c', // Chergui
  '11829': '9ba1f365-1cef-4dca-886c-11d6ac3df943', // Utopia
};

const normalizeName = (value) => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^riad/, '');

export function matchSimpleBookingHotels(bookableHotels, partnerHotels) {
  const byId = new Map(partnerHotels.map((hotel) => [String(hotel.id), hotel]));
  const byName = new Map();
  for (const hotel of partnerHotels) {
    const name = normalizeName(resolvePartnerText(hotel.hotelName, 'en'));
    if (!name) continue;
    // Do not guess when two Centra properties share the same name.
    if (byName.has(name)) byName.set(name, null);
    else byName.set(name, hotel);
  }

  return bookableHotels.map((bookingHotel) => ({
    bookingHotel,
    partnerHotel: byId.get(centraIdsByBookingId[bookingHotel.id])
      || byName.get(normalizeName(bookingHotel.name))
      || null,
  }));
}
