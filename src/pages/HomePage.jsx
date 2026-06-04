import { Helmet } from 'react-helmet';
import HeroSection from '@/components/HeroSection';
import CatalogueSection from '@/components/CatalogueSection';
import FeaturedQuartiers from '@/components/FeaturedQuartiers';
import FeaturedDestinations from '@/components/FeaturedDestinations';
import Experiences from '@/components/Experiences';
import StickyBookingCta from '@/components/StickyBookingCta';

const HomePage = () => {
  const pageTitle =
    "LA CENTRALE DES RIADS — Riads & Maisons d'Hôtes Classés au Maroc";
  const pageDescription =
    "Réservez en direct avec les hôteliers, parmi les riads et maisons d'hôtes classés de Marrakech, Essaouira et Ouarzazate, sans intermédiaire ni commission.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Helmet>

      <div>
        <HeroSection />      
        <CatalogueSection />
        <FeaturedQuartiers />
        <FeaturedDestinations />
        <Experiences />
      </div>

    </>
  );
};

export default HomePage;
