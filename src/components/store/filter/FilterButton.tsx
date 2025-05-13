'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { ProductFilter } from './ProductFilter';
import { useProductDialog, FilterParams } from '@/components/providers/product-provider';
import { ProductData } from '@/lib/actions/product';

export const FilterButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { productsDataLocal, setFilterParams, filterParams } = useProductDialog();
  
  // State for filter options
  const [categories, setCategories] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Fetch filter options from global products
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsLoading(true);
      try {
        // Fetch first page of all products without any filters
        const response = await fetch('/api/products/filter-options');
        if (!response.ok) throw new Error('Failed to fetch filter options');
        
        const { categories, allergies, dietary, maxPrice } = await response.json();
        
        setCategories(categories || []);
        setAllergies(allergies || []);
        setDietary(dietary || []);
        setMaxPrice(maxPrice || 10000);
      } catch (error) {
        console.error('Error fetching filter options:', error);
        // Fallback to local product data if API fails
        fallbackToLocalData();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFilterOptions();
  }, []);
  
  // Fallback function to use local product data if API fails
  const fallbackToLocalData = () => {
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
    
    setCategories(Array.from(categorySet));
    setAllergies(Array.from(allergySet));
    setDietary(Array.from(dietarySet));
    setMaxPrice(maxPriceValue);
  };

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
        isLoading={isLoading}
      />
    </>
  );
}; 