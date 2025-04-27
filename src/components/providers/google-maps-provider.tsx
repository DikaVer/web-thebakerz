'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import Script from 'next/script';
import { logger } from '@/lib/logger';

interface GoogleMapsContextProps {
  isLoaded: boolean;
  loadError: Error | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextProps | undefined>(undefined);

export const useGoogleMaps = (): GoogleMapsContextProps => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};

interface GoogleMapsProviderProps {
  children: ReactNode;
}

// Include Places library and set language to Dutch
const GOOGLE_MAPS_LIBRARIES = 'places';
const GOOGLE_MAPS_LANGUAGE = 'nl';

export const GoogleMapsProvider = ({ children }: GoogleMapsProviderProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    // Check if the script is already loaded (e.g., by another instance or SSR)
    if (window.google && window.google.maps) {
         logger.debug('GoogleMapsProvider', 'Google Maps script already seems loaded.');
         setIsLoaded(true);
    }
  }, []);


  const handleScriptLoad = () => {
    logger.debug('GoogleMapsProvider', 'Google Maps script loaded successfully.');
    setIsLoaded(true);
  };

  const handleScriptError = (e: any) => { // The event type might be generic
    const error = new Error('Google Maps script failed to load.');
    logger.error('GoogleMapsProvider', 'Google Maps script loading error:', { originalError: e, message: error.message });
    setLoadError(error);
    // Optionally, report this error to an error tracking service
  };

  // Only render the script if the API key is available
  if (!apiKey) {
      logger.error('GoogleMapsProvider', 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing. Google Maps script will not be loaded.');
      // Render children without the context value signalling an error,
      // or provide a context value indicating the configuration error.
      // For simplicity, we'll provide a context value indicating not loaded and an error.
      if (!loadError) { // Avoid setting error state twice if already set
          setLoadError(new Error('Google Maps API key is missing.'));
      }
       return (
          <GoogleMapsContext.Provider value={{ isLoaded: false, loadError }}>
              {children}
          </GoogleMapsContext.Provider>
      );
  }

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {!isLoaded && !loadError && ( // Avoid rendering script if already loaded or error occurred
         <Script
           id="google-maps-provider-script"
           strategy="afterInteractive" // Load after the page is interactive
           src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${GOOGLE_MAPS_LIBRARIES}&language=${GOOGLE_MAPS_LANGUAGE}`}
           onLoad={handleScriptLoad}
           onError={handleScriptError}
           async
           defer
         />
      )}
      {children}
    </GoogleMapsContext.Provider>
  );
}; 