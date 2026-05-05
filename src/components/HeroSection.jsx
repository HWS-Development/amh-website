import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import BookingStrip from "@/components/BookingStrip";

const heroSlidesData = {
  en: [
    {
      destination: "Marrakech",
      imgSrc:
        "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/public/amhimages/heroimageriad/jamaaelfna.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvaGVyb2ltYWdlcmlhZC9oZXJvcmFrLmpwZyIsImlhdCI6MTc1NTg0NzgyMCwiZXhwIjoxOTEzNTI3ODIwfQ.E-2G7FPfVUKs6jcXz7mn4Qb-hiVWI7AoMXI0q1DVYTc",
      imgAlt: "Historic medina and Koutoubia Mosque in Marrakech",
    },
    {
      destination: "Essaouira",
      imgSrc:
        "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/public/amhimages/heroimageriad/essaouira.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvaGVyb2ltYWdlcmlhZC9oZXJvZXNzLmpwZyIsImlhdCI6MTc1NTg0Nzg4NywiZXhwIjoxOTEzNTI3ODg3fQ.N5OmYqBbkJgXMHOacXz2n4tisAW7uUQzFdBjKbY6ysI",
      imgAlt: "Coastal city of Essaouira",
    },
    {
      destination: "Ouarzazate",
      imgSrc:
        "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/public/amhimages/heroimageriad/ouarzazate.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvcm90YXRpdmUvT3VhcnphemF0ZV9yb3RhMS5qcGVnIiwiaWF0IjoxNzU0NTAwNzk3LCJleHAiOjIwNjk4NjA3OTd9.ZVqwsDonRGgbRdfn0ilj8zO9srTzSbsCe65WwlfYb6E",
      imgAlt: "Ancient Kasbah and desert landscape in Ouarzazate",
    },
  ],

  fr: [
    {
      destination: "Marrakech",
      imgSrc:
        "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/heroimageriad/herorak.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvaGVyb2ltYWdlcmlhZC9oZXJvcmFrLmpwZyIsImlhdCI6MTc1NTg0NzgyMCwiZXhwIjoxOTEzNTI3ODIwfQ.E-2G7FPfVUKs6jcXz7mn4Qb-hiVWI7AoMXI0q1DVYTc",
      imgAlt: "Médina historique et mosquée Koutoubia à Marrakech",
    },
    {
      destination: "Essaouira",
      imgSrc:
        "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/heroimageriad/heroess.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvaGVyb2ltYWdlcmlhZC9oZXJvZXNzLmpwZyIsImlhdCI6MTc1NTg0Nzg4NywiZXhwIjoxOTEzNTI3ODg3fQ.N5OmYqBbkJgXMHOacXz2n4tisAW7uUQzFdBjKbY6ysI",
      imgAlt: "Ville côtière d'Essaouira",
    },
    {
      destination: "Ouarzazate",
      imgSrc:
        "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/rotative/Ouarzazate_rota1.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvcm90YXRpdmUvT3VhcnphemF0ZV9yb3RhMS5qcGVnIiwiaWF0IjoxNzU0NTAwNzk3LCJleHAiOjIwNjk4NjA3OTd9.ZVqwsDonRGgbRdfn0ilj8zO9srTzSbsCe65WwlfYb6E",
      imgAlt: "Ancienne Kasbah et paysage désertique à Ouarzazate",
    },
  ],

  es: [
    {
      destination: "Marrakech",
      imgSrc:
        "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/heroimageriad/herorak.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvaGVyb2ltYWdlcmlhZC9oZXJvcmFrLmpwZyIsImlhdCI6MTc1NTg0NzgyMCwiZXhwIjoxOTEzNTI3ODIwfQ.E-2G7FPfVUKs6jcXz7mn4Qb-hiVWI7AoMXI0q1DVYTc",
      imgAlt: "Medina histórica y mezquita Kutubía en Marrakech",
    },
    {
      destination: "Essaouira",
      imgSrc:
        "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/heroimageriad/heroess.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvaGVyb2ltYWdlcmlhZC9oZXJvZXNzLmpwZyIsImlhdCI6MTc1NTg0Nzg4NywiZXhwIjoxOTEzNTI3ODg3fQ.N5OmYqBbkJgXMHOacXz2n4tisAW7uUQzFdBjKbY6ysI",
      imgAlt: "Ciudad costera de Essaouira",
    },
    {
      destination: "Ouarzazate",
      imgSrc:
        "https://dzuwwfttnigeisicqyto.supabase.co/storage/v1/object/sign/amhimages/rotative/Ouarzazate_rota1.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZmUzOTdmNy0zMGUxLTQyMjktOGZhNC01ZTZhZGQ3MGE4NWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbWhpbWFnZXMvcm90YXRpdmUvT3VhcnphemF0ZV9yb3RhMS5qcGVnIiwiaWF0IjoxNzU0NTAwNzk3LCJleHAiOjIwNjk4NjA3OTd9.ZVqwsDonRGgbRdfn0ilj8zO9srTzSbsCe65WwlfYb6E",
      imgAlt: "Antigua Kasbah y paisaje desértico en Ouarzazate",
    },
  ],
};

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const { currentLanguage, date, onDateChange } = useLanguage();
  const heroSlides = heroSlidesData[currentLanguage] || heroSlidesData.en;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    if (isMobile) return;

    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isMobile, heroSlides.length]);

  const slide = isMobile ? heroSlides[0] : heroSlides[currentIndex];

  const slideVariants = {
    hidden: { opacity: 0, scale: 1.04 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.04 },
  };

  return (
    <section className="relative h-[calc(100vh-10px)] md:h-[calc(100vh-10px)] w-full overflow-hidden text-white">
      <AnimatePresence initial={false}>
        <motion.div
          key={isMobile ? "marrakech-mobile" : currentIndex}
          variants={slideVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 1.25, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            loading="lazy"
            src={slide.imgSrc}
            alt={slide.imgAlt}
            className="w-full h-full object-cover brightness-110 contrast-110 saturate-110"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/25" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col justify-end items-center px-4 pb-8 md:pb-12">
        {!isMobile && (
          <div className="flex flex-col items-center w-full mb-7">
            <div className="flex items-center space-x-3 md:space-x-4 justify-center flex-wrap">
              <button
                onClick={prevSlide}
                className="p-3 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
              >
                <ChevronLeft size={30} />
              </button>

              {heroSlides.map((s, i) => (
                <button
                  key={s.destination}
                  onClick={() => setCurrentIndex(i)}
                  className={`py-3 px-8 text-base font-semibold transition-all duration-300 backdrop-blur-sm whitespace-nowrap ${
                    currentIndex === i
                      ? "bg-brand-action shadow-lg scale-105"
                      : "bg-white/30 hover:bg-white/40"
                  }`}
                >
                  {s.destination}
                </button>
              ))}

              <button
                onClick={nextSlide}
                className="p-3 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
              >
                <ChevronRight size={30} />
              </button>
            </div>

            <div className="flex space-x-2 mt-4">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`transition-all duration-300 backdrop-blur-sm ${
                    currentIndex === i
                      ? "bg-white w-4 h-4"
                      : "bg-white/50 w-2 h-2"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="w-full max-w-[1500px] px-2 md:px-6 mb-2 md:mb-4">
          <div className="w-full scale-[1.03] md:scale-[1.08] origin-center">
            <BookingStrip
              date={date}
              onDateChange={onDateChange}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;