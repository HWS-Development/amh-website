import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
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
  ArrowLeft, Star, MapPin, Check, Shield, Phone, Mail, Globe, MessageCircle,
  ChevronRight, Sparkles, X, Wifi, Waves, Bath, Sun, Wind, Users,
  Utensils, Tv, Coffee, Car, Key, Thermometer, Heart, Baby,
  Accessibility, Dumbbell, ParkingCircle, BedDouble, Shirt, PawPrint,
  CigaretteOff, Snowflake, ConciergeBell, Plane, Lock,
  ChevronDown, BookOpen, ExternalLink,
} from "lucide-react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { getTranslated } from "@/lib/utils";
import { fetchCatalog } from "@/lib/catalogs";
import { optimizeImageUrl } from "@/lib/imageUtils";
import { usePartnerHotelById, usePartnerHotels, extractCentraHotelId } from "@/lib/partnerHotelsApi";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_IMAGE = import.meta.env.VITE_FALLBACK_IMAGE ||
  "https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png";

const fetchServicesCatalog = async (language) => {
  try {
    return await fetchCatalog("mgh_services_catalog", language);
  } catch {
    console.warn("mgh_services_catalog not found, trying typo fallback");
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

const GalleryModal = ({ open, images, name, startIndex, onClose }) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        { opacity: 0, scale: 0.96, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-brand-ink/98 flex flex-col" ref={overlayRef}>
      <div className="h-[72px] flex items-center justify-between px-7" ref={contentRef}>
        <span className="text-xs font-montserrat text-white/50 uppercase tracking-[0.3em]">{name}</span>
        <button
          type="button"
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center text-white/30 hover:text-white transition-all duration-500 hover:bg-white/5 rounded-full group"
        >
          <X className="w-4 h-4 transition-transform duration-500 group-hover:rotate-90" />
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
                  className="max-w-full max-h-full object-contain select-none"
                  draggable={false}
                  style={{ boxShadow: "0 24px 96px rgba(0,0,0,0.6)" }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <style>{`
        .riad-gallery-swiper .swiper-button-next,
        .riad-gallery-swiper .swiper-button-prev {
          color: #bf673e;
          opacity: 0.7;
          transition: opacity 0.4s;
        }
        .riad-gallery-swiper .swiper-button-next:hover,
        .riad-gallery-swiper .swiper-button-prev:hover { opacity: 1; }
        .riad-gallery-swiper .swiper-button-next::after,
        .riad-gallery-swiper .swiper-button-prev::after { font-size: 14px; font-weight: 700; }
        .riad-gallery-swiper .swiper-pagination {
          color: #bf673e;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          letter-spacing: 0.15em;
        }
      `}</style>
    </div>
  );
};

const StarRow = ({ count = 5, filled = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <Star
        key={i}
        className="w-3 h-3"
        style={{
          color: i < filled ? "#bf673e" : "rgba(191,103,62,0.15)",
          fill: i < filled ? "#bf673e" : "none",
        }}
      />
    ))}
  </div>
);

const SectionEyebrow = ({ label }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="h-px w-6 bg-brand-action/60" />
    <span className="font-montserrat uppercase tracking-[0.35em] text-[0.55rem] text-brand-action font-semibold">
      {label}
    </span>
    <span className="h-px flex-1 bg-brand-action/10" />
  </div>
);

const MetricItem = ({ value, suffix = "", label, icon: Icon, delay = 0, isDecimal = false }) => {
  const numberRef = useRef(null);
  const itemRef = useRef(null);

  useEffect(() => {
    if (!numberRef.current) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 2.4,
      ease: "power3.out",
      delay,
      scrollTrigger: {
        trigger: itemRef.current,
        start: "top 85%",
        once: true,
      },
      onUpdate: () => {
        if (!numberRef.current) return;
        numberRef.current.textContent = isDecimal
          ? obj.val.toFixed(1) + suffix
          : Math.round(obj.val) + suffix;
      },
    });
  }, [value, suffix, delay, isDecimal]);

  return (
    <div ref={itemRef} className="flex flex-col items-center justify-center">
      {Icon && (
        <div className="mb-5 md:mb-6">
          <Icon className="w-[18px] h-[18px] md:w-5 md:h-5 text-brand-action/50" strokeWidth={1.2} />
        </div>
      )}
      <span
        ref={numberRef}
        className="font-display text-[3rem] md:text-[4.5rem] text-brand-ink leading-none tracking-tight"
      >
        0{suffix}
      </span>
      {label && (
        <span className="font-montserrat text-[0.5rem] md:text-[0.55rem] uppercase tracking-[0.35em] text-brand-ink/40 mt-4 md:mt-5 block font-medium">
          {label}
        </span>
      )}
    </div>
  );
};

const normalizePartnerHotel = (hotel) => {
  if (!hotel) return null;

  return {
    ...hotel,
    hotel_id: hotel.hotel_id || hotel.hotelId || null,
    org_id: hotel.org_id || hotel.orgId || null,
    city_id: hotel.city_id || hotel.cityId || null,
    neighborhood_id: hotel.neighborhood_id || hotel.neighborhoodId || null,
    property_type_id: hotel.property_type_id || hotel.propertyTypeId || null,
    amenity_ids: hotel.amenity_ids || hotel.amenityIds || [],
    service_ids: hotel.service_ids || hotel.serviceIds || [],
    booking_condition_ids: hotel.booking_condition_ids || hotel.bookingConditionIds || [],
    image_urls: hotel.image_urls || hotel.imageUrls || [],
    simple_booking_link: hotel.simple_booking_link || hotel.simpleBookingLink || null,
    rating_avg: hotel.rating_avg || hotel.ratingAvg || null,
    reviews_count: hotel.reviews_count ?? hotel.reviewsCount ?? null,
    extra_info: hotel.extra_info || hotel.extraInfo || null,
    phone_number: hotel.phone_number || hotel.phoneNumber || null,
    source_created_at: hotel.source_created_at || hotel.sourceCreatedAt || null,
    latitude: hotel.latitude ?? hotel.lat ?? null,
    longitude: hotel.longitude ?? hotel.lng ?? hotel.lon ?? null,
  };
};

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
  const carouselRef = useRef(null);
  const infoCardRef = useRef(null);
  const amenitiesRef = useRef(null);
  const servicesRef = useRef(null);
  const bookingRef = useRef(null);
  const pageRef = useRef(null);
  const mapSectionRef = useRef(null);
  const mapParallaxRef = useRef(null);
  const ctaRef = useRef(null);
  const heroContentRef = useRef(null);
  const heroMetaRef = useRef(null);
  const websiteIconRef = useRef(null);

  const { data: hotelData, error: hotelError, isLoading: hotelLoading } = usePartnerHotelById(id);

  // Listing fallback — used when the detail endpoint fails (e.g. Centra 403/500).
  const { data: hotelList, isLoading: listLoading } = usePartnerHotels();
  const fallbackHotel = useMemo(() => {
    if (!Array.isArray(hotelList) || !id) return null;
    return hotelList.find(
      (h) =>
        h?.id === id ||
        h?.hotel_id === id ||
        h?.hotelId === id ||
        extractCentraHotelId(h?.image_urls) === id
    ) || null;
  }, [hotelList, id]);

  useEffect(() => {
    const fetchAll = async (sourceHotel) => {
      setLoading(true);
      try {
        const [citiesArr, neighborhoodsArr, propertyTypesArr, amenitiesArr, servicesArr] = await Promise.all([
          fetchCatalog("mgh_cities", currentLanguage),
          fetchCatalog("mgh_neighborhoods", currentLanguage),
          fetchCatalog("mgh_property_types", currentLanguage),
          fetchCatalog("mgh_amenities_catalog", currentLanguage),
          fetchServicesCatalog(currentLanguage),
        ]);
        setCities(Object.fromEntries(citiesArr.map((c) => [c.id, c.label])));
        setNeighborhoods(Object.fromEntries(neighborhoodsArr.map((n) => [n.id, n.label])));
        setPropertyTypes(Object.fromEntries(propertyTypesArr.map((p) => [p.id, p.label])));
        setAmenitiesCatalog(Object.fromEntries(amenitiesArr.map((a) => [a.id, a.label])));
        setServicesCatalog(Object.fromEntries(servicesArr.map((s) => [s.id, s.label])));
        const normalizedHotel = normalizePartnerHotel(sourceHotel);
        setRiad(normalizedHotel);
        if (normalizedHotel?.latitude && normalizedHotel?.longitude) {
          setTimeout(() => setMapLoaded(true), 600);
        }
      } catch {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch riad details." });
        setRiad(null);
      }
      setLoading(false);
    };

    // Prefer fresh detail data; fall back to listing entry on error.
    if (hotelData) {
      fetchAll(hotelData);
    } else if (hotelError && fallbackHotel) {
      console.warn("[RiadDetailPage] Detail fetch failed — falling back to listing data.", hotelError);
      fetchAll(fallbackHotel);
    } else if (hotelError && !listLoading) {
      // Detail failed and listing has no match either.
      toast({ variant: "destructive", title: "Error", description: "Could not fetch riad details." });
      setRiad(null);
      setLoading(false);
    } else if (hotelLoading || listLoading) {
      setLoading(true);
    }
  }, [hotelData, hotelError, hotelLoading, fallbackHotel, listLoading, currentLanguage, toast]);

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
  const extraInfo = riad ? getTranslated(riad.extra_info, currentLanguage) : "";
  const extraInfoLines = extraInfo
    ? extraInfo.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    : [];

  // Fallback phone number generator (deterministic from riad id)
  const fallbackPhone = (id) => {
    if (!id) return null;
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
    const digits = String(Math.abs(hash) % 100000000).padStart(9, '0');
    return `+212 6 ${digits.slice(0,2)} ${digits.slice(2,4)} ${digits.slice(4,6)} ${digits.slice(6,8)}`;
  };
  const phoneNumber = riad?.phone_number || (riad ? fallbackPhone(riad.id || riad.hotel_id) : null);

  const hasMetrics = riad?.rating_avg || riad?.reviews_count || amenities.length > 0 || images.length > 1;

  const animateSlide = useCallback((newIdx, dir) => {
    const enterLayer = activeLayer.current === "A" ? imgLayerB : imgLayerA;
    const exitLayer = activeLayer.current === "A" ? imgLayerA : imgLayerB;
    if (!enterLayer.current || !exitLayer.current) return;

    enterLayer.current.src = optimizeImageUrl(images[newIdx], { quality: 60 });
    enterLayer.current.alt = `${name} ${newIdx + 1}`;
    enterLayer.current.style.zIndex = 2;
    exitLayer.current.style.zIndex = 1;

    const tl = gsap.timeline();
    tl.fromTo(enterLayer.current,
      {
        opacity: 0,
        scale: 1.08,
        x: dir > 0 ? 80 : -80,
        filter: "blur(12px)",
      },
      {
        opacity: 1,
        scale: 1,
        x: 0,
        filter: "blur(0px)",
        duration: 1.1,
        ease: "power2.out",
      },
      0
    );
    tl.to(exitLayer.current,
      {
        opacity: 0,
        scale: 1.03,
        x: dir > 0 ? -60 : 60,
        filter: "blur(8px)",
        duration: 0.9,
        ease: "power2.out",
      },
      0
    );
    activeLayer.current = activeLayer.current === "A" ? "B" : "A";
    if (progressBarRef.current) {
      gsap.fromTo(progressBarRef.current, { scaleX: 0 }, { scaleX: 1, duration: 5.4, ease: "none" });
    }
  }, [images, name]);

  useEffect(() => {
    if (images.length === 0) return;
    if (imgLayerA.current) {
      imgLayerA.current.src = optimizeImageUrl(images[0], { quality: 60 });
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

  /* ─── Hero entrance sequence ─── */
  useEffect(() => {
    if (loading || !riad) return;

    const ctx = gsap.context(() => {
      if (heroContentRef.current) {
        gsap.fromTo(heroContentRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.3 }
        );
      }
      if (heroMetaRef.current) {
        gsap.fromTo(heroMetaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.6 }
        );
      }
    });

    return () => ctx.revert();
  }, [loading, riad]);

  /* ─── Advanced GSAP ScrollTrigger Animations ─── */
  useEffect(() => {
    if (loading || !riad) return;

    const ctx = gsap.context(() => {
      if (carouselRef.current) {
        gsap.to(carouselRef.current, {
          y: 60,
          scale: 1.03,
          ease: "none",
          scrollTrigger: {
            trigger: carouselRef.current,
            start: "top top",
            end: "bottom top+=300",
            scrub: 2,
          },
        });
      }

      if (infoCardRef.current) {
        gsap.from(infoCardRef.current, {
          opacity: 0,
          x: 80,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: infoCardRef.current,
            start: "top 80%",
            once: true,
          },
        });
      }

      if (amenitiesRef.current) {
        gsap.from(amenitiesRef.current.querySelectorAll("li"), {
          opacity: 0,
          y: 16,
          duration: 0.6,
          stagger: 0.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: amenitiesRef.current,
            start: "top 82%",
            once: true,
          },
        });
      }

      if (servicesRef.current) {
        gsap.from(servicesRef.current.querySelectorAll("li"), {
          opacity: 0,
          y: 16,
          duration: 0.6,
          stagger: 0.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: servicesRef.current,
            start: "top 82%",
            once: true,
          },
        });
      }

      if (bookingRef.current) {
        gsap.from(bookingRef.current.querySelectorAll("li"), {
          opacity: 0,
          y: 12,
          duration: 0.5,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: {
            trigger: bookingRef.current,
            start: "top 82%",
            once: true,
          },
        });
      }

      if (mapSectionRef.current) {
        const addressCard = mapSectionRef.current.querySelector("[data-address-card]");
        const mapEl = mapSectionRef.current.querySelector("[data-map-container]");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: mapSectionRef.current,
            start: "top 80%",
            once: true,
          },
        });

        if (addressCard) {
          tl.from(addressCard, { opacity: 0, x: -60, duration: 0.8, ease: "power3.out" });
        }
        if (mapEl) {
          tl.from(mapEl, { opacity: 0, y: 40, scale: 0.97, duration: 1, ease: "power4.out" }, "-=0.3");
        }

        const mapParallaxEl = mapSectionRef.current.querySelector("[data-map-parallax]");
        if (mapParallaxEl) {
          gsap.to(mapParallaxEl, {
            y: 30,
            ease: "none",
            scrollTrigger: {
              trigger: mapSectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
            },
          });
        }
      }

      if (mapParallaxRef.current) {
        gsap.to(mapParallaxRef.current, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: mapSectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      }

      const thumbStrip = carouselRef.current?.querySelector("[data-thumb-strip]");
      if (thumbStrip) {
        gsap.from(thumbStrip.children, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: {
            trigger: thumbStrip,
            start: "top 85%",
            once: true,
          },
        });
      }
    }, pageRef);

    return () => ctx.revert();
  }, [loading, riad]);

  useEffect(() => {
    if (!websiteIconRef.current) return;
    gsap.to(websiteIconRef.current, {
      y: -4,
      duration: 2.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }, [loading, riad]);

  useEffect(() => { setPhotoIdx(0); }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const intervalId = setInterval(() => {
      setPhotoIdx((i) => {
        const next = (i + 1) % images.length;
        animateSlide(next, 1);
        return next;
      });
    }, 5500);
    return () => clearInterval(intervalId);
  }, [images.length, animateSlide]);

  const goNext = () => {
    setPhotoIdx((i) => {
      const next = (i + 1) % images.length;
      animateSlide(next, 1);
      return next;
    });
  };
  const goPrev = () => {
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

  const customIcon = useMemo(
    () => L.divIcon({
      html: `<div style="width:38px;height:38px;background:#bf673e;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 6px 20px rgba(0,0,0,0.3)"></div>`,
      iconSize: [38, 38], iconAnchor: [19, 38], className: "",
    }),
    [],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-brand-beige rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-brand-action rounded-full animate-spin" />
        </div>
        <span className="mt-5 text-xs text-brand-ink/40 font-montserrat tracking-[0.3em] uppercase">{t("loading")}</span>
      </div>
    );
  }

  if (!riad) return null;

  return (
    <>
      <Helmet>
        <title>{name} &middot; LA CENTRALE DES RIADS</title>
        <meta name="description" content={description?.substring(0, 160)} />
      </Helmet>

      <GalleryModal
        open={galleryOpen}
        images={images}
        name={name}
        startIndex={activeImageIndex}
        onClose={() => setGalleryOpen(false)}
      />

      <div ref={pageRef} className="relative bg-white font-montserrat min-h-screen overflow-hidden">

        <div ref={carouselRef} className="relative h-screen max-h-[700px] md:max-h-[800px] overflow-hidden bg-[#1d1d1b]">
          <img
            ref={imgLayerA}
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            alt=""
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
          <img
            ref={imgLayerB}
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            alt=""
            loading="lazy"
            decoding="async"
            style={{ opacity: 0 }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/80 via-[#1d1d1b]/30 via-40% to-transparent pointer-events-none z-[1]" />

          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-[1]" />

          <div className="absolute inset-6 border border-white/10 pointer-events-none z-[1]" />

          {/* Back link — inside hero overlay */}
          <div className="absolute top-8 left-8 z-20">
            <Link
              to="/all-riads"
              className="inline-flex items-center gap-2.5 text-white/50 hover:text-white transition-colors text-xs tracking-[0.15em] uppercase group font-montserrat"
            >
              <span className="w-8 h-px bg-white/30 group-hover:bg-white transition-colors duration-500" />
              <span className="transition-colors duration-500">{t("backToListings")}</span>
            </Link>
          </div>

          {/* Hero content — animated entrance */}
          <div
            ref={heroContentRef}
            className="absolute bottom-24 md:bottom-32 left-8 md:left-14 right-8 md:right-14 z-10"
          >
            <div className="max-w-3xl">
              {propertyType && (
                <div className="flex items-center gap-3 mb-5" ref={heroMetaRef}>
                  <span className="h-px w-8 bg-brand-action" />
                  <span className="font-montserrat uppercase tracking-[0.45em] text-[0.6rem] text-brand-action font-semibold">
                    {propertyType}
                  </span>
                </div>
              )}
              <h1 className="font-montserrat font-bold uppercase text-white text-[clamp(1.8rem,3.5vw,3.2rem)] leading-[1.15] max-w-2xl tracking-[0.04em] [text-shadow:0_4px_30px_rgba(0,0,0,0.5)]">
                {name}
              </h1>
              {(neighborhood || city) && (
                <div className="flex items-center gap-2 mt-5 text-white/50">
                  <MapPin className="w-3.5 h-3.5 text-brand-action" />
                  <span className="text-[0.7rem] uppercase tracking-[0.2em] font-medium">
                    {[neighborhood, city].filter(Boolean).join(" \u00b7 ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {images.length > 1 && (
            <div className="absolute bottom-8 md:bottom-12 left-8 md:left-14 right-8 md:right-14 flex items-center gap-4 text-white z-10">
              <span className="font-montserrat text-[0.65rem] tracking-[0.4em] text-brand-action font-medium">
                {String(photoIdx + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 h-[1px] bg-white/15 relative overflow-hidden">
                <span
                  ref={progressBarRef}
                  style={{ transformOrigin: "left", transform: "scaleX(0)" }}
                  className="absolute inset-0 bg-gradient-to-r from-brand-action to-white/60"
                />
              </div>
              <span className="font-montserrat text-[0.65rem] tracking-[0.4em] text-white/60">
                {String(images.length).padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                aria-label="Previous"
                className="group absolute left-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 flex items-center justify-center bg-black/20 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-brand-action/80 hover:border-brand-action transition-all duration-500"
              >
                <span className="text-2xl leading-none transition-transform duration-500 group-hover:-translate-x-0.5">&#8249;</span>
              </button>
              <button
                onClick={goNext}
                aria-label="Next"
                className="group absolute right-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 flex items-center justify-center bg-black/20 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-brand-action/80 hover:border-brand-action transition-all duration-500"
              >
                <span className="text-2xl leading-none transition-transform duration-500 group-hover:translate-x-0.5">&#8250;</span>
              </button>
            </>
          )}
        </div>

        {/* ── Main content ── */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 -mt-20 relative z-10 pb-16">

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

            {/* ── Empty left column spacer ── */}
            <div className="hidden lg:block lg:col-span-1" />

            {/* ── Info Card ── */}
            <div className="lg:col-span-5 relative" ref={infoCardRef}>
              <div className="bg-white border border-brand-ink/5 shadow-xl relative flex flex-col overflow-hidden">
                <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-brand-action/20 pointer-events-none z-10" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-brand-action/20 pointer-events-none z-10" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-brand-action/20 pointer-events-none z-10" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-brand-action/20 pointer-events-none z-10" />

                {/* Rating + Location */}
                <div className="px-8 md:px-10 pt-10 md:pt-12">
                  {riad.rating_avg && (
                    <div className="flex items-center gap-4 mb-4">
                      <StarRow count={5} filled={ratingFull} />
                      <span className="text-brand-ink/40 text-xs tracking-wide">
                        {riad.rating_avg} &middot; {riad.reviews_count} {t("reviews")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Scrollable content */}
                <div className="relative flex-1 min-h-0 px-8 md:px-10 pb-4">
                  <div className="h-full overflow-y-auto max-h-[560px]">
                    {description && (
                      <p className="text-[0.85rem] text-brand-ink/60 leading-[1.9] mb-8 font-light">
                        {description}
                      </p>
                    )}

                    {amenities.length > 0 && (
                      <div className="mb-7">
                        <SectionEyebrow label={t("amenities")} />
                        <ul ref={amenitiesRef} className="grid grid-cols-2 gap-x-5 gap-y-3 text-[0.8rem] text-brand-ink/70">
                          {amenities.map((a, i) => (
                            <li key={`${a}-${i}`} className="flex items-start gap-3">
                              <span className="mt-[6px] h-[4px] w-[4px] bg-brand-action shrink-0" />
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {services.length > 0 && (
                      <div className="mb-7">
                        <SectionEyebrow label={t("services")} />
                        <ul ref={servicesRef} className="grid grid-cols-2 gap-x-5 gap-y-3 text-[0.8rem] text-brand-ink/70">
                          {services.map((s, i) => (
                            <li key={`${s}-${i}`} className="flex items-start gap-3">
                              <span className="mt-[6px] h-[4px] w-[4px] bg-brand-action shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {extraInfoLines.length > 0 && (
                      <div className="mb-7">
                        <SectionEyebrow label={t("practicalInformation") || "Practical Information"} />
                        <ul className="grid grid-cols-1 gap-y-3 text-[0.8rem] text-brand-ink/70">
                          {extraInfoLines.map((line, i) => (
                            <li key={`extra-${i}`} className="flex items-start gap-3">
                              <span className="mt-[6px] h-[4px] w-[4px] bg-brand-action shrink-0" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {bookingConditions.length > 0 && (
                      <div className="mb-7">
                        <SectionEyebrow label={t("bookingConditions")} />
                        <ul ref={bookingRef} className="grid grid-cols-1 gap-y-3 text-[0.8rem] text-brand-ink/70">
                          {bookingConditions.map((bc, i) => (
                            <li key={`bc-${i}`} className="flex items-start gap-3">
                              <Shield className="w-3.5 h-3.5 text-brand-action mt-0.5 shrink-0" />
                              <span>{bc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom: actions + read more */}
                <div className="shrink-0 px-8 md:px-10 pb-10 md:pb-12 pt-4">
                  {/* Phone number — prominent display */}
                  {phoneNumber && (
                    <a
                      href={`tel:${phoneNumber}`}
                      className="group inline-flex items-center gap-3 mb-5 px-4 py-2.5 bg-brand-beige/60 hover:bg-brand-beige border border-brand-action/15 hover:border-brand-action/40 transition-all duration-500"
                    >
                      <span className="grid place-items-center w-7 h-7 rounded-full bg-brand-action/10 text-brand-action group-hover:bg-brand-action group-hover:text-white transition-colors duration-500">
                        <Phone className="w-3.5 h-3.5" strokeWidth={2.2} />
                      </span>
                      <span className="flex flex-col leading-tight">
                        <span className="font-montserrat text-[0.5rem] uppercase tracking-[0.3em] text-brand-ink/40 font-semibold">
                          {t("callUs") || "Téléphone"}
                        </span>
                        <span className="font-montserrat text-[0.85rem] font-semibold text-brand-ink tracking-wide">
                          {phoneNumber}
                        </span>
                      </span>
                    </a>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    {riad.simple_booking_link ? (
                      <a
                        href={riad.simple_booking_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 bg-brand-action text-white px-7 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] hover:bg-brand-ink transition-all duration-500 font-montserrat"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {t("bookNow")}
                        <span className="inline-block transition-transform duration-500 group-hover:translate-x-1" aria-hidden>&#8594;</span>
                      </a>
                    ) : riad.website ? (
                      <a
                        href={riad.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 bg-brand-action text-white px-7 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] hover:bg-brand-ink transition-all duration-500 font-montserrat"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {t("bookNow")}
                        <span className="inline-block transition-transform duration-500 group-hover:translate-x-1" aria-hidden>&#8594;</span>
                      </a>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-2">
                      {phoneNumber && (
                        <a href={`tel:${phoneNumber}`} aria-label="Phone" className="w-11 h-11 border border-brand-ink/10 text-brand-ink/40 flex items-center justify-center hover:bg-brand-action hover:text-white hover:border-brand-action transition-all duration-400">
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {phoneNumber && (
                        <a href={`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="w-11 h-11 border border-brand-ink/10 text-brand-ink/40 flex items-center justify-center hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-400">
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                      {riad.email && (
                        <a href={`mailto:${riad.email}`} aria-label="Email" className="w-11 h-11 border border-brand-ink/10 text-brand-ink/40 flex items-center justify-center hover:bg-brand-action hover:text-white hover:border-brand-action transition-all duration-400">
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      {riad.simple_booking_link && riad.website && (
                        <div className="relative group">
                          <div className="absolute -inset-3 bg-gradient-to-r from-brand-action/15 via-brand-action/5 to-brand-ink/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                          <a
                            href={riad.website}
                            target="_blank"
                            rel="noreferrer"
                            className="relative flex items-center gap-3 px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-brand-ink/10 rounded-full shadow-sm hover:shadow-xl hover:border-brand-action/30 hover:bg-white transition-all duration-500"
                          >
                            <span ref={websiteIconRef} className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-brand-action to-brand-ink/80 text-white shadow-lg">
                              <Globe className="w-4 h-4" />
                            </span>
                            <span className="text-[0.7rem] font-medium text-brand-ink/70 group-hover:text-brand-ink transition-colors font-montserrat tracking-tight">
                              {(() => { try { return new URL(riad.website).hostname.replace(/^www\./, ''); } catch { return riad.website; } })()}
                            </span>
                            <ExternalLink className="w-3 h-3 text-brand-ink/20 group-hover:text-brand-action transition-colors" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Gallery Thumb Strip — width-matched to info card ── */}
            <div className="hidden lg:block lg:col-span-1" />
            <div className="lg:col-span-5">
              {images.length > 1 && (
                <div data-thumb-strip>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="h-px flex-1 bg-brand-ink/5" />
                    <span className="font-montserrat text-[0.5rem] uppercase tracking-[0.4em] text-brand-ink/20 font-semibold">
                      {t("gallery") || "Gallery"}
                    </span>
                    <span className="h-px flex-1 bg-brand-ink/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {images.slice(0, 6).map((src, i) => (
                      <button
                        key={`thumb-${i}`}
                        onClick={() => {
                          const dir = i > photoIdx ? 1 : -1;
                          animateSlide(i, dir);
                          setPhotoIdx(i);
                        }}
                        aria-label={`Photo ${i + 1}`}
                        className={`relative group overflow-hidden transition-all duration-500 ${
                          photoIdx === i
                            ? "ring-2 ring-brand-action ring-offset-2 ring-offset-white scale-[1.02]"
                            : "hover:scale-[1.02]"
                        }`}
                      >
                        <div className="aspect-[4/3] overflow-hidden bg-brand-beige/40">
                          <OptimizedImage
                            src={src}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                        </div>
                        {photoIdx === i && (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-action shadow-sm" />
                        )}
                        <span className="absolute bottom-2 left-2 font-montserrat text-[0.5rem] font-bold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </button>
                    ))}
                    {images.length > 6 && (
                      <button
                        onClick={() => openGallery(0)}
                        className="relative aspect-[4/3] overflow-hidden bg-brand-ink group cursor-pointer transition-all duration-500 hover:scale-[1.02]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-action/10 to-brand-ink/90 flex items-center justify-center">
                          <div className="text-center">
                            <BookOpen className="w-5 h-5 text-white/60 mx-auto mb-2" />
                            <span className="block font-montserrat text-[0.6rem] font-bold text-white/80 uppercase tracking-[0.2em]">
                              +{images.length - 6}
                            </span>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══════ Address + Map Section ═══════ */}
          {(address || position) && (
            <div ref={mapSectionRef} className="mt-24 md:mt-32 relative overflow-hidden">
              {/* Full-bleed warm background layer (parallax) */}
              <div
                ref={mapParallaxRef}
                className="absolute inset-0 bg-gradient-to-b from-brand-beige/30 via-white to-brand-beige/20 -mx-6 md:-mx-12 lg:-mx-16"
              />

              <div className="relative">
                {/* Section header */}
                <div className="flex items-center gap-4 mb-10 md:mb-12">
                  <span className="h-px w-10 bg-brand-action" />
                  <span className="font-montserrat uppercase tracking-[0.4em] text-[0.5rem] text-brand-action font-semibold">
                    {t("location") || "Location"}
                  </span>
                  <span className="h-px flex-1 bg-brand-action/10" />
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                  {/* Address Card */}
                  <div className="lg:col-span-4" data-address-card>
                    <div className="bg-white border border-brand-ink/5 shadow-lg p-8 md:p-10 relative h-full flex flex-col">
                      <span className="absolute top-4 left-4 w-4 h-4 border-t border-l border-brand-action/20 pointer-events-none" />
                      <span className="absolute top-4 right-4 w-4 h-4 border-t border-r border-brand-action/20 pointer-events-none" />
                      <span className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-brand-action/20 pointer-events-none" />
                      <span className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-brand-action/20 pointer-events-none" />

                      <div className="flex flex-col gap-6 flex-1">
                        <div className="w-12 h-12 bg-brand-action/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-brand-action" />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-montserrat text-[0.55rem] uppercase tracking-[0.3em] text-brand-ink/30 font-semibold mb-3">
                            {t("address") || "Address"}
                          </h3>
                          <p className="text-sm text-brand-ink/60 leading-relaxed font-montserrat">
                            {address}
                          </p>
                        </div>

                        {position && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${riad.latitude},${riad.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-brand-action hover:text-brand-ink font-semibold transition-all duration-400 group mt-auto"
                          >
                            <span>{t("directions") || "Get Directions"}</span>
                            <ChevronRight className="w-3 h-3 transition-transform duration-400 group-hover:translate-x-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  <div className="lg:col-span-8" data-map-container>
                    {position ? (
                      <div className="relative overflow-hidden shadow-xl bg-white">
                        <span className="absolute top-4 left-4 w-5 h-5 border-t border-l border-white/40 z-20 pointer-events-none" />
                        <span className="absolute top-4 right-4 w-5 h-5 border-t border-r border-white/40 z-20 pointer-events-none" />
                        <span className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-white/40 z-20 pointer-events-none" />
                        <span className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-white/40 z-20 pointer-events-none" />

                        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-brand-ink/5">
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-brand-action" />
                            <span className="text-sm font-semibold text-brand-ink font-montserrat tracking-wide">
                              {name}
                            </span>
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${riad.latitude},${riad.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.15em] text-brand-action hover:text-brand-action/70 font-semibold transition-all duration-400 group"
                          >
                            <Globe className="w-3 h-3" />
                            {t("googleMaps")}
                          </a>
                        </div>

                        <div className="h-[400px] md:h-[500px] relative overflow-hidden">
                          <div className="w-full h-full" data-map-parallax>
                            {mapLoaded ? (
                              <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ width: "100%", height: "100%" }} zoomControl={false}>
                                <TileLayer
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={position} icon={customIcon}>
                                  <Popup>
                                    <div className="font-montserrat p-1">
                                      <strong className="block mb-1 text-brand-ink text-xs">{name}</strong>
                                      {address && <p className="text-[0.7rem] text-brand-ink/60 mb-1">{address}</p>}
                                      {city && <p className="text-[0.7rem] text-brand-ink/40">{city}</p>}
                                    </div>
                                  </Popup>
                                </Marker>
                              </MapContainer>
                            ) : (
                              <div className="w-full h-full bg-brand-beige/30 flex items-center justify-center">
                                <span className="text-xs text-brand-ink/30 font-montserrat tracking-[0.2em] uppercase">{t("loading")}...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative overflow-hidden shadow-xl bg-white">
                        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-brand-ink/5">
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-brand-action" />
                            <span className="text-sm font-semibold text-brand-ink font-montserrat tracking-wide">
                              {name}
                            </span>
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address || ''} ${city || ''}`.trim())}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.15em] text-brand-action hover:text-brand-action/70 font-semibold transition-all duration-400 group"
                          >
                            <Globe className="w-3 h-3" />
                            {t("googleMaps")}
                          </a>
                        </div>
                        <div className="h-[400px] md:h-[500px] relative overflow-hidden">
                          <iframe
                            title={name}
                            src={`https://www.google.com/maps?q=${encodeURIComponent(`${name} ${address || ''} ${city || ''}`.trim())}&output=embed`}
                            className="w-full h-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating WhatsApp button (fixed, right side) */}
      {phoneNumber && (
        <a
          href={`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="fixed right-4 bottom-4 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-3 shadow-xl hover:bg-green-600 transition-all duration-300 rounded-lg"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] font-montserrat hidden md:inline">
            WhatsApp
          </span>
        </a>
      )}
    </>
  );
};

export default RiadDetailPage;
