import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const destinations = [
  { value: '', label: 'Toutes les destinations' },
  { value: 'marrakech', label: 'Marrakech' },
  { value: 'essaouira', label: 'Essaouira' },
  { value: 'ouarzazate', label: 'Ouarzazate' },
];

const BookingStrip = ({ date, onDateChange, isSticky = false, isMobile = false, onSearch }) => {
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [destination, setDestination] = useState('');
  const [guests, setGuests] = useState(2);
  const [destOpen, setDestOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const stripRef = useRef(null);

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

    const guestParams = Array(guests).fill('A').join('%2C');
    const simplebookingBase = import.meta.env.VITE_SIMPLEBOOKING_BASE || 'https://www.simplebooking.it/portal/256';
    let url = `${simplebookingBase}?lang=${currentLanguage.toUpperCase()}&cur=EUR&in=${checkin}&out=${checkout}&guests=${guestParams}&map=JPPSV`;

    if (onSearch) {
      onSearch();
    }

    window.open(url, '_blank');
  };

  const selectedDestLabel = destinations.find((d) => d.value === destination)?.label || 'DESTINATION';

  // Clean field: uniform height, white bg, single-line label
  const fieldPill = cn(
    'flex items-center justify-center cursor-pointer select-none font-montserrat text-center h-[52px] px-6 transition-all duration-200 shadow-sm',
    'hover:shadow-md'
  );

  const fieldStyle = { backgroundColor: '#ffffff' };

  const labelClass = 'text-[11px] sm:text-xs font-semibold text-brand-ink/50 uppercase tracking-[0.18em]';

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 w-full">
        <Popover open={destOpen} onOpenChange={setDestOpen}>
          <PopoverTrigger asChild>
            <div className="flex items-center justify-center h-12 px-5 cursor-pointer shadow-sm" style={{ backgroundColor: '#ffffff' }}>
              <span className={labelClass}>{selectedDestLabel}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-1.5 shadow-xl border-brand-ink/5" align="center">
            {destinations.map((d) => (
              <button
                key={d.value}
                onClick={() => { setDestination(d.value); setDestOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2 text-xs font-medium hover:bg-brand-beige transition-colors',
                  destination === d.value && 'bg-brand-beige text-brand-action'
                )}
              >
                {d.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center justify-center h-12 px-5 cursor-pointer shadow-sm" style={{ backgroundColor: '#ffffff' }}>
              <span className={labelClass}>
                {date?.from
                  ? date.to
                    ? `${format(date.from, 'dd/MM')} - ${format(date.to, 'dd/MM')}`
                    : format(date.from, 'dd/MM/yyyy')
                  : 'DATES'}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 shadow-xl border-brand-ink/5" align="center">
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

        <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
          <PopoverTrigger asChild>
            <div className="flex items-center justify-center h-12 px-5 cursor-pointer shadow-sm" style={{ backgroundColor: '#ffffff' }}>
              <span className={labelClass}>{guests} {guests > 1 ? 'PERSONNES' : 'PERSONNE'}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1.5 shadow-xl border-brand-ink/5" align="center">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => { setGuests(n); setGuestsOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2 text-xs font-medium hover:bg-brand-beige transition-colors',
                  guests === n && 'bg-brand-beige text-brand-action'
                )}
              >
                {n} {n > 1 ? 'personnes' : 'personne'}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <Button
          onClick={handleSearchClick}
          className="bg-[#3d4357] hover:bg-[#2e3245] text-white font-semibold uppercase tracking-[0.12em] h-12 text-xs"
        >
          {t('recherchez') || 'RECHERCHEZ'}
        </Button>
      </div>
    );
  }

  return (
    <div ref={stripRef}>
      <div className="grid grid-cols-4 gap-3 items-stretch">
        {/* DESTINATION */}
        <Popover open={destOpen} onOpenChange={setDestOpen}>
          <PopoverTrigger asChild>
            <div className={fieldPill} style={fieldStyle}>
              <span className={labelClass}>{selectedDestLabel}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-1.5 shadow-xl border-brand-ink/5" align="start">
            {destinations.map((d) => (
              <button
                key={d.value}
                onClick={() => { setDestination(d.value); setDestOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2 text-xs font-medium hover:bg-brand-beige transition-colors',
                  destination === d.value && 'bg-brand-beige text-brand-action'
                )}
              >
                {d.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* DATES */}
        <Popover>
          <PopoverTrigger asChild>
            <div className={fieldPill} style={fieldStyle}>
              <span className={labelClass}>
                {date?.from
                  ? date.to
                    ? `${format(date.from, 'dd/MM')} - ${format(date.to, 'dd/MM')}`
                    : format(date.from, 'dd/MM/yyyy')
                  : t('dates') || 'DATES'}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 shadow-xl border-brand-ink/5" align="start">
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

        {/* NOMBRE */}
        <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
          <PopoverTrigger asChild>
            <div className={fieldPill} style={fieldStyle}>
              <span className={labelClass}>{t('nombre') || 'NOMBRE'}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1.5 shadow-xl border-brand-ink/5" align="start">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => { setGuests(n); setGuestsOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2 text-xs font-medium hover:bg-brand-beige transition-colors',
                  guests === n && 'bg-brand-beige text-brand-action'
                )}
              >
                {n} {n > 1 ? (t('persons') || 'personnes') : (t('person') || 'personne')}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* RECHERCHEZ */}
        <Button
          onClick={handleSearchClick}
          className="bg-[#3d4357] hover:bg-[#2e3245] text-white font-semibold uppercase tracking-[0.12em] h-[52px] text-xs sm:text-sm whitespace-nowrap transition-all duration-300 shadow-sm hover:shadow-md"
          style={{ backgroundColor: '#3d4357' }}
        >
          {t('recherchez') || 'RECHERCHEZ'}
        </Button>
      </div>
    </div>
  );
};

export default BookingStrip;
