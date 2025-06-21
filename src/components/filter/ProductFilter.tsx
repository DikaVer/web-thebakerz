'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import SidebarDrawer from '@/components/SidebarDrawer';
import { Button, Checkbox, CheckboxGroup, Select, SelectItem, Divider, Spinner, Accordion, AccordionItem } from '@heroui/react';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import { iconAllergyMap } from '@/components/store/product/components/allergy-icons';
import { iconSuperMap } from '@/components/store/product/components/super-icons';
import { FilterParams } from '@/components/providers/product-provider';
import { formatCurrency } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { categories } from '@/lib/local-variables';
import { useTranslations } from 'next-intl';
import { CustomOrderButton } from '@/components/ui/custom-order-button';
import { RescueDealsSwitch } from '@/components/ui/rescue-deals-switch';
import { usePathname } from 'next/navigation';

interface ProductFilterProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialFilterParams?: FilterParams;
  onFilterChange?: (filterParams: FilterParams) => void;
  isLoading?: boolean;
}

// Predefined allergies list for exclusion
const ALLERGY_OPTIONS = [
  'honey', 'banana', 'orange', 'soy', 'lupine', 'apple', 'sesame', 'kiwi', 
  'peach', 'gelatin', 'wheat', 'gluten', 'nuts', 'cashew', 'walnut', 'egg', 'milk'
];

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 100000;

export const ProductFilter: React.FC<ProductFilterProps> = ({
  isOpen,
  onOpenChange,
  initialFilterParams,
  onFilterChange,
  isLoading = false
}) => {
  // Track if filters are being updated to prevent excessive updates
  const isUpdating = useRef(false);
  const lastUpdateTime = useRef<number>(0);
  const didMount = useRef(false);
  const t = useTranslations("filter");
  const pathname = usePathname();
  
  // Get all category names from the categories object
  const allCategories = useMemo(() => Object.keys(categories), []);
  
  // Generate price options with specified step increments
  const priceOptions = useMemo(() => {
    const options: number[] = [];
    // 0 to 100 with step 5
    for (let i = 0; i <= DEFAULT_MAX_PRICE; i += 500) {
      options.push(i);
    }
    // 150 to 1000 with step 50
    for (let i = 15000; i <= DEFAULT_MAX_PRICE; i += 5000) {
      options.push(i);
    }
    return options;
  }, []);
  
  // Initialize state from initial filter params
  const [minPrice, setMinPrice] = useState<number>(() => {
    // Use initialFilterParams or defaults
    if (initialFilterParams?.minPrice !== undefined) {
      return initialFilterParams.minPrice;
    }
    return DEFAULT_MIN_PRICE;
  });
  
  const [maxPrice, setMaxPrice] = useState<number>(() => {
    // Use initialFilterParams or defaults
    if (initialFilterParams?.maxPrice !== undefined) {
      return initialFilterParams.maxPrice;
    }
    return DEFAULT_MAX_PRICE;
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    // If there are categories in initialFilterParams, use those
    // Otherwise select all categories by default
    return initialFilterParams?.categories || [];
  });
  
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(() => {
    return initialFilterParams?.allergies || [];
  });
  
  const [selectedDietary, setSelectedDietary] = useState<string[]>(() => {
    return initialFilterParams?.dietary || [];
  });

  // Update states when initialFilterParams change, but only when not in the middle of updating
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    
    if (initialFilterParams && !isUpdating.current) {
      if (initialFilterParams.minPrice !== undefined) {
        setMinPrice(initialFilterParams.minPrice);
      } else {
        setMinPrice(DEFAULT_MIN_PRICE);
      }
      
      if (initialFilterParams.maxPrice !== undefined) {
        setMaxPrice(initialFilterParams.maxPrice);
      } else {
        setMaxPrice(DEFAULT_MAX_PRICE);
      }
      
      if (initialFilterParams.categories) {
        setSelectedCategories(initialFilterParams.categories);
      } else {
        // If no categories specified, select all by default
        setSelectedCategories([]);
      }
      
      if (initialFilterParams.allergies) {
        setSelectedAllergies(initialFilterParams.allergies);
      } else {
        setSelectedAllergies([]);
      }
      
      if (initialFilterParams.dietary) {
        setSelectedDietary(initialFilterParams.dietary);
      } else {
        setSelectedDietary([]);
      }
    }
  }, [initialFilterParams, allCategories]);

  // Create a stable reference to the current filter values for the debounced function
  const filterValues = useRef({
    minPrice,
    maxPrice,
    selectedCategories,
    selectedAllergies,
    selectedDietary,
  });

  // Update ref whenever filter values change
  useEffect(() => {
    filterValues.current = {
      minPrice,
      maxPrice,
      selectedCategories,
      selectedAllergies,
      selectedDietary,
    };
    logger.debug('[ProductFilter] filterValues.current updated. selectedCategories:', JSON.stringify(selectedCategories));
  }, [minPrice, maxPrice, selectedCategories, selectedAllergies, selectedDietary]);

  // Debounced function to notify parent of filter changes
  const updateFilters = useCallback(
    debounce(() => {
      if (!isOpen) return;
      
      // Only update if enough time has passed since last update to prevent rapid changes
      const now = Date.now();
      if (now - lastUpdateTime.current < 300) {
        return;
      }
      
      lastUpdateTime.current = now;
      isUpdating.current = true;
      
      const { minPrice, maxPrice, selectedCategories, selectedAllergies, selectedDietary } = filterValues.current;
      
      // Log filter values before sending to parent
      const categoriesToSend = selectedCategories.length > 0 ? selectedCategories : undefined;
      logger.debug('[ProductFilter] filter_update', 'ProductFilter sending filter values', {
        minPrice: minPrice > DEFAULT_MIN_PRICE ? minPrice : undefined,
        maxPrice: maxPrice < DEFAULT_MAX_PRICE ? maxPrice : undefined,
        categories: categoriesToSend,
        allergies: selectedAllergies.length > 0 ? selectedAllergies : undefined,
        dietary: selectedDietary.length > 0 ? selectedDietary : undefined,
        minPriceType: typeof minPrice,
        maxPriceType: typeof maxPrice
      });
      
      // Notify parent component about filter changes
      if (onFilterChange) {
        onFilterChange({
          minPrice: minPrice > DEFAULT_MIN_PRICE ? minPrice : undefined,
          maxPrice: maxPrice < DEFAULT_MAX_PRICE ? maxPrice : undefined,
          categories: categoriesToSend,
          allergies: selectedAllergies.length > 0 ? selectedAllergies : undefined,
          dietary: selectedDietary.length > 0 ? selectedDietary : undefined
        });
      }
      
      // Reset the updating flag after a short delay to allow state to settle
      setTimeout(() => {
        isUpdating.current = false;
      }, 500); // Reduced delay from 2000ms
    }, 700), // Adjusted debounce time from 1000ms to 700ms
    [onFilterChange] // Removed isOpen. onFilterChange is the main prop dependency.
  );

  // Update filters with a debounce to prevent excessive updates
  useEffect(() => {
    if (didMount.current) {
      // logger.debug('[ProductFilter] useEffect triggering updateFilters due to state change. selectedCategories:', JSON.stringify(selectedCategories));
      updateFilters();
    } else {
      didMount.current = true; // Set didMount to true after the first render cycle for this effect
    }
    
    // Clean up the debounced function on unmount
    return () => {
      updateFilters.cancel();
    };
  }, [minPrice, maxPrice, selectedCategories, selectedAllergies, selectedDietary]);

  // Handle min price select change
  const handleMinPriceChange = useCallback((value: string) => {
    const newValue = Number(value);
    logger.debug('price_change', 'Min price changed', {
      newValue,
      valueType: typeof newValue
    });
    setMinPrice(newValue);
    // Ensure max is not less than min
    if (newValue > maxPrice) {
      setMaxPrice(newValue);
    }
  }, [maxPrice]);

  // Handle max price select change
  const handleMaxPriceChange = useCallback((value: string) => {
    const newValue = Number(value);
    logger.debug('price_change', 'Max price changed', {
      newValue,
      valueType: typeof newValue
    });
    setMaxPrice(newValue);
    // Ensure min is not greater than max
    if (newValue < minPrice) {
      setMinPrice(newValue);
    }
  }, [minPrice]);

  // Handle checkbox group changes with throttling
  const handleCategoriesChange = useCallback(
    throttle((values: string[]) => {
      logger.debug('[ProductFilter] handleCategoriesChange (throttled) called with values:', JSON.stringify(values));
      setSelectedCategories(values);
    }, 150), // Throttle time
    [] // No dependencies, so setSelectedCategories is from initial render, which is fine for useState setter
  );

  // Add function to remove all categories
  const removeAllCategories = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const handleAllergiesChange = useCallback(
    throttle((values: string[]) => {
      setSelectedAllergies(values);
    }, 150),
    []
  );

  const handleDietaryChange = useCallback(
    throttle((values: string[]) => {
      setSelectedDietary(values);
    }, 150),
    []
  );

  // Render allergy icon and label
  const renderAllergyOption = (allergy: string) => {
    const key = allergy.toLowerCase();
    const IconComponent = iconAllergyMap[key];
    
    return (
      <div className="flex items-center gap-2">
        {IconComponent && <IconComponent size={20} />}
        <span className="capitalize">{allergy.replace(/-/g, ' ')}</span>
      </div>
    );
  };

  // Render dietary icon and label
  const renderDietaryOption = (diet: string) => {
    const key = diet.toLowerCase();
    const IconComponent = iconSuperMap[key];
    
    return (
      <div className="flex items-center gap-2">
        {IconComponent && <IconComponent size={20} />}
        <span className="capitalize">{diet.replace(/-/g, ' ')}</span>
      </div>
    );
  };

  return (
    <SidebarDrawer 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      backdrop='blur'
      sidebarPlacement="right"
      sidebarWidth={375}
      className={'bg-background rounded-xl rounded-r-none'}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">{t("filterProducts")}</h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Rescue Deals Switch */}
            {!pathname.includes('search') && <RescueDealsSwitch />}

            {/* Price Range Filter - Always Show */}
            <div>
              <h4 className="font-medium mb-3">{t("priceRange")}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-foreground-500 mb-1 block">{t("minPrice")}</label>
                  <Select
                    aria-label="Minimum price"
                    selectedKeys={[minPrice.toString()]}
                    onSelectionChange={(keys) => {
                      if (typeof keys === "string") {
                        handleMinPriceChange(keys);
                      } else if (keys instanceof Set && keys.size > 0) {
                        handleMinPriceChange(Array.from(keys)[0] as string);
                      }
                    }}
                  >
                    {priceOptions.map((price) => (
                      <SelectItem key={price.toString()}>
                        {formatCurrency(price)}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-foreground-500 mb-1 block">{t("maxPrice")}</label>
                  <Select
                    aria-label="Maximum price"
                    selectedKeys={[maxPrice.toString()]}
                    onSelectionChange={(keys) => {
                      if (typeof keys === "string") {
                        handleMaxPriceChange(keys);
                      } else if (keys instanceof Set && keys.size > 0) {
                        handleMaxPriceChange(Array.from(keys)[0] as string);
                      }
                    }}
                  >
                    {priceOptions.map((price) => (
                      <SelectItem key={price.toString()}>
                        {formatCurrency(price)}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <Divider />

            {/* Remove All Button - Moved to upper position */}
            <div className="flex justify-end">
              <Button 
                aria-label="Remove all categories"
                size="sm" 
                variant="ghost" 
                color="secondary"
                onPress={removeAllCategories}
              >
                {t("removeAllCategories")}
              </Button>
            </div>

            {/* Filters Accordion */}
            <Accordion variant="bordered" selectionMode="multiple">
              {/* Categories Filter */}
              <AccordionItem key="categories" aria-label="Categories" title={t("categories")}>
                <CheckboxGroup
                  value={selectedCategories}
                  onValueChange={handleCategoriesChange}
                  className="gap-2"
                >
                  {allCategories.map((category) => (
                    <Checkbox
                        classNames={{
                          wrapper: 'before:border-background-secondary',
                        }}
                        key={category}
                        value={category}
                    >
                      <span className="capitalize">{category}</span>
                    </Checkbox>
                  ))}
                  {allCategories.length === 0 && (
                    <div className="text-sm text-gray-500 italic">No categories available</div>
                  )}
                </CheckboxGroup>
              </AccordionItem>

              {/* Allergies Filter */}
              <AccordionItem key="allergies" aria-label="Exclude Allergies" title={t("excludeAllergies")}>
                <CheckboxGroup
                  value={selectedAllergies}
                  onValueChange={handleAllergiesChange}
                  className="gap-2"
                >
                  {ALLERGY_OPTIONS.map((allergy) => (
                    <Checkbox
                          classNames={{
                              wrapper: 'before:border-background-secondary',
                          }}
                        key={allergy}
                        value={allergy}
                    >
                      {renderAllergyOption(allergy)}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </AccordionItem>

              {/* Dietary Filter */}
              <AccordionItem key="dietary" aria-label="Dietary Preferences" title={t("dietaryPreferences")}>
                <CheckboxGroup
                  value={selectedDietary}
                  onValueChange={handleDietaryChange}
                  className="gap-2"
                >
                  {Object.keys(iconSuperMap).map((diet) => (
                    <Checkbox
                        classNames={{
                            wrapper: 'before:border-background-secondary',
                        }}
                        key={diet}
                        value={diet}
                    >
                      {renderDietaryOption(diet)}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </AccordionItem>
            </Accordion>

            {/* Search/Apply Button */}
            <div className="pt-4">
              <Button
                className="w-full"
                color="primary"
                size="lg"
                onPress={() => onOpenChange(false)}
              >
                {t("search")}
              </Button>
            </div>
          </div>
        )}
        
        {/* <div className="flex items-center gap-4 mt-4">
            <Divider className="flex-1" />
            <span className="text-default-400">Or</span>
            <Divider className="flex-1" />
        </div>
        <p className="text-sm text-foreground-500 mt-4 w-full text-center">{t("special")}</p>
        <CustomOrderButton 
          className="w-full mt-4 justify-center"
        /> */}
      </div>
    </SidebarDrawer>
  );
}; 