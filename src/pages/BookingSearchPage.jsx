import { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMghDestinations } from '@/lib/mghApi';
import { getTranslated } from '@/lib/utils';
import hotels from '@/lib/simplebookingHotels.json';
import NotFoundPage from '@/pages/NotFoundPage';

const normalize = (value) => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/marrakesh/g, 'marrakech').replace(/fez/g, 'fes');

const buildBookingUrl = (hotelId, params, language) => {
  const base = new URL(import.meta.env.VITE_SIMPLEBOOKING_BASE || 'https://www.simplebooking.it/portal/256');
  base.pathname = `${base.pathname.replace(/\/$/, '')}/hotel/${hotelId}`;
  base.searchParams.set('lang', language.split('-')[0].toUpperCase());
  base.searchParams.set('cur', 'EUR');
  for (const key of ['in', 'out', 'guests']) {
    const value = params.get(key);
    if (value && (key === 'guests' ? /^[A0-9,|]+$/.test(value) : /^\d{4}-\d{2}-\d{2}$/.test(value))) {
      base.searchParams.set(key, value);
    }
  }
  return base.toString();
};

const BookingSearchPage = () => {
  const { t, currentLanguage } = useLanguage();
  const [params] = useSearchParams();
  const { data: destinations = [], isLoading, isError } = useMghDestinations();
  const slug = params.get('city');
  const destination = destinations.find((item) => item.slug === slug);
  const name = destination && getTranslated(destination.name_tr ?? destination.name, currentLanguage);
  const availableHotels = useMemo(() => hotels.filter((hotel) => (
    slug && normalize(hotel.city).includes(normalize(slug))
  )), [slug]);

  if (isLoading) return <div className="min-h-screen bg-brand-beige/20 pt-32 text-center">{t('loading')}</div>;
  if (!destination) return isError ? <div className="min-h-screen pt-32 text-center">{t('somethingWentWrong')}</div> : <NotFoundPage />;

  return (
    <>
      <Helmet>
        <title>{t('bookingSearchTitle', { city: name })} · MGH</title>
        <meta name="robots" content="noindex,follow" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-brand-beige/60 to-white pt-32 pb-24">
        <div className="content-wrapper max-w-5xl">
          <p className="font-montserrat text-xs font-semibold uppercase tracking-[0.3em] text-brand-action">{t('bookYourStay')}</p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-tight text-brand-ink">
            {t('bookingSearchTitle', { city: name })}
          </h1>
          <p className="mt-4 max-w-2xl font-montserrat text-sm leading-relaxed text-brand-ink/65">
            {t('bookingSearchIntro')}
          </p>
          {params.get('in') && params.get('out') && (
            <p className="mt-5 inline-flex items-center gap-2 font-montserrat text-xs text-brand-ink/70">
              <CalendarDays className="h-4 w-4 text-brand-action" />
              {params.get('in')} → {params.get('out')}
            </p>
          )}

          {availableHotels.length === 0 ? (
            <div className="mt-12 border border-brand-ink/10 bg-white p-8 md:p-12">
              <p className="font-montserrat text-sm leading-relaxed text-brand-ink/75">{t('bookingSearchEmpty', { city: name })}</p>
              <Link to={`/destinations/${encodeURIComponent(slug)}`} className="mt-6 inline-flex items-center gap-2 font-montserrat text-xs font-semibold uppercase tracking-wider text-brand-action hover:text-brand-ink">
                {t('exploreDestination')} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-12 font-montserrat text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink/50">
                {t('bookingSearchCount', { count: availableHotels.length })}
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {availableHotels.map((hotel) => (
                  <article key={hotel.id} className="flex flex-col justify-between gap-8 border border-brand-ink/10 bg-white p-6 md:p-8 shadow-sm">
                    <div>
                      <h2 className="font-display text-2xl text-brand-ink">{hotel.name}</h2>
                      <p className="mt-3 flex items-center gap-2 font-montserrat text-xs text-brand-ink/60">
                        <MapPin className="h-4 w-4 text-brand-action" /> {hotel.city}
                      </p>
                    </div>
                    <a href={buildBookingUrl(hotel.id, params, currentLanguage)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-between gap-4 bg-brand-ink px-5 py-3 font-montserrat text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-action">
                      {t('bookYourStay')} <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingSearchPage;
