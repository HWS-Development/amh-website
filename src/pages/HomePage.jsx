import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';
import HeroSection from '@/components/HeroSection';
import TrustBar from '@/components/TrustBar';
import FeaturedDestinations from '@/components/FeaturedDestinations';
import FeaturedQuartiers from '@/components/FeaturedQuartiers';
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
      { threshold: 0.1, rootMargin: "-10px 0px 0px 0px" } 
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

  const pageTitle = "MGH — Official Site for Certified Riads in Marrakech & Essaouira";
  const pageDescription = "Discover authentic Moroccan hospitality in our carefully selected riads and guesthouses throughout Marrakech. Licensed, inspected, and safe accommodations with direct booking benefits.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
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
              animate={{ opacity: 1, y: "-0%" }}
              exit={{ opacity: 0, y: "-70%" }}
              transition={{ duration: 0.25 }}
            >
             <BookingStrip date={date} onDateChange={onDateChange} />
            </motion.div>
          )}
        </AnimatePresence>
        <FeaturedDestinations />
        <FeaturedQuartiers />
        <Experiences />
        <TrustBar />
      </div>
    </>
  );
};

export default HomePage;