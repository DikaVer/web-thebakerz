'use client';

import { useEffect, useState, useRef } from 'react';
import { Autocomplete, AutocompleteItem, Button, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useLoadScript } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Coordinates } from '@/lib/cookie'; // Keep this for the type
import { storeCoordinatesInCookies } from '@/app/actions';
// Constants
const GOOGLE_MAPS_LIBRARIES = ['places'];
const COUNTRY_RESTRICTION = ['nl']; // Netherlands

interface SearchAddressProps {
    initialAddress?: string;
    initialCity?: string | null;
    initialCoords?: Coordinates | null;
    onLocationChange: (coords: Coordinates, city: string | null) => void;
}

export function SearchAddress({ 
    initialAddress = '', 
    initialCity = null,
    initialCoords = null, 
    onLocationChange 
}: SearchAddressProps) {
    const [isLocating, setIsLocating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);

    // Load Google Maps API
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: GOOGLE_MAPS_LIBRARIES as any,
        language: 'nl',
        preventGoogleFontsLoading: true,
    });

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
            console.error('ERROR: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set!');
        }
        if (loadError) {
            console.error('Google Maps script loading error:', loadError);
        }
    }, [loadError]);

    const [isInitialized, setIsInitialized] = useState(false);
    useEffect(() => {
        if (isLoaded && window.google?.maps?.places) {
            setIsInitialized(true);
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
        cacheKey: 'search-location', // Different cache key from landing
        initOnMount: isInitialized,
        defaultValue: initialAddress, // Set initial value from props
    });

    // Initialize geocoder
    useEffect(() => {
        if (isLoaded && window.google?.maps && !geocoderRef.current) {
            geocoderRef.current = new google.maps.Geocoder();
        }
    }, [isLoaded]);
    
    // Update local state if initial props change
    useEffect(() => {
        setValue(initialAddress, false); // Set initial value without triggering suggestions
    }, [initialAddress, setValue]);

    const processLocationSelection = async (coords: Coordinates, addrValue: string) => {
        setIsSubmitting(true);
        setErrorMessage(null);
        let city: string | null = null;

        try {
             // Reverse geocode to get city, even if address was selected (autocomplete might lack city)
            if (geocoderRef.current) {
                const results = await geocoderRef.current.geocode({ location: coords });
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

            // Update cookies using server action (this won't actually take effect until page refresh)
            // We don't need to await this as the user will navigate anyway
            try {
                await storeCoordinatesInCookies(coords, city || "Unknown City");
            } catch (e) {
                console.error("Failed to save location cookies:", e);
                // Non-blocking, continue with navigation
            }

            // Call the callback - this will trigger navigation 
            onLocationChange(coords, city);
            setValue(addrValue, false); // Update the input field display

        } catch (error: any) {
            console.error("Error processing location:", error);
            setErrorMessage("Failed to process location.");
            // Keep old cookies/state if processing failed
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle selection from autocomplete
    const handleAutocompleteSelect = async (selectedAddress: string) => {
        if (!ready) {
            setErrorMessage("Address search is not ready yet.");
            return;
        }
        setValue(selectedAddress, false); // Update input value
        clearSuggestions();

        try {
            const geocodeResults = await getGeocode({ address: selectedAddress });
            if (!geocodeResults || geocodeResults.length === 0) {
                throw new Error('No geocoding results found');
            }
            const coordinates = await getLatLng(geocodeResults[0]);
            await processLocationSelection(coordinates, selectedAddress);
        } catch (error: any) {
            console.error("Geocoding error:", error);
            setErrorMessage(error.message || "Failed to find this address");
            setIsSubmitting(false); // Ensure loading state is reset
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
        setValue('', false); // Clear address input

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
            });
            const coordinates = { lat: position.coords.latitude, lng: position.coords.longitude };

             // Since we got coords directly, we need to reverse geocode to get an address string for display
            let displayAddress = "Current Location"; // Fallback
            if (geocoderRef.current) {
                const results = await geocoderRef.current.geocode({ location: coordinates });
                if (results.results && results.results.length > 0) {
                    displayAddress = results.results[0].formatted_address; // Use the formatted address
                }
            }

            await processLocationSelection(coordinates, displayAddress);

        } catch (error: any) {
            let message = "Could not determine location.";
            if (error.code === 1) message = "Location access denied.";
            else if (error.code === 2) message = "Location unavailable.";
            else if (error.code === 3) message = "Location request timed out.";
            setErrorMessage(message);
            setIsSubmitting(false); // Ensure loading state reset
        } finally {
            setIsLocating(false);
        }
    };

    // Handle form submission (optional, if needed)
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!value.trim()) {
            setErrorMessage("Please enter an address");
            return;
        }
        // Trigger selection logic even on direct submit
        await handleAutocompleteSelect(value);
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full ">
             {loadError && (
                <div className="mb-2 text-red-600 bg-red-100 p-2 rounded-md text-sm">
                    Error loading address search. Please try refreshing the page.
                </div>
            )}
            <Autocomplete
                label="Enter Delivery Address" // More specific label
                aria-label="Delivery address search"
                placeholder="Street, number, city..."
                value={value}
                onInputChange={setValue}
                onSelectionChange={(key) => {
                    const selected = data.find(item => item.place_id === key);
                    if (selected) {
                        handleAutocompleteSelect(selected.description);
                    }
                }}
                isDisabled={!isLoaded || !ready || isLocating || isSubmitting}
                variant="bordered"
                isLoading={!isLoaded || !ready || isLocating || isSubmitting}
                startContent={
                    <Icon icon="solar:map-point-wave-linear" className="text-default-400" width={20} />
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
                    base: "w-full bg-white rounded-xl border border-default-200", // Adjusted styling
                    listbox: "max-h-[200px] bg-white",
                    popoverContent: "z-[1000] bg-white rounded-xl shadow-lg border border-default-200", // Style popover
                }}
                menuTrigger="input"
                items={data}
                disabledKeys={isSubmitting || isLocating ? data.map(item => item.place_id) : []} // Disable selection while processing
            >
                {data.map((item) => (
                    <AutocompleteItem key={item.place_id} textValue={item.description}>
                        <div className="flex items-center">
                            <Icon icon="solar:map-point-linear" className="text-primary-500 mr-2" width={16} />
                            <span className="text-gray-700 text-sm">{item.description}</span>
                        </div>
                    </AutocompleteItem>
                ))}
            </Autocomplete>

            {/* Status indicators below input */}
            <div className="mt-1 h-6 text-sm flex items-center"> 
                {isLocating && (
                    <div className="flex items-center gap-2 text-blue-600">
                        <Spinner size="sm" color="primary" />
                        <span>Finding your location...</span>
                    </div>
                )}
                {isSubmitting && (
                    <div className="flex items-center gap-2 text-orange-600">
                        <Spinner size="sm" color="warning" />
                        <span>Updating location...</span>
                    </div>
                )}
                {errorMessage && (
                    <div className="text-danger text-xs px-1">
                        {errorMessage}
                    </div>
                )}
            </div>
            
             {/* Hidden submit button to allow form submission via Enter key */}
            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
    );
}
