'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { ProductFilter } from './ProductFilter';
import { useProductDialog, FilterParams } from '@/components/providers/product-provider';
import { Hint } from '@/components/ui/hint';
import { logger } from '@/lib/logger';
import { useDelivery } from '@/components/providers/delivery-provider';

interface FilterButtonWithHintProps {
  showHintDelay?: number;
  autoHideDelay?: number;
}

export const FilterButtonWithHint: React.FC<FilterButtonWithHintProps> = ({
  showHintDelay = 300,
  autoHideDelay = 11000
}) => {
  const { setFilterParams, filterParams, toggleProductSearch, isProductSearchOpen } = useProductDialog();
  const [showFilterHint, setShowFilterHint] = useState(false);
  const { validationResult } = useDelivery();

  // Show filter hint after a delay on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show hint if filter modal hasn't been opened yet
      if (!isProductSearchOpen) {
        setShowFilterHint(true);
      }
    }, showHintDelay);

    // Auto-hide hint after specified delay
    const autoHideTimer = setTimeout(() => {
      setShowFilterHint(false);
    }, autoHideDelay);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoHideTimer);
    };
  }, [validationResult, showHintDelay, autoHideDelay]);

  // Hide hint when filter modal is opened
  useEffect(() => {
    if (isProductSearchOpen) {
      setShowFilterHint(false);
    }
  }, [isProductSearchOpen]);

  // Handle filter changes from the filter component - direct without debounce
  const handleFilterChange = (newFilterParams: FilterParams) => {
    logger.debug('filter_change', 'FilterButtonWithHint received new filter params', newFilterParams);
    setFilterParams(newFilterParams);
  };

  // Toggle filter drawer and update search params
  const toggleFilterDrawer = () => {
    toggleProductSearch();
  };

  return (
    <>
      <div className="flex justify-end">
        <div className="flex relative items-center justify-center">
          <Button 
            variant="flat" 
            className="bg-background-secondary relative z-10"
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
          
          {/* Filter hint positioned relative to the button */}
          <Hint
            show={showFilterHint} 
            onDismiss={() => setShowFilterHint(false)} 
            text="Click here to filter products"
            icon={<Icon icon="material-symbols:filter-list" className="text-foreground" width={16} height={16} />}
          />
        </div>
      </div>

      <ProductFilter
        isOpen={isProductSearchOpen}
        onOpenChange={toggleProductSearch}
        onFilterChange={handleFilterChange}
        initialFilterParams={filterParams}
      />
    </>
  );
}; 