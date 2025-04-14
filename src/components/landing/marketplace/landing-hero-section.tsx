'use client';

import { useEffect, useState, useRef } from 'react';
import { Button, Input, Spinner, Autocomplete, AutocompleteItem } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import BlurText from '@/components/ui/blur-text';
import { storeCoordinatesInCookies } from '@/app/actions';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { pacifico } from '@/components/fonts';
import { useLoadScript } from '@react-google-maps/api';

// Constants
const GOOGLE_MAPS_LIBRARIES = ['places'];
const COUNTRY_RESTRICTION = ['nl']; // Netherlands

// LandingSection component with the address search
export const LandingHeroSection = () => {
  const router = useRouter();
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES as any,
    language: 'nl', // Set Dutch language for suggestions
    preventGoogleFontsLoading: true, // Optional: prevent font loading if handled elsewhere
  });

  // Check if API key is missing and log error
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.error('ERROR: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set in environment variables!');
      console.warn('You need to add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file');
    }
    
    if (loadError) {
      console.error('Google Maps script loading error:', loadError);
    }
  }, [loadError]);

  // Basic initialization check
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isLoaded && window.google?.maps?.places) {
      setIsInitialized(true);
      console.log('Google Maps and Places API initialized');
    }
  }, [isLoaded]);

  // Places autocomplete hook
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: COUNTRY_RESTRICTION },
      types: ['address'],
    },
    debounce: 350,
    cacheKey: 'landing-location',
    initOnMount: isInitialized, // Only initialize when we're sure the API is ready
  });

  // Log when relevant states change
//   useEffect(() => {
//     console.log('Google Maps loaded state:', isLoaded);
//     console.log('Initialization state:', isInitialized);
//     console.log('Places autocomplete ready state:', ready);
//     console.log('Suggestion Status:', status);
//     console.log('Window.google exists:', !!window.google);
//     console.log('Window.google.maps exists:', !!window.google?.maps);
//     console.log('Window.google.maps.places exists:', !!window.google?.maps?.places);
//   }, [isLoaded, isInitialized, ready, status]);

  // Initialize geocoder only when script is loaded
  useEffect(() => {
    if (isLoaded && window.google?.maps && !geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
      console.log('Geocoder initialized');
    }
  }, [isLoaded]);

  // Handle selection from autocomplete
  const handleAutocompleteSelect = async (selectedAddress: string) => {
    if (!ready) {
      setErrorMessage("Address search is not ready yet.");
      return;
    }
    
    try {
      clearSuggestions();
      setValue(selectedAddress, false);
      
      setIsSubmitting(true);
      setErrorMessage(null);
      
      // Get geocode results for the selected address
      const geocodeResults = await getGeocode({ address: selectedAddress });
      
      if (!geocodeResults || geocodeResults.length === 0) {
        throw new Error('No geocoding results found');
      }
      
      // Extract coordinates
      const coordinates = await getLatLng(geocodeResults[0]);
      
      // Extract city from address components
      let city: string | undefined;
      geocodeResults[0].address_components.forEach((component) => {
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
      });
      
      // Store the coordinates and city in cookies
      const result = await storeCoordinatesInCookies(coordinates, city);
      
      if (result?.message) {
        throw new Error(result.message);
      }
      
      // Redirect to search page with both coordinates and city if available
      const searchParams = new URLSearchParams();
      searchParams.append('lat', coordinates.lat.toString());
      searchParams.append('lng', coordinates.lng.toString());
      if (city) searchParams.append('city', city);
      
      router.push(`/search?${searchParams.toString()}`);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to find this address");
    } 
  };

  // Get coordinates from user's current location
  const handleLocationClick = async () => {
    if (!isLoaded || !navigator.geolocation) {
      setErrorMessage("Geolocation services are not available.");
      return;
    }
    
    setIsLocating(true);
    setErrorMessage(null);
    
    try {
      // Get current position with timeout
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 8000 }
        );
      });
      
      const coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      // Use reverse geocoding to get city
      let city: string | undefined;
      if (geocoderRef.current) {
        const results = await geocoderRef.current.geocode({ location: coordinates });
        if (results.results && results.results.length > 0) {
          const addressComponents = results.results[0].address_components;
          for (const component of addressComponents) {
            if (component.types.includes('locality')) {
              city = component.long_name;
              break;
            }
          }
        }
      }
      
      // Store coordinates and city in server-side cookies
      const result = await storeCoordinatesInCookies(coordinates, city);
      
      if (result?.message) {
        throw new Error(result.message);
      }
      
      // Navigate to search page with city if available
      const searchParams = new URLSearchParams();
      searchParams.append('lat', coordinates.lat.toString());
      searchParams.append('lng', coordinates.lng.toString());
      if (city) searchParams.append('city', city);
      
      router.push(`/search?${searchParams.toString()}`);
    } catch (error: any) {
      let message = "Could not determine your location. Please enter an address manually.";
      
      if (error.code === 1) { // PERMISSION_DENIED
        message = "Location access was denied. Please enter an address manually.";
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        message = "Your location is unavailable. Please enter an address manually.";
      } else if (error.code === 3) { // TIMEOUT
        message = "Location request timed out. Please enter an address manually.";
      }
      
      setErrorMessage(message);
    } finally {
      setIsLocating(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!value.trim()) {
      setErrorMessage("Please enter an address");
      return;
    }
    
    await handleAutocompleteSelect(value);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Explicit check for Maps loading error */}
      {loadError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-100 text-red-700 p-4">
          Error loading Google Maps. Please check your API key and network connection.
        </div>
      )}
      
      {/* Full-screen background image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/landing/landingImage.png"
          alt="Bakers with cakes and pastries"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b bg-black bg-opacity-5"></div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full flex justify-center mt-32">
        <BlurText
          once={true}
          text="TheBakerz"
          delay={150}
          animateBy="words"
          direction="top"
          className={`font-pacifico text-5xl sm:text-7xl text-primary-800 drop-shadow-xl ${pacifico.className}`}
        />
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 md:px-8 lg:px-16">
           
        <div className="max-w-3xl mx-auto p-8 md:p-12 rounded-2xl">
    
          <BlurText
            once={true}
            text="Discover artisanal bakeries near you"
            delay={150}
            animateBy="words"
            direction="top"
            className="text-3xl sm:text-5xl font-bold text-primary-800 mb-8 drop-shadow-xl justify-center"
          />
          
          <form 
            onSubmit={handleSubmit}
            className="relative w-full max-w-md mx-auto"
          >
            <div className="relative">
              <Autocomplete
                label="Address"
                aria-label="Address search"
                placeholder="Enter your address"
                value={value}
                onInputChange={setValue}
                onSelectionChange={(key) => {
                  // Find the selected item from data
                  const selected = data.find(item => item.place_id === key);
                  if (selected) {
                    handleAutocompleteSelect(selected.description);
                  }
                }}
                isDisabled={!isLoaded || !ready || isLocating || isSubmitting}
                variant="bordered"
                isLoading={!isLoaded || !ready || isLocating || isSubmitting}
                startContent={
                  <Icon icon="solar:magnifer-linear" className="text-default-400" width={20} />
                }
                endContent={
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onPress={handleLocationClick}
                      title="Use current location"
                      className={isLocating || isSubmitting ? "hidden" : ""}
                      isDisabled={!isLoaded || !ready || isLocating || isSubmitting}
                      type="button"
                    >
                      <Icon icon="solar:map-arrow-square-outline" width={20} className="text-primary-500" />
                    </Button>
                }
                classNames={{
                  base: "w-full bg-white/95 rounded-2xl backdrop-blur-sm border-hidden shadow-lg",

                  listbox: "max-h-[200px] bg-white/95 backdrop-blur-sm",
                  popoverContent: "z-[1000]"
                }}
                menuTrigger="input"
                items={data}
              >
                {data.map((item) => (
                  <AutocompleteItem key={item.place_id} textValue={item.description}>
                    <div className="flex items-center">
                      <Icon icon="solar:map-point-linear" className="text-primary-500 mr-2" width={16} />
                      <span className="text-gray-800">{item.description}</span>
                    </div>
                  </AutocompleteItem>
                ))}
              </Autocomplete>
              
              {/* Status indicators below input */}
              <div className="mt-2 text-sm">                
                {isLocating && (
                  <div className="flex items-center justify-center gap-2 text-blue-700 p-2 rounded-md">
                    <Spinner size="sm" color="primary" />
                    <span>Finding your location...</span>
                  </div>
                )}
                
                {isSubmitting && (
                  <div className="flex items-center justify-center gap-2 text-warning-700 p-2 rounded-md">
                    <Spinner size="sm" color="primary" />
                    <span>Processing your address...</span>
                  </div>
                )}
                
                {errorMessage && (
                  <div className="text-red-500 p-2 rounded-md">
                    {errorMessage}
                  </div>
                )}
                
              </div>
            </div>
            
            <Button 
              type="submit"
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
            />
          </form>
        </div>
      </div>
    </div>
  );
};