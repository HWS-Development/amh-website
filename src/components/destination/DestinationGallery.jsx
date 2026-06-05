import { useRef, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_GALLERIES = {
  marrakech: ['/images/koutoubia.jpg', '/images/hero_koutoubia.webp'],
  essaouira: ['/images/essaouira1.jpg', '/images/hero_essaouira.webp'],
  ouarzazate: ['/images/ouarzazate1.jpg', '/images/hero_ouarzazate.webp'],
};

const DEFAULT_FALLBACK = ['/images/hero_koutoubia.webp'];

const DestinationGallery = ({ slug, gallery, destinationName, sectionRef }) => {
  const { t } = useLanguage();
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!resolvedGallery?.length || !gridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(gridRef.current.children, {
        y: 30,
        duration: 0.7,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 82%",
          once: true,
        },
      });
    }, gridRef);
    return () => ctx.revert();
  }, [resolvedGallery]);

  const resolvedGallery = (gallery && gallery.length > 0)
    ? gallery
    : (FALLBACK_GALLERIES[slug] || DEFAULT_FALLBACK);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };

  const goNext = () => {
    setLightboxIndex((i) => (i + 1) % resolvedGallery.length);
  };

  const goPrev = () => {
    setLightboxIndex((i) => (i - 1 + resolvedGallery.length) % resolvedGallery.length);
  };

  const aspectClasses = [
    "md:col-span-2 md:row-span-2",
    "md:col-span-1 md:row-span-1",
    "md:col-span-1 md:row-span-2",
    "md:col-span-2 md:row-span-1",
    "md:col-span-1 md:row-span-1",
    "md:col-span-1 md:row-span-1",
  ];

  return (
    <section id="gallery" ref={sectionRef} className="py-20 md:py-32 bg-[#faf9f7] relative">
      <div className="content-wrapper">
        <div ref={headerRef} className="text-center mb-14">
          <span className="font-montserrat uppercase tracking-[0.35em] text-[0.6rem] text-brand-action font-semibold">
            {t("moments") || "Moments"}
          </span>
          <h2 className="mt-3 font-display text-brand-ink text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight">
            {t("photoGallery")}
          </h2>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[250px]"
        >
          {resolvedGallery.slice(0, 6).map((url, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className={`overflow-hidden group relative ${aspectClasses[index] || "md:col-span-1 md:row-span-1"}`}
            >
              <OptimizedImage
                src={url}
                alt={`${destinationName} gallery ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-brand-ink/0 group-hover:bg-brand-ink/20 transition-all duration-700" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-white font-montserrat text-[0.6rem] uppercase tracking-[0.3em] font-semibold">
                  {t("view") || "View"}
                </span>
              </div>
            </button>
          ))}
        </div>

        {resolvedGallery.length > 6 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => openLightbox(0)}
              className="inline-flex items-center gap-2 bg-brand-ink text-white px-6 py-3 font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.25em] hover:bg-brand-action transition-all duration-500"
            >
              {t("viewAll") || "View all"} ({resolvedGallery.length})
            </button>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[9999] bg-brand-ink/95 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4">
            <span className="font-montserrat text-xs text-white/60 tracking-wide">
              {lightboxIndex + 1} / {resolvedGallery.length}
            </span>
            <button
              onClick={closeLightbox}
              className="w-10 h-10 grid place-items-center text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center p-6">
            <button
              onClick={goPrev}
              className="absolute left-4 z-10 w-10 h-10 grid place-items-center text-white/50 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <OptimizedImage
              src={resolvedGallery[lightboxIndex]}
              alt={`${destinationName} ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            <button
              onClick={goNext}
              className="absolute right-4 z-10 w-10 h-10 grid place-items-center text-white/50 hover:text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default DestinationGallery;
