import { useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMghDestinations } from '@/lib/mghApi';
import { getTranslated } from '@/lib/utils';
import { usePartnerHotels } from '@/lib/partnerHotelsApi';
import { usePartnerCatalogs } from '@/lib/partnerCatalogsApi';
import { mapPartnerHotelToRiad } from '@/lib/partnerHotelTransform';
import { matchSimpleBookingHotels } from '@/lib/simplebookingHotelMatch';
import hotels from '@/lib/simplebookingHotels.json';
import NotFoundPage from '@/pages/NotFoundPage';
import RiadCard from '@/components/RiadCard';

const HOTELS_PER_PAGE = 12;

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
  const [params, setSearchParams] = useSearchParams();
  const { data: destinations = [], isLoading, isError } = useMghDestinations();
  const { data: partnerHotels = [], isLoading: hotelsLoading, isError: hotelsError } = usePartnerHotels();
  const { data: partnerCatalogs } = usePartnerCatalogs();
  const slug = params.get('city');
  const destination = destinations.find((item) => item.slug === slug);
  const name = destination && getTranslated(destination.name_tr ?? destination.name, currentLanguage);
  const cityHotels = useMemo(() => hotels.filter((hotel) => (
    slug && normalize(hotel.city).includes(normalize(slug))
  )), [slug]);
  const matchedHotels = useMemo(() => matchSimpleBookingHotels(cityHotels, partnerHotels)
    .filter(({ partnerHotel }) => partnerHotel), [cityHotels, partnerHotels]);
  const totalPages = Math.max(1, Math.ceil(matchedHotels.length / HOTELS_PER_PAGE));
  const rawPage = params.get('page');
  const requestedPage = Number(rawPage);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, totalPages)
    : 1;
  const start = (page - 1) * HOTELS_PER_PAGE;
  const visibleHotels = useMemo(() => matchedHotels
    .slice(start, start + HOTELS_PER_PAGE)
    .map(({ bookingHotel, partnerHotel }) => {
      const riad = mapPartnerHotelToRiad(partnerHotel, currentLanguage, partnerCatalogs);
      return {
        bookingHotel,
        riad: {
          ...riad,
          country: t('morocco'),
        },
      };
    }), [matchedHotels, start, currentLanguage, partnerCatalogs, t]);
  const pageNumbers = totalPages <= 7
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : [...new Set([1, totalPages, ...Array.from({ length: 5 }, (_, index) => page + index - 2)])]
      .filter((number) => number >= 1 && number <= totalPages)
      .sort((a, b) => a - b);
  const resultsRef = useRef(null);
  const previousPageRef = useRef(page);

  useEffect(() => {
    if (hotelsLoading || hotelsError || rawPage === null || rawPage === String(page)) return;
    const next = new URLSearchParams(params);
    next.set('page', String(page));
    setSearchParams(next, { replace: true, preventScrollReset: true });
  }, [hotelsLoading, hotelsError, rawPage, page, params, setSearchParams]);

  useEffect(() => {
    if (previousPageRef.current !== page) {
      previousPageRef.current = page;
      resultsRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }, [page]);

  const goToPage = (nextPage) => {
    const next = new URLSearchParams(params);
    next.set('page', String(nextPage));
    setSearchParams(next);
  };

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
          <p className="mt-2 max-w-2xl font-montserrat text-xs leading-relaxed text-brand-ink/55">
            {t('bookingSearchAvailabilityNote')}
          </p>
          {params.get('in') && params.get('out') && (
            <p className="mt-5 inline-flex items-center gap-2 font-montserrat text-xs text-brand-ink/70">
              <CalendarDays className="h-4 w-4 text-brand-action" />
              {params.get('in')} → {params.get('out')}
            </p>
          )}

          {hotelsLoading ? (
            <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-action" aria-label={t('loading')} /></div>
          ) : hotelsError ? (
            <div className="mt-12 border border-brand-ink/10 bg-white p-8 font-montserrat text-sm text-brand-ink/75">{t('somethingWentWrong')}</div>
          ) : matchedHotels.length === 0 ? (
            <div className="mt-12 border border-brand-ink/10 bg-white p-8 md:p-12">
              <p className="font-montserrat text-sm leading-relaxed text-brand-ink/75">{t('bookingSearchEmpty', { city: name })}</p>
              <Link to={`/destinations/${encodeURIComponent(slug)}`} className="mt-6 inline-flex items-center gap-2 font-montserrat text-xs font-semibold uppercase tracking-wider text-brand-action hover:text-brand-ink">
                {t('exploreDestination')} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div ref={resultsRef} className="mt-12 scroll-mt-28">
              <div className="flex flex-wrap items-center justify-between gap-3 font-montserrat text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink/50">
                <p>{t('bookingSearchCount', { count: matchedHotels.length })}</p>
                {totalPages > 1 && (
                  <p>{t('bookingSearchRange', { start: start + 1, end: Math.min(start + HOTELS_PER_PAGE, matchedHotels.length), total: matchedHotels.length })}</p>
                )}
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleHotels.map(({ bookingHotel, riad }) => (
                  <RiadCard
                    key={bookingHotel.id}
                    riad={riad}
                    bookingHref={buildBookingUrl(bookingHotel.id, params, currentLanguage)}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <nav aria-label={t('bookingPagination')} className="mt-12 flex flex-wrap items-center justify-center gap-2 font-montserrat text-sm">
                  <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1} aria-label={t('previous')} className="grid h-11 w-11 place-items-center border border-brand-ink/15 text-brand-ink transition-colors hover:border-brand-action hover:text-brand-action disabled:cursor-not-allowed disabled:opacity-35">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {pageNumbers.map((number, index) => [
                    index > 0 && number - pageNumbers[index - 1] > 1 && (
                      <span key={`gap-${number}`} aria-hidden="true" className="px-1 text-brand-ink/50">…</span>
                    ),
                    <button key={number} type="button" onClick={() => goToPage(number)} aria-label={`${t('page')} ${number}`} aria-current={number === page ? 'page' : undefined} className={`h-11 w-11 border font-semibold transition-colors ${number === page ? 'border-brand-ink bg-brand-ink text-white' : 'border-brand-ink/15 text-brand-ink hover:border-brand-action hover:text-brand-action'}`}>
                      {number}
                    </button>,
                  ])}
                  <button type="button" onClick={() => goToPage(page + 1)} disabled={page === totalPages} aria-label={t('next')} className="grid h-11 w-11 place-items-center border border-brand-ink/15 text-brand-ink transition-colors hover:border-brand-action hover:text-brand-action disabled:cursor-not-allowed disabled:opacity-35">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingSearchPage;
