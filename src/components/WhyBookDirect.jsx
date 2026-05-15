import React, { useState, useEffect, useRef } from 'react';
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
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const headerRef = useRef(null);
  const sectionRef = useRef(null);

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

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
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };
    api.on('select', onSelect);
    return () => { api.off('select', onSelect); };
  }, [api]);

  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0, y: 20, duration: 0.6,
        scrollTrigger: { trigger: headerRef.current, start: 'top 85%', once: true }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="why-book-direct" className="section-padding bg-brand-background overflow-hidden">
      <div className="content-wrapper">
        <div ref={headerRef} className="text-center max-w-3xl mx-auto">
          <h2 className="h2-style text-brand-ink mb-4">
            {t('whyBookDirect')}
          </h2>
        </div>

        {loading ? (
          <div className="mt-12 flex space-x-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-1">
                <div className="flex flex-col items-center text-center p-6 bg-white shadow-sm animate-pulse h-full">
                  <div className="bg-gray-200 p-4 mb-4 w-16 h-16"></div>
                  <div className="h-6 bg-gray-200 w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 w-full"></div>
                  <div className="h-4 bg-gray-200 w-5/6 mt-1"></div>
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
            plugins={prefersReducedMotion ? [] : [autoplayPlugin.current]}
            className="mt-12"
            aria-live="polite"
          >
            <CarouselContent>
              {benefits.map((benefit) => {
                const IconComponent = iconMap[benefit.icon_name];
                return (
                  <CarouselItem key={benefit.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <div className="flex flex-col items-center text-center p-8 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 h-full">
                        <div className="bg-brand-action/10 p-4 mb-4">
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
                    "h-2 w-2 transition-all duration-300",
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
