// components/LocationMap.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { useGoogleMaps, DEFAULT_CENTER } from '@/components/providers/google-maps-provider';
import { logger } from "@/lib/logger"; // Import logger
import { Link } from "@heroui/react";
import { useSignInModal } from "@/components/ui/modal-signin";
import { useSession } from "@/components/providers/session-provider";

interface LocationMapProps {
    latitude: number;
    longitude: number;
    zoom?: number;
    height?: number | string;
    className?: string;
    onMapLoaded?: () => void;
    interactive?: boolean;
}

const LocationMap: React.FC<LocationMapProps> = ({
    latitude,
    longitude,
    zoom = 15,
    height = '100%',
    onMapLoaded,
    className,
    interactive = false,
}) => {
    const t = useTranslations("app/(store)/components/location-map");
    const { isLoaded: isMapsApiReady, loadError } = useGoogleMaps();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<any>(null); // Using 'any' for AdvancedMarkerElement if specific type is complex
    const [isMapVisible, setIsMapVisible] = useState(false);
    const { openModal, ModalSign } = useSignInModal();
    const { session } = useSession();
    
    // Memoize position to prevent unnecessary updates, handle 0 as valid coordinate
    const position = useMemo(() => ({
        lat: typeof latitude === 'number' ? latitude : DEFAULT_CENTER.lat,
        lng: typeof longitude === 'number' ? longitude : DEFAULT_CENTER.lng
    }), [latitude, longitude]);
    
    // Ref to hold the current position for stable access in callbacks
    const currentPositionRef = useRef(position);
    useEffect(() => {
        currentPositionRef.current = position;
    }, [position]);
    
    // Debounce timer refs
    const mapPanDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const resizeDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    
    // Initialize map when API is ready
    const initializeMap = useCallback(async () => {
        if (mapInstanceRef.current) return; // Guard: Do not re-initialize if map already exists
        if (!mapRef.current || !isMapsApiReady || loadError) return;
        if (!window.google || !window.google.maps) {
            logger.error("LocationMap", "Google Maps API not available yet.");
            return;
        }
        
        try {
            // Import required libraries
            const { Map, RenderingType } = await window.google.maps.importLibrary("maps") as google.maps.MapsLibrary;
            const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
            
            // Configure map options
            const mapOptions: google.maps.MapOptions = {
                center: currentPositionRef.current,
                zoom: zoom,
                mapId: 'DEMO_MAP_ID', // Use your actual map ID in production
                renderingType: RenderingType.VECTOR, // Enable vector rendering for modern look
                disableDefaultUI: !interactive,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControl: interactive,
                clickableIcons: interactive,
                draggable: interactive,
                scrollwheel: interactive,
                disableDoubleClickZoom: !interactive,
                gestureHandling: interactive ? 'cooperative' : 'none',
                keyboardShortcuts: interactive,
                tiltInteractionEnabled: false, // Often best to disable for simple locational maps
            };
            
            // Create the map
            const map = new Map(mapRef.current, mapOptions);
            mapInstanceRef.current = map;
            
            // Create custom marker
            const marker = new AdvancedMarkerElement({
                map,
                position: currentPositionRef.current,
                title: t('storeLocation') || 'Store Location',
            });
            
            markerRef.current = marker;
            
            // Show map after initialization
            setIsMapVisible(true);
            
        } catch (error) {
            logger.error('LocationMap', 'Error initializing map:', { error });
        }
    }, [isMapsApiReady, loadError, zoom, t, interactive, onMapLoaded]); // currentPositionRef is stable

    // Initialize map effect
    useEffect(() => {

        initializeMap();
        
        return () => {
            // Clean up resources on unmount
            if (markerRef.current) {
                // @ts-ignore // AdvancedMarkerElement might not have 'map' directly assignable to null in some TS versions
                markerRef.current.map = null; 
                markerRef.current = null;
            }
            
            if (mapPanDebounceTimerRef.current) {
                clearTimeout(mapPanDebounceTimerRef.current);
                mapPanDebounceTimerRef.current = null;
            }

            if (resizeDebounceTimerRef.current) { // Ensure resize timer is also cleared
                clearTimeout(resizeDebounceTimerRef.current);
                resizeDebounceTimerRef.current = null;
            }
            
            // Note: Google Map instances are often managed by the API, direct destruction might not be needed
            // or could lead to issues. If issues persist, consult Google Maps API documentation on cleanup.
            mapInstanceRef.current = null;
        };
    }, []);

    // Handle resize events with debouncing
    useEffect(() => {
        if (!mapRef.current || !isMapsApiReady || !mapInstanceRef.current) return; // Ensure map is ready for resize observation
        
        const handleResize = () => {
            if (resizeDebounceTimerRef.current) {
                clearTimeout(resizeDebounceTimerRef.current);
            }
            
            resizeDebounceTimerRef.current = setTimeout(() => {
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.setCenter(currentPositionRef.current);
                }
                resizeDebounceTimerRef.current = null;
            }, 250); // Debounce time for resize
        };
        
        const currentMapContainer = mapRef.current; // Capture for cleanup
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(currentMapContainer);
        
        return () => {
            if (currentMapContainer) { // Check if ref still exists
              resizeObserver.unobserve(currentMapContainer);
            }
            resizeObserver.disconnect();
            if (resizeDebounceTimerRef.current) {
                clearTimeout(resizeDebounceTimerRef.current);
                resizeDebounceTimerRef.current = null;
            }
        };
    }, [isMapsApiReady]); // Only depends on isMapsApiReady to setup/teardown observer

    // Generate the Google Maps URL
    const mapUrl = useMemo(() => {
      const lat = typeof latitude === 'number' ? latitude : DEFAULT_CENTER.lat;
      const lng = typeof longitude === 'number' ? longitude : DEFAULT_CENTER.lng;
      return `https://www.google.com/maps?q=${lat},${lng}`;
    }, [latitude, longitude]);

    // Handle map click with authentication check
    const handleMapClick = (e: React.MouseEvent) => {
        if (!session?.user) {
            e.preventDefault();
            openModal();
        } else {
            window.open(mapUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <>
            {/* Sign-in modal */}
            <ModalSign 
                message="And you can access location details and directions"
            />
            
            <Link
                isExternal
                href="#"
                onClick={handleMapClick}
                aria-label={t("viewOnGoogleMaps")}
                className={`block overflow-hidden rounded-lg rounded-t-none md:rounded-lg md:rounded-l-none relative duration-300 ${className || ''}`}
                style={{ height, minHeight: '200px' }}
            >
                <div className="relative w-full h-full" style={{ minHeight: 'inherit' }}>
                    <div 
                        ref={mapRef} 
                        className={`w-full h-full transition-opacity duration-300 ${isMapVisible ? 'opacity-100' : 'opacity-0'}`}
                        style={{ minHeight: 'inherit' }}
                        aria-label={"Store location map"} // More specific ARIA label
                    >
                        {/* Error state */}
                        {loadError && (
                             <div className="absolute inset-0 bg-danger-50 flex flex-col items-center justify-center text-center p-4">
                                <Icon icon="solar:danger-triangle-bold-duotone" className="text-danger text-3xl mb-2"/>
                                <span className="text-danger-700 text-sm font-medium">{t("errorLoadingMap")}</span>
                                <span className="text-danger-500 text-xs mt-1">{loadError.message}</span>
                             </div>
                        )}
                        {/* Loading state */}
                        {!isMapsApiReady && !loadError && (
                            <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center">
                                <Icon icon="svg-spinners:ring-resize" className="text-gray-400 text-3xl mb-2" />
                                <span className="text-gray-500 text-sm">{t("loadingMap")}</span>
                            </div>
                        )}
                    </div>
                    {/* Border overlay */}
                    <div className="absolute inset-0 border border-default-200 pointer-events-none rounded-lg"></div>
                    {/* "View on Google Maps" button */}
                    <div className="absolute top-3 right-3 bg-black/75 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm transition-all hover:scale-105 hover:bg-black/90 flex items-center shadow-md">
                        <Icon icon="solar:map-arrow-right-bold-duotone" className="mr-1.5 text-white" width="14" height="14" />
                        {t("viewOnGoogleMaps")}
                    </div>
                </div>
            </Link>
        </>
    );
};

export default LocationMap;
