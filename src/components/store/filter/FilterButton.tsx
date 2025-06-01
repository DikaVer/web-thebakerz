'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { ProductFilter } from './ProductFilter';
import { useProductDialog, FilterParams } from '@/components/providers/product-provider';
import { ProductData } from '@/lib/actions/product';
import { logger } from '@/lib/logger';

export const FilterButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setFilterParams, filterParams } = useProductDialog();
  
  

  


  // Handle filter changes from the filter component - direct without debounce
  const handleFilterChange = (newFilterParams: FilterParams) => {
    logger.debug('filter_change', 'FilterButton received new filter params', newFilterParams);
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
            icon="material-symbols:search"
            width={20}
            height={20}
          />
        </Button>
      </div>

      <ProductFilter
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onFilterChange={handleFilterChange}
        initialFilterParams={filterParams}
      />
    </>
  );
}; 