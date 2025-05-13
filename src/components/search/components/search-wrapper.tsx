'use client';

import React from 'react';
import { Suspense } from 'react';
import { Coordinates, DeliveryMode } from '@/lib/delivery-cookie';
import { useProductDialog } from '@/components/providers/product-provider';
import { StorePanelSkeleton } from '@/components/search/components/store-panel-skeleton';
import ProductResults from './product-results';

interface SearchWrapperProps {
    initialCoords: Coordinates;
    initialDeliveryMode: DeliveryMode;
    initialCountry?: string;
    storeResults: React.ReactNode;
}

const SearchWrapper: React.FC<SearchWrapperProps> = ({
    initialCoords,
    initialDeliveryMode,
    initialCountry,
    storeResults
}) => {
    const { filterParams } = useProductDialog();

    const areProductFiltersActive = 
        (filterParams.categories?.length ?? 0) > 0 ||
        (filterParams.allergies?.length ?? 0) > 0 ||
        (filterParams.dietary?.length ?? 0) > 0 ||
        filterParams.minPrice !== undefined ||
        filterParams.maxPrice !== undefined;

    const suspenseKey = `${initialCoords.lat}-${initialCoords.lng}-${initialDeliveryMode}-${initialCountry}-${JSON.stringify(filterParams)}`;

    return (
        <Suspense key={suspenseKey} fallback={<StorePanelSkeleton />}>
            {areProductFiltersActive ? (
                <ProductResults />
            ) : (
                storeResults
            )}
        </Suspense>
    );
};

export default SearchWrapper; 