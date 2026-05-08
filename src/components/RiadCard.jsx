import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import AmenityIcon from "@/components/AmenityIcon";
import AmenitiesModal from "@/components/AmenitiesModal";
import { useLanguage } from "@/contexts/LanguageContext";
import OptimizedImage from '@/components/ui/OptimizedImage';

const FALLBACK_IMAGE = import.meta.env.VITE_FALLBACK_IMAGE ||
  "https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png";
const MAX_AMENITIES = 3;
const PRIORITY_AMENITY_IDS = [
  "pool",
  "spa_hammam",
  "on_site_fitness_room",
  "on_site_restaurant_guest_table",
  "rooftop",
  "garden",
];

const RiadCard = ({ riad }) => {
  const { t } = useLanguage();
  const amenityEntries = (riad.amenity_ids || []).map((id, index) => ({
    id,
    label: riad.amenities?.[index],
  }));
  const prioritizedAmenities = [
    ...amenityEntries.filter((entry) => PRIORITY_AMENITY_IDS.includes(entry.id)),
    ...amenityEntries.filter((entry) => !PRIORITY_AMENITY_IDS.includes(entry.id)),
  ].filter((entry) => Boolean(entry.label));
  const visibleAmenities = prioritizedAmenities.slice(0, MAX_AMENITIES);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);

  const hasRating =
    typeof riad.rating_avg === "number" && !Number.isNaN(riad.rating_avg);

  return (
    <div className="h-full flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
      {/* IMAGE */}
      <div className="relative">
        <Link to={`/riad/${riad.id}`}>
          <OptimizedImage
            src={riad.imageUrl || FALLBACK_IMAGE}
            alt={riad.name}
            className="h-56 w-full object-cover"
          />
        </Link>

        {hasRating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
            <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
            <span className="font-semibold text-sm text-gray-900">
              {riad.rating_avg.toFixed(1)}
            </span>
            {riad.reviews_count && (
              <span className="text-xs text-gray-600">
                ({riad.reviews_count})
              </span>
            )}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-1">
        {/* TITLE */}
        <Link to={`/riad/${riad.id}`} className="min-h-[1.2rem]">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-brand-action transition-colors">
            {riad.name}
          </h3>
        </Link>
        {riad.description && (
          <p className="mt-1 min-h-[2.5rem] text-sm text-gray-600 line-clamp-2">
            {riad.description}
          </p>
        )}

        {/* PROPERTY TYPE */}
        {riad.propertyType && (
          <p className="text-sm text-brand-ink/60 mt-1">{riad.propertyType}</p>
        )}

        {/* LOCATION */}
        <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="line-clamp-1">
            {[riad.neighborhood, riad.city].filter(Boolean).join(", ")}
          </span>
        </div>
        {/* AMENITIES */}
        {visibleAmenities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {visibleAmenities.map(({ id, label }, index) => (
              <span
                key={`${id}-${index}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                   bg-gray-50 border border-gray-200 text-xs text-gray-800"
              >
                <AmenityIcon label={label} className="w-4 h-4 text-gray-500" />
                <span className="line-clamp-1 max-w-[11rem]">{label}</span>
              </span>
            ))}

            {prioritizedAmenities.length > MAX_AMENITIES && (
              <>
                <button
                  onClick={() => setAmenitiesOpen(true)}
                  aria-label={`Show all ${prioritizedAmenities.length} amenities`}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#02162a] via-[#063a65] to-[#0b66b0] text-white text-xs font-semibold shadow-lg transform hover:scale-105 transition-transform"
                >
                  +{prioritizedAmenities.length - MAX_AMENITIES}
                </button>

                <AmenitiesModal
                  open={amenitiesOpen}
                  onOpenChange={setAmenitiesOpen}
                  amenities={prioritizedAmenities.map((p) => p.label)}
                  riadName={riad.name}
                />
              </>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-5">
          <div className="flex gap-2">
            {/* More details - toujours visible */}
            <Button
              asChild
              variant="outline"
              className="flex-1 h-11 rounded-xl"
            >
              <Link to={`/riad/${riad.id}`}>{t("moreDetails")}</Link>
            </Button>

            {/* Réserver - seulement si simple_booking_link existe */}
            {riad.simple_booking_link && (
              <Button
                asChild
                className="flex-1 h-11 rounded-xl bg-brand-action text-white hover:bg-brand-action/90"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiadCard;
