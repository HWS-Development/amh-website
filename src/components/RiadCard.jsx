import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, ArrowUpRight } from "lucide-react";
import AmenityIcon from "@/components/AmenityIcon";
import AmenitiesModal from "@/components/AmenitiesModal";
import { useLanguage } from "@/contexts/LanguageContext";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { buildPropertyDetailHref } from "@/lib/partnerHotelsApi";
import { formatInternationalAddress } from "@/lib/partnerHotelTransform";

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
    ...amenityEntries.filter((entry) =>
      PRIORITY_AMENITY_IDS.includes(entry.id)
    ),
    ...amenityEntries.filter(
      (entry) => !PRIORITY_AMENITY_IDS.includes(entry.id)
    ),
  ].filter((entry) => Boolean(entry.label));
  const visibleAmenities = prioritizedAmenities.slice(0, MAX_AMENITIES);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const detailHref = buildPropertyDetailHref(riad.property_type_id, riad.hotelName);
  const location = formatInternationalAddress(riad);

  const hasRating =
    typeof riad.rating_avg === "number" && !Number.isNaN(riad.rating_avg);

  return (
    <article className="group h-full flex flex-col bg-white overflow-hidden transition-all duration-500 ease-editorial hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2),0_0_0_1px_rgba(191,103,62,0.06)]">
      {/* IMAGE — taller editorial aspect (4/3) */}
      <div className="relative overflow-hidden bg-brand-beige">
        <Link
          to={detailHref}
          aria-label={riad.hotelName}
          className="block relative aspect-[3/4] md:aspect-[4/5]"
        >
          {riad.imageUrl ? (
            <OptimizedImage
              src={riad.imageUrl}
              alt={riad.hotelName}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-editorial group-hover:scale-[1.06]"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-brand-beige p-12">
              <img src="/images/logo_mgh.svg" alt="" className="h-full w-full object-contain opacity-35" />
            </div>
          )}

          {/* subtle bottom gradient for badge legibility */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />

          {/* corner arrow chip on hover */}
          <span
            aria-hidden
            className="absolute bottom-3 right-3 grid place-items-center w-10 h-10 rounded-full bg-white/95 text-brand-ink translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-editorial"
          >
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </Link>

        {hasRating && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />
            <span className="font-semibold text-xs text-brand-ink">
              {riad.rating_avg.toFixed(1)}
            </span>
            {riad.reviews_count > 0 && (
              <span className="text-[10px] text-brand-ink/55">
                ({riad.reviews_count})
              </span>
            )}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-5 pt-5 pb-5 flex flex-col flex-1">
        {/* TITLE — serif editorial */}
        <Link to={detailHref}>
          <h3 className="font-display text-[clamp(1.1rem,1.4vw,1.35rem)] leading-tight text-brand-ink line-clamp-1 group-hover:text-brand-action transition-colors duration-500 ease-editorial">
            {riad.hotelName}
          </h3>
        </Link>

        {riad.description && (
          <p className="mt-1.5 text-xs text-brand-ink/60 line-clamp-2 leading-relaxed">
            {riad.description}
          </p>
        )}

        {/* PROPERTY TYPE — eyebrow */}
        {riad.propertyType && (
          <p className="mt-2 font-montserrat text-[0.6rem] uppercase tracking-[0.28em] text-brand-action font-semibold">
            {riad.propertyType}
          </p>
        )}

        {/* LOCATION */}
        {location && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-brand-ink/55">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
        )}

        {/* AMENITIES */}
        {visibleAmenities.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {visibleAmenities.map(({ id, label }, index) => (
              <span
                key={`${id}-${index}`}
                className="inline-flex items-center gap-1 px-2 py-1 bg-brand-beige/70 text-[10px] text-brand-ink/75 font-medium"
              >
                <AmenityIcon
                  label={label}
                  className="w-3 h-3 text-brand-action/70"
                />
                <span className="line-clamp-1 max-w-[9rem]">{label}</span>
              </span>
            ))}

            {prioritizedAmenities.length > MAX_AMENITIES && (
              <>
                <button
                  onClick={() => setAmenitiesOpen(true)}
                  aria-label={`Show all ${prioritizedAmenities.length} amenities`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-action text-white text-[10px] font-bold tracking-wide hover:bg-brand-ink transition-colors duration-300"
                >
                  +{prioritizedAmenities.length - MAX_AMENITIES}
                </button>

                <AmenitiesModal
                  open={amenitiesOpen}
                  onOpenChange={setAmenitiesOpen}
                  amenities={prioritizedAmenities.map((p) => p.label)}
                  riadName={riad.hotelName}
                />
              </>
            )}
          </div>
        )}

        {/* CTA — refined link button (editorial) */}
        <div className="mt-auto pt-5">
          <Link
            to={detailHref}
            className="group/btn relative flex items-center justify-between w-full px-4 py-3 border border-brand-ink/15 text-brand-ink hover:border-brand-action hover:text-brand-action hover:bg-brand-action/[0.03] transition-all duration-500 ease-editorial"
          >
            <span className="relative">
              <span className="font-montserrat text-[0.68rem] font-semibold uppercase tracking-[0.28em]">{t("moreDetails")}</span>
              <span className="absolute left-0 -bottom-px h-px w-0 bg-brand-action transition-all duration-500 ease-editorial group-hover/btn:w-full" />
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-500 ease-editorial group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default RiadCard;
