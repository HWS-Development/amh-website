import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Loader2, MapPin, Search } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePartnerHotels } from '@/lib/partnerHotelsApi';
import { usePartnerCatalogs } from '@/lib/partnerCatalogsApi';
import {
  deriveDestinationsFromRiads,
  deriveNeighborhoodsFromRiads,
  mapPartnerHotelToRiad,
} from '@/lib/partnerHotelTransform';

const normalize = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const MedinaQuartiersPage = () => {
  const { t, currentLanguage } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const selectedCity = searchParams.get('city') || '';
  const { data: hotels = [], isLoading, error } = usePartnerHotels();
  const { data: partnerCatalogs } = usePartnerCatalogs();

  const riads = useMemo(
    () => hotels.map((hotel) => mapPartnerHotelToRiad(hotel, currentLanguage, partnerCatalogs)),
    [hotels, currentLanguage, partnerCatalogs]
  );
  const cities = useMemo(() => deriveDestinationsFromRiads(riads), [riads]);
  const neighborhoods = useMemo(() => deriveNeighborhoodsFromRiads(riads), [riads]);
  const visibleNeighborhoods = useMemo(() => {
    const query = normalize(search);
    return neighborhoods.filter((neighborhood) => {
      if (selectedCity && neighborhood.city_id !== selectedCity) return false;
      return !query || normalize(`${neighborhood.name} ${neighborhood.city}`).includes(query);
    });
  }, [neighborhoods, search, selectedCity]);

  const updateCity = (cityId) => {
    const next = new URLSearchParams(searchParams);
    if (cityId) next.set('city', cityId);
    else next.delete('city');
    setSearchParams(next);
  };

  const pageTitle = `${t('medinaQuartiersTitle')} · MGH`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={t('medinaQuartiersSubtitle')} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-white via-brand-beige/20 to-white pt-24">
        <header className="border-y border-brand-ink/5 bg-brand-beige/35 py-12 md:py-16">
          <div className="content-wrapper">
            <Breadcrumb items={[
              { label: t('home'), href: '/' },
              { label: t('quartiersMedina') },
            ]} />
            <div className="mx-auto mt-8 max-w-3xl text-center">
              <p className="font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-brand-action">
                {t('quartiersEyebrow') || 'Quartiers présents dans Centra'}
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,5rem)] leading-none text-brand-ink">
                {t('medinaQuartiersTitle')}
              </h1>
              <p className="mt-5 font-montserrat text-sm leading-relaxed text-brand-ink/65 md:text-base">
                {t('medinaQuartiersSubtitle')}
              </p>
            </div>
          </div>
        </header>

        <main className="content-wrapper section-padding">
          <div className="mb-10 grid gap-3 md:grid-cols-[1fr_260px]">
            <label className="relative block">
              <span className="sr-only">{t('searchByName')}</span>
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/40" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('searchByName')}
                className="h-14 w-full border border-brand-ink/10 bg-white pl-11 pr-4 font-montserrat text-sm outline-none transition-colors focus:border-brand-action"
              />
            </label>
            <label>
              <span className="sr-only">{t('filterByCity')}</span>
              <select
                value={selectedCity}
                onChange={(event) => updateCity(event.target.value)}
                className="h-14 w-full border border-brand-ink/10 bg-white px-4 font-montserrat text-sm text-brand-ink outline-none transition-colors focus:border-brand-action"
              >
                <option value="">{t('allCities')}</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center">
              <Loader2 className="h-9 w-9 animate-spin text-brand-action" />
            </div>
          ) : error ? (
            <div className="border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
              {t('somethingWentWrong')}
            </div>
          ) : visibleNeighborhoods.length === 0 ? (
            <div className="py-24 text-center font-montserrat text-sm text-brand-ink/55">
              {t('noQuartiersFound')}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleNeighborhoods.map((neighborhood) => (
                <article key={neighborhood.id} className="group overflow-hidden bg-white shadow-[0_20px_55px_-35px_rgba(29,29,27,0.45)]">
                  <Link
                    to={`/all-riads?city=${encodeURIComponent(neighborhood.city_id || '')}&quartier=${encodeURIComponent(neighborhood.id)}`}
                    className="block"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-brand-beige">
                      {neighborhood.image ? (
                        <OptimizedImage
                          src={neighborhood.image}
                          alt={neighborhood.name}
                          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center font-display text-5xl italic text-brand-action/35">
                          {neighborhood.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/65 via-transparent to-transparent" />
                      <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 font-montserrat text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white">
                        <MapPin className="h-3 w-3 text-brand-action" />
                        {neighborhood.city}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-5 p-5">
                      <div>
                        <h2 className="font-display text-2xl text-brand-ink transition-colors group-hover:text-brand-action">
                          {neighborhood.name}
                        </h2>
                        {neighborhood.shortDescription && (
                          <p className="mt-2 line-clamp-2 font-montserrat text-xs leading-relaxed text-brand-ink/65">
                            {neighborhood.shortDescription}
                          </p>
                        )}
                        <p className="mt-1 font-montserrat text-xs text-brand-ink/55">
                          {neighborhood.hotelCount} {t('propertiesAvailable') || 'properties'}
                        </p>
                      </div>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand-ink/10 text-brand-action transition-all group-hover:rotate-45 group-hover:border-brand-action">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default MedinaQuartiersPage;
