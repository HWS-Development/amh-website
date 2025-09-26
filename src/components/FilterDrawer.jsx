import React, { useState, useEffect, useMemo } from 'react';
    import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
    import { Button } from '@/components/ui/button';
    import { Checkbox } from '@/components/ui/checkbox';
    import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
    import { Label } from '@/components/ui/label';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Loader2 } from 'lucide-react';

    const RATING_THRESHOLDS = {
      '4.9': '4.9+',
      '4.5': '4.5+',
      '4.0': '4.0+',
    };

    const normalizeQuartier = (quartier) => {
      if (!quartier) return null;
      try {
        const parsed = JSON.parse(quartier);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch (e) {
        // Not a JSON string, return as is
      }
      return quartier.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const FilterDrawer = ({ open, onOpenChange, filters, onFiltersChange, resultCount }) => {
      const { t } = useLanguage();
      const [localFilters, setLocalFilters] = useState(filters);
      const [options, setOptions] = useState({ cities: [], quartiers: [], amenities: [] });
      const [loading, setLoading] = useState(false);
      const [loadingDependents, setLoadingDependents] = useState(false);

      useEffect(() => {
        setLocalFilters(filters);
      }, [filters, open]);

      useEffect(() => {
        const fetchOptions = async () => {
          if (!open) return;
          setLoading(true);

          let query = supabase.from('mgh_properties').select('city, amenities');
          
          const { data, error } = await query;
          
          if (error) {
            console.error('Error fetching filter options:', error);
          } else {
            const cities = [...new Set(data.map(r => r.city).filter(Boolean))].sort();
            const amenities = [...new Set(data.flatMap(r => r.amenities || []).filter(Boolean))].sort();
            
            setOptions(prev => ({ ...prev, cities, amenities }));
          }
          setLoading(false);
        };
        fetchOptions();
      }, [open]);

      useEffect(() => {
        const fetchDependentQuartiers = async () => {
            const selectedCities = localFilters.cities || [];
            if (!open || selectedCities.length === 0) {
                setOptions(prev => ({ ...prev, quartiers: [] }));
                return;
            }

            setLoadingDependents(true);
            let query = supabase.from('mgh_properties').select('quartier').in('city', selectedCities);

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching dependent quartiers:", error);
                setOptions(prev => ({...prev, quartiers: []}));
            } else {
                const quartiers = [...new Set(
                    data
                    .map(r => normalizeQuartier(r.quartier))
                    .filter(Boolean)
                )].sort();
                setOptions(prev => ({...prev, quartiers}));
            }
            setLoadingDependents(false);
        };

        fetchDependentQuartiers();
      }, [localFilters.cities, open]);


      const handleMultiSelectChange = (key, value) => {
        const currentValues = localFilters[key] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        const newFilters = { ...localFilters, [key]: newValues };
        
        if (key === 'cities') {
          newFilters.quartiers = [];
        }
        setLocalFilters(newFilters);
      };

      const handleRatingChange = (value) => {
        setLocalFilters({ ...localFilters, rating: value });
      };

      const handleApplyFilters = () => {
        onFiltersChange(localFilters);
        onOpenChange(false);
      };

      const handleReset = () => {
        const reset = { cities: [], quartiers: [], amenities: [], rating: null };
        setLocalFilters(reset);
        onFiltersChange(reset);
      };

      const renderSection = (title, items, key, isLoading = false) => (
        <div>
          <h3 className="font-semibold text-lg mb-4">{t(title)}</h3>
          {isLoading ? (
             <div className="flex justify-center items-center h-20">
                <Loader2 className="w-6 h-6 text-brand-action animate-spin" />
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {items.length > 0 ? items.map((item) => (
                <div key={item} className="flex items-center space-x-3">
                    <Checkbox
                    id={`${key}-${item}`}
                    checked={(localFilters[key] || []).includes(item)}
                    onCheckedChange={() => handleMultiSelectChange(key, item)}
                    />
                    <Label htmlFor={`${key}-${item}`} className="font-normal capitalize cursor-pointer">{item}</Label>
                </div>
                )) : <p className="text-sm text-gray-500">{t('noOptionsAvailable')}</p>}
            </div>
          )}
        </div>
      );

      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="right" className="w-full sm:max-w-md lg:max-w-lg flex flex-col">
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="text-2xl font-bold">{t('filters')}</SheetTitle>
            </SheetHeader>
            <div className="p-6 flex-grow overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-8 h-8 text-brand-action animate-spin" />
                </div>
              ) : (
                <div className="space-y-8">
                  {renderSection('cities', options.cities, 'cities')}
                  
                  {(localFilters.cities?.length > 0) && renderSection('quartier', options.quartiers, 'quartiers', loadingDependents)}
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-4">{t('guestRating')}</h3>
                    <RadioGroup
                      value={localFilters.rating || ''}
                      onValueChange={handleRatingChange}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                          <RadioGroupItem value="" id="rating-all" />
                          <Label htmlFor="rating-all" className="font-normal cursor-pointer">{t('all')}</Label>
                      </div>
                      {Object.entries(RATING_THRESHOLDS).map(([value, label]) => (
                        <div key={value} className="flex items-center space-x-2">
                          <RadioGroupItem value={value} id={`rating-${value}`} />
                          <Label htmlFor={`rating-${value}`} className="font-normal cursor-pointer">{label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {renderSection('amenities', options.amenities, 'amenities')}
                </div>
              )}
            </div>
            <SheetFooter className="p-6 border-t bg-white mt-auto">
              <div className="w-full flex gap-4">
                <Button variant="outline" className="flex-1" onClick={handleReset}>{t('resetFilters')}</Button>
                <Button className="flex-1" onClick={handleApplyFilters}>
                  {t('showResults')} ({resultCount !== null ? resultCount : '...'})
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );
    };

    export default FilterDrawer;