import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import OptimizedImage from "@/components/ui/OptimizedImage";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  ArrowLeft, Star, MapPin, Check, Phone, Mail, Globe,
  ChevronRight, Sparkles, X, Wifi, Waves, Bath, Sun, Wind, Users,
  Utensils, Tv, Coffee, Car, Key, Thermometer, Heart, Baby,
  Accessibility, Dumbbell, ParkingCircle, BedDouble, Shirt, PawPrint,
  CigaretteOff, Snowflake, ConciergeBell, Plane, Lock,
  ChevronDown, BookOpen, ExternalLink,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { getTranslated } from "@/lib/utils";
import { optimizeImageUrl } from "@/lib/imageUtils";
import { buildPropertyDetailHref, usePartnerHotelById, usePartnerHotels, extractCentraHotelId, idToLabel, slugifyPropertyName } from "@/lib/partnerHotelsApi";
import { usePartnerCatalogs } from "@/lib/partnerCatalogsApi";
import { formatInternationalAddress, mapPartnerHotelToRiad } from "@/lib/partnerHotelTransform";
import BackToTopButton from "@/components/BackToTopButton";
import GooglePlaceMap from "@/components/GooglePlaceMap";
import NotFoundPage from "@/pages/NotFoundPage";

gsap.registerPlugin(ScrollTrigger);

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

const normalizeExternalUrl = (url) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `https://${url}`;
};

const normalizeMapText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const buildGoogleMapsPlaceQuery = ({ hotelName, street, neighborhood, city, country, position }) => {
  const parts = [];
  const addPart = (value) => {
    const text = String(value || "").trim();
    if (!text) return;
    const normalized = normalizeMapText(text);
    if (parts.some((part) => normalizeMapText(part) === normalized)) return;
    parts.push(text);
  };

  addPart(hotelName);
  addPart(street || neighborhood);
  addPart(city);

  if (parts.length > 0) {
    addPart(country || "MA");
    return parts.join(", ");
  }

  return position ? `${position[0]},${position[1]}` : "";
};

const CENTRA_HOTEL_ID_PATTERN = /^HT-[A-Z0-9]+$/i;
const HOTEL_ID_PATTERN = /^(?:HT-[A-Z0-9]+|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;

const getHotelRouteId = (hotel) =>
  hotel?.id ||
  hotel?.hotel_id ||
  hotel?.hotelId ||
  extractCentraHotelId(hotel?.image_urls || hotel?.imageUrls) ||
  null;

const getHotelPropertyTypeId = (hotel) =>
  hotel?.property_type_id || hotel?.propertyTypeId || null;

const hotelMatchesSlug = (hotel, slug) =>
  Boolean(slug && hotel?.hotelName && slugifyPropertyName(hotel.hotelName) === slug);

const GalleryModal = ({ open, images, startIndex, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 z-10 w-12 h-12 flex items-center justify-center text-white/50 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-7 h-7" />
      </button>

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
              <div className="w-full h-full flex items-center justify-center">
                <OptimizedImage
                  src={url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-contain select-none"
                  draggable={false}
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

const normalizePartnerHotel = (hotel, language, catalogs) => {
  if (!hotel) return null;
  const mapped = mapPartnerHotelToRiad(hotel, language, catalogs);

  return {
    ...hotel,
    ...mapped,
    hotel_id: hotel.hotel_id || hotel.hotelId || null,
    org_id: hotel.org_id || hotel.orgId || null,
    city_id: mapped.city_id,
    neighborhood_id: mapped.neighborhood_id,
    property_type_id: mapped.property_type_id,
    amenity_ids: mapped.amenity_ids,
    service_ids: mapped.service_ids,
    main_image_url: mapped.main_image_url,
    image_urls: mapped.image_urls,
    rating_avg: mapped.rating_avg,
    reviews_count: mapped.reviews_count,
    extra_info: hotel.extra_info || hotel.extraInfo || null,
    phone_number: mapped.phone,
    email: hotel.email || null,
    website: hotel.website || null,
    beLink: mapped.simple_booking_link,
    whatsappNumber: mapped.whatsapp_number,
    simple_booking_link: mapped.simple_booking_link,
    source_created_at: hotel.source_created_at || hotel.sourceCreatedAt || null,
    country: mapped.country,
    city: mapped.city,
    neighborhood: mapped.neighborhood,
    propertyType: mapped.propertyType,
    street: mapped.street,
    latitude: hotel.latitude ?? hotel.lat ?? null,
    longitude: hotel.longitude ?? hotel.lng ?? hotel.lon ?? null,
  };
};

const RiadDetailPage = () => {
  const { propertyType: routePropertyType, slug, id, legacySlug } = useParams();
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();

  const routeSlug = legacySlug || slug || id || "";
  const normalizedRouteSlug = slugifyPropertyName(routeSlug);
  const routeHotelId = id || (HOTEL_ID_PATTERN.test(routeSlug) ? routeSlug : null);

  const [riad, setRiad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  
  const imgLayerA = useRef(null);
  const imgLayerB = useRef(null);
  const activeLayer = useRef("A");
  const progressBarRef = useRef(null);
  const carouselRef = useRef(null);
  const infoCardRef = useRef(null);
  const pageRef = useRef(null);
  const mapSectionRef = useRef(null);
  const mapParallaxRef = useRef(null);
  const ctaRef = useRef(null);
  const heroContentRef = useRef(null);
  const heroMetaRef = useRef(null);
  const websiteIconRef = useRef(null);
  const trackedRiadViewRef = useRef(null);

  // Listing fallback — used when the detail endpoint fails (e.g. Centra 403/500).
  const { data: hotelList, isLoading: listLoading } = usePartnerHotels();
  const matchedHotel = useMemo(() => {
    if (!Array.isArray(hotelList)) return null;

    if (routeHotelId) {
      const byId = hotelList.find((hotel) =>
        String(getHotelRouteId(hotel)) === String(routeHotelId) ||
        extractCentraHotelId(hotel?.image_urls || hotel?.imageUrls) === routeHotelId
      );
      if (byId) return byId;
    }

    const normalizedPropertyType = slugifyPropertyName(routePropertyType);
    const matchingType = normalizedPropertyType
      ? hotelList.find((hotel) =>
          slugifyPropertyName(getHotelPropertyTypeId(hotel)) === normalizedPropertyType &&
          hotelMatchesSlug(hotel, normalizedRouteSlug)
        )
      : null;

    return matchingType || hotelList.find(
      (hotel) => hotelMatchesSlug(hotel, normalizedRouteSlug)
    ) || null;
  }, [hotelList, routeHotelId, normalizedRouteSlug, routePropertyType]);
  const resolvedHotelId = getHotelRouteId(matchedHotel) || routeHotelId;
  const listedCentraHotelId = extractCentraHotelId(matchedHotel?.image_urls || matchedHotel?.imageUrls);
  const waitForHotelList = listLoading && routeHotelId && !CENTRA_HOTEL_ID_PATTERN.test(routeHotelId);
  const detailHotelId = listedCentraHotelId || (waitForHotelList ? null : resolvedHotelId);

  const { data: hotelData, error: hotelError, isLoading: hotelLoading } = usePartnerHotelById(detailHotelId);
  const { data: partnerCatalogs } = usePartnerCatalogs();

  const fallbackHotel = useMemo(() => {
    if (matchedHotel) return matchedHotel;
    if (!Array.isArray(hotelList) || !resolvedHotelId) return null;
    return hotelList.find(
      (h) =>
        h?.id === resolvedHotelId ||
        h?.hotel_id === resolvedHotelId ||
        h?.hotelId === resolvedHotelId ||
        extractCentraHotelId(h?.image_urls) === resolvedHotelId
    ) || null;
  }, [hotelList, matchedHotel, resolvedHotelId]);

  useEffect(() => {
    if (!matchedHotel || !hotelData?.hotelName) return;
    const canonicalHotelName = hotelData.hotelName;
    const canonicalPropertyType = getHotelPropertyTypeId(hotelData) || getHotelPropertyTypeId(matchedHotel);
    const canonicalHref = buildPropertyDetailHref(canonicalPropertyType, canonicalHotelName);
    const currentHref = legacySlug ? `/riad/${id}/${legacySlug}` : `/${routePropertyType}/${slug}`;
    if (canonicalHref && canonicalHref !== currentHref) {
      navigate(canonicalHref, { replace: true });
    }
  }, [hotelData, id, legacySlug, matchedHotel, navigate, routePropertyType, slug, currentLanguage]);

  useEffect(() => {
    const applyHotel = (sourceHotel) => {
      setLoading(true);
      setRiad(normalizePartnerHotel(sourceHotel, currentLanguage, partnerCatalogs));
      setLoading(false);
    };

    if (!resolvedHotelId) {
      if (fallbackHotel && !listLoading) {
        applyHotel(fallbackHotel);
      } else if (listLoading) {
        setLoading(true);
      } else {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch riad details." });
        setRiad(null);
        setLoading(false);
      }
      return;
    }

    // Prefer fresh detail data; fall back to listing entry on error.
    if (hotelData) {
      applyHotel(fallbackHotel ? {
        ...fallbackHotel,
        ...hotelData,
        id: fallbackHotel.id || hotelData.id,
      } : hotelData);
    } else if (hotelError && fallbackHotel) {
      console.warn("[RiadDetailPage] Detail fetch failed — falling back to listing data.", hotelError);
      applyHotel(fallbackHotel);
    } else if (hotelError && !listLoading) {
      // Detail failed and listing has no match either.
      toast({ variant: "destructive", title: "Error", description: "Could not fetch riad details." });
      setRiad(null);
      setLoading(false);
    } else if (hotelLoading || listLoading) {
      setLoading(true);
    }
  }, [hotelData, hotelError, hotelLoading, fallbackHotel, listLoading, resolvedHotelId, currentLanguage, partnerCatalogs, toast]);

  const hotelName = riad ? getTranslated(riad.hotelName, currentLanguage) : "";
  const description = riad ? getTranslated(riad.description, currentLanguage) : "";
  const internationalAddress = formatInternationalAddress(riad);
  const city = riad?.city || "";
  const neighborhood = riad?.neighborhood || "";
  const propertyType = riad?.propertyType || (riad?.property_type_id ? idToLabel(riad.property_type_id) : "");
  const analyticsRiadId = riad ? (getHotelRouteId(riad) || resolvedHotelId) : null;

  useEffect(() => {
    if (!analyticsRiadId || !hotelName || trackedRiadViewRef.current === analyticsRiadId) return;
    if (typeof window.gtag !== "function") return;

    trackedRiadViewRef.current = analyticsRiadId;
    window.gtag("event", "view_item", {
      items: [{
        item_id: analyticsRiadId,
        item_name: hotelName,
        item_category: propertyType || "Riad",
        ...(city ? { item_category2: city } : {}),
      }],
    });
  }, [analyticsRiadId, hotelName, city, propertyType]);

  const images = useMemo(() => {
    if (!riad) return [];
    const availableImages = [
      ...(riad.main_image_url ? [riad.main_image_url] : []),
      ...(Array.isArray(riad.image_urls) ? riad.image_urls.filter((url) => url !== riad.main_image_url) : []),
    ];
    return availableImages;
  }, [riad]);
  const amenities = riad
    ? (riad.amenities || (riad.amenity_ids || []).map(idToLabel))
    : [];
  const services = riad
    ? (riad.services || (riad.service_ids || []).map(idToLabel))
    : [];
  const bookingConditions = riad
    ? (riad.bookingConditions || (riad.booking_condition_ids || []).map(idToLabel))
    : [];
  const position = riad && riad.latitude && riad.longitude ? [riad.latitude, riad.longitude] : null;
  const ratingNum = riad ? (parseFloat(riad.rating_avg) || 0) : 0;
  const ratingFull = Math.round(ratingNum);
  const extraInfo = riad ? getTranslated(riad.extra_info, currentLanguage) : "";
  const extraInfoLines = extraInfo
    ? extraInfo.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    : [];
  const mapPlaceQuery = buildGoogleMapsPlaceQuery({
    hotelName,
    street: riad?.street,
    neighborhood,
    city,
    country: riad?.country,
    position,
  });
  const encodedMapPlaceQuery = encodeURIComponent(mapPlaceQuery);
  const googleMapsSearchUrl = mapPlaceQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodedMapPlaceQuery}`
    : null;
  const googleMapsDirectionsUrl = mapPlaceQuery
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodedMapPlaceQuery}`
    : null;
  const locationLabel = internationalAddress || [neighborhood, city, riad?.country].filter(Boolean).join(", ");
  const displayAddress = locationLabel || mapPlaceQuery;

  const phoneNumber = riad?.phone_number || riad?.phone || null;
  const email = riad?.email || null;
  const website = riad?.website || null;
  const beLink = riad?.beLink || null;
  const whatsappNumber = riad?.whatsappNumber || null;

  const hasMetrics = riad?.rating_avg || riad?.reviews_count || amenities.length > 0 || images.length > 1;

  const animateSlide = useCallback((newIdx, dir) => {
    const enterLayer = activeLayer.current === "A" ? imgLayerB : imgLayerA;
    const exitLayer = activeLayer.current === "A" ? imgLayerA : imgLayerB;
    if (!enterLayer.current || !exitLayer.current) return;

    enterLayer.current.src = optimizeImageUrl(images[newIdx], { quality: 60 });
    enterLayer.current.alt = `${hotelName} ${newIdx + 1}`;
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
  }, [images, hotelName]);

  useEffect(() => {
    if (images.length === 0) return;
    if (imgLayerA.current) {
      imgLayerA.current.src = optimizeImageUrl(images[0], { quality: 60 });
      imgLayerA.current.alt = `${hotelName} 1`;
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
  }, [images, hotelName]);

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

  useEffect(() => { setPhotoIdx(0); }, [images]);

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

  if (!riad) return <NotFoundPage />;

  return (
    <>
      <Helmet>
        <title>{hotelName} &middot; LA CENTRALE DES RIADS</title>
        <meta name="description" content={description?.substring(0, 160)} />
      </Helmet>

      <GalleryModal
        open={galleryOpen}
        images={images}
        startIndex={activeImageIndex}
        onClose={() => setGalleryOpen(false)}
      />

      <div ref={pageRef} className="relative bg-white font-montserrat min-h-screen overflow-hidden">

        <div ref={carouselRef} className="relative h-screen max-h-[700px] md:max-h-[800px] overflow-hidden bg-[#1d1d1b]">
          {images.length === 0 && (
            <div className="absolute inset-0 grid place-items-center bg-brand-beige p-20">
              <img src="/images/logo_mgh.svg" alt="" className="h-48 w-48 object-contain opacity-30" />
            </div>
          )}
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
                {hotelName}
              </h1>
              {locationLabel && (
                <div className="flex items-center gap-2 mt-5 text-white/50">
                  <MapPin className="w-3.5 h-3.5 text-brand-action" />
                  <span className="text-[0.7rem] uppercase tracking-[0.2em] font-medium">
                    {locationLabel}
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
            <div className="lg:col-span-5 relative pt-20 md:pt-24" ref={infoCardRef}>
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
                        <ul className="grid grid-cols-2 gap-x-5 gap-y-3 text-[0.8rem] text-brand-ink/70">
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
                        <ul className="grid grid-cols-2 gap-x-5 gap-y-3 text-[0.8rem] text-brand-ink/70">
                          {services.map((s, i) => (
                            <li key={`${s}-${i}`} className="flex items-start gap-3">
                              <span className="mt-[6px] h-[4px] w-[4px] bg-brand-action shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {bookingConditions.length > 0 && (
                      <div className="mb-7">
                        <SectionEyebrow label={t("bookingConditions") || "Booking Conditions"} />
                        <ul className="grid grid-cols-1 gap-y-3 text-[0.8rem] text-brand-ink/70">
                          {bookingConditions.map((condition, i) => (
                            <li key={`${condition}-${i}`} className="flex items-start gap-3">
                              <span className="mt-[6px] h-[4px] w-[4px] bg-brand-action shrink-0" />
                              <span>{condition}</span>
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

                  </div>
                </div>

                {/* Bottom: actions + read more */}
                <div className="shrink-0 px-8 md:px-10 pb-10 md:pb-12 pt-4">
                  <div className="flex flex-col gap-3">
                    {phoneNumber && (
                      <div className="w-full h-[52px] bg-white border border-brand-ink/10 text-brand-ink/70 flex items-center justify-center gap-3 px-6 font-montserrat">
                        <Phone className="w-4 h-4 text-brand-action shrink-0" />
                        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em]">{phoneNumber}</span>
                      </div>
                    )}

                    {email && (
                      <a
                        href={`mailto:${email}`}
                        aria-label="Email"
                        className="w-full h-[52px] border border-brand-ink/10 text-brand-ink/40 flex items-center justify-center gap-3 hover:bg-brand-action hover:text-white hover:border-brand-action transition-all duration-400"
                      >
                        <Mail className="w-4 h-4 shrink-0" />
                        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] font-montserrat truncate">{email}</span>
                      </a>
                    )}

                    {website && (
                      <a
                        href={normalizeExternalUrl(website)}
                        target="_blank"
                        rel="noreferrer"
                        className="group w-full h-[52px] inline-flex items-center justify-center gap-3 px-6 bg-white border border-brand-ink/10 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-ink/70 hover:text-brand-ink hover:border-brand-action/40 hover:bg-white transition-all duration-500 font-montserrat"
                      >
                        <Globe ref={websiteIconRef} className="w-3.5 h-3.5 text-brand-action shrink-0" />
                        <span className="truncate">
                          {(() => { try { return new URL(normalizeExternalUrl(website)).hostname.replace(/^www\./, ''); } catch { return website; } })()}
                        </span>
                        <ExternalLink className="w-3 h-3 text-brand-ink/30 group-hover:text-brand-action transition-colors shrink-0" />
                      </a>
                    )}

                    {(beLink || riad?.simple_booking_link || website) && (
                      <a
                        href={beLink || riad?.simple_booking_link || normalizeExternalUrl(website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group w-full h-[52px] inline-flex items-center justify-center gap-3 bg-brand-action text-white px-6 text-[0.65rem] font-semibold uppercase tracking-[0.2em] hover:bg-brand-ink transition-all duration-500 font-montserrat"
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{t("bookNow")}</span>
                        <span className="inline-block transition-transform duration-500 group-hover:translate-x-1 shrink-0" aria-hidden>&#8594;</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Gallery Thumb Strip — width-matched to info card ── */}
            <div className="hidden lg:block lg:col-span-1" />
            <div className="lg:col-span-5 pt-20 md:pt-24">
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
          {mapPlaceQuery && (
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
                            {displayAddress}
                          </p>
                        </div>

                        {googleMapsDirectionsUrl && (
                          <a
                            href={googleMapsDirectionsUrl}
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
                    <div className="relative overflow-hidden shadow-xl bg-white">
                      <span className="absolute top-4 left-4 w-5 h-5 border-t border-l border-white/40 z-20 pointer-events-none" />
                      <span className="absolute top-4 right-4 w-5 h-5 border-t border-r border-white/40 z-20 pointer-events-none" />
                      <span className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-white/40 z-20 pointer-events-none" />
                      <span className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-white/40 z-20 pointer-events-none" />

                      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-brand-ink/5">
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-brand-action" />
                          <span className="text-sm font-semibold text-brand-ink font-montserrat tracking-wide">
                            {hotelName}
                          </span>
                        </div>
                        {googleMapsSearchUrl && (
                          <a
                            href={googleMapsSearchUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.15em] text-brand-action hover:text-brand-action/70 font-semibold transition-all duration-400 group"
                          >
                            <Globe className="w-3 h-3" />
                            {t("googleMaps")}
                          </a>
                        )}
                      </div>
                      <div className="h-[400px] md:h-[500px] relative overflow-hidden">
                        <GooglePlaceMap
                          title={hotelName}
                          query={mapPlaceQuery}
                          position={position}
                          mapsUrl={googleMapsSearchUrl}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-24 right-6 z-40 w-14 h-14 flex items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 hover:scale-110 active:scale-95 transition-all duration-300"
          aria-label="WhatsApp"
        >
          <FaWhatsapp className="w-7 h-7" />
        </a>
      )}
      <BackToTopButton />
    </>
  );
};

export default RiadDetailPage;
