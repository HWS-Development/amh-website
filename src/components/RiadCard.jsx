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
    <div className="h-full flex flex-col bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
      {/* IMAGE */}
      <div className="relative">
        <Link to={`/riad/${riad.id}`}>
          <OptimizedImage
            src={riad.imageUrl || FALLBACK_IMAGE}
            alt={riad.name}
            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {hasRating && (
          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />
            <span className="font-semibold text-xs text-brand-ink">
              {riad.rating_avg.toFixed(1)}
            </span>
            {riad.reviews_count > 0 && (
              <span className="text-[10px] text-brand-ink/50">
                ({riad.reviews_count})
              </span>
            )}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-4 pt-3.5 pb-4 flex flex-col flex-1">
        {/* TITLE */}
        <Link to={`/riad/${riad.id}`}>
          <h3 className="text-sm font-bold text-brand-ink leading-tight line-clamp-1 hover:text-brand-action transition-colors">
            {riad.name}
          </h3>
        </Link>

        {riad.description && (
          <p className="mt-1 text-xs text-brand-ink/60 line-clamp-2 leading-relaxed">
            {riad.description}
          </p>
        )}

        {/* PROPERTY TYPE */}
        {riad.propertyType && (
          <p className="text-xs text-brand-ink/45 mt-1.5 font-medium">{riad.propertyType}</p>
        )}

        {/* LOCATION */}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-brand-ink/55">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="line-clamp-1">
            {[riad.neighborhood, riad.city].filter(Boolean).join(", ")}
          </span>
        </div>

        {/* AMENITIES */}
        {visibleAmenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {visibleAmenities.map(({ id, label }, index) => (
              <span
                key={`${id}-${index}`}
                className="inline-flex items-center gap-1 px-2 py-0.5
                   bg-brand-beige/60 text-[10px] text-brand-ink/70 font-medium"
              >
                <AmenityIcon label={label} className="w-3 h-3 text-brand-ink/40" />
                <span className="line-clamp-1 max-w-[9rem]">{label}</span>
              </span>
            ))}

            {prioritizedAmenities.length > MAX_AMENITIES && (
              <>
                <button
                  onClick={() => setAmenitiesOpen(true)}
                  aria-label={`Show all ${prioritizedAmenities.length} amenities`}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-action text-white text-[10px] font-bold shadow-sm hover:bg-brand-action/90 transition-colors"
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
        <div className="mt-auto pt-4">
          <Button
            asChild
            variant="outline"
            className="w-full h-9 text-xs font-semibold border-brand-ink/15 text-brand-ink hover:bg-brand-action hover:text-white hover:border-brand-action transition-all duration-300"
          >
            <Link to={`/riad/${riad.id}`}>{t("moreDetails")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RiadCard;
