import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { fetchCatalog } from "@/lib/catalogs";

const RATING_THRESHOLDS = [
  { value: 4.9, label: "4.9+" },
  { value: 4.5, label: "4.5+" },
  { value: 4.0, label: "4.0+" },
];

const FilterDrawer = ({
  open,
  onOpenChange,
  filters,
  neighborhoods = [],
  onFiltersChange,
  resultCount,
}) => {
  const { t, currentLanguage } = useLanguage();

  const [localFilters, setLocalFilters] = useState(filters);
  const [cities, setCities] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      try {
        const [citiesData, amenitiesData] = await Promise.all([
          fetchCatalog("mgh_cities", currentLanguage),
          fetchCatalog("mgh_amenities_catalog", currentLanguage),
        ]);

        setCities(citiesData);
        setAmenities(amenitiesData);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, currentLanguage]);

  const toggleArray = (key, value) => {
    const cur = localFilters[key] || [];
    setLocalFilters({
      ...localFilters,
      [key]: cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value],
    });
  };

  const apply = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const reset = () => {
    const r = { city: null, amenities: [], rating: null, neighborhood: null };
    setLocalFilters(r);
    onFiltersChange(r);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-2xl font-bold">{t("filters")}</SheetTitle>
        </SheetHeader>

        <div className="p-6 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* CITY */}
              <div>
                <h3 className="font-semibold mb-4">{t("cities")}</h3>
                <RadioGroup
                  value={localFilters.city || ""}
                  onValueChange={(v) => {
                    const next = {
                      ...localFilters,
                      city: v || null,
                      neighborhood: null,
                    };
                    setLocalFilters(next);
                    onFiltersChange(next);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="" />
                    <Label>{t("all")}</Label>
                  </div>

                  {cities.map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <RadioGroupItem value={c.id} />
                      <Label>{c.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* RATING */}
              <div>
                <h3 className="font-semibold mb-4">{t("guestRating")}</h3>
                <RadioGroup
                  value={
                    localFilters.rating !== null
                      ? String(localFilters.rating)
                      : ""
                  }
                  onValueChange={(v) =>
                    setLocalFilters({
                      ...localFilters,
                      rating: v === "" ? null : Number(v),
                    })
                  }
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="" />
                    <Label>{t("all")}</Label>
                  </div>

                  {RATING_THRESHOLDS.map((r) => (
                    <div key={r.value} className="flex items-center gap-2">
                      <RadioGroupItem value={String(r.value)} />
                      <Label>{r.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {localFilters.city && neighborhoods.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">{t("quartier")}</h3>

                  <RadioGroup
                    value={localFilters.neighborhood || ""}
                    onValueChange={(v) =>
                      setLocalFilters({
                        ...localFilters,
                        neighborhood: v || null,
                      })
                    }
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="" />
                      <Label>{t("all")}</Label>
                    </div>

                    {neighborhoods.map((n) => (
                      <div key={n.id} className="flex items-center gap-2">
                        <RadioGroupItem value={n.id} />
                        <Label>{n.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* AMENITIES */}
              <div>
                <h3 className="font-semibold mb-4">{t("amenities")}</h3>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {amenities.map((a) => (
                    <div key={a.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={localFilters.amenities.includes(a.id)}
                        onCheckedChange={() => toggleArray("amenities", a.id)}
                      />
                      <Label>{a.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="p-6 border-t flex gap-3">
          <Button variant="outline" className="flex-1" onClick={reset}>
            {t("resetFilters")}
          </Button>
          <Button className="flex-1" onClick={apply}>
            {t("showResults")} ({resultCount})
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default FilterDrawer;
