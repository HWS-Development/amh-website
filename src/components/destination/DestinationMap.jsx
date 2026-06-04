import { useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, ExternalLink } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DestinationMap = ({ mapUrl, destinationName, sectionRef }) => {
  const { t } = useLanguage();
  const headerRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!mapUrl) return;
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          y: 30,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 82%",
            once: true,
          },
        });
      }
      if (mapContainerRef.current) {
        gsap.from(mapContainerRef.current, {
          y: 40,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: mapContainerRef.current,
            start: "top 82%",
            once: true,
          },
        });
      }
    });
    return () => ctx.revert();
  }, [mapUrl]);

  if (!mapUrl) return null;

  return (
    <section id="map" ref={sectionRef} className="py-20 md:py-32 bg-white relative">
      <div className="content-wrapper">
        <div ref={headerRef} className="text-center mb-14">
          <span className="font-montserrat uppercase tracking-[0.35em] text-[0.6rem] text-brand-action font-semibold">
            {t("location") || "Location"}
          </span>
          <h2 className="mt-3 font-display text-brand-ink text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight">
            {t("map")}
          </h2>
        </div>

        <div
          ref={mapContainerRef}
          className="relative overflow-hidden shadow-lg border border-brand-ink/5 group"
        >
          <div className="aspect-video">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map of ${destinationName}`}
            />
          </div>

          <div className="absolute bottom-4 right-4">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2.5 shadow-md hover:bg-brand-action hover:text-white transition-all duration-300 group/btn"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-montserrat text-[0.6rem] font-semibold uppercase tracking-[0.2em]">
                {t("openMap") || "Open map"}
              </span>
              <ExternalLink className="w-3 h-3 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DestinationMap;
