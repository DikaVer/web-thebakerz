/**
 * @fileoverview Client-side Google Maps loader context provider and
 * useGoogleMaps hook.
 *
 * Exports GoogleMapsProvider, which injects the Google Maps JavaScript API
 * bootstrap script once, preloads the maps, places, and marker libraries, and
 * supplies GoogleMapsContext with isLoaded and loadError state. Also exports
 * the DEFAULT_CENTER coordinates (Amsterdam) and global window.google type
 * declarations.
 */
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useRef, useMemo } from 'react';
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

// Default location for Amsterdam
export const DEFAULT_CENTER = { lat: 52.3676, lng: 4.9041 };

export const GoogleMapsProvider = ({ children }: GoogleMapsProviderProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isLoadingRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (isLoadingRef.current) {
      logger.debug('GoogleMapsProvider', 'Google Maps loading already in progress.');
      return;
    }

    // Skip if already loaded
    if (window.google && window.google.maps) {
      logger.debug('GoogleMapsProvider', 'Google Maps already loaded, skipping initialization.');
      setIsLoaded(true);
      return;
    }

    // Skip if no API key
    if (!apiKey) {
      const error = new Error('Google Maps API key is missing.');
      setLoadError(error);
      logger.error('GoogleMapsProvider', 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing.');
      return;
    }

    // Mark as loading to prevent multiple attempts
    isLoadingRef.current = true;

    // Load the Maps JavaScript API directly instead of on window load
    const loadGoogleMaps = async () => {
      try {
        logger.debug('GoogleMapsProvider', 'Starting Google Maps initialization');
        
        // Insert the script element to load Google Maps API
        const script = document.createElement('script');
        script.innerHTML = `
          (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.\${c}apis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
            key: "${apiKey}",
            v: "weekly",
            language: "nl"
          });
        `;
        document.head.appendChild(script);

        // Create a promise that resolves when script is loaded with a timeout
        const scriptLoadPromise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Google Maps script load timeout after 10 seconds'));
          }, 10000); // 10 second timeout

          // Check periodically if window.google.maps exists
          const checkInterval = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(checkInterval);
              clearTimeout(timeout);
              resolve();
            }
          }, 100);
        });

        // Wait for script to load
        await scriptLoadPromise;
        
        // Pre-load needed libraries one at a time to avoid race conditions
        logger.debug('GoogleMapsProvider', 'Loading Maps library');
        await window.google.maps.importLibrary("maps");
        logger.debug('GoogleMapsProvider', 'Loading Places library');
        await window.google.maps.importLibrary("places");
        logger.debug('GoogleMapsProvider', 'Loading Marker library');
        await window.google.maps.importLibrary("marker");
        
        logger.debug('GoogleMapsProvider', 'Google Maps initialization complete');
        setIsLoaded(true);
        isLoadingRef.current = false;
      } catch (error) {
        const mapError = error instanceof Error ? error : new Error('Failed to load Google Maps');
        setLoadError(mapError);
        isLoadingRef.current = false;
        logger.error('GoogleMapsProvider', 'Error loading Google Maps:', { error });
      }
    };

    loadGoogleMaps();

    // Cleanup function (if needed)
    return () => {
      isLoadingRef.current = false;
    };
  }, [apiKey]);

  const contextValue = useMemo(() => ({
    isLoaded,
    loadError
  }), [isLoaded, loadError]);

  return (
    <GoogleMapsContext.Provider value={contextValue}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

// Add global type definitions for TypeScript
declare global {
  interface Window {
    google: {
      maps: {
        importLibrary: (libraryName: string) => Promise<any>;
        Map: any;
        LatLng: any;
        MapTypeId: any;
        event: {
          trigger: (instance: any, eventName: string) => void;
        };
        RenderingType: {
          VECTOR: string;
          RASTER: string;
        };
      };
    };
  }
} 