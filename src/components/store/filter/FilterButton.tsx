'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { ProductFilter } from './ProductFilter';
import { useProductDialog, FilterParams } from '@/components/providers/product-provider';
import { ProductData } from '@/lib/actions/product';

export const FilterButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { productsDataLocal, setFilterParams, filterParams } = useProductDialog();
  
  // Process product data to get filter options
  const { categories, allergies, dietary, maxPrice } = useMemo(() => {
    const productsArray: ProductData[] = Object.values(productsDataLocal || {});
    
    // Get all categories
    const categorySet = new Set<string>();
    productsArray.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    
    // Get unique allergies
    const allergySet = new Set<string>();
    productsArray.forEach(product => {
      if (product.allergies && Array.isArray(product.allergies)) {
        product.allergies.forEach(allergy => allergySet.add(allergy));
      }
    });
    
    // Get unique dietary restrictions
    const dietarySet = new Set<string>();
    productsArray.forEach(product => {
      if (product.dietary && Array.isArray(product.dietary)) {
        product.dietary.forEach(diet => dietarySet.add(diet));
      }
    });
    
    // Find max price for slider
    const maxPriceValue = productsArray.length > 0 
      ? Math.max(...productsArray.map(product => product.price))
      : 10000; // Default to 100€ (10000 cents)
    
    return {
      categories: Array.from(categorySet),
      allergies: Array.from(allergySet),
      dietary: Array.from(dietarySet),
      maxPrice: maxPriceValue
    };
  }, [productsDataLocal]);

  // Handle filter changes from the filter component - direct without debounce
  const handleFilterChange = (newFilterParams: FilterParams) => {
    setFilterParams(newFilterParams);
  };

  // Toggle filter drawer
  const toggleFilterDrawer = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      <div className="flex justify-end">
        <Button 
          variant="flat" 
          className="bg-background-secondary"
          size="sm"
          isIconOnly
          radius="sm"
          onPress={toggleFilterDrawer}
          aria-label="Filter products"
        >
          <Icon 
            icon="mage:filter"
            width={20}
            height={20}
          />
        </Button>
      </div>

      <ProductFilter
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        categories={categories}
        allergies={allergies}
        dietary={dietary}
        maxPrice={maxPrice}
        onFilterChange={handleFilterChange}
        initialFilterParams={filterParams}
      />
    </>
  );
}; 