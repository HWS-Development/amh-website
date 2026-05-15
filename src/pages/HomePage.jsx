import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';
import HeroSection from '@/components/HeroSection';
import TrustBar from '@/components/TrustBar';
import CatalogueSection from '@/components/CatalogueSection';
import FeaturedQuartiers from '@/components/FeaturedQuartiers';
import Experiences from '@/components/Experiences';

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

  const pageTitle = "LA CENTRALE DES RIADS — Riads & Maisons d'Hôtes Classés au Maroc";
  const pageDescription = "Réservez en direct avec les hôteliers, parmi les riads et maisons d'hôtes classés de Marrakech, Essaouira et Ouarzazate, sans intermédiaire ni commission.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Helmet>

      <div>
        <div ref={heroRef}>
          <HeroSection />
        </div>

        <CatalogueSection />
        <FeaturedQuartiers />
        <Experiences />
        <TrustBar />
      </div>
    </>
  );
};

export default HomePage;
