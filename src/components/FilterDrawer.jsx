import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X, RotateCcw, Building2, MapPin, Wifi, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const RATING_THRESHOLDS = [
  { value: 4.9, label: "4.9+" },
  { value: 4.5, label: "4.5+" },
  { value: 4.0, label: "4.0+" },
];

const FilterSection = ({ icon: Icon, title, children }) => (
  <div className="border-b border-brand-ink/5 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-7 h-7 bg-brand-beige/70 grid place-items-center">
        {Icon && <Icon className="w-3.5 h-3.5 text-brand-action" />}
      </div>
      <span className="font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-ink/70">
        {title}
      </span>
    </div>
    {children}
  </div>
);

const FilterDrawer = ({
  open,
  onOpenChange,
  filters,
  cities = [],
  propertyTypes = [],
  amenities = [],
  onFiltersChange,
  resultCount,
  riadsMap = [],
}) => {
  const { t } = useLanguage();
  const [local, setLocal] = useState(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters, open]);

  const toggleAmenity = (id) => {
    setLocal((prev) => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(id)
        ? prev.amenity_ids.filter((v) => v !== id)
        : [...prev.amenity_ids, id],
    }));
  };

  const apply = () => {
    onFiltersChange(local);
    onOpenChange(false);
  };

  const reset = () => {
    const r = {
      city_id: null,
      neighborhood_id: null,
      property_type_id: null,
      amenity_ids: [],
      rating: null,
      onlyBookable: false,
    };
    setLocal(r);
    onFiltersChange(r);
    onOpenChange(false);
  };

  const previewCount = useMemo(() => {
    let list = [...riadsMap];
    if (!list.length) return 0;

    if (local.city_id) {
      list = list.filter((r) => String(r.city_id) === String(local.city_id));
    }
    if (local.neighborhood_id) {
      list = list.filter((r) => String(r.neighborhood_id) === String(local.neighborhood_id));
    }
    if (local.property_type_id) {
      list = list.filter((r) => String(r.property_type_id) === String(local.property_type_id));
    }
    if (local.amenity_ids?.length > 0) {
      list = list.filter((r) =>
        local.amenity_ids.some((aid) => (r.amenity_ids || []).includes(aid))
      );
    }
    if (local.rating) {
      list = list.filter((r) => (r.rating_avg || 0) >= local.rating);
    }
    if (local.onlyBookable) {
      list = list.filter((r) => r.simple_booking_link && r.simple_booking_link.trim());
    }
    return list.length;
  }, [riadsMap, local]);

  const localNeighborhoods = useMemo(() => {
    const source = riadsMap.filter((r) =>
      !local.city_id || String(r.city_id) === String(local.city_id)
    );
    const map = new Map();
    source.forEach((r) => {
      if (r.neighborhood_id) {
        const nid = String(r.neighborhood_id);
        if (!map.has(nid)) {
          map.set(nid, r.neighborhood || nid);
        }
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [riadsMap, local.city_id]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="shrink-0 px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-brand-ink/5">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-montserrat uppercase tracking-[0.35em] text-[0.55rem] text-brand-action font-semibold">
                {t("refine") || "Refine"}
              </span>
              <SheetTitle className="mt-1 font-display text-[1.6rem] text-brand-ink leading-tight tracking-tight font-medium">
                {t("filters")}
              </SheetTitle>
            </div>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-brand-ink/40 hover:text-brand-action transition-colors font-montserrat"
            >
              <RotateCcw className="w-3 h-3" />
              {t("reset") || "Reset"}
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
          {/* Booking */}
          <FilterSection title={t("booking") || "Booking"}>
            <label className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={Boolean(local.onlyBookable)}
                onCheckedChange={(checked) =>
                  setLocal((prev) => ({ ...prev, onlyBookable: Boolean(checked) }))
                }
                className="border-brand-ink/20 data-[state=checked]:bg-brand-action data-[state=checked]:border-brand-action"
              />
              <span className="font-montserrat text-[0.82rem] text-brand-ink/70 group-hover:text-brand-ink transition-colors">
                {t("onlyShowBookableRiads")}
              </span>
            </label>
          </FilterSection>

          {/* City */}
          <FilterSection icon={MapPin} title={t("cities") || "City"}>
            <RadioGroup
              value={local.city_id || ""}
              onValueChange={(v) =>
                setLocal((prev) => ({
                  ...prev,
                  city_id: v || null,
                  neighborhood_id: null,
                }))
              }
              className="space-y-2"
            >
              <Label className="flex items-center gap-2 cursor-pointer font-normal">
                <RadioGroupItem value="" className="border-brand-ink/20 data-[state=checked]:bg-brand-action data-[state=checked]:border-brand-action" />
                <span className="font-montserrat text-[0.82rem] text-brand-ink/50">{t("all")}</span>
              </Label>
              {cities.map((c) => (
                <Label key={c.id} className="flex items-center gap-2 cursor-pointer font-normal">
                  <RadioGroupItem value={c.id} className="border-brand-ink/20 data-[state=checked]:bg-brand-action data-[state=checked]:border-brand-action" />
                  <span className="font-montserrat text-[0.82rem] text-brand-ink/70">{c.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </FilterSection>

          {/* Neighborhood (only if city selected) */}
          {local.city_id && localNeighborhoods.length > 0 && (
            <FilterSection icon={MapPin} title={t("quartier") || "Neighborhood"}>
              <RadioGroup
                value={local.neighborhood_id || ""}
                onValueChange={(v) =>
                  setLocal((prev) => ({ ...prev, neighborhood_id: v || null }))
                }
                className="space-y-2"
              >
                <Label className="flex items-center gap-2 cursor-pointer font-normal">
                  <RadioGroupItem value="" className="border-brand-ink/20 data-[state=checked]:bg-brand-action data-[state=checked]:border-brand-action" />
                  <span className="font-montserrat text-[0.82rem] text-brand-ink/50">{t("all")}</span>
                </Label>
                {localNeighborhoods.map((n) => (
                  <Label key={n.id} className="flex items-center gap-2 cursor-pointer font-normal">
                    <RadioGroupItem value={n.id} className="border-brand-ink/20 data-[state=checked]:bg-brand-action data-[state=checked]:border-brand-action" />
                    <span className="font-montserrat text-[0.82rem] text-brand-ink/70">{n.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </FilterSection>
          )}

          {/* Property Type */}
          <FilterSection icon={Building2} title={t("propertyType") || "Property Type"}>
            <RadioGroup
              value={local.property_type_id || ""}
              onValueChange={(v) =>
                setLocal((prev) => ({ ...prev, property_type_id: v || null }))
              }
              className="space-y-2"
            >
              <Label className="flex items-center gap-2 cursor-pointer font-normal">
                <RadioGroupItem value="" className="border-brand-ink/20 data-[state=checked]:bg-brand-action data-[state=checked]:border-brand-action" />
                <span className="font-montserrat text-[0.82rem] text-brand-ink/50">{t("all")}</span>
              </Label>
              {propertyTypes.map((p) => (
                <Label key={p.id} className="flex items-center gap-2 cursor-pointer font-normal">
                  <RadioGroupItem value={p.id} className="border-brand-ink/20 data-[state=checked]:bg-brand-action data-[state=checked]:border-brand-action" />
                  <span className="font-montserrat text-[0.82rem] text-brand-ink/70">{p.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </FilterSection>

          {/* Rating */}
          <FilterSection icon={Star} title={t("guestRating") || "Guest Rating"}>
            <RadioGroup
              value={local.rating !== null ? String(local.rating) : ""}
              onValueChange={(v) =>
                setLocal((prev) => ({ ...prev, rating: v === "" ? null : Number(v) }))
              }
              className="space-y-2"
            >
              <Label className="flex items-center gap-2 cursor-pointer font-normal">
                <RadioGroupItem value="" className="border-brand-ink/20 data-[state=checked]:bg-brand-action data-[state=checked]:border-brand-action" />
                <span className="font-montserrat text-[0.82rem] text-brand-ink/50">{t("all")}</span>
              </Label>
              {RATING_THRESHOLDS.map((r) => (
                <Label key={r.value} className="flex items-center gap-2 cursor-pointer font-normal">
                  <RadioGroupItem value={String(r.value)} className="border-brand-ink/20 data-[state=checked]:bg-brand-action data-[state=checked]:border-brand-action" />
                  <span className="font-montserrat text-[0.82rem] text-brand-ink/70">{r.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </FilterSection>

          {/* Amenities */}
          <FilterSection icon={Wifi} title={t("amenities") || "Amenities"}>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {amenities.map((a) => (
                <label key={a.id} className="flex items-center gap-3 cursor-pointer group py-0.5">
                  <Checkbox
                    checked={local.amenity_ids.includes(a.id)}
                    onCheckedChange={() => toggleAmenity(a.id)}
                    className="border-brand-ink/20 data-[state=checked]:bg-brand-action data-[state=checked]:border-brand-action"
                  />
                  <span className="font-montserrat text-[0.82rem] text-brand-ink/70 group-hover:text-brand-ink transition-colors">
                    {a.label}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        </div>

        <SheetFooter className="shrink-0 px-6 md:px-8 py-5 border-t border-brand-ink/5 bg-brand-beige/20 gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 border-brand-ink/15 text-brand-ink/60 hover:bg-brand-ink/5 hover:text-brand-ink font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.15em]"
            onClick={reset}
          >
            <X className="w-3.5 h-3.5 mr-1.5" />
            {t("resetFilters")}
          </Button>
          <Button
            className="flex-1 h-12 bg-brand-action hover:bg-brand-ink text-white font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.15em] transition-all duration-500"
            onClick={apply}
          >
            {t("showResults")} ({previewCount})
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default FilterDrawer;
