import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const heroSlidesData = {
  en: [
    {
      destination: 'Marrakech',
      title: 'Discover Authentic Moroccan Riads',
      subtitle: 'Over 250 licensed riads in Marrakech, Essaouira & Ouarzazate.',
      tagline: 'The vibrant heart of Morocco',
      riadCount: 190,
      availableText: 'available riads',
      imgSrc: 'https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/heroimageriad/herorak.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvaGVyb2ltYWdlcmlhZC9oZXJvcmFrLmpwZyIsImlhdCI6MTc1NTg0NzgyMCwiZXhwIjoxOTEzNTI3ODIwfQ.E-2G7FPfVUKs6jcXz7mn4Qb-hiVWI7AoMXI0q1DVYTc',
      imgAlt: 'Historic medina and Koutoubia Mosque in Marrakech',
      link: '/destinations/marrakech'
    },
    {
      destination: 'Essaouira',
      title: 'Coastal Charm & Artistic Soul',
      subtitle: 'Explore the windswept ramparts and artistic medina.',
      tagline: 'The windy city of Africa',
      riadCount: 40,
      availableText: 'available riads',
      imgSrc: 'https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/heroimageriad/heroess.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvaGVyb2ltYWdlcmlhZC9oZXJvZXNzLmpwZyIsImiYXQiOjE3NTU4NDc4ODcsImV4cCI6MTkxMzUyNzg4N30.N5OmYqBbkJgXMHOacXz2n4tisAW7uUQzFdBjKbY6ysI',
      imgAlt: 'Coastal city of Essaouira with traditional blue boats and ramparts',
      link: '/destinations/essaouira'
    },
    {
      destination: 'Ouarzazate',
      title: 'Gateway to the Sahara',
      subtitle: 'Discover ancient kasbahs and cinematic desert landscapes.',
      tagline: 'Where the desert meets the stars',
      riadCount: 20,
      availableText: 'available riads',
      imgSrc: 'https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/rotative/Ouarzazate_rota1.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvcm90YXRpdmUvT3VhcnphemF0ZV9yb3RhMS5qcGVnIiwiaWF0IjoxNzU0NTAwNzk3LCJleHAiOjIwNjk4NjA3OTd9.ZVqwsDonRGgbRdfn0ilj8zO9srTzSbsCe65WwlfYb6E',
      imgAlt: 'Ancient Kasbah and desert landscape in Ouarzazate, Morocco',
      link: '/destinations/ouarzazate'
    }
  ],
  fr: [
    {
      destination: 'Marrakech',
      title: 'Découvrez d\'Authentiques Riads Marocains',
      subtitle: 'Plus de 250 riads autorisés à Marrakech, Essaouira & Ouarzazate.',
      tagline: 'Le cœur vibrant du Maroc',
      riadCount: 190,
      availableText: 'riads disponibles',
      imgSrc: 'https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/heroimageriad/herorak.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvaGVyb2ltYWdlcmlhZC9oZXJvcmFrLmpwZyIsImlhdCI6MTc1NTg0NzgyMCwiZXhwIjoxOTEzNTI3ODIwfQ.E-2G7FPfVUKs6jcXz7mn4Qb-hiVWI7AoMXI0q1DVYTc',
      imgAlt: 'Médina historique et mosquée Koutoubia à Marrakech',
      link: '/destinations/marrakech'
    },
    {
      destination: 'Essaouira',
      title: 'Charme Côtier & Âme Artistique',
      subtitle: 'Explorez les remparts balayés par le vent et la médina artistique.',
      tagline: 'La ville du vent d\'Afrique',
      riadCount: 40,
      availableText: 'riads disponibles',
      imgSrc: 'https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/heroimageriad/heroess.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvaGVyb2ltYWdlcmlhZC9oZXJvZXNzLmpwZyIsImlhdCI6MTc1NTg0Nzg4NywiZXhwIjoxOTEzNTI3ODg3fQ.N5OmYqBbkJgXMHOacXz2n4tisAW7uUQzFdBjKbY6ysI',
      imgAlt: 'Ville côtière d\'Essaouira avec ses bateaux bleus traditionnels et ses remparts',
      link: '/destinations/essaouira'
    },
    {
      destination: 'Ouarzazate',
      title: 'La Porte du Sahara',
      subtitle: 'Découvrez d\'anciennes kasbahs et des paysages désertiques cinématographiques.',
      tagline: 'Où le désert rencontre les étoiles',
      riadCount: 20,
      availableText: 'riads disponibles',
      imgSrc: 'https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/rotative/Ouarzazate_rota1.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvcm90YXRpdmUvT3VhcnphemF0ZV9yb3RhMS5qcGVnIiwiaWF0IjoxNzU0NTAwNzk3LCJleHAiOjIwNjk4NjA3OTd9.ZVqwsDonRGgbRdfn0ilj8zO9srTzSbsCe65WwlfYb6E',
      imgAlt: 'Ancienne Kasbah et paysage désertique à Ouarzazate, Maroc',
      link: '/destinations/ouarzazate'
    }
  ],
  es: [
    {
      destination: 'Marrakech',
      title: 'Descubra Auténticos Riads Marroquíes',
      subtitle: 'Más de 250 riads con licencia en Marrakech, Esauira y Uarzazat.',
      tagline: 'El vibrante corazón de Marruecos',
      riadCount: 190,
      availableText: 'riads disponibles',
      imgSrc: 'https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/heroimageriad/herorak.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvaGVyb2ltYWdlcmlhZC9oZXJvcmFrLmpwZyIsImlhdCI6MTc1NTg0NzgyMCwiZXhwIjoxOTEzNTI3ODIwfQ.E-2G7FPfVUKs6jcXz7mn4Qb-hiVWI7AoMXI0q1DVYTc',
      imgAlt: 'Medina histórica y mezquita Kutubía en Marrakech',
      link: '/destinations/marrakech'
    },
    {
      destination: 'Esauira',
      title: 'Encanto Costero y Alma Artística',
      subtitle: 'Explore las murallas azotadas por el viento y la medina artística.',
      tagline: 'La ciudad ventosa de África',
      riadCount: 40,
      availableText: 'riads disponibles',
      imgSrc: 'https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/heroimageriad/heroess.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvaGVyb2ltYWdlcmlhZC9oZXJvZXNzLmpwZyIsImlhdCI6MTc1NTg0Nzg4NywiZXhwIjoxOTEzNTI3ODg3fQ.N5OmYqBbkJgXMHOacXz2n4tisAW7uUQzFdBjKbY6ysI',
      imgAlt: 'Ciudad costera de Esauira con barcos azules tradicionales y murallas',
      link: '/destinations/essaouira'
    },
    {
      destination: 'Uarzazat',
      title: 'Puerta de entrada al Sáhara',
      subtitle: 'Descubra antiguas kasbahs y paisajes desérticos cinematográficos.',
      tagline: 'Donde el desierto se encuentra con las estrellas',
      riadCount: 20,
      availableText: 'riads disponibles',
      imgSrc: 'https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/rotative/Ouarzazate_rota1.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvcm90YXRpdmUvT3VhcnphemF0ZV9yb3RhMS5qcGVnIiwiaWF0IjoxNzU0NTAwNzk3LCJleHAiOjIwNjk4NjA3OTd9.ZVqwsDonRGgbRdfn0ilj8zO9srTzSbsCe65WwlfYb6E',
      imgAlt: 'Antigua Kasbah y paisaje desértico en Uarzazat, Marruecos',
      link: '/destinations/ouarzazate'
    }
  ]
};

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t, currentLanguage } = useLanguage();
  const heroSlides = heroSlidesData[currentLanguage] || heroSlidesData.en;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's 'md' breakpoint is 768px
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    if (!isMobile) { // Only auto-play on desktop
      const timer = setInterval(nextSlide, 7000);
      return () => clearInterval(timer);
    }
  }, [isMobile]);

  const slide = isMobile ? heroSlides[0] : heroSlides[currentIndex]; // Always Marrakech for mobile

  const slideVariants = {
    hidden: { opacity: 0, scale: 1.05 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  };

  return (
    <section className="relative h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] w-full overflow-hidden text-white">
      <AnimatePresence initial={false}>
        <motion.div
          key={isMobile ? "marrakech-mobile" : currentIndex} // Unique key for mobile to prevent re-animation
          variants={slideVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            loading="lazy"
            src={slide.imgSrc}
            alt={slide.imgAlt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-ink/50"></div>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col justify-between pt-2 md:pt-28 pb-4">
        <div className="content-wrapper">
          <div className="flex items-center space-x-2 text-base font-bold text-white text-shadow-sm">
            <Star className="w-5 h-5 text-brand-action" fill="currentColor"/>
            <span>{t('officialAssociation')}</span>
          </div>
        </div>

        <div className="content-wrapper flex-grow flex flex-col justify-center">
          <div className="w-full">
            <motion.div 
              key={isMobile ? "marrakech-text-mobile" : currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="text-left max-w-4xl w-full"
            >
              <h1 className="h1-style leading-tight font-bold text-shadow-lg">{slide.title}</h1>
              <p className="mt-2 md:mt-4 body-text max-w-2xl text-white/90 text-shadow-sm">{slide.subtitle}</p>
            </motion.div>
            
            <motion.div 
              key={isMobile ? "marrakech-card-mobile" : currentIndex + '_card'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
              className="mt-8 p-4 md:p-8 bg-brand-ink/30 backdrop-blur-md rounded-sm w-full max-w-4xl flex flex-col md:flex-row items-start md:items-center justify-between text-left"
            >
              <div className="flex items-center">
                <MapPin className="w-8 h-8 md:w-10 md:h-10 mr-4 text-white flex-shrink-0" />
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">{slide.destination}</h2>
                  <p className="text-white/80 text-base">{slide.tagline}</p>
                  <Link to={slide.link} className="text-brand-action text-base font-bold underline-offset-4 hover:underline">
                    {slide.riadCount} {slide.availableText}
                  </Link>
                </div>
              </div>
              <div className="text-left md:text-center mt-6 md:mt-0 md:ml-8">
                <p className="text-5xl font-bold text-brand-action">{slide.riadCount}</p>
                <p className="text-sm uppercase tracking-wider text-white/70">{t('riad')}</p>
              </div>
            </motion.div>

            <motion.div
              key={isMobile ? "marrakech-button-mobile" : currentIndex + '_button'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
              className="mt-8"
            >
              <Button asChild size="lg" className="btn-action text-lg font-bold w-full md:w-[240px] h-[56px] transition-transform duration-250 hover:scale-105">
                <Link to={slide.link}>{t('discoverRiads')}</Link>
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {/* This empty div is a spacer */}
          <div className="h-20"></div>

          {!isMobile && ( // Hide carousel controls on mobile
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center w-full px-4">
                <div className="flex items-center space-x-2 md:space-x-4">
                   <button onClick={prevSlide} className="p-2 transition-opacity hover:opacity-80"><ChevronLeft size={24} /></button>
                   {heroSlides.map((s, i) => (
                       <button 
                           key={s.destination}
                           onClick={() => setCurrentIndex(i)}
                           className={`py-2 px-4 md:px-5 rounded-full text-sm font-semibold transition-colors duration-300 ${currentIndex === i ? 'bg-brand-action' : 'bg-white/50'}`}
                       >
                           {s.destination}
                       </button>
                   ))}
                   <button onClick={nextSlide} className="p-2 transition-opacity hover:opacity-80"><ChevronRight size={24} /></button>
                </div>
                <div className="flex space-x-2 mt-3">
                    {heroSlides.map((_, i) => (
                        <button key={i} onClick={() => setCurrentIndex(i)} className={`w-2 h-2 rounded-full transition-colors duration-300 ${currentIndex === i ? 'bg-white' : 'bg-white/50'}`}></button>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;