
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
    
    let url = `https://www.simplebooking.it/portal/256?lang=${currentLanguage.toUpperCase()}&cur=EUR&in=${checkin}&out=${checkout}&guests=A%2CA`;

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
      className={cn("bg-white", isSticky && !isMobile ? 'py-0' : 'py-2')}
    >
      <div className={cn(!isSticky && "content-wrapper")}>
        <div className={cn(
          "bg-white grid items-stretch gap-2", 
          isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3',
          isSticky && !isMobile ? 'shadow-none border-0 p-0' : 'border border-brand-ink/20 p-2 rounded-lg'
        )}>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-auto text-brand-ink hover:bg-brand-ink/5 col-span-1 border-brand-ink/20",
                  isSticky && !isMobile ? "py-2 px-3 text-xs rounded-sm" : "py-3 rounded-sm",
                  isMobile ? "h-14" : ""
                )}
              >
                <Calendar className={cn("mr-2 text-brand-ink/80", isSticky ? "h-4 w-4" : "h-5 w-5")} />
                <div className="truncate">
                    <p className={cn("font-semibold text-brand-ink/80", isSticky ? "text-xs" : "text-xs")}>{t('selectYourDates')}</p>
                    <p className={cn("font-medium truncate", isSticky ? "text-xs" : "text-sm")}>
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
            <PopoverContent className="w-auto p-0" align="start">
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
            "relative col-span-1 flex items-center border border-brand-ink/20 rounded-sm",
            isMobile ? "px-3 h-14" : "px-3"
          )}>
             <Tag className={cn("mr-2 text-brand-ink/80", isSticky ? "h-4 w-4" : "h-5 w-5")} />
             <div className="w-full">
                 <label htmlFor="promo-code" className={cn("font-semibold text-brand-ink/80", isSticky ? "text-xs" : "text-xs")}>{t('havePromoCode')}</label>
                 <Input
                     id="promo-code"
                     type="text"
                     value={promoCode}
                     onChange={(e) => setPromoCode(e.target.value)}
                     placeholder={t('enterCode')}
                     className={cn(
                       "w-full border-0 p-0 h-auto placeholder:text-brand-ink/50 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent",
                       isSticky ? "text-xs" : "text-sm"
                     )}
                 />
             </div>
          </div>
          
          <Button 
            onClick={handleSearchClick}
            className={cn(
              "w-full h-full btn-action font-bold col-span-1",
              isSticky && !isMobile ? "text-sm py-2" : "text-base",
              isMobile ? "h-14" : "py-5"
            )}
          >
            <Search className={cn("mr-2", isSticky ? "h-4 w-4" : "h-5 w-5")} />
            {t('findMyRiad')}
          </Button>

        </div>
      </div>
    </motion.div>
  );
};

export default BookingStrip;
