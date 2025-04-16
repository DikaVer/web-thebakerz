'use client';

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { Spinner } from '@heroui/react';
import { SearchAddress } from './components/search-address';
import { ToggleDelivery } from './components/toggle-delivery';
import { StorePanel } from './components/store-panel';
import { findNearbyStores, NearbyStore } from '@/lib/actions/store';
import { Coordinates } from '@/lib/cookie';
import { useTranslations } from 'next-intl';
import { getSearchCity, getSearchCoordinates } from '@/lib/cookie';
import { useMediaQuery } from 'usehooks-ts';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';

interface SearchComponentProps {
    initialCoords?: Coordinates | null;
    initialCity?: string | null;
    initialDeliveryMode?: 'pickup' | 'delivery';
    children: ReactNode;
}

export function SearchComponent({ 
    initialCoords: serverInitialCoords = null,
    initialCity: serverInitialCity = null,
    initialDeliveryMode: serverInitialDeliveryMode = 'pickup',
    children
}: SearchComponentProps) {
    const t = useTranslations("search");
    const router = useRouter();

    // Client-side state primarily for controlling inputs and triggering navigation
    const [coords, setCoords] = useState<Coordinates | null>(serverInitialCoords);
    const [city, setCity] = useState<string | null>(serverInitialCity);
    const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>(serverInitialDeliveryMode);
    const [initialAddress, setInitialAddress] = useState<string | undefined>(undefined);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const isSmall = useMediaQuery("(max-width: 540px)");

    // Effect to derive initial address for the input (can be simplified)
    useEffect(() => {
        let addressForInput: string | undefined;
        if (serverInitialCity) {
            addressForInput = serverInitialCity;
        } else if (serverInitialCoords) {
            addressForInput = "Selected Location"; 
        }
        setInitialAddress(addressForInput);
        setIsInitialLoad(false);
    }, [serverInitialCoords, serverInitialCity]);

    // Handler for location changes from SearchAddress
    const handleLocationUpdate = useCallback((newCoords: Coordinates, newCity: string | null) => {
        // Update local state (optional, but can keep inputs consistent immediately)
        setCoords(newCoords);
        setCity(newCity);
        
        // Construct the new search params
        const params = new URLSearchParams();
        params.set('lat', newCoords.lat.toString());
        params.set('lng', newCoords.lng.toString());
        if (newCity) params.set('city', newCity);
        params.set('mode', deliveryMode);
        
        // Navigate to the same page with new params
        router.push(`/search?${params.toString()}`);
        
    }, [router, deliveryMode]); // Dependencies

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
            params.set('mode', newMode);

            // Navigate to the same page with new params
            router.push(`/search?${params.toString()}`);
        }
    }, [router, coords, city]); // Dependencies


    return (
        <div className="flex flex-col container mx-auto px-4 py-8">
            {/* City Display */}
            {city && (
                <div className="mb-4 flex items-center gap-2">
                    <span className="text-lg font-medium">{city}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                <div className="md:col-span-2 order-2 md:order-1 md:pr-6">
                    {/* Render SearchAddress only after initial load */} 
                     {!isInitialLoad && (
                        <SearchAddress 
                            initialAddress={initialAddress}
                            initialCoords={coords}
                            initialCity={city}
                            onLocationChange={handleLocationUpdate} 
                        />
                    )}
                     {/* Show skeleton or placeholder while initial load happens */}
                    {isInitialLoad && <div className="h-16 bg-default-200 rounded-xl animate-pulse"></div>}
                </div>
                <div className="md:col-span-1 flex items-start justify-end  order-1 md:order-2">
                    <ToggleDelivery 
                        currentMode={deliveryMode} 
                        onModeChange={handleModeChange} 
                        isLoading={false}
                        isDisabled={!coords}
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
