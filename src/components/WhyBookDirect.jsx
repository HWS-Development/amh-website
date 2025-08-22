import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, Tag, Lock, MessageSquare, Award, Map } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from '@/lib/utils';

const iconMap = {
  ShieldCheck,
  Tag,
  Lock,
  MessageSquare,
  Award,
  Map,
};

const WhyBookDirect = () => {
  const { t } = useLanguage();
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const shouldReduceMotion = useReducedMotion();

  const autoplayPlugin = useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: true,
      stopOnFocusIn: true,
      stopOnMouseEnter: true,
    })
  );

  useEffect(() => {
    const fetchBenefits = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('why_book_direct')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching benefits:', error);
        setBenefits([]);
      } else {
        setBenefits(data);
      }
      setLoading(false);
    };

    fetchBenefits();
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  return (
    <section id="why-book-direct" className="section-padding bg-brand-background overflow-hidden">
      <div className="content-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="h2-style text-brand-ink mb-4">
            {t('whyBookDirect')}
          </h2>
        </motion.div>

        {loading ? (
          <div className="mt-12 flex space-x-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-1">
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm animate-pulse h-full">
                  <div className="bg-gray-200 p-4 rounded-full mb-4 w-16 h-16"></div>
                  <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-5/6 mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={shouldReduceMotion ? [] : [autoplayPlugin.current]}
            className="mt-12"
            aria-live="polite"
          >
            <CarouselContent>
              {benefits.map((benefit) => {
                const IconComponent = iconMap[benefit.icon_name];
                return (
                  <CarouselItem key={benefit.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <div className="flex flex-col items-center text-center p-8 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 h-full">
                        <div className="bg-brand-action/10 p-4 rounded-full mb-4">
                          {IconComponent && <IconComponent className="w-8 h-8 text-brand-action" />}
                        </div>
                        <h3 className="text-xl font-bold text-brand-ink mb-2">{t(benefit.title_key)}</h3>
                        <p className="text-sm text-brand-ink/80">{t(benefit.description_key)}</p>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious aria-label="Previous benefit" />
              <CarouselNext aria-label="Next benefit" />
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300",
                    current === index + 1 ? "bg-brand-action w-4" : "bg-brand-ink/20"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default WhyBookDirect;