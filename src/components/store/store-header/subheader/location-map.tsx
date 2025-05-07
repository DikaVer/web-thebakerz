// components/LocationMap.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { useGoogleMaps } from '@/components/providers/google-maps-provider';
import { logger } from '@/lib/logger';

interface LocationMapProps {
    latitude: number;
    longitude: number;
    zoom?: number;
    height?: number;
    className?: string;
    onMapLoaded: () => void;
}

const LocationMap: React.FC<LocationMapProps> = ({
    latitude,
    longitude,
    zoom = 15,
    height = 147,
    onMapLoaded,
    className,
}) => {
    const t = useTranslations("app/(store)/components/location-map");
    const { isLoaded: isMapsApiReady, loadError } = useGoogleMaps();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const circlesRef = useRef<google.maps.Circle[]>([]);
    const iconUrlRef = useRef<string | null>(null);


    // Create custom marker element using the exact Iconify icon
    const createCustomMarker = () => {
        if (!mapInstanceRef.current) return;
        
        // Create pure SVG for the marker with the correct shop icon - light blue background with white icon
        const iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="16" fill="#730c70" />
            <g fill="none" stroke="white" stroke-width="1.5"  transform="translate(6, 6) scale(0.8)">
                <path stroke-linecap="round" d="M22 22H2m18 0V11M4 22V11" />
                <path stroke-linejoin="round" d="M16.528 2H7.472c-1.203 0-1.804 0-2.287.299c-.484.298-.753.836-1.29 1.912L2.49 7.76c-.324.82-.608 1.786-.062 2.479A2 2 0 0 0 6 9a2 2 0 1 0 4 0a2 2 0 1 0 4 0a2 2 0 1 0 4 0a2 2 0 0 0 3.571 1.238c.546-.693.262-1.659-.062-2.479l-1.404-3.548c-.537-1.076-.806-1.614-1.29-1.912C18.332 2 17.731 2 16.528 2Z" />
                <path stroke-linecap="round" d="M9.5 21.5v-3c0-.935 0-1.402.201-1.75a1.5 1.5 0 0 1 .549-.549C10.598 16 11.065 16 12 16s1.402 0 1.75.201a1.5 1.5 0 0 1 .549.549c.201.348.201.815.201 1.75v3" />
            </g>
        </svg>`;
        
        // Create a blob URL for the SVG
        const blob = new Blob([iconSvg], {type: 'image/svg+xml'});
        const iconUrl = URL.createObjectURL(blob);
        iconUrlRef.current = iconUrl;
        
        // Create the marker with proper configuration - properly centered
        const marker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: mapInstanceRef.current,
            icon: {
                url: iconUrl,
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 16) // Center point of the marker
            },
            optimized: false,
            clickable: false,
            zIndex: 10
        });
        markerRef.current = marker;
        
        // Create circles with consistent configuration
        const createCircle = (radius: number, fillOpacity: number, zIndex: number) => {
            const circle = new google.maps.Circle({
                strokeWeight: 0,
                fillColor: "#730c70",
                fillOpacity,
                map: mapInstanceRef.current,
                center: { lat: latitude, lng: longitude },
                radius,
                zIndex,
                clickable: false
            });
            circlesRef.current.push(circle);
            return circle;
        };
        
        // Create the four circles with different radii and opacities
        createCircle(80, 0.25, 5);  // First circle (closest to marker)
        createCircle(120, 0.2, 4);  // Second circle
        createCircle(160, 0.1, 3);  // Third circle
        createCircle(200, 0.05, 2); // Fourth circle (outermost)
    };

    // Initialize map once script is loaded
    const initializeMap = () => {
        if (!mapRef.current || mapInstanceRef.current) return;

        if (!window.google || !window.google.maps) {
            logger.error('LocationMap', 'Google Maps API not available for initialization');
            return;
        }

        const mapOptions = {
            center: { lat: latitude, lng: longitude },
            zoom: zoom,
            disableDefaultUI: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: false,
            
            // Disable all interactions
            draggable: false,
            scrollwheel: false,
            disableDoubleClickZoom: true,
            gestureHandling: 'none',
            keyboardShortcuts: false,
            
            styles: [
                { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
                { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] },
                { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": 40 }, { "lightness": 40 }] },
                { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#d3eaf8" }] }
            ]
        };

        // Create the map
        const map = new google.maps.Map(mapRef.current, mapOptions);
        
        // Make sure the map is properly centered after it loads
        google.maps.event.addListenerOnce(map, 'idle', () => {
            map.setCenter({ lat: latitude, lng: longitude });
            mapInstanceRef.current = map;
            onMapLoaded?.();
            createCustomMarker();
        });
    };


    // Initialize map when Google Maps script is loaded
    useEffect(() => {
        // Initialize map only when API is loaded and no error occurred
        if (isMapsApiReady && !loadError) {
            logger.debug('LocationMap', 'Google Maps ready, initializing map.');
            initializeMap();
        } else if (loadError) {
            logger.error('LocationMap', 'Cannot initialize map due to Google Maps loading error:', { loadError });
        } else {
            logger.debug('LocationMap', 'Google Maps not ready yet.');
            // Optional: You could implement a timeout here if needed, but the provider handles loading.
        }
        
        // Clean up map on unmount
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
            }
            if (iconUrlRef.current) {
                URL.revokeObjectURL(iconUrlRef.current);
            }
        };
    }, [isMapsApiReady, loadError, latitude, longitude]);


    return (
        <a 
            href={`https://www.google.com/maps?q=${latitude},${longitude}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label={t("viewOnGoogleMaps")}
            className={`block overflow-hidden rounded-xl rounded-t-none shadow-lg relative hover:shadow-xl transition-shadow duration-300 ${className}`}
        >
            <div className="relative" style={{ width: '100%', height: `${height}px` }}>
                <div 
                    ref={mapRef} 
                    className="w-full h-full rounded-xl rounded-t-none"
                >
                    {/* Show error if map failed to load */}    
                    {loadError && (
                         <div className="absolute inset-0 bg-danger-50 flex items-center justify-center text-center p-4">
                            <Icon icon="solar:danger-triangle-bold-duotone" className="text-danger text-2xl mr-2"/>
                            <span className="text-danger-700 text-sm">{t("errorLoadingMap")}</span>
                         </div>
                    )}
                    {/* Fallback content while map loads */}
                    {!isMapsApiReady && !loadError && (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                            <Icon icon="svg-spinners:ring-resize" className="text-gray-400 text-2xl mr-2" />
                            <span className="text-gray-400 text-sm">{t("loadingMap")}</span>
                        </div>
                    )}
                    {/* Map container - shown once loaded */} 
                    {isMapsApiReady && !loadError && (
                        <span className="text-gray-400">{t("storeLocation")}</span>
                    )}
                </div>
                <div className="absolute inset-0 rounded-xl rounded-t-none border border-default-100 pointer-events-none"></div>
                <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm transition-transform hover:scale-105 flex items-center">
                    <Icon icon="solar:map-arrow-right-bold" className="mr-1.5 text-white" />
                    {t("viewOnGoogleMaps")}
                </div>
            </div>
        </a>
    );
};

export default LocationMap;
