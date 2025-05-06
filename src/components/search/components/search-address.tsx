'use client';

import { useEffect, useState, useRef } from 'react';
import { Autocomplete, AutocompleteItem, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useGoogleMaps } from '@/components/providers/google-maps-provider';
import { storeCoordinatesInCookies } from '@/app/actions';
import { useTranslations } from 'next-intl';
import {Coordinates} from "@/lib/delivery-cookie";
import { logger } from '@/lib/logger';

// Constants
const GOOGLE_MAPS_LIBRARIES = ['places'];
const COUNTRY_RESTRICTION = ['nl']; // Netherlands

interface SearchAddressProps {
    onLocationChange: (coords: Coordinates, city?: string, country?: string) => void;
}

interface PlaceSuggestion {
    place_id: string;
    description: string;
}

export function SearchAddress({ 
    onLocationChange 
}: SearchAddressProps) {
    const { isLoaded: isMapsApiReady, loadError } = useGoogleMaps();
    const [isLocating, setIsLocating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);
    const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const t = useTranslations("app/search");

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
            logger.error('SearchAddress', 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set!');
        }
        if (loadError) {
            logger.error('SearchAddress', 'Google Maps script loading error from provider:', { loadError });
            if (!errorMessage) {
                setErrorMessage(`${t("errorLoadingAddressSearch")}: ${loadError.message}`);
            }
        }
    }, [loadError, errorMessage, t]);

    // Initialize services when Maps API is loaded
    useEffect(() => {
        if (isMapsApiReady && !loadError && window.google?.maps) {
            try {
                geocoderRef.current = new google.maps.Geocoder();
                sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
                logger.debug('SearchAddress', 'Google Maps services initialized.');
            } catch (error) {
                logger.error('SearchAddress', 'Error initializing Google Maps services:', { error });
                setErrorMessage(t("errorInitializingServices"));
            }
        }
    }, [isMapsApiReady, loadError, t]);

    // Fetch suggestions when input changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!isMapsApiReady || !!loadError || !value.trim() || !window.google?.maps?.places || !sessionTokenRef.current) {
                setSuggestions([]);
                return;
            }
            
            const currentSessionToken = sessionTokenRef.current;

            try {
                const request = {
                    input: value,
                    includedPrimaryTypes: ['geocode'],
                    includedRegionCodes: COUNTRY_RESTRICTION,
                    language: 'nl',
                    sessionToken: currentSessionToken,
                };

                const result = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
                
                if (result && result.suggestions) {
                    const formattedSuggestions: PlaceSuggestion[] = result.suggestions.map((suggestion: any) => ({
                        place_id: suggestion.placePrediction.placeId,
                        description: suggestion.placePrediction.text?.text || suggestion.placePrediction.description || ''
                    }));
                    
                    setSuggestions(formattedSuggestions);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                logger.error('SearchAddress', 'Error fetching place suggestions:', { error });
                setSuggestions([]);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchSuggestions();
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [value, isMapsApiReady, loadError]);

    const processLocationSelection = async (coords: Coordinates, addrValue: string) => {
        setIsSubmitting(true);
        setErrorMessage(null);
        let city: string | undefined;
        let country: string | undefined;

        try {
            if (geocoderRef.current) {
                const results = await geocoderRef.current.geocode({ location: coords });
                if (results.results && results.results.length > 0) {
                    const addressComponents = results.results[0].address_components;
                    for (const component of addressComponents) {
                        if (component.types.includes('locality')) {
                            city = component.long_name;
                        }
                        if (component.types.includes('country')) {
                            country = component.short_name;
                        }
                    }
                }
            }

            try {
                await storeCoordinatesInCookies(coords, city, country);
            } catch (e) {
                console.error("Failed to save location cookies:", e);
            }

            onLocationChange(coords, city, country);
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
        if (!isMapsApiReady || !!loadError || !geocoderRef.current) {
            const errorMsg = loadError ? `${t("errorLoadingAddressSearch")}: ${loadError.message}` : t("addressSearchNotReady");
            setErrorMessage(errorMsg);
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
        if (!isMapsApiReady || !!loadError || !navigator.geolocation) {
            const errorMsg = !isMapsApiReady 
                ? (loadError ? `${t("errorLoadingAddressSearch")}: ${loadError.message}` : t("addressSearchNotReady"))
                : t("geolocationNotAvailable");
            setErrorMessage(errorMsg);
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
                <div className="mb-2 text-danger-700 bg-danger-100 p-2 rounded-md text-sm">
                    {t("errorLoadingAddressSearch")}: {loadError.message}
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
                isDisabled={!isMapsApiReady || !!loadError || isLocating || isSubmitting}
                variant="bordered"
                isLoading={!isMapsApiReady && !loadError || isLocating || isSubmitting}
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
