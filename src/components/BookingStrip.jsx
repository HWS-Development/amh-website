import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, Tag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const BookingStrip = ({ date, onDateChange, isSticky = false, isMobile = false, onSearch }) => {
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState('');

  const containerVariants = {
    initial: { y: isSticky ? 0 : -20, opacity: isSticky ? 1 : 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.5, delay: 0.2 }
  };

  const handleSearchClick = (e) => {
    e.preventDefault();

    if (!date || !date.from || !date.to) {
      toast({
        title: t('missingDates'),
        description: t('missingDatesDesc'),
        variant: "destructive",
      });
      return;
    }

    const checkin = format(date.from, 'yyyy-MM-dd');
    const checkout = format(date.to, 'yyyy-MM-dd');
    
    let url = `https://www.simplebooking.it/portal/256?lang=${currentLanguage.toUpperCase()}&cur=EUR&in=${checkin}&out=${checkout}&guests=A%2CA&map=JPPSV`;

    if (promoCode) {
      url += `&coupon=${encodeURIComponent(promoCode)}`;
    }

    if (onSearch) {
      onSearch();
    }
    
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={containerVariants.initial}
      animate={containerVariants.animate}
      transition={containerVariants.transition}
      className={cn("bg-transparent", isSticky && !isMobile ? 'py-0' : 'py-0')}
    >
      <div className={cn(!isSticky && !isMobile && "content-wrapper px-0")}>
        <div className={cn(
          "bg-white grid items-stretch gap-3 md:gap-4", 
          isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3',
          isSticky && !isMobile ? 'shadow-none border-0 p-0' : isMobile ? 'border border-brand-ink/15 p-3' : 'border-0 p-0'
        )}>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-auto text-brand-ink hover:bg-brand-ink/5 col-span-1 border-brand-ink/15",
                  isSticky && !isMobile ? "py-2 px-3 text-xs" : isMobile ? "h-16 py-2 border-brand-ink/20" : "py-4 border-brand-ink/15 text-base shadow-sm hover:shadow-md transition-shadow"
                )}
              >
                <Calendar className={cn("mr-3 text-brand-ink/60", isSticky ? "h-4 w-4" : isMobile ? "h-5 w-5" : "h-6 w-6")} />
                <div className="truncate">
                    <p className={cn("font-semibold text-brand-ink/70 leading-tight", isSticky ? "text-xs" : isMobile ? "text-xs" : "text-sm")}>{t('selectYourDates')}</p>
                    <p className={cn("font-medium truncate text-brand-ink", isSticky ? "text-xs" : isMobile ? "text-sm" : "text-base")}>
                        {date?.from ? (
                            date.to ? (
                            <>
                                {format(date.from, "LLL dd")} - {format(date.to, "LLL dd, y")}
                            </>
                            ) : (
                            format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>{t('selectDates')}</span>
                        )}
                    </p>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 shadow-xl" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={onDateChange}
                numberOfMonths={isMobile ? 1 : 2}
                disabled={{ before: new Date() }}
              />
            </PopoverContent>
          </Popover>
          
          <div className={cn(
            "relative col-span-1 flex items-center border border-brand-ink/15",
            isSticky && !isMobile ? "px-3" : isMobile ? "px-3 h-16" : "px-4 py-4 shadow-sm hover:shadow-md transition-shadow"
          )}>
             <Tag className={cn("mr-3 text-brand-ink/60", isSticky ? "h-4 w-4" : isMobile ? "h-5 w-5" : "h-6 w-6")} />
             <div className="w-full">
                 <label htmlFor="promo-code" className={cn("font-semibold text-brand-ink/70", isSticky ? "text-xs" : isMobile ? "text-xs" : "text-sm")}>{t('havePromoCode')}</label>
                 <Input
                     id="promo-code"
                     type="text"
                     value={promoCode}
                     onChange={(e) => setPromoCode(e.target.value)}
                     placeholder={t('enterCode')}
                     className={cn(
                       "w-full border-0 p-0 h-auto placeholder:text-brand-ink/40 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-brand-ink font-medium",
                       isSticky ? "text-xs" : isMobile ? "text-sm" : "text-base"
                     )}
                 />
             </div>
          </div>
          
          <Button 
            onClick={handleSearchClick}
            className={cn(
              "w-full h-full btn-action font-bold col-span-1 transition-all hover:shadow-lg",
              isSticky && !isMobile ? "text-sm py-2" : isMobile ? "h-16 text-base" : "text-lg py-4 shadow-md",
              !isSticky && !isMobile ? "text-white font-bold tracking-wide" : ""
            )}
          >
            <Search className={cn("mr-2", isSticky ? "h-4 w-4" : isMobile ? "h-5 w-5" : "h-6 w-6")} />
            {t('findMyRiad')}
          </Button>

        </div>
      </div>
    </motion.div>
  );
};

export default BookingStrip;