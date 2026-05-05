import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import AmenityIcon from "@/components/AmenityIcon";
import AmenitiesModal from "@/components/AmenitiesModal";
import { useLanguage } from "@/contexts/LanguageContext";

const FALLBACK_IMAGE =
  "https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png";

const MAX_AMENITIES = 4;

const RiadListItem = ({ riad }) => {
  const { t } = useLanguage();
  const featureLabels = [...(riad.amenities || []), ...(riad.services || [])];
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);

  const hasRating =
    typeof riad.rating_avg === "number" && !Number.isNaN(riad.rating_avg);

  return (
    <div className="group flex flex-col md:flex-row gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-shadow">
      {/* IMAGE */}
      <div className="relative shrink-0">
        <Link to={`/riad/${riad.id}`}>
          <img
            src={riad.imageUrl || FALLBACK_IMAGE}
            alt={riad.name}
            className="h-44 w-full md:h-32 md:w-52 object-cover rounded-xl"
            loading="lazy"
          />
        </Link>

        {hasRating && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
            <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
            <span className="text-sm font-semibold">
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
      <div className="flex-1 min-w-0 flex flex-col">
        {/* TITLE */}
        <Link to={`/riad/${riad.id}`}>
          <h3 className="text-lg font-semibold text-gray-950 truncate group-hover:text-brand-action transition-colors">
            {riad.name}
          </h3>
        </Link>
        {riad.description && (
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {riad.description}
          </p>
        )}

        {/* PROPERTY TYPE */}
        {riad.propertyType && (
          <p className="text-sm text-brand-ink/60 mt-1">{riad.propertyType}</p>
        )}

        {/* LOCATION */}
        <div className="mt-1 flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="line-clamp-1">
            {[riad.neighborhood, riad.city].filter(Boolean).join(", ")}
          </span>
        </div>

        {/* AMENITIES */}
        {featureLabels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {featureLabels.slice(0, MAX_AMENITIES).map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f5f5f5] border border-gray-200 rounded-md text-xs font-medium text-gray-800 uppercase"
              >
                <AmenityIcon label={label} className="w-4 h-4 text-gray-600" />
                {label}
              </span>
            ))}

            {featureLabels.length > MAX_AMENITIES && (
              <>
                <button
                  onClick={() => setAmenitiesOpen(true)}
                  aria-label={`Show all ${featureLabels.length} amenities and services`}
                  className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-[#02162a] via-[#063a65] to-[#0b66b0] text-white rounded-md text-xs font-medium shadow-lg hover:scale-105 transition-transform"
                >
                  +{featureLabels.length - MAX_AMENITIES}
                </button>

                <AmenitiesModal
                  open={amenitiesOpen}
                  onOpenChange={setAmenitiesOpen}
                  amenities={featureLabels}
                  riadName={riad.name}
                />
              </>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-5">
          <div className="flex gap-2">
            {/* More details  */}
            <Button
              asChild
              variant="outline"
              className="flex-1 h-11 rounded-xl"
            >
              <Link to={`/riad/${riad.id}`}>More details</Link>
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

export default RiadListItem;
