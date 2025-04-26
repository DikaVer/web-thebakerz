'use client';

import React, { useState, useCallback, ReactNode } from 'react';
import { SearchAddress } from './components/search-address';
import { ToggleDelivery } from './components/toggle-delivery';
import { Coordinates } from '@/lib/cookie';
import { useRouter } from 'next/navigation';

interface SearchComponentProps {
    initialCoords: Coordinates;
    initialDeliveryMode?: 'pickup' | 'delivery';
    children: ReactNode;
}

export function SearchComponent({ 
    initialCoords,
    initialDeliveryMode = 'pickup',
    children
}: SearchComponentProps) {
    const router = useRouter();

    // Client-side state primarily for controlling inputs and triggering navigation
    const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>(initialDeliveryMode);
    const [coords, setCoords] = useState<Coordinates>(initialCoords);
    const [city, setCity] = useState<string | undefined>();
    const [country, setCountry] = useState<string | undefined>();

    // Handler for location changes from SearchAddress
    const handleLocationUpdate = useCallback((newCoords: Coordinates, newCity?: string, newCountry?: string) => {
        // Update local state (optional, but can keep inputs consistent immediately)
        setCoords(newCoords);
        setCity(newCity);
        setCountry(newCountry);
        
        // Construct the new search params
        const params = new URLSearchParams();
        params.set('lat', newCoords.lat.toString());
        params.set('lng', newCoords.lng.toString());
        if (newCity) params.set('city', newCity);
        if (newCountry) params.set('country', newCountry);
        params.set('mode', deliveryMode);
        
        // Navigate to the same page with new params
        router.push(`/search?${params.toString()}`);
        
    }, [router, deliveryMode, coords, city, country]); // Dependencies

    // Handler for delivery mode changes
    const handleModeChange = useCallback((newMode: 'pickup' | 'delivery') => {
        // Update local state for toggle feedback
        setDeliveryMode(newMode);

        if (coords) { // Only navigate if we have coordinates
             // Construct the new search params
            const params = new URLSearchParams();
            params.set('lat', coords.lat.toString());
            params.set('lng', coords.lng.toString());
            if (city) params.set('city', city);
            if (country) params.set('country', country);
            params.set('mode', newMode);

            // Navigate to the same page with new params
            router.push(`/search?${params.toString()}`);
        }
    }, [router, deliveryMode, coords, city, country]); // Dependencies


    return (
        <div className="flex flex-col container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                <div className="md:col-span-2 order-2 md:order-1 md:pr-6">
                    {/* Render SearchAddress only after initial load */} 

                        <SearchAddress 
                            onLocationChange={handleLocationUpdate} 
                        />
                     {/* Show skeleton or placeholder while initial load happens */}
                    {/* {isInitialLoad && <div className="h-16 bg-default-200 rounded-xl animate-pulse"></div>} */}
                </div>
                <div className="md:col-span-1 flex items-start justify-end  order-1 md:order-2">
                    <ToggleDelivery 
                        currentMode={deliveryMode} 
                        onModeChange={handleModeChange} 
                        isLoading={false}
                    />
                </div>
            </div>

            {/* Store Results Area */} 
            <div className="mb-4">
                {children} 
            </div>
        </div>
    );
}
