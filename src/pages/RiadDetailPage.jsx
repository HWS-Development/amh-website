import React, { useEffect, useState, useMemo, useRef, useLayoutEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

import OptimizedImage from "@/components/ui/OptimizedImage";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  ArrowLeft, Star, MapPin, Check, Shield, Phone, Mail, Globe,
  ChevronRight, Sparkles, X, Wifi, Waves, Bath, Sun, Wind, Users,
  Utensils, Tv, Coffee, Car, Key, Thermometer, Heart, Baby,
  Accessibility, Dumbbell, ParkingCircle, BedDouble, Shirt, PawPrint,
  CigaretteOff, Snowflake, ConciergeBell, Plane, Lock,
} from "lucide-react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { getTranslated } from "@/lib/utils";
import { fetchCatalog } from "@/lib/catalogs";
import { usePartnerHotelById } from "@/lib/partnerHotelsApi";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_IMAGE = import.meta.env.VITE_FALLBACK_IMAGE ||
  "https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png";

const fetchServicesCatalog = async (language) => {
  try {
    return await fetchCatalog("mgh_services_catalog", language);
  } catch {
    return fetchCatalog("mgh_serivces_catalog", language);
  }
};

const getAmenityIcon = (label = "") => {
  const text = label.toLowerCase();
  if (text.includes("wifi") || text.includes("wi-fi") || text.includes("internet")) return Wifi;
  if (text.includes("pool") || text.includes("piscine") || text.includes("swimming")) return Waves;
  if (text.includes("bath") || text.includes("bain") || text.includes("shower") || text.includes("douche")) return Bath;
  if (text.includes("terrace") || text.includes("terrasse") || text.includes("sun") || text.includes("solarium")) return Sun;
  if (text.includes("air") || text.includes("clim") || text.includes("conditioning")) return Snowflake;
  if (text.includes("chauffage") || text.includes("heating")) return Thermometer;
  if (text.includes("restaurant") || text.includes("breakfast") || text.includes("petit-déjeuner") || text.includes("dinner") || text.includes("food")) return Utensils;
  if (text.includes("coffee") || text.includes("café") || text.includes("tea") || text.includes("thé")) return Coffee;
  if (text.includes("tv") || text.includes("television") || text.includes("télé")) return Tv;
  if (text.includes("family") || text.includes("famille") || text.includes("group")) return Users;
  if (text.includes("baby") || text.includes("bébé") || text.includes("child") || text.includes("children")) return Baby;
  if (text.includes("parking") || text.includes("garage")) return ParkingCircle;
  if (text.includes("car") || text.includes("voiture") || text.includes("rental")) return Car;
  if (text.includes("airport") || text.includes("aéroport") || text.includes("transfer") || text.includes("shuttle")) return Plane;
  if (text.includes("spa") || text.includes("massage") || text.includes("wellness") || text.includes("bien-être")) return Heart;
  if (text.includes("gym") || text.includes("fitness") || text.includes("sport")) return Dumbbell;
  if (text.includes("room") || text.includes("bed") || text.includes("lit") || text.includes("suite")) return BedDouble;
  if (text.includes("laundry") || text.includes("linge") || text.includes("pressing")) return Shirt;
  if (text.includes("pet") || text.includes("animal")) return PawPrint;
  if (text.includes("non-smoking") || text.includes("non fumeur") || text.includes("smoking")) return CigaretteOff;
  if (text.includes("accessible") || text.includes("handicap") || text.includes("wheelchair")) return Accessibility;
  if (text.includes("safe") || text.includes("security") || text.includes("sécurité")) return Lock;
  if (text.includes("reception") || text.includes("concierge") || text.includes("front desk")) return ConciergeBell;
  if (text.includes("key") || text.includes("clé")) return Key;
  if (text.includes("view") || text.includes("vue")) return Sun;
  if (text.includes("wind") || text.includes("ventilation")) return Wind;
  return Check;
};

/* ═══════════════════════════ Gallery Modal ═══════════════════════════ */
const GalleryModal = ({ open, images, name, startIndex, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-white/98 flex flex-col" style={{ animation: "modalIn 360ms cubic-bezier(.2,.9,.25,1)" }}>
      <div className="h-[76px] flex items-center justify-between px-7 border-b border-brand-ink/8">
        <span className="text-sm font-semibold text-brand-ink font-montserrat">{name}</span>
        <button type="button" onClick={onClose} className="w-10 h-10 border border-brand-ink/12 bg-white flex items-center justify-center cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <Swiper
          modules={[Navigation, Pagination, Keyboard]}
          navigation
          pagination={{ type: "fraction" }}
          keyboard={{ enabled: true }}
          initialSlide={startIndex}
          className="w-full h-full riad-gallery-swiper"
          style={{ "--swiper-navigation-color": "#bf673e", "--swiper-pagination-color": "#bf673e" }}
        >
          {images.map((url, index) => (
            <SwiperSlide key={`${url}-${index}`}>
              <div className="w-full h-full flex items-center justify-center p-7 md:px-24 md:pb-16">
                <OptimizedImage
                  src={url}
                  alt={`${name} ${index + 1}`}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", boxShadow: "0 20px 70px rgba(0,0,0,0.14)" }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:translateY(8px) scale(.995) } to { opacity:1; transform:translateY(0) scale(1) } }
        .riad-gallery-swiper .swiper-button-next, .riad-gallery-swiper .swiper-button-prev { color:#bf673e; }
        .riad-gallery-swiper .swiper-button-next::after, .riad-gallery-swiper .swiper-button-prev::after { font-size:14px; font-weight:700; }
        .riad-gallery-swiper .swiper-pagination { color:#bf673e; font-family:'Montserrat',sans-serif; font-size:13px; }
      `}</style>
    </div>
  );
};

/* ─── Star Row ─── */
const StarRow = ({ count = 5, filled = 5 }) => (
  <div className="flex gap-1">
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} className="w-3.5 h-3.5" style={{ color: i < filled ? "#bf673e" : "rgba(191,103,62,0.25)", fill: i < filled ? "#bf673e" : "none" }} />
    ))}
  </div>
);

/* ═══════════════════════════════════ MAIN PAGE ═══════════════════════════════════ */
const RiadDetailPage = () => {
  const { id } = useParams();
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();

  const [riad, setRiad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  const [cities, setCities] = useState({});
  const [neighborhoods, setNeighborhoods] = useState({});
  const [propertyTypes, setPropertyTypes] = useState({});
  const [amenitiesCatalog, setAmenitiesCatalog] = useState({});
  const [servicesCatalog, setServicesCatalog] = useState({});
  const [bookingConditionsCatalog, setBookingConditionsCatalog] = useState({});

  const imgLayerA = useRef(null);
  const imgLayerB = useRef(null);
  const activeLayer = useRef("A");
  const progressBarRef = useRef(null);
  const infoCardRef = useRef(null);
  const amenitiesRef = useRef(null);
  const servicesRef = useRef(null);

  const pageRef = useRef(null);
  const mapRef = useRef(null);

  const { data: hotelData, error: hotelError, isLoading: hotelLoading } = usePartnerHotelById(id);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [citiesArr, neighborhoodsArr, propertyTypesArr, amenitiesArr, servicesArr, bookingConditionsArr] = await Promise.all([
          fetchCatalog("mgh_cities", currentLanguage),
          fetchCatalog("mgh_neighborhoods", currentLanguage),
          fetchCatalog("mgh_property_types", currentLanguage),
          fetchCatalog("mgh_amenities_catalog", currentLanguage),
          fetchServicesCatalog(currentLanguage),
          fetchCatalog("mgh_booking_conditions", currentLanguage).catch(() => []),
        ]);
        setCities(Object.fromEntries(citiesArr.map((c) => [c.id, c.label])));
        setNeighborhoods(Object.fromEntries(neighborhoodsArr.map((n) => [n.id, n.label])));
        setPropertyTypes(Object.fromEntries(propertyTypesArr.map((p) => [p.id, p.label])));
        setAmenitiesCatalog(Object.fromEntries(amenitiesArr.map((a) => [a.id, a.label])));
        setServicesCatalog(Object.fromEntries(servicesArr.map((s) => [s.id, s.label])));
        setBookingConditionsCatalog(Object.fromEntries(bookingConditionsArr.map((b) => [b.id, b.label])));
        setRiad(hotelData);
        if (hotelData?.latitude && hotelData?.longitude) {
          setTimeout(() => setMapLoaded(true), 600);
        }
      } catch {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch riad details." });
        setRiad(null);
      }
      setLoading(false);
    };

    if (hotelData) {
      fetchAll();
    } else if (hotelError) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch riad details." });
      setRiad(null);
      setLoading(false);
    } else if (hotelLoading) {
      setLoading(true);
    }
  }, [hotelData, hotelError, hotelLoading, currentLanguage, toast]);

  /* ─── Derived data ─── */
  const name = riad ? getTranslated(riad.name, currentLanguage) : "";
  const description = riad ? getTranslated(riad.description, currentLanguage) : "";
  const address = riad ? getTranslated(riad.address, currentLanguage) : "";
  const city = riad ? (cities[riad.city_id] || "") : "";
  const neighborhood = riad ? (neighborhoods[riad.neighborhood_id] || "") : "";
  const propertyType = riad ? (propertyTypes[riad.property_type_id] || "") : "";
  const images = riad && Array.isArray(riad.image_urls) && riad.image_urls.length > 0 ? riad.image_urls : [FALLBACK_IMAGE];
  const amenities = riad ? (riad.amenity_ids || []).map((aid) => amenitiesCatalog[aid]).filter(Boolean) : [];
  const services = riad ? (riad.service_ids || []).map((sid) => servicesCatalog[sid]).filter(Boolean) : [];
  const bookingConditions = riad ? (riad.booking_condition_ids || []).map((bid) => bookingConditionsCatalog[bid]).filter(Boolean) : [];
  const position = riad && riad.latitude && riad.longitude ? [riad.latitude, riad.longitude] : null;
  const ratingNum = riad ? (parseFloat(riad.rating_avg) || 0) : 0;
  const ratingFull = Math.round(ratingNum);

  // GSAP cinematic slide transition
  const animateSlide = useCallback((newIdx, dir) => {
    const enterLayer = activeLayer.current === "A" ? imgLayerB : imgLayerA;
    const exitLayer = activeLayer.current === "A" ? imgLayerA : imgLayerB;

    if (!enterLayer.current || !exitLayer.current) return;

    // Set new image on enter layer
    enterLayer.current.src = images[newIdx];
    enterLayer.current.alt = `${name} ${newIdx + 1}`;

    // Place enter layer on top
    enterLayer.current.style.zIndex = 2;
    exitLayer.current.style.zIndex = 1;

    const tl = gsap.timeline();

    // Enter: fade + scale + slide + blur in
    tl.fromTo(enterLayer.current,
      { opacity: 0, scale: 1.06, x: dir > 0 ? 60 : -60, filter: "blur(8px)" },
      { opacity: 1, scale: 1, x: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out" },
      0
    );

    // Exit: fade + slide + blur out
    tl.to(exitLayer.current,
      { opacity: 0, scale: 1.02, x: dir > 0 ? -60 : 60, filter: "blur(8px)", duration: 0.9, ease: "power3.out" },
      0
    );

    activeLayer.current = activeLayer.current === "A" ? "B" : "A";

    // Animate progress bar
    if (progressBarRef.current) {
      gsap.fromTo(progressBarRef.current, { scaleX: 0 }, { scaleX: 1, duration: 5.4, ease: "none" });
    }
  }, [images, name]);

  // Initialize first image
  useEffect(() => {
    if (images.length === 0) return;
    if (imgLayerA.current) {
      imgLayerA.current.src = images[0];
      imgLayerA.current.alt = `${name} 1`;
      imgLayerA.current.style.opacity = 1;
      imgLayerA.current.style.zIndex = 2;
    }
    if (imgLayerB.current) {
      imgLayerB.current.style.opacity = 0;
      imgLayerB.current.style.zIndex = 1;
    }
    activeLayer.current = "A";
    if (progressBarRef.current) {
      gsap.fromTo(progressBarRef.current, { scaleX: 0 }, { scaleX: 1, duration: 5.4, ease: "none" });
    }
  }, [images, name]);

  // Info card entry animation
  useEffect(() => {
    if (loading || !riad || !infoCardRef.current) return;
    gsap.from(infoCardRef.current, { opacity: 0, x: 50, duration: 0.9, ease: "power3.out" });
  }, [loading, riad]);

  // Amenities/services stagger
  useEffect(() => {
    if (loading || !riad) return;
    if (amenitiesRef.current) {
      const items = amenitiesRef.current.querySelectorAll("li");
      if (items.length) gsap.from(items, { opacity: 0, y: 8, duration: 0.45, stagger: 0.03 });
    }
    if (servicesRef.current) {
      const items = servicesRef.current.querySelectorAll("li");
      if (items.length) gsap.from(items, { opacity: 0, y: 8, duration: 0.45, stagger: 0.03 });
    }
  }, [loading, riad]);
  useLayoutEffect(() => {
    if (loading || !riad) return;
    const ctx = gsap.context(() => {
      if (mapRef.current) {
        gsap.from(mapRef.current, {
          y: 30, opacity: 0, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: mapRef.current, start: "top 85%" },
        });
      }
    }, pageRef);
    return () => ctx.revert();
  }, [loading, riad]);

  const customIcon = useMemo(
    () => L.divIcon({
      html: `<div style="width:36px;height:36px;background:#bf673e;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 14px rgba(0,0,0,0.25)"></div>`,
      iconSize: [36, 36], iconAnchor: [18, 36], className: "",
    }),
    [],
  );

  /* ─── Carousel autoplay ─── */
  useEffect(() => { setPhotoIdx(0); setDirection(1); }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const intervalId = setInterval(() => {
      setDirection(1);
      setPhotoIdx((i) => {
        const next = (i + 1) % images.length;
        animateSlide(next, 1);
        return next;
      });
    }, 5500);
    return () => clearInterval(intervalId);
  }, [images.length, animateSlide]);

  const goNext = () => {
    setDirection(1);
    setPhotoIdx((i) => {
      const next = (i + 1) % images.length;
      animateSlide(next, 1);
      return next;
    });
  };
  const goPrev = () => {
    setDirection(-1);
    setPhotoIdx((i) => {
      const next = (i - 1 + images.length) % images.length;
      animateSlide(next, -1);
      return next;
    });
  };

  const openGallery = (index) => {
    setActiveImageIndex(index);
    setGalleryOpen(true);
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-beige border-t-brand-action animate-spin mb-4" />
        <span className="text-sm text-brand-ink/50 font-montserrat tracking-wide">{t("loading")}</span>
      </div>
    );
  }

  if (!riad) return null;

  return (
    <>
      <Helmet>
        <title>{name} &middot; LA CENTRALE DES RIADS</title>
      </Helmet>

      <GalleryModal
        open={galleryOpen}
        images={images}
        name={name}
        startIndex={activeImageIndex}
        onClose={() => setGalleryOpen(false)}
      />

      <div ref={pageRef} className="relative bg-white font-montserrat min-h-screen overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-brand-action/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 left-0 w-[500px] h-[500px] bg-brand-action/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-[100px] pb-16">
          {/* Back link */}
          <Link
            to="/all-riads"
            className="inline-flex items-center gap-2 text-brand-ink/50 hover:text-brand-action transition-colors text-sm font-medium mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t("backToListings")}
          </Link>

          {/* ═══════ Main grid: Carousel (7) + Info Card (5) ═══════ */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            {/* ============ Cinematic image gallery ============ */}
            <div className="lg:col-span-7 relative">
              <div className="relative overflow-hidden shadow-lg h-[460px] md:h-[600px] bg-[#1d1d1b]">
                {/* GSAP dual-layer carousel */}
                <img
                  ref={imgLayerA}
                  className="absolute inset-0 w-full h-full object-cover will-change-transform cursor-pointer"
                  onClick={() => openGallery(photoIdx)}
                  alt=""
                />
                <img
                  ref={imgLayerB}
                  className="absolute inset-0 w-full h-full object-cover will-change-transform cursor-pointer"
                  onClick={() => openGallery(photoIdx)}
                  alt=""
                  style={{ opacity: 0 }}
                />

                {/* Cinematic overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/75 via-[#1d1d1b]/10 to-transparent pointer-events-none" />
                <div className="pointer-events-none absolute inset-3 border border-white/25" />

                {/* Top label */}
                {propertyType && (
                  <div className="absolute top-6 left-6 flex items-center gap-3 text-white z-10">
                    <span className="h-px w-8 bg-brand-action" />
                    <span className="font-montserrat uppercase tracking-[0.4em] text-[0.65rem] text-white/90">
                      {propertyType}
                    </span>
                  </div>
                )}

                {/* Bottom title + counter */}
                <div className="absolute bottom-20 left-6 right-6 flex items-end justify-between text-white z-10">
                  <h1 className="font-montserrat font-bold uppercase text-[clamp(1.2rem,2.4vw,2.2rem)] leading-tight max-w-md tracking-wide [text-shadow:0_3px_20px_rgba(0,0,0,0.6)]">
                    {name}
                  </h1>
                  <span className="hidden md:block font-montserrat text-white/70 text-[0.72rem] tracking-[0.4em] uppercase">
                    {String(photoIdx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                  </span>
                </div>

                {/* Gallery navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={goPrev}
                      aria-label="Previous"
                      className="group absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-brand-action hover:border-brand-action transition-all duration-500"
                    >
                      <span className="text-xl leading-none transition-transform duration-500 group-hover:-translate-x-0.5">&#8249;</span>
                    </button>
                    <button
                      onClick={goNext}
                      aria-label="Next"
                      className="group absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-brand-action hover:border-brand-action transition-all duration-500"
                    >
                      <span className="text-xl leading-none transition-transform duration-500 group-hover:translate-x-0.5">&#8250;</span>
                    </button>
                  </>
                )}

                {/* Photo progress bar */}
                {images.length > 1 && (
                  <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4 text-white z-10">
                    <span className="font-montserrat text-[0.7rem] tracking-[0.4em] text-brand-action font-medium">
                      {String(photoIdx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 h-px bg-white/20 relative overflow-hidden">
                      <span
                        ref={progressBarRef}
                        style={{ transformOrigin: "left", transform: "scaleX(0)" }}
                        className="absolute inset-0 bg-gradient-to-r from-brand-action to-white/80"
                      />
                    </div>
                    <span className="font-montserrat text-[0.7rem] tracking-[0.4em] text-white/80">
                      {String(images.length).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div
                  className="mt-4 grid gap-3"
                  style={{ gridTemplateColumns: `repeat(${Math.min(images.length, 7)}, minmax(0,1fr))` }}
                >
                  {images.slice(0, 7).map((src, i) => (
                    <button
                      key={`thumb-${i}`}
                      onClick={() => {
                        const dir = i > photoIdx ? 1 : -1;
                        setDirection(dir);
                        animateSlide(i, dir);
                        setPhotoIdx(i);
                      }}
                      aria-label={`Photo ${i + 1}`}
                      className={`relative aspect-[4/3] overflow-hidden shadow-sm transition-all duration-500 ${
                        photoIdx === i
                          ? "ring-2 ring-brand-action ring-offset-2 ring-offset-white"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                      <div className={`absolute inset-0 transition-colors duration-500 ${
                        photoIdx === i ? "bg-transparent" : "bg-[#1d1d1b]/30 hover:bg-transparent"
                      }`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ============ Info card ============ */}
            <div className="lg:col-span-5 relative">
              <div
                ref={infoCardRef}
                className="h-full bg-brand-beige border border-brand-action/20 p-8 md:p-10 relative shadow-sm flex flex-col"
              >
                {/* Corner ornaments */}
                <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-brand-action pointer-events-none" />
                <span className="absolute top-3 right-3 w-3 h-3 border-t border-r border-brand-action pointer-events-none" />
                <span className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-brand-action pointer-events-none" />
                <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-brand-action pointer-events-none" />

                {/* Eyebrow: property type */}
                {propertyType && (
                  <div className="flex items-center gap-3">
                    <span className="h-px w-6 bg-brand-action" />
                    <span className="font-montserrat uppercase tracking-[0.35em] text-[0.6rem] text-brand-action font-semibold">
                      {propertyType}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h2 className="mt-4 font-montserrat font-bold uppercase text-brand-ink text-[clamp(1.3rem,2.2vw,2rem)] leading-tight tracking-wide">
                  {name}
                </h2>

                {/* Hairline */}
                <span className="block h-px bg-brand-action/20 mt-5 mb-5" />

                {/* Rating */}
                {riad.rating_avg && (
                  <div className="flex items-center gap-3 mb-3">
                    <StarRow count={5} filled={ratingFull} />
                    <span className="text-brand-ink/55 text-sm">
                      {riad.rating_avg} &middot; {riad.reviews_count} {t("reviews")}
                    </span>
                  </div>
                )}

                {/* Location */}
                {(neighborhood || city) && (
                  <div className="flex items-center gap-2 text-brand-ink/50 mb-5">
                    <MapPin className="w-3.5 h-3.5 text-brand-action" />
                    <span className="text-[0.8rem] uppercase tracking-[0.12em] font-medium">
                      {[neighborhood, city].filter(Boolean).join(" \u00b7 ")}
                    </span>
                  </div>
                )}

                {/* Description */}
                {description && (
                  <p className="text-[0.9rem] text-brand-ink/65 leading-[1.85] mb-6">
                    {description}
                  </p>
                )}

                {/* Amenities */}
                {amenities.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="h-px w-5 bg-brand-action" />
                      <span className="font-montserrat uppercase tracking-[0.3em] text-[0.55rem] text-brand-action font-semibold">
                        {t("amenities")}
                      </span>
                    </div>
                    <ul ref={amenitiesRef} className="grid grid-cols-2 gap-x-5 gap-y-2.5 text-[0.82rem] text-brand-ink/75">
                      {amenities.map((a, i) => (
                        <li
                          key={`${a}-${i}`}
                          className="flex items-start gap-2.5"
                        >
                          <span className="mt-[7px] h-[5px] w-[5px] bg-brand-action ring-2 ring-brand-action/30 flex-shrink-0" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Services */}
                {services.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="h-px w-5 bg-brand-action" />
                      <span className="font-montserrat uppercase tracking-[0.3em] text-[0.55rem] text-brand-action font-semibold">
                        {t("services")}
                      </span>
                    </div>
                    <ul ref={servicesRef} className="grid grid-cols-2 gap-x-5 gap-y-2.5 text-[0.82rem] text-brand-ink/75">
                      {services.map((s, i) => (
                        <li
                          key={`${s}-${i}`}
                          className="flex items-start gap-2.5"
                        >
                          <span className="mt-[7px] h-[5px] w-[5px] bg-brand-action ring-2 ring-brand-action/30 flex-shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Booking Conditions */}
                {bookingConditions.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="h-px w-5 bg-brand-action" />
                      <span className="font-montserrat uppercase tracking-[0.3em] text-[0.55rem] text-brand-action font-semibold">
                        {t("bookingConditions")}
                      </span>
                    </div>
                    <ul className="grid grid-cols-1 gap-y-2.5 text-[0.82rem] text-brand-ink/75">
                      {bookingConditions.map((bc, i) => (
                        <li
                          key={`bc-${i}`}
                          className="flex items-start gap-2.5"
                        >
                          <Shield className="w-3.5 h-3.5 text-brand-action mt-0.5 flex-shrink-0" />
                          <span>{bc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bottom: Book Now + contact icons */}
                <div className="mt-auto pt-8 flex items-center justify-between gap-4">
                  {riad.simple_booking_link ? (
                    <a
                      href={riad.simple_booking_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 bg-brand-action text-white px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] hover:bg-brand-action/90 transition-all duration-300 font-montserrat"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {t("bookNow")} <span aria-hidden>&#8594;</span>
                    </a>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    {riad.phone && (
                      <a
                        href={`tel:${riad.phone}`}
                        aria-label="Phone"
                        className="w-10 h-10 border border-brand-action/30 text-brand-action flex items-center justify-center hover:bg-brand-action hover:text-white transition-colors duration-300"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    {riad.email && (
                      <a
                        href={`mailto:${riad.email}`}
                        aria-label="Email"
                        className="w-10 h-10 border border-brand-action/30 text-brand-action flex items-center justify-center hover:bg-brand-action hover:text-white transition-colors duration-300"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {riad.website && (
                      <a
                        href={riad.website}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Website"
                        className="w-10 h-10 border border-brand-action/30 text-brand-action flex items-center justify-center hover:bg-brand-action hover:text-white transition-colors duration-300"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
                </div>
            </div>
          </div>

          {/* ═══════ Address + Map ═══════ */}
          {(address || position) && (
            <div ref={mapRef} className="mt-14 grid lg:grid-cols-12 gap-10 lg:gap-14">
              <div className="lg:col-span-7">
                {/* Address */}
                {address && (
                  <div className="flex items-start gap-3 bg-brand-beige/40 border border-brand-ink/5 p-5 mb-6 relative">
                    <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-brand-action/30 pointer-events-none" />
                    <span className="absolute top-2 right-2 w-2 h-2 border-t border-r border-brand-action/30 pointer-events-none" />
                    <span className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-brand-action/30 pointer-events-none" />
                    <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-brand-action/30 pointer-events-none" />
                    <MapPin className="w-4 h-4 text-brand-action mt-0.5 shrink-0" />
                    <span className="text-sm text-brand-ink/60 leading-relaxed font-montserrat">{address}</span>
                  </div>
                )}

                {/* Map */}
                {position && (
                  <div className="bg-white border border-brand-ink/8 overflow-hidden shadow-sm relative">
                    <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-brand-action/25 z-20 pointer-events-none" />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-brand-action/25 z-20 pointer-events-none" />
                    <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-brand-action/25 z-20 pointer-events-none" />
                    <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-brand-action/25 z-20 pointer-events-none" />

                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-action" />
                        <span className="text-base font-bold text-brand-ink font-montserrat">{t("location")}</span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${riad.latitude},${riad.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[0.65rem] uppercase tracking-[0.12em] text-brand-action hover:text-brand-action/80 font-semibold"
                      >
                        {t("googleMaps")} <ChevronRight className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="h-[280px] relative">
                      {mapLoaded ? (
                        <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ width: "100%", height: "100%" }} zoomControl={false}>
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={position} icon={customIcon}>
                            <Popup>
                              <div className="font-montserrat p-1">
                                <strong className="block mb-1 text-brand-ink">{name}</strong>
                                {address && <p className="text-xs text-brand-ink/60 mb-1">{address}</p>}
                                {city && <p className="text-xs">{city}</p>}
                              </div>
                            </Popup>
                          </Marker>
                        </MapContainer>
                      ) : (
                        <div className="w-full h-full bg-brand-beige/50 flex items-center justify-center">
                          <span className="text-sm text-brand-ink/40 font-montserrat">{t("loading")}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RiadDetailPage;
