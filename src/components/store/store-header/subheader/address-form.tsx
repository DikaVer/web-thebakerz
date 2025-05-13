'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Button,
  addToast,
  Autocomplete,
  AutocompleteItem,
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Icon } from '@iconify/react';
import { useDelivery } from '@/components/providers/delivery-provider';
import { useGoogleMaps, DEFAULT_CENTER } from '@/components/providers/google-maps-provider';
import { 
    AddressZodSchema, 
    COUNTRY_RESTRICTION, 
    DUTCH_POSTAL_CODE_REGEX 
} from '@/lib/schemas/address.schema';
import { ExtendedDeliveryAddressRaw } from '@/app/(store)/[id]/delivery-actions';
import { logger } from '@/lib/logger';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from "@/components/ui/form";

// --- Format postal code based on country format ---
const formatPostalCode = (code: string, countryCode?: string): string => {
  const cleanCode = code.replace(/\s+/g, '');
  
  // Format Dutch postal code (if it matches the pattern)
  if (DUTCH_POSTAL_CODE_REGEX.test(cleanCode)) {
    return `${cleanCode.substring(0, 4)} ${cleanCode.substring(4).toUpperCase()}`;
  }
  
  // For other countries, just return the cleaned code in uppercase
  return cleanCode.toUpperCase();
};

// Create a mutable copy of the country restriction for the Google API
const MUTABLE_COUNTRY_RESTRICTION: string[] = Array.from(COUNTRY_RESTRICTION);

// --- Interfaces ---
interface AddressFormProps {
  initialAddress?: ExtendedDeliveryAddressRaw;
  isValidating: boolean;
  onAutocompleteFocus?: () => void;
  onAutocompleteBlur?: () => void;
  onSubmitStart?: () => void;
  onSubmitEnd?: (success?: boolean) => void;
  onClose: () => void;
  defaultCenter?: { lat: number; lng: number };
}

interface PlaceSuggestion {
  place_id: string;
  description: string;
}

// Define the type for the form data based on the Zod schema
type AddressFormData = z.infer<typeof AddressZodSchema>;

// --- Address Form Component ---
export function AddressForm({
  initialAddress,
  isValidating,
  onAutocompleteFocus,
  onAutocompleteBlur,
  onSubmitStart,
  onSubmitEnd,
  onClose,
  defaultCenter,
}: AddressFormProps) {
  const t = useTranslations('app/(store)/components/store-subheader');
  const { handleAddressSubmit } = useDelivery();
  const { isLoaded: isMapsApiReady, loadError } = useGoogleMaps();
  
  // --- Map References ---
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<any>(null);

  // --- RHF Setup ---
  const form = useForm<AddressFormData>({
    resolver: zodResolver(AddressZodSchema),
    defaultValues: {
      street: initialAddress?.street || '',
      houseNumber: initialAddress?.houseNumber || '',
      city: initialAddress?.city || '',
      zipCode: initialAddress?.zipCode || '',
      additionalInfo: initialAddress?.additionalInfo || '',
      formattedAddress: initialAddress?.formattedAddress || '',
      coordinates: initialAddress?.coordinates || DEFAULT_CENTER,
      country: initialAddress?.country || '',
      // Initialize optional fields
      placeId: initialAddress?.placeId,
      administrativeAreas: initialAddress?.administrativeAreas,
      neighborhood: initialAddress?.neighborhood,
      premise: initialAddress?.premise,
      subpremise: initialAddress?.subpremise,
      addressComponents: initialAddress?.addressComponents,
    },
  });
  const { handleSubmit, setValue, reset, watch, formState: { isSubmitting } } = form;
  
  // Track current coordinates to sync with map
  const coordinates = watch('coordinates');

  // --- State for Autocomplete ---
  const [autocompleteValue, setAutocompleteValue] = useState(initialAddress?.formattedAddress || '');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);

  // --- Refs ---
  const formRef = useRef<HTMLFormElement>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // --- Initialize Map ---
  const initializeMap = useCallback(() => {
    if (!isMapsApiReady || !mapRef.current || loadError || googleMapRef.current) return;

    try {
      (async () => {
        // Import required libraries
        const { Map, RenderingType } = await window.google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");
        
        // Initialize map
        const initialCoords = coordinates || DEFAULT_CENTER;
        const map = new Map(mapRef.current, {
          center: initialCoords,
          zoom: 13,
          mapId: 'DEMO_MAP_ID', // Use your actual map ID here
          renderingType: RenderingType.VECTOR, // Enable vector rendering for WebGL features
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          tiltInteractionEnabled: false, // Disable tilt for ease of use
          gestureHandling: 'greedy',
        });
        
        googleMapRef.current = map;
        
        // Add a marker for the location
        const marker = new AdvancedMarkerElement({
          map,
          position: map.getCenter(),
          title: 'Delivery Location',
        });
        
        markerRef.current = marker;
        
        // Center the marker in the map
        const centerMarker = () => {
          if (googleMapRef.current && markerRef.current) {
            const center = googleMapRef.current.getCenter();
            if (center) {
              markerRef.current.position = center;
            }
          }
        };
        
        // Setup map events
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const newPosition = { 
              lat: e.latLng.lat(), 
              lng: e.latLng.lng() 
            };
            map.panTo(newPosition);
            updateAddressFromCoordinates(newPosition);
          }
        });
        
        // Keep marker in center during map movements
        map.addListener('center_changed', centerMarker);
        
        // Handle map drag events
        map.addListener('dragend', () => {
          if (googleMapRef.current) {
            const center = googleMapRef.current.getCenter();
            if (center) {
              const newPosition = { 
                lat: center.lat(), 
                lng: center.lng() 
              };
              updateAddressFromCoordinates(newPosition);
            }
          }
        });
        
        // Initialize geocoder
        geocoderRef.current = new google.maps.Geocoder();
        setIsMapVisible(true);
      })();
    } catch (error) {
      logger.error('addressForm', 'Error initializing map:', { error });
    }
  }, [isMapsApiReady, loadError, coordinates, t]);

  // --- Effects for Google Maps initialization ---
  useEffect(() => {
    if (isMapsApiReady && !loadError) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      initializeMap();
    }
  }, [isMapsApiReady, loadError, initializeMap]);

  // --- Update map when coordinates change ---
  useEffect(() => {
    if (googleMapRef.current && coordinates) {
      googleMapRef.current.panTo(coordinates);
    }
  }, [coordinates]);

  // --- Effect for fetching suggestions ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isMapsApiReady || !autocompleteValue.trim() || !window.google?.maps?.places || !sessionTokenRef.current) {
        setSuggestions([]);
        return;
      }

      try {
        const request = {
          input: autocompleteValue,
          includedPrimaryTypes: ['geocode'],
          includedRegionCodes: MUTABLE_COUNTRY_RESTRICTION,
          language: 'en',
          sessionToken: sessionTokenRef.current,
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
        logger.error('addressForm', 'Error fetching suggestions:', { error });
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [autocompleteValue, isMapsApiReady]);

  // Reset form when initialAddress changes
  useEffect(() => {
    if (initialAddress) {
      reset({
        street: initialAddress.street || '',
        houseNumber: initialAddress.houseNumber || '',
        city: initialAddress.city || '',
        zipCode: initialAddress.zipCode || '',
        additionalInfo: initialAddress.additionalInfo || '',
        formattedAddress: initialAddress.formattedAddress || '',
        coordinates: initialAddress.coordinates || DEFAULT_CENTER,
        country: initialAddress.country || '',
        // Set optional fields
        placeId: initialAddress.placeId,
        administrativeAreas: initialAddress.administrativeAreas,
        neighborhood: initialAddress.neighborhood,
        premise: initialAddress.premise,
        subpremise: initialAddress.subpremise,
        addressComponents: initialAddress.addressComponents,
      });
      setAutocompleteValue(initialAddress.formattedAddress || '');
    } else {
      reset({
        street: '',
        houseNumber: '',
        city: '',
        zipCode: '',
        additionalInfo: '',
        formattedAddress: '',
        coordinates: DEFAULT_CENTER,
        country: '',
        placeId: undefined,
        administrativeAreas: undefined,
        neighborhood: undefined,
        premise: undefined,
        subpremise: undefined,
        addressComponents: undefined,
      });
      setAutocompleteValue('');
    }
  }, [initialAddress, reset]);

  // --- Update address from coordinates (reverse geocoding) ---
  const updateAddressFromCoordinates = async (position: { lat: number; lng: number }) => {
    if (!geocoderRef.current) return;
    
    try {
      setValue('coordinates', position);
      
      const results = await geocoderRef.current.geocode({ location: position });
      
      if (results.results && results.results.length > 0) {
        const result = results.results[0];
        
        // Process address components
        let street = '';
        let houseNumber = '';
        let city = '';
        let zipCode = '';
        let country = '';
        let administrativeAreas: string[] = [];
        let neighborhood = '';
        let premise = '';
        let subpremise = '';

        // Store complete address components
        const addressComponents = result.address_components;
        
        addressComponents.forEach(component => {
          const types = component.types;
          
          if (types.includes('route')) street = component.long_name;
          if (types.includes('street_number')) houseNumber = component.long_name;
          if (types.includes('locality') || types.includes('postal_town')) city = component.long_name;
          if (types.includes('postal_code')) zipCode = formatPostalCode(component.long_name, result.address_components[0].short_name);
          if (types.includes('country')) country = component.short_name;
          
          // Additional components
          if (types.includes('administrative_area_level_1') || 
              types.includes('administrative_area_level_2') || 
              types.includes('administrative_area_level_3')) {
            administrativeAreas.push(component.long_name);
          }
          
          if (types.includes('sublocality') || types.includes('neighborhood')) {
            neighborhood = component.long_name;
          }
          
          if (types.includes('premise')) {
            premise = component.long_name;
          }
          
          if (types.includes('subpremise')) {
            subpremise = component.long_name;
          }
        });

      

        // Update form values
        const formattedAddress = result.formatted_address;
        setAutocompleteValue(formattedAddress);
        setValue('formattedAddress', formattedAddress);
        setValue('street', street, { shouldValidate: true });
        setValue('houseNumber', houseNumber, { shouldValidate: true });
        setValue('city', city, { shouldValidate: true });
        setValue('zipCode', zipCode, { shouldValidate: true });
        setValue('country', country);
        
        // Set additional fields
        setValue('placeId', result.place_id);
        setValue('administrativeAreas', administrativeAreas);
        setValue('neighborhood', neighborhood);
        setValue('premise', premise);
        setValue('subpremise', subpremise);
        setValue('addressComponents', addressComponents);
        
        form.trigger();
 
        // Update map position
        if (googleMapRef.current && markerRef.current) {
          googleMapRef.current.panTo(position);
        }
      }
    } catch (error) {
      logger.error('addressForm', 'Error in reverse geocoding:', { error });
    }
  };

  // --- Handlers for places autocomplete ---
  const handleAutocompleteSelect = async (description: string, placeId?: string) => {
    if (!isMapsApiReady || !!loadError) {
      setError(loadError ? `Maps failed to load: ${loadError.message}` : "Address search is not ready.");
      return;
    }
    if (!geocoderRef.current) {
      setError("Geocoder service not initialized.");
      return;
    }
    setError(null);

    try {
      setSuggestions([]);
      setAutocompleteValue(description);
      setValue('formattedAddress', description);
      
      const geocoder = geocoderRef.current;
      
      const geocodeResults = await geocoder.geocode(
        placeId ? { placeId } : { address: description }
      );
      
      if (!geocodeResults?.results?.length) {
        throw new Error('No geocoding results found');
      }

      const result = geocodeResults.results[0];
      if (!result || !result.geometry || !result.geometry.location) {
        throw new Error('Invalid address format');
      }

      const coords = {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng()
      };

      // Process address components
      let street = '';
      let houseNumber = '';
      let city = '';
      let zipCode = '';
      let country = '';
      let administrativeAreas: string[] = [];
      let neighborhood = '';
      let premise = '';
      let subpremise = '';

      // Store complete address components
      const addressComponents = result.address_components;

      addressComponents.forEach(component => {
        const types = component.types;
        
        if (types.includes('route')) street = component.long_name;
        if (types.includes('street_number')) houseNumber = component.long_name;
        if (types.includes('locality') || types.includes('postal_town')) city = component.long_name;
        if (types.includes('postal_code')) zipCode = formatPostalCode(component.long_name, result.address_components[0].short_name);
        if (types.includes('country')) country = component.short_name;
        
        // Additional components
        if (types.includes('administrative_area_level_1') || 
            types.includes('administrative_area_level_2') || 
            types.includes('administrative_area_level_3')) {
          administrativeAreas.push(component.long_name);
        }
        
        if (types.includes('sublocality') || types.includes('neighborhood')) {
          neighborhood = component.long_name;
        }
        
        if (types.includes('premise')) {
          premise = component.long_name;
        }
        
        if (types.includes('subpremise')) {
          subpremise = component.long_name;
        }
      });

      setValue('street', street, { shouldValidate: true });
      setValue('houseNumber', houseNumber, { shouldValidate: true });
      setValue('city', city, { shouldValidate: true });
      setValue('zipCode', zipCode, { shouldValidate: true });
      setValue('country', country);
      setValue('coordinates', coords);
      
      // Set additional fields
      setValue('placeId', placeId || result.place_id);
      setValue('administrativeAreas', administrativeAreas);
      setValue('neighborhood', neighborhood);
      setValue('premise', premise);
      setValue('subpremise', subpremise);
      setValue('addressComponents', addressComponents);
  

      // Update map position
      if (googleMapRef.current && markerRef.current) {
        googleMapRef.current.panTo(coords);
      }

      form.trigger();
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();

    } catch (error) {
      logger.error('addressForm', 'Error selecting place:', { error });
      addToast({ description: 'Error processing address. Please try typing manually.', color: 'danger' });
    }
  };

  // --- Form Submission ---
  const onSubmit = async (data: AddressFormData) => {
    if (isValidating || isSubmitting) {
      onClose && onClose();
      return;
    }

    onSubmitStart && onSubmitStart();

    const submissionData: ExtendedDeliveryAddressRaw = {
      street: data.street,
      houseNumber: data.houseNumber,
      city: data.city,
      zipCode: data.zipCode,
      country: data.country,
      coordinates: data.coordinates,
      formattedAddress: `${data.street} ${data.houseNumber}, ${data.zipCode} ${data.city}, ${data.country}`,
      additionalInfo: data.additionalInfo || '',
      // Include additional data (these are all part of ExtendedDeliveryAddressRaw)
      placeId: data.placeId,
      administrativeAreas: data.administrativeAreas,
      neighborhood: data.neighborhood,
      premise: data.premise,
      subpremise: data.subpremise,
      addressComponents: data.addressComponents,
    };
    
    try {
      logger.debug('addressForm', 'submissionData', { submissionData });
      await handleAddressSubmit(submissionData);
      onSubmitEnd && onSubmitEnd(true);
      onClose();
      
    } catch (err) {
      logger.error('addressForm', 'Form submission failed:', { error: err });
      addToast({ description: "An error occurred submitting the address.", color: "danger" });
      onSubmitEnd && onSubmitEnd(false);
    }
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >  
        {error && <div className="text-red-500">{error}</div>}
        {/* Address Autocomplete */}
        <div className="flex relative gap-4">
          <Autocomplete
            placeholder={ 
              loadError 
                ? `Error: ${loadError.message}`
                : !isMapsApiReady 
                  ? "Loading Google Maps..." 
                  : autocompleteValue || (t('typeToSearchAddress') || "Enter street and address number")
            }
            value={autocompleteValue}
            onInputChange={setAutocompleteValue}
            onSelectionChange={(key) => {
              const selected = suggestions.find(item => item.place_id === key as string);
              if (selected) {
                handleAutocompleteSelect(selected.description, selected.place_id);
              }
            }}
            selectorIcon={null}
            isDisabled={!isMapsApiReady || !!loadError || isValidating || isSubmitting}
            variant="bordered"
            isLoading={!isMapsApiReady && !loadError}
            startContent={
              <Icon icon="solar:magnifer-linear" className="text-foreground" width={20} />
            }
            classNames={{
              base: "w-full",
              listbox: "max-h-[200px]",
              popoverContent: "z-[1000]",
              selectorButton: "hidden"
            }}
            onFocus={onAutocompleteFocus}
            onBlur={onAutocompleteBlur}
            menuTrigger="input"
            items={suggestions}
          >
            {suggestions.map((item) => (
              <AutocompleteItem key={item.place_id} textValue={item.description}>
                <div className="flex items-center">
                  <Icon icon="solar:map-point-linear" className="text-foreground mr-2" width={16} />
                  <span>{item.description}</span>
                </div>
              </AutocompleteItem>
            ))}
          </Autocomplete>
          
          {/* Submit Button */}
          <div className="flex h-full justify-end gap-2">
            <Button
              type="submit"
              className='bg-gradient-primary'
              color="primary"
              isLoading={isValidating || isSubmitting}
              isDisabled={isValidating || isSubmitting}
              onPress={() => {
                const validationResult = AddressZodSchema.safeParse(form.getValues());
                console.log(validationResult);
              }}
            >
              Ok
            </Button>
          </div>
        </div>

        {/* Google Map */}
        {isMapsApiReady && (
          <div 
            className={`mt-2 w-full h-[70vh] sm:h-[400px] rounded-lg overflow-hidden transition-all duration-300 ${isMapVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <div 
              ref={mapRef} 
              className="w-full h-full"
              aria-label={"Map to select delivery address"}
            />
          </div>
        )}
      </form>
    </Form>
  );
}