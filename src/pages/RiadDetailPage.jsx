import React, { useEffect, useState, useMemo, useRef } from "react";
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
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

import OptimizedImage from '@/components/ui/OptimizedImage';
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  ArrowLeft,
  Star,
  MapPin,
  Check,
  Shield,
  Phone,
  Mail,
  Globe,
  ChevronRight,
  Sparkles,
  X,
  ImageIcon,
  Wifi,
  Waves,
  Bath,
  Sun,
  Wind,
  Users,
  Utensils,
  Tv,
  Coffee,
  Car,
  Key,
  Thermometer,
  Heart,
  Baby,
  Accessibility,
  Dumbbell,
  ParkingCircle,
  BedDouble,
  Shirt,
  PawPrint,
  CigaretteOff,
  Snowflake,
  ConciergeBell,
  Plane,
  Lock,
} from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { getTranslated } from "@/lib/utils";
import { fetchCatalog } from "@/lib/catalogs";
import { fetchPartnerHotelById } from "@/lib/partnerHotelsApi";

const FALLBACK_IMAGE = import.meta.env.VITE_FALLBACK_IMAGE ||
  "https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png";



  const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Jost:wght@300;400;500;600&display=swap');

  :root {
    --gold: #C9A96E;
    --gold-light: #E8D5B0;
    --gold-dark: #9A7A48;
    --ink: #1A1410;
    --paper: #FAF8F4;
    --stone: #F0EDE6;
    --mist: rgba(201,169,110,0.12);
    --navy: #02162a;
  }

  .reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }

  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .amenity-pill {
    transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    cursor: default;
  }

  .amenity-pill:hover {
    background: rgba(201,169,110,0.18);
    border-color: var(--gold);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(201,169,110,0.2);
  }

  .ornament-divider {
    display: flex;
    align-items: center;
    gap: 16px;
    color: var(--gold);
  }

  .ornament-divider::before,
  .ornament-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold-light), transparent);
  }

  .contact-item {
    transition: all 0.2s;
    border: 1px solid transparent;
    border-radius: 12px;
    padding: 10px 12px;
  }

  .contact-item:hover {
    background: var(--mist);
    border-color: rgba(201,169,110,0.3);
  }

  .rating-badge {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.8rem;
    font-weight: 300;
    line-height: 1;
    color: var(--gold);
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-6px) rotate(1deg); }
    66% { transform: translateY(-3px) rotate(-1deg); }
  }

  .ornament-float {
    animation: float 6s ease-in-out infinite;
  }

  @keyframes ring {
    0% { box-shadow: 0 0 0 0 rgba(201,169,110,0.5); }
    70% { box-shadow: 0 0 0 14px rgba(201,169,110,0); }
    100% { box-shadow: 0 0 0 0 rgba(201,169,110,0); }
  }

  .cta-pulse {
    animation: ring 2.4s ease-out infinite;
  }

  .gallery-tile {
    border: none;
    padding: 0;
    overflow: hidden;
    cursor: pointer;
    background: var(--stone);
    position: relative;
  }

  .gallery-tile img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.45s ease, filter 0.45s ease;
  }

  .gallery-tile:hover img {
    transform: scale(1.04);
    filter: brightness(0.9);
  }

  /* subtle 3D tilt and perspective for premium feel */
  .gallery-tile {
    transform-origin: center;
    will-change: transform;
    transition: transform 0.45s cubic-bezier(.2,.9,.2,1), box-shadow 0.45s;
  }

  .gallery-tile:hover {
    transform: perspective(900px) translateY(-6px) rotateX(2deg) rotateY(-1deg);
    box-shadow: 0 30px 70px rgba(15,12,10,0.18);
  }

  .booking-gallery-shell {
    max-width: 1320px;
    margin: 0 auto;
    padding: 96px 24px 34px;
  }

  .booking-gallery-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 8px;
    height: 430px;
    border-radius: 18px;
    overflow: hidden;
  }

  .booking-gallery-main {
    height: 430px;
  }

  .booking-gallery-side {
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 8px;
    height: 430px;
  }

  .booking-gallery-bottom {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-top: 8px;
  }

  .booking-gallery-bottom-tile {
    height: 118px;
    border-radius: 12px;
  }

  .gallery-overlay-button {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.48);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 20px;
    text-decoration: underline;
    font-family: 'Jost', sans-serif;
  }

  /* Hero overlay shown on the main gallery tile */
  .hero-overlay {
    position: absolute;
    bottom: 18px;
    left: 18px;
    right: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 18px;
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(10,8,6,0.06), rgba(10,8,6,0.18));
    backdrop-filter: blur(6px) saturate(120%);
    box-shadow: 0 12px 40px rgba(10,8,6,0.28);
    color: white;
  }

  .hero-overlay .title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1.1rem, 2.5vw, 1.6rem);
    font-weight: 400;
    line-height: 1.05;
    text-shadow: 0 6px 24px rgba(0,0,0,0.45);
  }

  .hero-overlay .mini-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    font-weight: 600;
    font-size: 0.85rem;
    color: white;
    transition: transform 0.28s ease, background 0.28s ease;
  }

  .hero-overlay .mini-cta:hover { transform: translateY(-3px); background: rgba(255,255,255,0.09); }

  .gallery-modal-swiper .swiper-button-next,
  .gallery-modal-swiper .swiper-button-prev {
    color: #111;
    background: white;
    width: 40px;
    height: 40px;

    }

  .gallery-modal-swiper .swiper-button-next::after,
  .gallery-modal-swiper .swiper-button-prev::after {
    font-size: 14px;
    font-weight: 700;
  }

  .gallery-modal-swiper .swiper-pagination-bullet-active {
    background: var(--gold);
  }

  /* Modal open animation */
  .gallery-modal-fade {
    animation: modalIn 360ms cubic-bezier(.2,.9,.25,1);
  }

  @keyframes modalIn {
    from { opacity: 0; transform: translateY(8px) scale(0.995); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Glass booking card enhancements */
  .glass-card { background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.55)); border-radius: 20px; box-shadow: 0 20px 80px rgba(10,8,6,0.12); border: 1px solid rgba(255,255,255,0.35); }

  .cta-advanced { transition: transform 0.22s cubic-bezier(.2,.9,.2,1), box-shadow 0.22s; }
  .cta-advanced:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 20px 50px rgba(201,169,110,0.18); }

  /* animated rating badge */
  .rating-badge-hero { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; color: var(--gold); letter-spacing: -0.02em; text-shadow: 0 10px 30px rgba(201,169,110,0.14); transform-origin: left center; animation: popIn 560ms cubic-bezier(.2,.9,.2,1) both; }

  @keyframes popIn { from { transform: scale(.92) translateY(6px); opacity: 0 } to { transform: scale(1) translateY(0); opacity: 1 } }

  @media (max-width: 900px) {
    .booking-gallery-shell {
      padding: 86px 16px 28px;
    }

    .booking-gallery-grid {
      grid-template-columns: 1fr;
      height: auto;
      overflow: visible;
      border-radius: 0;
    }

    .booking-gallery-main {
      height: 320px;
      border-radius: 18px !important;
      overflow: hidden;
    }

    .booking-gallery-side {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: none;
      height: 160px;
    }

    .booking-gallery-side .gallery-tile {
      border-radius: 14px !important;
    }

    .booking-gallery-bottom {
      grid-template-columns: repeat(2, 1fr);
    }

    .booking-gallery-bottom-tile {
      height: 140px;
    }
  }
`;

function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.1 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}

const fetchServicesCatalog = async (language) => {
  try {
    return await fetchCatalog("mgh_services_catalog", language);
  } catch {
    return fetchCatalog("mgh_serivces_catalog", language);
  }
};

const getAmenityIcon = (label = "", type = "amenity") => {
  const text = label.toLowerCase();

  if (
    text.includes("wifi") ||
    text.includes("wi-fi") ||
    text.includes("internet")
  )
    return Wifi;
  if (
    text.includes("pool") ||
    text.includes("piscine") ||
    text.includes("swimming")
  )
    return Waves;
  if (
    text.includes("bath") ||
    text.includes("bain") ||
    text.includes("shower") ||
    text.includes("douche")
  )
    return Bath;
  if (
    text.includes("terrace") ||
    text.includes("terrasse") ||
    text.includes("sun") ||
    text.includes("solarium")
  )
    return Sun;
  if (
    text.includes("air") ||
    text.includes("clim") ||
    text.includes("conditioning")
  )
    return Snowflake;
  if (text.includes("chauffage") || text.includes("heating"))
    return Thermometer;
  if (
    text.includes("restaurant") ||
    text.includes("breakfast") ||
    text.includes("petit-déjeuner") ||
    text.includes("dinner") ||
    text.includes("food")
  )
    return Utensils;
  if (
    text.includes("coffee") ||
    text.includes("café") ||
    text.includes("tea") ||
    text.includes("thé")
  )
    return Coffee;
  if (
    text.includes("tv") ||
    text.includes("television") ||
    text.includes("télé")
  )
    return Tv;
  if (
    text.includes("family") ||
    text.includes("famille") ||
    text.includes("group")
  )
    return Users;
  if (
    text.includes("baby") ||
    text.includes("bébé") ||
    text.includes("child") ||
    text.includes("children")
  )
    return Baby;
  if (text.includes("parking") || text.includes("garage")) return ParkingCircle;
  if (
    text.includes("car") ||
    text.includes("voiture") ||
    text.includes("rental")
  )
    return Car;
  if (
    text.includes("airport") ||
    text.includes("aéroport") ||
    text.includes("transfer") ||
    text.includes("shuttle")
  )
    return Plane;
  if (
    text.includes("spa") ||
    text.includes("massage") ||
    text.includes("wellness") ||
    text.includes("bien-être")
  )
    return Heart;
  if (
    text.includes("gym") ||
    text.includes("fitness") ||
    text.includes("sport")
  )
    return Dumbbell;
  if (
    text.includes("room") ||
    text.includes("bed") ||
    text.includes("lit") ||
    text.includes("suite")
  )
    return BedDouble;
  if (
    text.includes("laundry") ||
    text.includes("linge") ||
    text.includes("pressing")
  )
    return Shirt;
  if (text.includes("pet") || text.includes("animal")) return PawPrint;
  if (
    text.includes("non-smoking") ||
    text.includes("non fumeur") ||
    text.includes("smoking")
  )
    return CigaretteOff;
  if (
    text.includes("accessible") ||
    text.includes("handicap") ||
    text.includes("wheelchair")
  )
    return Accessibility;
  if (
    text.includes("safe") ||
    text.includes("security") ||
    text.includes("sécurité")
  )
    return Lock;
  if (
    text.includes("reception") ||
    text.includes("concierge") ||
    text.includes("front desk")
  )
    return ConciergeBell;
  if (text.includes("key") || text.includes("clé")) return Key;
  if (text.includes("view") || text.includes("vue")) return Sun;
  if (text.includes("wind") || text.includes("ventilation")) return Wind;

  return type === "service" ? ConciergeBell : Check;
};

const StarRow = ({ count = 5, filled = 5 }) => (
  <div className="flex gap-1">
    {Array.from({ length: count }).map((_, i) => (
      <Star
        key={i}
        className="w-3.5 h-3.5"
        style={{
          color: i < filled ? "var(--gold)" : "rgba(201,169,110,0.25)",
          fill: i < filled ? "var(--gold)" : "none",
        }}
      />
    ))}
  </div>
);

const SectionHeading = ({ children, delay = 0 }) => {
  const ref = useReveal();

  return (
    <div
      ref={ref}
      className="reveal mb-6"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="ornament-divider mb-4">
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--gold)",
          }}
        >
          ✦
        </span>
      </div>

      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          fontWeight: 400,
          color: "var(--ink)",
          letterSpacing: "0.02em",
        }}
      >
        {children}
      </h2>
    </div>
  );
};

const FeaturePill = ({ label, icon, delay = 0, type = "amenity" }) => {
  const ref = useReveal();
  const Icon = icon || getAmenityIcon(label, type);

  return (
    <div
      ref={ref}
      className="reveal amenity-pill flex items-center gap-2.5 rounded-xl px-4 py-3"
      style={{
        background: "rgba(201,169,110,0.07)",
        border: "1px solid rgba(201,169,110,0.2)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <span style={{ color: "var(--gold)" }}>
        <Icon className="w-3.5 h-3.5" />
      </span>

      <span
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "0.82rem",
          fontWeight: 400,
          color: "var(--ink)",
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </span>
    </div>
  );
};

const LoadingScreen = ({ t }) => (
  <div
    className="min-h-screen flex flex-col items-center justify-center"
    style={{ background: "var(--paper)" }}
  >
    <div
      className="ornament-float mb-6 text-4xl"
      style={{ color: "var(--gold)" }}
    >
      ✦
    </div>

    <div
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1.1rem",
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: "var(--gold)",
      }}
    >
      {t("loading")}
    </div>
  </div>
);

const GalleryTile = ({
  src,
  alt,
  onClick,
  style,
  className = "",
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`gallery-tile ${className}`}
    style={{
      position: "relative",
      border: "none",
      padding: 0,
      overflow: "hidden",
      cursor: "pointer",
      background: "var(--stone)",
      ...style,
    }}
  >
    <OptimizedImage
      src={src}
      alt={alt}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
    {children}
  </button>
);


  const HotelGalleryGrid = ({ images, name, onOpen, t }) => {
  const galleryImages = images.length > 0 ? images : [FALLBACK_IMAGE];

  const getImage = (index) => galleryImages[index] || galleryImages[0];

  const remaining = Math.max(galleryImages.length - 8, 0);

    return (
      <section className="booking-gallery-shell">
        <div className="booking-gallery-grid">
          <div style={{ position: 'relative' }}>
            <GalleryTile
              src={getImage(0)}
              alt={`${name} 1`}
              onClick={() => onOpen(0)}
              className="booking-gallery-main"
              style={{
                borderRadius: "18px 0 0 18px",
              }}
            />

            <div className="hero-overlay reveal" style={{ transitionDelay: '120ms' }}>
              <div>
                <div className="title">{name}</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{t('viewPhotos')}</div>
              </div>
              <button className="mini-cta" type="button" onClick={() => onOpen(0)}>
                {t('viewPhotos')}
                <ChevronRight style={{ width: 12, height: 12 }} />
              </button>
            </div>
          </div>

        <div className="booking-gallery-side">
          <GalleryTile
            src={getImage(1)}
            alt={`${name} 2`}
            onClick={() => onOpen(1)}
            style={{
              borderRadius: "0 18px 0 0",
            }}
          />

          <GalleryTile
            src={getImage(2)}
            alt={`${name} 3`}
            onClick={() => onOpen(2)}
            style={{
              borderRadius: "0 0 18px 0",
            }}
          />
        </div>
      </div>

      <div className="booking-gallery-bottom">
        {[3, 4, 5, 6].map((imageIndex) => (
          <GalleryTile
            key={imageIndex}
            src={getImage(imageIndex)}
            alt={`${name} ${imageIndex + 1}`}
            onClick={() => onOpen(imageIndex)}
            className="booking-gallery-bottom-tile"
          />
        ))}

        <GalleryTile
          src={getImage(7)}
          alt={`${name} gallery`}
          onClick={() => onOpen(7)}
          className="booking-gallery-bottom-tile"
        >
          <div className="gallery-overlay-button">
            <ImageIcon className="w-5 h-5 mr-2" />
            {remaining > 0
              ? `${remaining} ${t("otherPhotos")}`
              : t("viewPhotos")}
          </div>
        </GalleryTile>
      </div>
    </section>
  );
};

  const GalleryModal = ({ open, images, name, startIndex, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="gallery-modal-fade"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(255,255,255,0.98)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 76,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          {name}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.12)",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          <Swiper
          modules={[Navigation, Pagination, Keyboard]}
          navigation
          pagination={{
            type: "fraction",
          }}
          keyboard={{ enabled: true }}
          initialSlide={startIndex}
          className="gallery-modal-swiper"
          style={{ width: "100%", height: "100%" }}
        >
          {images.map((url, index) => (
            <SwiperSlide key={`${url}-${index}`}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "28px 90px 60px",
                }}
              >
                <OptimizedImage
                  src={url}
                  alt={`${name} ${index + 1}`}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: 12,
                    boxShadow: "0 20px 70px rgba(0,0,0,0.14)",
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        </div>
      </div>
    );
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

  const [cities, setCities] = useState({});
  const [neighborhoods, setNeighborhoods] = useState({});
  const [propertyTypes, setPropertyTypes] = useState({});
  const [amenitiesCatalog, setAmenitiesCatalog] = useState({});
  const [servicesCatalog, setServicesCatalog] = useState({});

  const ratingRef = useReveal();

  useEffect(() => {
    const styleId = "riad-detail-styles";
    if (document.getElementById(styleId)) return;

    const el = document.createElement("style");
    el.id = styleId;
    el.textContent = GLOBAL_STYLES;
    document.head.appendChild(el);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      try {
        const [
          citiesArr,
          neighborhoodsArr,
          propertyTypesArr,
          amenitiesArr,
          servicesArr,
          { data, error },
        ] = await Promise.all([
          fetchCatalog("mgh_cities", currentLanguage),
          fetchCatalog("mgh_neighborhoods", currentLanguage),
          fetchCatalog("mgh_property_types", currentLanguage),
          fetchCatalog("mgh_amenities_catalog", currentLanguage),
          fetchServicesCatalog(currentLanguage),
          fetchPartnerHotelById(id),
        ]);

        if (error) throw error;

        setCities(Object.fromEntries(citiesArr.map((c) => [c.id, c.label])));
        setNeighborhoods(
          Object.fromEntries(neighborhoodsArr.map((n) => [n.id, n.label])),
        );
        setPropertyTypes(
          Object.fromEntries(propertyTypesArr.map((p) => [p.id, p.label])),
        );
        setAmenitiesCatalog(
          Object.fromEntries(amenitiesArr.map((a) => [a.id, a.label])),
        );
        setServicesCatalog(
          Object.fromEntries(servicesArr.map((s) => [s.id, s.label])),
        );
        setRiad(data);

        if (data?.latitude && data?.longitude) {
          setTimeout(() => setMapLoaded(true), 600);
        }
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch riad details.",
        });
        setRiad(null);
      }

      setLoading(false);
    };

    fetchAll();
  }, [id, currentLanguage, toast]);

  const customIcon = useMemo(
    () =>
      L.divIcon({
        html: `<div style="width:36px;height:36px;background:var(--gold,#C9A96E);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 14px rgba(0,0,0,0.25)"></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        className: "",
      }),
    [],
  );

  if (loading) return <LoadingScreen t={t} />;
  if (!riad) return null;

  const name = getTranslated(riad.name, currentLanguage);
  const description = getTranslated(riad.description, currentLanguage);
  const address = getTranslated(riad.address, currentLanguage);

  const city = cities[riad.city_id] || "";
  const neighborhood = neighborhoods[riad.neighborhood_id] || "";
  const propertyType = propertyTypes[riad.property_type_id] || "";

  const images =
    Array.isArray(riad.image_urls) && riad.image_urls.length > 0
      ? riad.image_urls
      : [FALLBACK_IMAGE];

  const amenities = (riad.amenity_ids || [])
    .map((amenityId) => amenitiesCatalog[amenityId])
    .filter(Boolean);

  const services = (riad.service_ids || [])
    .map((serviceId) => servicesCatalog[serviceId])
    .filter(Boolean);

  const position =
    riad.latitude && riad.longitude ? [riad.latitude, riad.longitude] : null;

  const ratingNum = parseFloat(riad.rating_avg) || 0;
  const ratingFull = Math.round(ratingNum);

  const openGallery = (index) => {
    setActiveImageIndex(index);
    setGalleryOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>{name} · MGH</title>
      </Helmet>

      <GalleryModal
        open={galleryOpen}
        images={images}
        name={name}
        startIndex={activeImageIndex}
        onClose={() => setGalleryOpen(false)}
      />

      <div
        style={{
          background: "var(--paper)",
          fontFamily: "'Jost', sans-serif",
          minHeight: "100vh",
        }}
      >
        <HotelGalleryGrid
          images={images}
          name={name}
          onOpen={openGallery}
          t={t}
        />
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "18px 24px 100px",
          }}
        >
          <button
            onClick={() => history.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "white",
              border: "1px solid rgba(201,169,110,0.25)",
              borderRadius: 999,
              padding: "10px 16px",
              color: "var(--ink)",
              cursor: "pointer",
              marginBottom: 24,
              boxShadow: "0 8px 25px rgba(201,169,110,0.08)",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToListings")}
          </button>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: 48 }}
            className="lg-grid"
          >
            <style>{`@media(min-width:1024px){ .lg-grid{ grid-template-columns: 3fr 2fr !important; } }`}</style>

            <div>
              {propertyType && (
                <div
                  style={{
                    display: "inline-flex",
                    background: "rgba(201,169,110,0.13)",
                    border: "1px solid rgba(201,169,110,0.35)",
                    color: "var(--gold-dark)",
                    borderRadius: 999,
                    padding: "6px 14px",
                    fontSize: "0.72rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  {propertyType}
                </div>
              )}

              {riad.rating_avg && (
                <div
                  ref={ratingRef}
                  className="reveal"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 14,
                  }}
                >
                  <StarRow count={5} filled={ratingFull} />
                  <span
                    style={{
                      color: "var(--gold-dark)",
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1rem",
                      fontStyle: "italic",
                    }}
                  >
                    {riad.rating_avg} · {riad.reviews_count} {t("reviews")}
                  </span>
                </div>
              )}

              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2.4rem, 5vw, 4rem)",
                  fontWeight: 300,
                  color: "var(--ink)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  marginBottom: 12,
                }}
              >
                {name}
              </h1>

              {(neighborhood || city) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    color: "rgba(26,20,16,0.62)",
                    marginBottom: 32,
                  }}
                >
                  <MapPin
                    style={{ width: 15, height: 15, color: "var(--gold)" }}
                  />
                  <span
                    style={{
                      fontSize: "0.86rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {[neighborhood, city].filter(Boolean).join(" · ")}
                  </span>
                </div>
              )}

              {description && (
                <div style={{ marginBottom: 48 }}>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(1.08rem, 2vw, 1.25rem)",
                      fontWeight: 300,
                      color: "rgba(26,20,16,0.75)",
                      lineHeight: 1.85,
                      borderLeft: "2px solid var(--gold-light)",
                      paddingLeft: 20,
                    }}
                  >
                    {description}
                  </p>
                </div>
              )}

              {address && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    background: "white",
                    borderRadius: 16,
                    padding: "14px 20px",
                    border: "1px solid rgba(201,169,110,0.2)",
                    boxShadow: "0 2px 20px rgba(201,169,110,0.08)",
                    marginBottom: 52,
                  }}
                >
                  <MapPin
                    style={{
                      width: 16,
                      height: 16,
                      color: "var(--gold)",
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.875rem",
                      color: "rgba(26,20,16,0.65)",
                      lineHeight: 1.6,
                    }}
                  >
                    {address}
                  </span>
                </div>
              )}

              {amenities.length > 0 && (
                <div style={{ marginBottom: 52 }}>
                  <SectionHeading>
                    {t("amenities") || "Équipements"}
                  </SectionHeading>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(170px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {amenities.map((a, i) => (
                      <FeaturePill
                        key={`${a}-${i}`}
                        label={a}
                        delay={i * 40}
                        type="amenity"
                      />
                    ))}
                  </div>
                </div>
              )}

              {services.length > 0 && (
                <div style={{ marginBottom: 52 }}>
                  <SectionHeading delay={100}>
                    {t("services") || "Services"}
                  </SectionHeading>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(170px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {services.map((s, i) => (
                      <FeaturePill
                        key={`${s}-${i}`}
                        label={s}
                        delay={i * 40}
                        type="service"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div
                className="slide-in"
                style={{ position: "sticky", top: 100 }}
              >
                <div
                  className="glass-card"
                  style={{
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #2C2017 0%, #3D2D18 50%, #2C2017 100%)",
                      padding: "28px 28px 24px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <Shield
                        style={{ width: 14, height: 14, color: "var(--gold)" }}
                      />
                      <span
                        style={{
                          fontSize: "0.65rem",
                          letterSpacing: "0.25em",
                          textTransform: "uppercase",
                          color: "var(--gold)",
                        }}
                      >
                        {t("certifiedSecure")}
                      </span>
                    </div>

                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "1.5rem",
                        fontWeight: 300,
                        color: "white",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {name}
                    </div>
                  </div>

                  <div style={{ padding: 28 }}>
                    {riad.simple_booking_link && (
                      <a
                        href={riad.simple_booking_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-pulse cta-advanced"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                          width: "100%",
                          padding: "14px 24px",
                          background:
                            "linear-gradient(135deg, var(--gold-dark), var(--gold), #E8C87A, var(--gold))",
                          backgroundSize: "200% 200%",
                          borderRadius: 14,
                          color: "white",
                          textDecoration: "none",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          marginBottom: 24,
                        }}
                      >
                        <Sparkles style={{ width: 15, height: 15 }} />
                        {t("bookNow")}
                        <ChevronRight style={{ width: 10, height: 10 }} />
                      </a>
                    )}

                    {riad.rating_avg && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div className="rating-badge-hero">{riad.rating_avg}</div>
                        <div style={{ fontSize: 13, color: 'rgba(26,20,16,0.7)' }}>{riad.reviews_count} {t('reviews')}</div>
                      </div>
                    )}

                    <div
                      style={{
                        height: 1,
                        background:
                          "linear-gradient(90deg, transparent, rgba(201,169,110,0.25), transparent)",
                        marginBottom: 20,
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      {riad.phone && (
                        <a
                          href={`tel:${riad.phone}`}
                          className="contact-item"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            textDecoration: "none",
                            color: "var(--ink)",
                          }}
                        >
                          <Phone
                            style={{
                              width: 16,
                              height: 16,
                              color: "var(--gold)",
                            }}
                          />
                          <span>{riad.phone}</span>
                        </a>
                      )}

                      {riad.email && (
                        <a
                          href={`mailto:${riad.email}`}
                          className="contact-item"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            textDecoration: "none",
                            color: "var(--ink)",
                          }}
                        >
                          <Mail
                            style={{
                              width: 16,
                              height: 16,
                              color: "var(--gold)",
                            }}
                          />
                          <span style={{ wordBreak: "break-all" }}>
                            {riad.email}
                          </span>
                        </a>
                      )}

                      {riad.website && (
                        <a
                          href={riad.website}
                          target="_blank"
                          rel="noreferrer"
                          className="contact-item"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            textDecoration: "none",
                            color: "var(--ink)",
                          }}
                        >
                          <Globe
                            style={{
                              width: 16,
                              height: 16,
                              color: "var(--gold)",
                            }}
                          />
                          <span>{t("visitWebsite") || "Visiter le site"}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {position && (
                  <div
                    style={{
                      marginTop: 20,
                      background: "white",
                      borderRadius: 24,
                      overflow: "hidden",
                      border: "1px solid rgba(201,169,110,0.2)",
                      boxShadow: "0 8px 40px rgba(201,169,110,0.08)",
                    }}
                  >
                    <div
                      style={{
                        padding: "18px 22px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <MapPin
                          style={{
                            width: 15,
                            height: 15,
                            color: "var(--gold)",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: "1.1rem",
                            fontWeight: 400,
                            color: "var(--ink)",
                          }}
                        >
                          {t("location")}
                        </span>
                      </div>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${riad.latitude},${riad.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "0.7rem",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--gold)",
                          textDecoration: "none",
                        }}
                      >
                        {t("googleMaps")}{" "}
                        <ChevronRight style={{ width: 10, height: 10 }} />
                      </a>
                    </div>

                    <div style={{ height: 220, position: "relative" }}>
                      {mapLoaded ? (
                        <MapContainer
                          center={position}
                          zoom={15}
                          scrollWheelZoom={false}
                          style={{ width: "100%", height: "100%" }}
                          zoomControl={false}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={position} icon={customIcon}>
                            <Popup>
                              <div
                                style={{
                                  fontFamily: "'Jost', sans-serif",
                                  padding: "6px 4px",
                                }}
                              >
                                <strong
                                  style={{
                                    display: "block",
                                    marginBottom: 4,
                                    color: "var(--ink)",
                                  }}
                                >
                                  {name}
                                </strong>
                                {address && (
                                  <p
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "rgba(26,20,16,0.6)",
                                      margin: "0 0 4px",
                                    }}
                                  >
                                    {address}
                                  </p>
                                )}
                                {city && (
                                  <p style={{ fontSize: "0.8rem", margin: 0 }}>
                                    {city}
                                  </p>
                                )}
                                {riad.phone && (
                                  <p
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "var(--gold)",
                                      marginTop: 6,
                                      marginBottom: 0,
                                    }}
                                  >
                                    📞 {riad.phone}
                                  </p>
                                )}
                              </div>
                            </Popup>
                          </Marker>
                        </MapContainer>
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "var(--stone)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {t("loading")}…
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", paddingBottom: 48 }}>
          <div
            className="ornament-float"
            style={{ fontSize: "1.2rem", color: "rgba(201,169,110,0.4)" }}
          >
            ✦
          </div>
        </div>
      </div>
    </>
  );
};

export default RiadDetailPage;
