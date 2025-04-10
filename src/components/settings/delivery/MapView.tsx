'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useTranslations } from "next-intl";
import { WorkHours } from "@/lib/actions/calendar-actions";

// Map styles
const mapContainerStyle = {
  width: '100%',
  height: '400px',
  marginBottom: '20px',
  borderRadius: '0.375rem',
};

// Center of Netherlands
const center = {
  lat: 52.1326,
  lng: 5.2913,
};

interface MapElement {
  marker: google.maps.Marker | null;
  circle: google.maps.Circle | null;
}

interface DeliveryCity {
  name: string;
  range: number;
  priceInCents: number;
  minOrderPriceInCents: number;
  coordinates: { lat: number, lng: number };
  deliverySchedule?: WorkHours;
  isStoreDelivery: boolean;
  minOrderTime: number;
}

interface MapViewProps {
  cities: DeliveryCity[];
  selectedCity: string | null;
  deliveryRange: number;
  cityCoordinates: Record<string, { lat: number, lng: number }>;
}

const MapView: React.FC<MapViewProps> = ({ 
  cities, 
  selectedCity, 
  deliveryRange,
  cityCoordinates
}) => {
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapElementsRef = useRef<{[key: string]: MapElement}>({});
  const previewElementRef = useRef<MapElement | null>(null);

  // Load Google Maps API
  const { isLoaded: mapsApiLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    language: 'nl',  // Set to Dutch since we're operating in the Netherlands
    region: 'NL'     // Set region to Netherlands
  });

  // Update map elements (markers and circles) whenever cities changes
  useEffect(() => {
    if (!mapLoaded || !map) return;

    // Clean up all existing map elements
    Object.values(mapElementsRef.current).forEach(element => {
      if (element.marker) element.marker.setMap(null);
      if (element.circle) element.circle.setMap(null);
    });
    
    // Reset the map elements reference
    mapElementsRef.current = {};
    
    // Create bounds object to fit map to show all cities
    const bounds = new google.maps.LatLngBounds();
    let hasValidCity = false;

    // Create new markers and circles for each city
    cities.forEach(city => {
      const cityData = city.coordinates;
      if (!cityData) return;
      
      hasValidCity = true;
      
      // Add city location to bounds
      bounds.extend(new google.maps.LatLng(cityData.lat, cityData.lng));
      
      // Create marker
      const marker = new google.maps.Marker({
        position: { lat: cityData.lat, lng: cityData.lng },
        map: map,
        title: city.name
      });
      
      // Convert km to meters for circle radius
      const radiusInMeters = city.range * 1000;
      
      // Create circle
      const circle = new google.maps.Circle({
        center: { lat: cityData.lat, lng: cityData.lng },
        radius: radiusInMeters,
        map: map,
        fillColor: '#4285F4',
        fillOpacity: 0.2,
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 2
      });
      
      // Store references to map elements
      mapElementsRef.current[city.name] = { marker, circle };
      
      // Extend bounds to include the circle
      const radiusInDegrees = city.range / 111; // Rough conversion from km to degrees
      bounds.extend(new google.maps.LatLng(
        cityData.lat + radiusInDegrees,
        cityData.lng + radiusInDegrees
      ));
      bounds.extend(new google.maps.LatLng(
        cityData.lat - radiusInDegrees,
        cityData.lng - radiusInDegrees
      ));
    });
    
    // Fit the map to show all cities and their delivery ranges
    if (hasValidCity) {
      map.fitBounds(bounds);
    } else {
      resetMap();
    }
  }, [cities, mapLoaded, map]);

  // Handle preview of the selected city on the map
  useEffect(() => {
    if (!mapLoaded || !map) return;
    
    // Clean up previous preview
    if (previewElementRef.current) {
      if (previewElementRef.current.marker) previewElementRef.current.marker.setMap(null);
      if (previewElementRef.current.circle) previewElementRef.current.circle.setMap(null);
      previewElementRef.current = null;
    }
    
    // If no city is selected, no need to show preview
    if (!selectedCity) return;
    
    // Get the city data for the selected city
    const cityData = cityCoordinates[selectedCity];
    if (!cityData) return;
    
    // Create a marker with different color for the selected city
    const marker = new google.maps.Marker({
      position: { lat: cityData.lat, lng: cityData.lng },
      map: map,
      title: selectedCity,
      animation: google.maps.Animation.BOUNCE, // Add bounce animation to the marker
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#FF5722', // Orange color for selected city
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFF',
        scale: 8
      }
    });
    
    // Convert km to meters for circle radius
    const radiusInMeters = deliveryRange * 1000;
    
    // Create circle for the selected city with different color
    const circle = new google.maps.Circle({
      center: { lat: cityData.lat, lng: cityData.lng },
      radius: radiusInMeters,
      map: map,
      fillColor: '#FF5722', // Orange color for selected city
      fillOpacity: 0.2,
      strokeColor: '#FF5722',
      strokeOpacity: 0.8,
      strokeWeight: 2
    });
    
    // Store the preview elements
    previewElementRef.current = { marker, circle };
    
    // Ensure the selected city is visible on the map
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(cityData.lat, cityData.lng));
    
    // Extend bounds to include the circle
    const radiusInDegrees = deliveryRange / 111; // Rough conversion from km to degrees
    bounds.extend(new google.maps.LatLng(
      cityData.lat + radiusInDegrees,
      cityData.lng + radiusInDegrees
    ));
    bounds.extend(new google.maps.LatLng(
      cityData.lat - radiusInDegrees,
      cityData.lng - radiusInDegrees
    ));
    
    map.fitBounds(bounds);
    
  }, [selectedCity, deliveryRange, mapLoaded, map, cityCoordinates]);

  // Update delivery range circle in real-time when slider changes
  useEffect(() => {
    if (!mapLoaded || !map || !selectedCity || !previewElementRef.current?.circle) return;
    
    // Update the circle radius when delivery range changes
    const radiusInMeters = deliveryRange * 1000;
    previewElementRef.current.circle.setRadius(radiusInMeters);
    
  }, [deliveryRange, mapLoaded, map, selectedCity]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
    setMapLoaded(true);
  }, []);

  const resetMap = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setZoom(7);
      mapRef.current.setCenter(center);
    }
  }, []);

  if (!mapsApiLoaded) {
    return (
      <div className="h-[400px] bg-gray-100 rounded-md flex items-center justify-center">
        {t("loadingMap")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("mapView")}</h3>
        <Button
          onPress={resetMap}
          size="sm"
          variant={'ghost'}
          className="text-xs border-1"
        >
          {t("resetMap")}
        </Button>
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={7}
        onLoad={onMapLoad}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {/* We're managing markers and circles directly in useEffect, 
            not through React components */}
      </GoogleMap>
    </div>
  );
};

export default MapView; 