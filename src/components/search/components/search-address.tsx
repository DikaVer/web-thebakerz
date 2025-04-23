'use client';

import { useEffect, useState, useRef } from 'react';
import { Autocomplete, AutocompleteItem, Button, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useLoadScript } from '@react-google-maps/api';
import { Coordinates } from '@/lib/cookie';
import { storeCoordinatesInCookies } from '@/app/actions';
import { useTranslations } from 'next-intl';

// Constants
const GOOGLE_MAPS_LIBRARIES = ['places'];
const COUNTRY_RESTRICTION = ['nl']; // Netherlands

interface SearchAddressProps {
    initialAddress?: string;
    initialCity?: string | null;
    initialCoords?: Coordinates | null;
    onLocationChange: (coords: Coordinates, city: string | null) => void;
}

interface PlaceSuggestion {
    place_id: string;
    description: string;
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
    const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
    const [value, setValue] = useState(initialAddress);
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [isSearchReady, setIsSearchReady] = useState(false);
    const t = useTranslations("app/search");

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

    // Initialize services when Maps API is loaded
    useEffect(() => {
        if (isLoaded && window.google?.maps) {
            geocoderRef.current = new google.maps.Geocoder();
            sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
            setIsSearchReady(true);
        }
    }, [isLoaded]);

    // Fetch suggestions when input changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!isSearchReady || !value.trim() || !window.google?.maps?.places || !sessionTokenRef.current) {
                setSuggestions([]);
                return;
            }

            try {
                const request = {
                    input: value,
                    includedPrimaryTypes: ['geocode'],
                    includedRegionCodes: COUNTRY_RESTRICTION,
                    language: 'nl',
                    sessionToken: sessionTokenRef.current,
                };

                const result = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
                
                if (result && result.suggestions) {
                    const formattedSuggestions: PlaceSuggestion[] = result.suggestions.map((suggestion: any) => ({
                        place_id: suggestion.placePrediction.placeId,
                        description: suggestion.placePrediction.text?.text || suggestion.placePrediction.description || ''
                    }));
                    
                    setSuggestions(formattedSuggestions);
                }
            } catch (error) {
                console.error('Error fetching place suggestions:', error);
                setSuggestions([]);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchSuggestions();
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [value, isSearchReady]);

    const processLocationSelection = async (coords: Coordinates, addrValue: string) => {
        setIsSubmitting(true);
        setErrorMessage(null);
        let city: string | null = null;

        try {
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

            try {
                await storeCoordinatesInCookies(coords, city || "Unknown City");
            } catch (e) {
                console.error("Failed to save location cookies:", e);
            }

            onLocationChange(coords, city);
            setValue(addrValue);
            sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();

        } catch (error: any) {
            console.error("Error processing location:", error);
            setErrorMessage("Failed to process location.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAutocompleteSelect = async (selectedAddress: string, placeId?: string) => {
        if (!isSearchReady || !geocoderRef.current) {
            setErrorMessage("Address search is not ready yet.");
            return;
        }
        
        try {
            setValue(selectedAddress);
            setSuggestions([]);
            
            setIsSubmitting(true);
            setErrorMessage(null);
            
            let geocodeResults;
            if (placeId) {
                geocodeResults = await geocoderRef.current.geocode({ placeId });
            } else {
                geocodeResults = await geocoderRef.current.geocode({ address: selectedAddress });
            }
            
            if (!geocodeResults || geocodeResults.results.length === 0) {
                throw new Error('No geocoding results found');
            }
            
            const coordinates = {
                lat: geocodeResults.results[0].geometry.location.lat(),
                lng: geocodeResults.results[0].geometry.location.lng()
            };
            
            await processLocationSelection(coordinates, selectedAddress);
        } catch (error: any) {
            console.error("Geocoding error:", error);
            setErrorMessage(error.message || "Failed to find this address");
            setIsSubmitting(false);
        }
    };

    const handleLocationClick = async () => {
        if (!isLoaded || !navigator.geolocation) {
            setErrorMessage("Geolocation services are not available.");
            return;
        }
        
        setIsLocating(true);
        setErrorMessage(null);
        setValue('');
        
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
            });
            
            const coordinates = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            let displayAddress = "Current Location";
            if (geocoderRef.current) {
                const results = await geocoderRef.current.geocode({ location: coordinates });
                if (results.results && results.results.length > 0) {
                    displayAddress = results.results[0].formatted_address;
                }
            }

            await processLocationSelection(coordinates, displayAddress);

        } catch (error: any) {
            let message = "Could not determine location.";
            if (error.code === 1) message = "Location access denied.";
            else if (error.code === 2) message = "Location unavailable.";
            else if (error.code === 3) message = "Location request timed out.";
            setErrorMessage(message);
        } finally {
            setIsLocating(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!value.trim()) {
            setErrorMessage("Please enter an address");
            return;
        }
        await handleAutocompleteSelect(value);
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full">
            {loadError && (
                <div className="mb-2 text-red-600 bg-red-100 p-2 rounded-md text-sm">
                    {t("errorLoadingAddressSearch")}
                </div>
            )}
            <Autocomplete
                label={t("searchAddressLabel")}
                aria-label="Delivery address search"
                placeholder={t("searchAddressPlaceholder")}
                value={value}
                onInputChange={setValue}
                onSelectionChange={(key) => {
                    const selected = suggestions.find(item => item.place_id === key);
                    if (selected) {
                        handleAutocompleteSelect(selected.description, selected.place_id);
                    }
                }}
                isDisabled={!isLoaded || !isSearchReady || isLocating || isSubmitting}
                variant="bordered"
                isLoading={!isLoaded || !isSearchReady || isLocating || isSubmitting}
                startContent={
                    <Icon icon="solar:map-point-wave-linear" className="text-default-400" width={20} />
                }
                classNames={{
                    base: "w-full rounded-xl border border-default-200",
                    listbox: "max-h-[200px]",
                    popoverContent: "z-[1000] rounded-xl shadow-lg border border-default-200",
                }}
                menuTrigger="input"
                items={suggestions}
            >
                {suggestions.map((item) => (
                    <AutocompleteItem key={item.place_id} textValue={item.description}>
                        <div className="flex items-center">
                            <Icon icon="solar:map-point-linear" className="text-primary-500 dark:text-secondary mr-2" width={16} />
                            <span className="text-sm">{item.description}</span>
                        </div>
                    </AutocompleteItem>
                ))}
            </Autocomplete>

            <div className="mt-1 h-6 text-sm flex items-center">
                {isLocating && (
                    <div className="flex items-center gap-2 text-blue-600">
                        <Spinner size="sm" color="primary" />
                        <span>{t("findingLocation")}</span>
                    </div>
                )}
                {isSubmitting && (
                    <div className="flex items-center gap-2 text-orange-600">
                        <Spinner size="sm" color="warning" />
                        <span>{t("updatingLocation")}</span>
                    </div>
                )}
                {errorMessage && (
                    <div className="text-danger text-xs px-1">
                        {errorMessage}
                    </div>
                )}
            </div>
            
            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
    );
}
