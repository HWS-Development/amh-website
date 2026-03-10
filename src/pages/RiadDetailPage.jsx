import React, { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import Leaflet pour la carte
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  ArrowLeft,
  Star,
  MapPin,
  Check,
  Shield,
  Loader2,
  Phone,
  Mail,
  Globe,
} from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/customSupabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { getTranslated } from "@/lib/utils";
import { fetchCatalog } from "@/lib/catalogs";

const FALLBACK_IMAGE =
  "https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png";

const fetchServicesCatalog = async (language) => {
  try {
    return await fetchCatalog("mgh_services_catalog", language);
  } catch {
    return fetchCatalog("mgh_serivces_catalog", language);
  }
};

const RiadDetailPage = () => {
  const { id } = useParams();
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();

  const [riad, setRiad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [cities, setCities] = useState({});
  const [neighborhoods, setNeighborhoods] = useState({});
  const [propertyTypes, setPropertyTypes] = useState({});
  const [amenitiesCatalog, setAmenitiesCatalog] = useState({});
  const [servicesCatalog, setServicesCatalog] = useState({});

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
          supabase
            .from("mgh_properties_final")
            .select(
              `
    id,
    name,
    description,
    address,
    city_id,
    neighborhood_id,
    property_type_id,
    amenity_ids,
    service_ids,
    image_urls,
    rating_avg,
    reviews_count,
    simple_booking_link,
    phone,
    email,
    website,
    latitude,
    longitude
  `,
            )
            .eq("id", id)
            .single(),
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
          Object.fromEntries(servicesArr.map((service) => [service.id, service.label])),
        );

        setRiad(data);

        // Précharger la carte si des coordonnées existent
        if (data?.latitude && data?.longitude) {
          setTimeout(() => setMapLoaded(true), 500);
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

  // Custom icon pour le marqueur
  const customIcon = useMemo(
    () =>
      L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    [],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-16 h-16 animate-spin" />
      </div>
    );
  }

  if (!riad) return null;

  const name = getTranslated(riad.name, currentLanguage);
  const description = getTranslated(riad.description, currentLanguage);
  const images =
    Array.isArray(riad.image_urls) && riad.image_urls.length > 0
      ? riad.image_urls
      : [FALLBACK_IMAGE];

  const address = getTranslated(riad.address, currentLanguage);

  const city = cities[riad.city_id] || "";
  const neighborhood = neighborhoods[riad.neighborhood_id] || "";
  const propertyType = propertyTypes[riad.property_type_id] || "";

  const amenities = (riad.amenity_ids || [])
    .map((id) => amenitiesCatalog[id])
    .filter(Boolean);
  const services = (riad.service_ids || [])
    .map((id) => servicesCatalog[id])
    .filter(Boolean);

  // Position pour la carte Leaflet
  const position =
    riad.latitude && riad.longitude ? [riad.latitude, riad.longitude] : null;

  return (
    <>
      <Helmet>
        <title>{name} · MGH</title>
      </Helmet>

      <div className="bg-white pt-24 pb-12">
        <div className="content-wrapper">
          <Button
            variant="ghost"
            onClick={() => history.back()}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToListings")}
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className="w-full h-[55vh] md:h-[65vh] mb-10 rounded-3xl overflow-hidden shadow-2xl"
              >
                {images.map((url, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative w-full h-full">
                      <img
                        src={url}
                        alt={`${name} ${idx + 1}`}
                        className="w-full h-full object-cover scale-[1.03] transition-transform duration-700"
                        loading="lazy"
                      />

                      {/* Overlay luxe */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {riad.rating_avg && (
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-brand-action" />
                  <span className="font-semibold">{riad.rating_avg}</span>
                </div>
              )}

              <h1 className="text-4xl font-bold mb-2">{name}</h1>

              {description && (
                <p className="text-base text-brand-ink/75 mb-4">{description}</p>
              )}

              <div className="flex items-center gap-2 text-gray-500 mb-6">
                <MapPin className="w-4 h-4" />
                <span className="text-sm tracking-wide">
                  {[neighborhood, city].filter(Boolean).join(" · ")}
                </span>
              </div>

              {address && <p className="mb-8">{address}</p>}

              {amenities.length > 0 && (
                <div className="border-t pt-8">
                  <h2 className="text-2xl font-bold mb-4">{t("amenities")}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenities.map((a, index) => (
                      <div key={`${a}-${index}`} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-brand-action" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {services.length > 0 && (
                <div className="border-t pt-8">
                  <h2 className="text-2xl font-bold mb-4">{t("services")}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {services.map((service, index) => (
                      <div
                        key={`${service}-${index}`}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-4 h-4 text-brand-action" />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <Card className="sticky top-28">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 mt-1 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-emerald-700 leading-snug">
                      {t("licensedAndSecure")}
                    </h3>
                  </div>
                  {riad.simple_booking_link && (
                    <Button
                      asChild
                      className="w-full h-11 rounded-xl bg-brand-action text-white hover:bg-brand-action/90"
                    >
                      <a
                        href={riad.simple_booking_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("bookNow")}
                      </a>
                    </Button>
                  )}

                  {riad.phone && (
                    <div className="pt-2">
                      <a
                        href={`tel:${riad.phone}`}
                        className="flex items-center gap-3 text-gray-800 hover:underline transition-all"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="font-medium">{riad.phone}</span>
                      </a>
                    </div>
                  )}

                  {riad.email && (
                    <div className="pt-2">
                      <a
                        href={`mailto:${riad.email}`}
                        className="flex items-center gap-3 text-sm text-gray-600 hover:text-black transition"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="break-all">{riad.email}</span>
                      </a>
                    </div>
                  )}

                  {riad.website && (
                    <div className="pt-1">
                      <a
                        href={riad.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 text-sm text-gray-600 hover:text-black transition"
                      >
                        <Globe className="w-4 h-4" />
                        <span>{t("visitWebsite")}</span>
                      </a>
                    </div>
                  )}

                  {/* SECTION CARTE LEAFLET */}
                  {position && (
                    <div className="pt-4">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {t("location") || "Emplacement"}
                      </h3>

                      {mapLoaded ? (
                        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 h-64">
                          <MapContainer
                            center={position}
                            zoom={15}
                            scrollWheelZoom={false}
                            className="w-full h-full"
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={position} icon={customIcon}>
                              <Popup>
                                <div className="font-sans p-2">
                                  <strong className="text-sm block mb-1">
                                    {name}
                                  </strong>
                                  <p className="text-sm text-gray-600 mb-1">
                                    {address}
                                  </p>
                                  <p className="text-sm">{city}</p>
                                  {riad.phone && (
                                    <p className="text-sm text-brand-action mt-2">
                                      📞 {riad.phone}
                                    </p>
                                  )}
                                </div>
                              </Popup>
                            </Marker>
                          </MapContainer>
                        </div>
                      ) : (
                        <div className="rounded-2xl overflow-hidden border border-gray-200 h-64 bg-gray-100 animate-pulse flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                      )}

                      <div className="mt-3 text-center">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${riad.latitude},${riad.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" />
                          Google Maps
                        </a>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RiadDetailPage;
