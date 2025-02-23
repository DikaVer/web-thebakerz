// components/LocationMap.tsx
"use client";

import React, { useEffect, useRef } from "react";
import * as atlas from "azure-maps-control";
import Head from "next/head";

interface LocationMapProps {
    latitude: number;
    longitude: number;
    zoom?: number;
    width?: number;
    height?: number;
    className?: string;
}

// Helper function to generate a circle polygon around a center coordinate.
// radius is in meters and steps defines the number of points in the circle.
const getCirclePolygon = (center: number[], radius: number, steps: number = 64) => {
    const coordinates: number[][] = [];
    const earthRadius = 6371000; // Earth radius in meters
    const lat = center[1] * Math.PI / 180;
    const lon = center[0] * Math.PI / 180;

    for (let i = 0; i <= steps; i++) {
        const angle = i * 360 / steps * Math.PI / 180;
        // Compute the offset in radians.
        const dx = radius * Math.cos(angle) / earthRadius;
        const dy = radius * Math.sin(angle) / earthRadius;
        // Adjust the lat and lon.
        const newLat = lat + dy;
        const newLon = lon + dx / Math.cos(lat);
        coordinates.push([newLon * 180 / Math.PI, newLat * 180 / Math.PI]);
    }

    return new atlas.data.Polygon([coordinates]);
};

const LocationMap: React.FC<LocationMapProps> = ({
                                                     latitude,
                                                     longitude,
                                                        zoom = 15,
                                                     width = 412,
                                                     height = 160,
                                                     className,
                                                 }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const subscriptionKey = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY;
    const loadMapDependencies = async () => {
        try {
            await Promise.all([
                //@ts-ignore
                import('azure-maps-control/dist/atlas.min.css'),
                import('azure-maps-control')
            ]);
        } catch (error) {
            console.error('Map dependency loading failed:', error);
            throw error;
        }
    };

// In component
    useEffect(() => {
        loadMapDependencies().then(() => {
            // Initialize map
        });
    }, []);

    // Apply MS map
    useEffect(() => {
        // Create a link element
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/3/atlas.min.css';
        link.type = 'text/css';
        document.head.appendChild(link);
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize the map
        const map = new atlas.Map(mapRef.current, {
            autoResize: true,
            zoom: zoom,
            center: [longitude, latitude],
            authOptions: {
                authType: atlas.AuthenticationType.subscriptionKey,
                subscriptionKey: subscriptionKey || "YOUR_AZURE_MAPS_SUBSCRIPTION_KEY",
            },
            showFeedbackLink: false,
            showLogo: false,
            // Disable user interactions (drag, zoom, etc.)
            style: "grayscale_light",
            interactive: false,
        });

        map.events.add("ready", () => {
            // Define your custom SVG for the pin.
            const customPinHtml = `
            <a href="https://www.google.com/maps?q=${latitude},${longitude}" target="_blank" style="display:block;">
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
  <!-- Background circle filled with #730c70 -->
  <circle cx="12" cy="12" r="12" fill="#730c70" />
  <rect width="24" height="24" fill="none"/>
  <!-- Group with transform to scale down the inner icon -->
  <g transform="translate(5, 5) scale(0.6)" fill="none" stroke="#fff" stroke-width="2">
    <path d="M3.5 11v3c0 3.771 0 5.657 1.172 6.828S7.729 22 11.5 22h1c3.771 0 5.657 0 6.828-1.172S20.5 17.771 20.5 14v-3"/>
    <path d="M9.5 2h5l.652 6.517a3.167 3.167 0 1 1-6.304 0z"/>
    <path d="M3.33 5.351c.178-.89.267-1.335.448-1.696a3 3 0 0 1 1.888-1.548C6.056 2 6.51 2 7.418 2H9.5l-.725 7.245a3.06 3.06 0 1 1-6.043-.904zm17.34 0c-.178-.89-.267-1.335-.448-1.696a3 3 0 0 0-1.888-1.548C17.944 2 17.49 2 16.582 2H14.5l.725 7.245a3.06 3.06 0 1 0 6.043-.904z"/>
    <path stroke-linecap="round" d="M9.5 21.5v-3c0-.935 0-1.402.201-1.75a1.5 1.5 0 0 1 .549-.549C10.598 16 11.065 16 12 16s1.402 0 1.75.201a1.5 1.5 0 0 1 .549.549c.201.348.201.815.201 1.75v3"/>
  </g>
</svg>
</a>
`;



            // Create a circle polygon around the pin (for example, radius 500 meters).
            const circlePolygon1 = getCirclePolygon([longitude, latitude], 40);
            const circlePolygon2 = getCirclePolygon([longitude, latitude], 50);
            const circlePolygon3 = getCirclePolygon([longitude, latitude], 60);

            // Create a data source, add the circle polygon, and add it to the map.
            const dataSource = new atlas.source.DataSource();
            dataSource.add(circlePolygon1);
            dataSource.add(circlePolygon2);
            dataSource.add(circlePolygon3);
            map.sources.add(dataSource);

            // Add a polygon layer to render the circle.
            map.layers.add(new atlas.layer.PolygonLayer(dataSource, "polygon-layer", {
                fillColor: "rgba(115,12,112,0.3)",
                strokeColor: "#730c70",
                strokeWidth: 2,
                filter: ['any', ['==', ['geometry-type'], 'Polygon']]
            }));

            // Add the custom pin marker at the specified location.
            const marker = new atlas.HtmlMarker({
                position: [longitude, latitude - 0.0002],
                htmlContent: customPinHtml,
            });
            map.markers.add(marker);
        });

        return () => map.dispose();
    }, [latitude, longitude, zoom, subscriptionKey]);

    return (
        <>
            <div
                ref={mapRef}
                className={className}
                style={{ width: `${width}px`, height: `${height}px` }}
            />
        </>
    );
};

export default LocationMap;
