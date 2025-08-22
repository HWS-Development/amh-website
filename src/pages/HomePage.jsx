
import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';
import HeroSection from '@/components/HeroSection';
import TrustBar from '@/components/TrustBar';
import FeaturedDestinations from '@/components/FeaturedDestinations';
import Collections from '@/components/Collections';
import Experiences from '@/components/Experiences';
import BookingStrip from '@/components/BookingStrip';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = () => {
  const { t } = useLanguage();
  const { date, onDateChange } = useLanguage();
  const [showBookingStrip, setShowBookingStrip] = useState(true);
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowBookingStrip(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "-100px 0px 0px 0px" } 
    );

    const currentHeroRef = heroRef.current;
    if (currentHeroRef) {
      observer.observe(currentHeroRef);
    }

    return () => {
      if (currentHeroRef) {
        observer.unobserve(currentHeroRef);
      }
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Association Maisons d'Hôtes de Marrakech - Authentic Riads & Guesthouses</title>
        <meta 
          name="description" 
          content="Discover authentic Moroccan hospitality in our carefully selected riads and guesthouses throughout Marrakech. Licensed, inspected, and safe accommodations with direct booking benefits." 
        />
      </Helmet>
      
      <div className="pt-20 md:pt-0">
        <div ref={heroRef}>
          <HeroSection />
        </div>
        <div className="md:hidden">
          <BookingStrip date={date} onDateChange={onDateChange} isMobile={true} />
        </div>
        <AnimatePresence>
          {showBookingStrip && (
            <motion.div
              className="hidden md:block transform -translate-y-1/2 z-30 relative"
              initial={{ opacity: 0, y: "-70%" }}
              animate={{ opacity: 1, y: "-50%" }}
              exit={{ opacity: 0, y: "-70%" }}
              transition={{ duration: 0.25 }}
            >
             <BookingStrip date={date} onDateChange={onDateChange} />
            </motion.div>
          )}
        </AnimatePresence>
        <FeaturedDestinations />
        <Collections />
        <Experiences />
        <TrustBar />
      </div>
    </>
  );
};

export default HomePage;
