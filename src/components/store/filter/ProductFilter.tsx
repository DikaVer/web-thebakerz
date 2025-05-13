'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import SidebarDrawer from '@/components/SidebarDrawer';
import { Button, Checkbox, CheckboxGroup, Slider, Divider, Spinner } from '@heroui/react';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import { iconAllergyMap } from '@/components/store/product/components/allergy-icons';
import { iconSuperMap } from '@/components/store/product/components/super-icons';
import { FilterParams } from '@/components/providers/product-provider';
import { formatCurrency } from '@/lib/utils';

interface ProductFilterProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  allergies: string[];
  dietary: string[];
  maxPrice: number; // price in cents
  initialFilterParams?: FilterParams;
  onFilterChange?: (filterParams: FilterParams) => void;
  isLoading?: boolean;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  isOpen,
  onOpenChange,
  categories = [],
  allergies = [],
  dietary = [],
  maxPrice = 10000, // default to 100€ (10000 cents)
  initialFilterParams,
  onFilterChange,
  isLoading = false
}) => {
  // Track if filters are being updated to prevent excessive updates
  const isUpdating = useRef(false);
  const lastUpdateTime = useRef<number>(0);
  const didMount = useRef(false);
  
  // Initialize state from initial filter params
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    // Use initialFilterParams or defaults
    if (initialFilterParams?.minPrice !== undefined && initialFilterParams?.maxPrice !== undefined) {
      return [initialFilterParams.minPrice, initialFilterParams.maxPrice];
    }
    return [0, maxPrice];
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
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
      if (initialFilterParams.minPrice !== undefined || initialFilterParams.maxPrice !== undefined) {
        setPriceRange([
          initialFilterParams.minPrice ?? 0,
          initialFilterParams.maxPrice ?? maxPrice
        ]);
      }
      
      if (initialFilterParams.categories) {
        setSelectedCategories(initialFilterParams.categories);
      } else {
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
  }, [initialFilterParams, maxPrice]);

  // Create a stable reference to the current filter values for the debounced function
  const filterValues = useRef({
    priceRange,
    selectedCategories,
    selectedAllergies,
    selectedDietary,
  });

  // Update ref whenever filter values change
  useEffect(() => {
    filterValues.current = {
      priceRange,
      selectedCategories,
      selectedAllergies,
      selectedDietary,
    };
  }, [priceRange, selectedCategories, selectedAllergies, selectedDietary]);

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
      
      const { priceRange, selectedCategories, selectedAllergies, selectedDietary } = filterValues.current;
      
      // Notify parent component about filter changes
      if (onFilterChange) {
        onFilterChange({
          minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
          maxPrice: priceRange[1] < maxPrice ? priceRange[1] : undefined,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          allergies: selectedAllergies.length > 0 ? selectedAllergies : undefined,
          dietary: selectedDietary.length > 0 ? selectedDietary : undefined
        });
      }
      
      // Reset the updating flag after a short delay to allow state to settle
      setTimeout(() => {
        isUpdating.current = false;
      }, 100);
    }, 300),
    [isOpen, maxPrice, onFilterChange]
  );

  // Update filters with a debounce to prevent excessive updates
  useEffect(() => {
    if (didMount.current) {
      updateFilters();
    }
    
    // Clean up the debounced function on unmount
    return () => {
      updateFilters.cancel();
    };
  }, [priceRange, selectedCategories, selectedAllergies, selectedDietary, isOpen, updateFilters]);

  // Reset all filters with throttling to prevent multiple resets
  const resetFilters = useCallback(
    throttle(() => {
      setPriceRange([0, maxPrice]);
      setSelectedCategories([]);
      setSelectedAllergies([]);
      setSelectedDietary([]);
    }, 300),
    [maxPrice]
  );

  // Handle slider change with throttling to prevent too many updates
  const handleSliderChange = useCallback(
    throttle((value: number | number[]) => {
      if (Array.isArray(value) && value.length === 2) {
        setPriceRange([value[0], value[1]]);
      }
    }, 100),
    []
  );

  // Handle checkbox group changes with throttling
  const handleCategoriesChange = useCallback(
    throttle((values: string[]) => {
      setSelectedCategories(values);
    }, 150),
    []
  );

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
      sidebarWidth={320}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Filter Products</h3>
          <Button 
            size="sm" 
            variant="ghost" 
            color="secondary"
            onPress={resetFilters}
          >
            Reset
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Price Range Filter - Always Show */}
            <div>
              <h4 className="font-medium mb-3">Price Range</h4>
              <Slider
                aria-label="Price range"
                defaultValue={priceRange}
                minValue={0}
                maxValue={maxPrice}
                step={50} // Step by 0.5€ (50 cents)
                value={priceRange}
                onChange={handleSliderChange}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-foreground-500">
                <span>{formatCurrency(priceRange[0])}</span>
                <span>{formatCurrency(priceRange[1])}</span>
              </div>
            </div>

            <Divider />

            {/* Categories Filter - Always Show */}
            <div>
              <h4 className="font-medium mb-3">Categories</h4>
              <CheckboxGroup
                value={selectedCategories}
                onValueChange={handleCategoriesChange}
                className="gap-2"
              >
                {categories.map((category) => (
                  <Checkbox key={category} value={category}>
                    <span className="capitalize">{category}</span>
                  </Checkbox>
                ))}
                {categories.length === 0 && (
                  <div className="text-sm text-gray-500 italic">No categories available</div>
                )}
              </CheckboxGroup>
            </div>

            {/* Allergies Filter - only show if allergies exist in products */}
            {allergies.length > 0 && (
              <>
                <Divider />
                <div>
                  <h4 className="font-medium mb-3">Exclude Allergies</h4>
                  <CheckboxGroup
                    value={selectedAllergies}
                    onValueChange={handleAllergiesChange}
                    className="gap-2"
                  >
                    {allergies.map((allergy) => (
                      <Checkbox key={allergy} value={allergy}>
                        {renderAllergyOption(allergy)}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                </div>
              </>
            )}

            {/* Dietary Filter - only show if dietary options exist in products */}
            {dietary.length > 0 && (
              <>
                <Divider />
                <div>
                  <h4 className="font-medium mb-3">Dietary Preferences</h4>
                  <CheckboxGroup
                    value={selectedDietary}
                    onValueChange={handleDietaryChange}
                    className="gap-2"
                  >
                    {dietary.map((diet) => (
                      <Checkbox key={diet} value={diet}>
                        {renderDietaryOption(diet)}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </SidebarDrawer>
  );
}; 