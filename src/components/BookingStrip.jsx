import React, { useState, useRef, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, CalendarDays, Users, Minus, Plus, Search as SearchIcon, BedDouble, Baby } from 'lucide-react';

const destinations = [
  { value: '', labelKey: 'allDestinations' },
  { value: 'marrakech', labelKey: 'marrakech' },
  { value: 'essaouira', labelKey: 'essaouira' },
  { value: 'ouarzazate', labelKey: 'ouarzazate' },
];

/* ────────────────────────────────────────────────────────────────────
   Guests + Rooms stepper popover (Airbnb-style)
   – Three discrete steppers: Adults / Children / Rooms
   – Hard limits: adults 1-12, children 0-8, rooms 1-6
   – Returns derived totals for label + URL params
   ──────────────────────────────────────────────────────────────────── */
const Stepper = ({ label, hint, value, min, max, onChange, Icon }) => {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 w-8 h-8 flex items-center justify-center bg-brand-beige text-brand-action shrink-0">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <div className="leading-tight">
          <div className="font-montserrat font-semibold text-[0.82rem] text-brand-ink uppercase tracking-[0.08em]">
            {label}
          </div>
          {hint && <div className="font-montserrat text-[0.7rem] text-brand-ink/55 mt-0.5">{hint}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          aria-label="decrement"
          className="w-8 h-8 flex items-center justify-center border border-brand-ink/20 text-brand-ink hover:border-brand-action hover:text-brand-action disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="font-montserrat font-semibold text-brand-ink w-6 text-center tabular-nums">{value}</span>
        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          aria-label="increment"
          className="w-8 h-8 flex items-center justify-center border border-brand-ink/20 text-brand-ink hover:border-brand-action hover:text-brand-action disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const BookingStrip = ({ date, onDateChange, isSticky = false, isMobile = false, onSearch }) => {
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [destination, setDestination] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [destOpen, setDestOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const stripRef = useRef(null);

  const totalPersons = adults + children;

  const handleSearchClick = (e) => {
    e.preventDefault();

    if (!date || !date.from || !date.to) {
      toast({
        title: t('missingDates'),
        description: t('missingDatesDesc'),
        variant: 'destructive',
      });
      return;
    }

    const checkin = format(date.from, 'yyyy-MM-dd');
    const checkout = format(date.to, 'yyyy-MM-dd');

    // SimpleBooking guests param: A = adult, C = child, separated by %2C
    const guestParams = [
      ...Array(adults).fill('A'),
      ...Array(children).fill('C'),
    ].join('%2C');

    const simplebookingBase = import.meta.env.VITE_SIMPLEBOOKING_BASE || 'https://www.simplebooking.it/portal/256';
    let url = `${simplebookingBase}?lang=${currentLanguage.toUpperCase()}&cur=EUR&in=${checkin}&out=${checkout}&guests=${guestParams}&rooms=${rooms}&map=JPPSV`;

    if (onSearch) onSearch();
    window.open(url, '_blank');
  };

  const selectedDestLabel = useMemo(() => {
    const found = destinations.find((d) => d.value === destination);
    return found ? t(found.labelKey) : t('destination');
  }, [destination, t, currentLanguage]);

  // Compact "2 pers. · 1 ch." label
  const guestsRoomsLabel = t('guestsRoomsShort', { persons: totalPersons, rooms });

  /* ─────────── Reusable field styles ─────────── */
  const fieldBase = cn(
    'flex items-center gap-2.5 cursor-pointer select-none font-montserrat',
    'h-[56px] px-4 transition-all duration-300 bg-white',
    'border border-transparent hover:border-brand-action/30 hover:shadow-md'
  );
  const labelClass = 'flex-1 text-left text-[0.72rem] sm:text-[0.78rem] font-semibold text-brand-ink uppercase tracking-[0.12em] truncate';
  const iconClass = 'w-4 h-4 text-brand-action shrink-0';

  /* ═══════════════════════ MOBILE ═══════════════════════ */
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2.5 w-full">
        {/* Destination */}
        <Popover open={destOpen} onOpenChange={setDestOpen}>
          <PopoverTrigger asChild>
            <div className={fieldBase}>
              <MapPin className={iconClass} />
              <span className={labelClass}>{selectedDestLabel}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[min(92vw,320px)] p-1.5 shadow-2xl border-brand-ink/5" align="center">
            {destinations.map((d) => (
              <button
                key={d.value}
                onClick={() => { setDestination(d.value); setDestOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2.5 text-xs font-medium font-montserrat hover:bg-brand-beige transition-colors',
                  destination === d.value && 'bg-brand-beige text-brand-action'
                )}
              >
                {t(d.labelKey)}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Dates */}
        <Popover>
          <PopoverTrigger asChild>
            <div className={fieldBase}>
              <CalendarDays className={iconClass} />
              <span className={labelClass}>
                {date?.from
                  ? date.to
                    ? `${format(date.from, 'dd MMM')} → ${format(date.to, 'dd MMM')}`
                    : format(date.from, 'dd/MM/yyyy')
                  : t('dates')}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 shadow-2xl border-brand-ink/5" align="center">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={onDateChange}
              numberOfMonths={1}
              disabled={{ before: new Date() }}
            />
          </PopoverContent>
        </Popover>

        {/* Guests & Rooms */}
        <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
          <PopoverTrigger asChild>
            <div className={fieldBase}>
              <Users className={iconClass} />
              <span className={labelClass}>{guestsRoomsLabel}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[min(92vw,340px)] p-4 shadow-2xl border-brand-ink/5" align="center">
            <Stepper label={t('adults')} hint={t('adultsHint')} Icon={Users} value={adults} min={1} max={12} onChange={setAdults} />
            <div className="h-px bg-brand-ink/8" />
            <Stepper label={t('children')} hint={t('childrenHint')} Icon={Baby} value={children} min={0} max={8} onChange={setChildren} />
            <div className="h-px bg-brand-ink/8" />
            <Stepper label={t('roomsLabel')} hint={t('roomsHint')} Icon={BedDouble} value={rooms} min={1} max={6} onChange={setRooms} />
            <button
              type="button"
              onClick={() => setGuestsOpen(false)}
              className="mt-3 w-full bg-brand-ink text-white font-montserrat uppercase tracking-[0.18em] text-xs py-2.5 hover:bg-brand-action transition-colors"
            >
              {t('done')}
            </button>
          </PopoverContent>
        </Popover>

        {/* Search */}
        <Button
          onClick={handleSearchClick}
          className="bg-brand-action hover:bg-brand-action/90 text-white font-semibold uppercase tracking-[0.14em] h-[56px] text-xs font-montserrat shadow-md hover:shadow-lg transition-all"
        >
          <SearchIcon className="w-4 h-4 mr-2" />
          {t('recherchez')}
        </Button>
      </div>
    );
  }

  /* ═══════════════════════ DESKTOP ═══════════════════════ */
  return (
    <div ref={stripRef} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-brand-ink/10 items-stretch w-full">
        {/* Destination */}
        <Popover open={destOpen} onOpenChange={setDestOpen}>
          <PopoverTrigger asChild>
            <div className={fieldBase}>
              <MapPin className={iconClass} />
              <span className={labelClass}>{selectedDestLabel}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1.5 shadow-2xl border-brand-ink/5" align="start">
            {destinations.map((d) => (
              <button
                key={d.value}
                onClick={() => { setDestination(d.value); setDestOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2.5 text-xs font-medium font-montserrat hover:bg-brand-beige transition-colors',
                  destination === d.value && 'bg-brand-beige text-brand-action'
                )}
              >
                {t(d.labelKey)}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Dates */}
        <Popover>
          <PopoverTrigger asChild>
            <div className={fieldBase}>
              <CalendarDays className={iconClass} />
              <span className={labelClass}>
                {date?.from
                  ? date.to
                    ? `${format(date.from, 'dd MMM')} → ${format(date.to, 'dd MMM')}`
                    : format(date.from, 'dd/MM/yyyy')
                  : t('dates')}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 shadow-2xl border-brand-ink/5" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={onDateChange}
              numberOfMonths={2}
              disabled={{ before: new Date() }}
            />
          </PopoverContent>
        </Popover>

        {/* Guests & Rooms */}
        <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
          <PopoverTrigger asChild>
            <div className={fieldBase}>
              <Users className={iconClass} />
              <span className={labelClass}>{guestsRoomsLabel}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] p-4 shadow-2xl border-brand-ink/5" align="start">
            <Stepper label={t('adults')} hint={t('adultsHint')} Icon={Users} value={adults} min={1} max={12} onChange={setAdults} />
            <div className="h-px bg-brand-ink/8" />
            <Stepper label={t('children')} hint={t('childrenHint')} Icon={Baby} value={children} min={0} max={8} onChange={setChildren} />
            <div className="h-px bg-brand-ink/8" />
            <Stepper label={t('roomsLabel')} hint={t('roomsHint')} Icon={BedDouble} value={rooms} min={1} max={6} onChange={setRooms} />
            <button
              type="button"
              onClick={() => setGuestsOpen(false)}
              className="mt-3 w-full bg-brand-ink text-white font-montserrat uppercase tracking-[0.18em] text-xs py-2.5 hover:bg-brand-action transition-colors"
            >
              {t('done')}
            </button>
          </PopoverContent>
        </Popover>

        {/* Search */}
        <Button
          onClick={handleSearchClick}
          className="bg-brand-action hover:bg-brand-action/90 text-white font-bold uppercase tracking-[0.14em] h-[56px] text-xs sm:text-sm whitespace-nowrap font-montserrat shadow-md hover:shadow-xl transition-all duration-300 group"
        >
          <SearchIcon className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
          {t('recherchez')}
        </Button>
      </div>
    </div>
  );
};

export default BookingStrip;
