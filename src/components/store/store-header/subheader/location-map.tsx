// components/LocationMap.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { useGoogleMaps } from '@/components/providers/google-maps-provider';

interface LocationMapProps {
    latitude: number;
    longitude: number;
    zoom?: number;
    height?: number | string;
    className?: string;
    onMapLoaded: () => void;
}

const LocationMap: React.FC<LocationMapProps> = ({
    latitude,
    longitude,
    zoom = 15,
    height = '100%',
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

    // Memoize createCustomMarker
    const createCustomMarker = useCallback(() => {
        if (!mapInstanceRef.current) return;
        
        // Clear previous marker and circles if any
        if (markerRef.current) {
            markerRef.current.setMap(null);
            markerRef.current = null;
        }
        
        circlesRef.current.forEach(circle => circle.setMap(null));
        circlesRef.current = [];
        
        if (iconUrlRef.current) {
            URL.revokeObjectURL(iconUrlRef.current);
            iconUrlRef.current = null;
        }

        const iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="16" fill="#730c70" />
            <g fill="none" stroke="white" stroke-width="1.5"  transform="translate(6, 6) scale(0.8)">
                <path stroke-linecap="round" d="M22 22H2m18 0V11M4 22V11" />
                <path stroke-linejoin="round" d="M16.528 2H7.472c-1.203 0-1.804 0-2.287.299c-.484.298-.753.836-1.29 1.912L2.49 7.76c-.324.82-.608 1.786-.062 2.479A2 2 0 0 0 6 9a2 2 0 1 0 4 0a2 2 0 1 0 4 0a2 2 0 1 0 4 0a2 2 0 0 0 3.571 1.238c.546-.693.262-1.659-.062-2.479l-1.404-3.548c-.537-1.076-.806-1.614-1.29-1.912C18.332 2 17.731 2 16.528 2Z" />
                <path stroke-linecap="round" d="M9.5 21.5v-3c0-.935 0-1.402.201-1.75a1.5 1.5 0 0 1 .549-.549C10.598 16 11.065 16 12 16s1.402 0 1.75.201a1.5 1.5 0 0 1 .549.549c.201.348.201.815.201 1.75v3" />
            </g>
        </svg>`;
        
        const blob = new Blob([iconSvg], {type: 'image/svg+xml'});
        const newIconUrl = URL.createObjectURL(blob);
        iconUrlRef.current = newIconUrl;
        
        const marker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: mapInstanceRef.current,
            icon: {
                url: newIconUrl,
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 16)
            },
            optimized: false,
            clickable: false,
            zIndex: 10
        });
        markerRef.current = marker;
        
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
        
        createCircle(80, 0.25, 5);
        createCircle(120, 0.2, 4);
        createCircle(160, 0.1, 3);
        createCircle(200, 0.05, 2);
    }, [latitude, longitude]);

    // Memoize initializeMap
    const initializeMap = useCallback(() => {
        if (!mapRef.current || !window.google || !window.google.maps) return;
        
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
            mapInstanceRef.current.setZoom(zoom);
            createCustomMarker();
            google.maps.event.trigger(mapInstanceRef.current, 'resize');
            onMapLoaded?.();
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

        const map = new google.maps.Map(mapRef.current, mapOptions);
        mapInstanceRef.current = map;
        
        google.maps.event.addListenerOnce(map, 'idle', () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
                createCustomMarker();
                google.maps.event.trigger(mapInstanceRef.current, 'resize');
                onMapLoaded?.();
            }
        });
    }, [latitude, longitude, zoom, onMapLoaded, createCustomMarker]);

    // Initialize map when API is ready
    useEffect(() => {
        if (isMapsApiReady && !loadError) {
            initializeMap();
        }
        
        return () => {
            // Clean up map and resources on unmount
            if (mapInstanceRef.current) {
                google.maps.event.clearInstanceListeners(mapInstanceRef.current);
            }
            
            if (markerRef.current) {
                markerRef.current.setMap(null);
                markerRef.current = null;
            }
            
            circlesRef.current.forEach(circle => circle.setMap(null));
            circlesRef.current = [];
            
            if (iconUrlRef.current) {
                URL.revokeObjectURL(iconUrlRef.current);
                iconUrlRef.current = null;
            }
            
            mapInstanceRef.current = null;
        };
    }, [isMapsApiReady, loadError, initializeMap]);

    // Use ResizeObserver to monitor container size changes
    useEffect(() => {
        if (!mapRef.current) return;
        
        const resizeObserver = new ResizeObserver(() => {
            if (mapInstanceRef.current) {
                google.maps.event.trigger(mapInstanceRef.current, 'resize');
                mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
            }
        });
        
        resizeObserver.observe(mapRef.current);
        
        return () => {
            resizeObserver.disconnect();
        };
    }, [latitude, longitude]);

    return (
        <a 
            href={`https://www.google.com/maps?q=${latitude},${longitude}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label={t("viewOnGoogleMaps")}
            className={`block overflow-hidden shadow-lg relative hover:shadow-xl transition-shadow duration-300 ${className || ''}`}
            style={{ height, minHeight: '200px' }}
        >
            <div className="relative w-full h-full" style={{ minHeight: 'inherit' }}>
                <div 
                    ref={mapRef} 
                    className="w-full h-full"
                    style={{ minHeight: 'inherit' }}
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
                </div>
                <div className="absolute inset-0 border border-default-100 pointer-events-none"></div>
                <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm transition-transform hover:scale-105 flex items-center">
                    <Icon icon="solar:map-arrow-right-bold" className="mr-1.5 text-white" />
                    {t("viewOnGoogleMaps")}
                </div>
            </div>
        </a>
    );
};

export default LocationMap;
