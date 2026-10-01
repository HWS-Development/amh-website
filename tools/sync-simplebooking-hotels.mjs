import { writeFile } from 'node:fs/promises';

// The public portal does not have any places configured, so its placeId URL
// parameter cannot filter by city. Snapshot its actual bookable properties to
// show a city-scoped choice before opening a property-specific booking URL.
const response = await fetch('https://www.simplebooking.it/graphql/ibe2/graphql?opname=PortalIO', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operationName: 'PortalIO',
    query: 'query PortalIO { portal(id: "256") { hotels { id name(languageCode: "EN") city(languageCode: "EN") } } }',
  }),
});

const payload = await response.json();
const hotels = payload.data?.portal?.hotels;
if (!Array.isArray(hotels) || hotels.length === 0) {
  throw new Error(`SimpleBooking hotel catalog unavailable: ${JSON.stringify(payload.errors || response.status)}`);
}

const catalog = hotels.map(({ id, name, city }) => {
  if (!/^\d+$/.test(String(id)) || !name || !city) {
    throw new Error(`Incomplete SimpleBooking property: ${JSON.stringify({ id, name, city })}`);
  }
  return { id: String(id), name: name.trim(), city: city.trim() };
}).sort((a, b) => a.name.localeCompare(b.name));

await writeFile(new URL('../src/lib/simplebookingHotels.json', import.meta.url), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Updated SimpleBooking catalog: ${catalog.length} properties.`);
