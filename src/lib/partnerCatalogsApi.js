import { useQuery } from '@tanstack/react-query';

const EMPTY_CATALOGS = {
  amenities: [],
  services: [],
  bookingConditions: [],
  neighborhoods: [],
};

async function fetchPartnerCatalogs() {
  const response = await fetch('/api/partner/catalogs');
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const preview = await response.text().catch(() => '');
    throw new Error(
      `Partner catalog route returned non-JSON (status ${response.status}). ` +
      `Body preview: ${preview.substring(0, 200)}`
    );
  }

  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.error || body.message || 'Could not load partner catalogs.');
  }

  return Object.fromEntries(
    Object.keys(EMPTY_CATALOGS).map((key) => [
      key,
      Array.isArray(body.data?.[key]) ? body.data[key] : [],
    ])
  );
}

export function usePartnerCatalogs() {
  return useQuery({
    queryKey: ['partner-catalogs'],
    queryFn: fetchPartnerCatalogs,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}
