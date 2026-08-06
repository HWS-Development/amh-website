import React, { useState, useRef, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, CalendarDays, Users, Minus, Plus, Search as SearchIcon, BedDouble, Baby } from 'lucide-react';
import { usePartnerHotels } from '@/lib/partnerHotelsApi';
import { usePartnerCatalogs } from '@/lib/partnerCatalogsApi';
import { deriveDestinationsFromRiads, mapPartnerHotelToRiad } from '@/lib/partnerHotelTransform';

const MAX_ROOMS = 6;
const CHILD_AGES = Array.from({ length: 13 }, (_, age) => age);

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

const RoomAllocationEditor = ({
  roomAllocations,
  onAdultsChange,
  onChildrenChange,
  onChildAgeChange,
  onAddRoom,
  onRemoveRoom,
  onDone,
  t,
}) => (
  <>
    <div className="max-h-[min(58vh,30rem)] overflow-y-auto pr-1">
      {roomAllocations.map((room, roomIndex) => (
        <section
          key={roomIndex}
          className={cn('pb-2', roomIndex > 0 && 'border-t border-brand-ink/10 pt-3')}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-action">
              <BedDouble className="h-4 w-4" />
              {t('roomNumber', { number: roomIndex + 1 })}
            </div>
            {roomAllocations.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveRoom(roomIndex)}
                className="font-montserrat text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-brand-ink/45 hover:text-brand-action transition-colors"
              >
                {t('removeRoom')}
              </button>
            )}
          </div>

          <Stepper
            label={t('adults')}
            hint={t('adultsHint')}
            Icon={Users}
            value={room.adults}
            min={1}
            max={12}
            onChange={(value) => onAdultsChange(roomIndex, value)}
          />
          <div className="h-px bg-brand-ink/8" />
          <Stepper
            label={t('children')}
            hint={t('childrenHint')}
            Icon={Baby}
            value={room.childAges.length}
            min={0}
            max={8}
            onChange={(value) => onChildrenChange(roomIndex, value)}
          />

          {room.childAges.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pb-3">
              {room.childAges.map((age, childIndex) => (
                <label key={childIndex} className="block">
                  <span className="mb-1 block font-montserrat text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-brand-ink/55">
                    {t('childNumber', { number: childIndex + 1 })}
                  </span>
                  <select
                    value={age ?? ''}
                    onChange={(event) => onChildAgeChange(roomIndex, childIndex, Number(event.target.value))}
                    className="h-9 w-full border border-brand-ink/15 bg-white px-2 font-montserrat text-xs text-brand-ink outline-none focus:border-brand-action"
                    aria-label={t('childAge', { number: childIndex + 1 })}
                  >
                    <option value="" disabled>{t('selectAge')}</option>
                    {CHILD_AGES.map((childAge) => (
                      <option key={childAge} value={childAge}>
                        {t('age', { count: childAge })}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>

    {roomAllocations.length < MAX_ROOMS && (
      <button
        type="button"
        onClick={onAddRoom}
        className="mt-2 flex w-full items-center justify-center gap-2 border border-brand-action/30 py-2.5 font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brand-action hover:bg-brand-action/5 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        {t('addRoom')}
      </button>
    )}

    <button
      type="button"
      onClick={onDone}
      className="mt-3 w-full bg-brand-ink text-white font-montserrat uppercase tracking-[0.18em] text-xs py-2.5 hover:bg-brand-action transition-colors"
    >
      {t('done')}
    </button>
  </>
);

const BookingStrip = ({ date, onDateChange, isSticky = false, isMobile = false, onSearch }) => {
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [destination, setDestination] = useState('');
  const [roomAllocations, setRoomAllocations] = useState([
    { adults: 2, childAges: [] },
  ]);
  const [destOpen, setDestOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const stripRef = useRef(null);
  const { data: hotels = [] } = usePartnerHotels();
  const { data: partnerCatalogs } = usePartnerCatalogs();
  const destinations = useMemo(() => {
    const riads = hotels.map((hotel) => mapPartnerHotelToRiad(hotel, currentLanguage, partnerCatalogs));
    return [
      { value: '', label: t('allDestinations') },
      ...deriveDestinationsFromRiads(riads).map((city) => ({ value: city.id, label: city.name })),
    ];
  }, [hotels, currentLanguage, partnerCatalogs, t]);

  const adults = roomAllocations.reduce((total, room) => total + room.adults, 0);
  const children = roomAllocations.reduce((total, room) => total + room.childAges.length, 0);
  const rooms = roomAllocations.length;
  const totalPersons = adults + children;

  const updateRoomAdults = (roomIndex, value) => {
    setRoomAllocations((current) => current.map((room, index) => (
      index === roomIndex ? { ...room, adults: value } : room
    )));
  };

  const updateRoomChildren = (roomIndex, value) => {
    setRoomAllocations((current) => current.map((room, index) => {
      if (index !== roomIndex) return room;
      const childAges = room.childAges.slice(0, value);
      while (childAges.length < value) childAges.push(null);
      return { ...room, childAges };
    }));
  };

  const updateChildAge = (roomIndex, childIndex, age) => {
    setRoomAllocations((current) => current.map((room, index) => {
      if (index !== roomIndex) return room;
      const childAges = [...room.childAges];
      childAges[childIndex] = age;
      return { ...room, childAges };
    }));
  };

  const addRoom = () => {
    setRoomAllocations((current) => (
      current.length < MAX_ROOMS
        ? [...current, { adults: 1, childAges: [] }]
        : current
    ));
  };

  const removeRoom = (roomIndex) => {
    setRoomAllocations((current) => (
      current.length > 1 ? current.filter((_, index) => index !== roomIndex) : current
    ));
  };

  const validateChildAges = () => {
    const hasMissingAge = roomAllocations.some((room) => (
      room.childAges.some((age) => !Number.isInteger(age))
    ));
    if (!hasMissingAge) return true;

    setGuestsOpen(true);
    toast({
      title: t('missingChildAges'),
      description: t('missingChildAgesDesc'),
      variant: 'destructive',
    });
    return false;
  };

  const closeGuests = () => {
    if (validateChildAges()) setGuestsOpen(false);
  };

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

    if (!validateChildAges()) return;

    const checkin = format(date.from, 'yyyy-MM-dd');
    const checkout = format(date.to, 'yyyy-MM-dd');

    const guestParams = roomAllocations.map((room) => [
      ...Array(room.adults).fill('A'),
      ...room.childAges.map(String),
    ].join(',')).join('|');

    const simplebookingBase = import.meta.env.VITE_SIMPLEBOOKING_BASE || 'https://www.simplebooking.it/portal/256';
    const params = new URLSearchParams({
      lang: currentLanguage.toUpperCase(),
      cur: 'EUR',
      in: checkin,
      out: checkout,
      guests: guestParams,
      map: 'JPPSV',
    });
    const url = `${simplebookingBase}?${params.toString()}`;

    if (onSearch) onSearch();
    window.open(url, '_blank');
  };

  const selectedDestLabel = useMemo(() => {
    const found = destinations.find((d) => d.value === destination);
    return found ? found.label : t('destination');
  }, [destination, destinations, t]);

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
                {d.label}
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
            <RoomAllocationEditor
              roomAllocations={roomAllocations}
              onAdultsChange={updateRoomAdults}
              onChildrenChange={updateRoomChildren}
              onChildAgeChange={updateChildAge}
              onAddRoom={addRoom}
              onRemoveRoom={removeRoom}
              onDone={closeGuests}
              t={t}
            />
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
                {d.label}
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
          <PopoverContent className="w-[380px] p-4 shadow-2xl border-brand-ink/5" align="start">
            <RoomAllocationEditor
              roomAllocations={roomAllocations}
              onAdultsChange={updateRoomAdults}
              onChildrenChange={updateRoomChildren}
              onChildAgeChange={updateChildAge}
              onAddRoom={addRoom}
              onRemoveRoom={removeRoom}
              onDone={closeGuests}
              t={t}
            />
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
