'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import SidebarDrawer from '@/components/SidebarDrawer';
import { Button, Checkbox, CheckboxGroup, Select, SelectItem, Divider, Spinner } from '@heroui/react';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import { iconAllergyMap } from '@/components/store/product/components/allergy-icons';
import { iconSuperMap } from '@/components/store/product/components/super-icons';
import { FilterParams } from '@/components/providers/product-provider';
import { formatCurrency } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { categories } from '@/lib/local-variables';

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
  
  // Get all category names from the categories object
  const allCategories = useMemo(() => Object.keys(categories), []);
  
  // Generate price options with specified step increments
  const priceOptions = useMemo(() => {
    const options: number[] = [];
    // 0 to 100 with step 5
    for (let i = 0; i <= 10000; i += 500) {
      options.push(i);
    }
    // 150 to 1000 with step 50
    for (let i = 15000; i <= 100000; i += 5000) {
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
    return 0;
  });
  
  const [maxPrice, setMaxPrice] = useState<number>(() => {
    // Use initialFilterParams or defaults
    if (initialFilterParams?.maxPrice !== undefined) {
      return initialFilterParams.maxPrice;
    }
    return 10000;
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    // If there are categories in initialFilterParams, use those
    // Otherwise select all categories by default
    return initialFilterParams?.categories || [...allCategories];
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
        setMinPrice(0);
      }
      
      if (initialFilterParams.maxPrice !== undefined) {
        setMaxPrice(initialFilterParams.maxPrice);
      } else {
        setMaxPrice(100000);
      }
      
      if (initialFilterParams.categories) {
        setSelectedCategories(initialFilterParams.categories);
      } else {
        // If no categories specified, select all by default
        setSelectedCategories([...allCategories]);
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
      logger.debug('filter_update', 'ProductFilter sending filter values', {
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 100000 ? maxPrice : undefined,
        minPriceType: typeof minPrice,
        maxPriceType: typeof maxPrice
      });
      
      // Notify parent component about filter changes
      if (onFilterChange) {
        onFilterChange({
          minPrice: minPrice > 0 ? minPrice : undefined,
          maxPrice: maxPrice < 1000000 ? maxPrice : undefined,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          allergies: selectedAllergies.length > 0 ? selectedAllergies : undefined,
          dietary: selectedDietary.length > 0 ? selectedDietary : undefined
        });
      }
      
      // Reset the updating flag after a short delay to allow state to settle
      setTimeout(() => {
        isUpdating.current = false;
      }, 2000);
    }, 1000),
    [isOpen, onFilterChange]
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
  }, [minPrice, maxPrice, selectedCategories, selectedAllergies, selectedDietary, isOpen, updateFilters]);

  // Reset all filters with throttling to prevent multiple resets
  const resetFilters = useCallback(
    throttle(() => {
      setMinPrice(0);
      setMaxPrice(10000);
      setSelectedCategories([...allCategories]);
      setSelectedAllergies([]);
      setSelectedDietary([]);
    }, 300),
    [allCategories]
  );

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
      setSelectedCategories(values);
    }, 150),
    []
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-foreground-500 mb-1 block">Min Price</label>
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
                  <label className="text-sm text-foreground-500 mb-1 block">Max Price</label>
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

            {/* Categories Filter - Always Show */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Categories</h4>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  color="secondary"
                  onPress={removeAllCategories}
                >
                  Remove All
                </Button>
              </div>
              <CheckboxGroup
                value={selectedCategories}
                onValueChange={handleCategoriesChange}
                className="gap-2"
              >
                {allCategories.map((category) => (
                  <Checkbox key={category} value={category}>
                    <span className="capitalize">{category}</span>
                  </Checkbox>
                ))}
                {allCategories.length === 0 && (
                  <div className="text-sm text-gray-500 italic">No categories available</div>
                )}
              </CheckboxGroup>
            </div>

            <Divider />

            {/* Allergies Filter - Show only specified allergies */}
            <div>
              <h4 className="font-medium mb-3">Exclude Allergies</h4>
              <CheckboxGroup
                value={selectedAllergies}
                onValueChange={handleAllergiesChange}
                className="gap-2"
              >
                {ALLERGY_OPTIONS.map((allergy) => (
                  <Checkbox key={allergy} value={allergy}>
                    {renderAllergyOption(allergy)}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </div>

            <Divider />

            {/* Dietary Filter - Show all dietary options */}
            <div>
              <h4 className="font-medium mb-3">Dietary Preferences</h4>
              <CheckboxGroup
                value={selectedDietary}
                onValueChange={handleDietaryChange}
                className="gap-2"
              >
                {Object.keys(iconSuperMap).map((diet) => (
                  <Checkbox key={diet} value={diet}>
                    {renderDietaryOption(diet)}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </div>
          </div>
        )}
      </div>
    </SidebarDrawer>
  );
}; 