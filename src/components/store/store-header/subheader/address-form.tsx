'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Input,
  Textarea,
  Button,
  Divider,
  addToast,
  Autocomplete,
  AutocompleteItem,
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Icon } from '@iconify/react';
import { useDelivery } from '@/components/providers/delivery-provider';
import { 
    AddressZodSchema, 
    MAX_CHARS_ADDRESS, 
    GOOGLE_MAPS_LIBRARIES, 
    COUNTRY_RESTRICTION, 
    DUTCH_POSTAL_CODE_REGEX 
} from '@/lib/schemas/address.schema';
import { DeliveryAddress, DeliveryAddressRaw } from '@/app/(store)/[id]/delivery-actions';
import { logger } from '@/lib/logger';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// --- Normalize a Dutch postal code to the format "1234 AB" ---
const formatDutchPostalCode = (code: string): string => {
  // Remove all spaces
  const cleanCode = code.replace(/\s+/g, '');
  
  // Check if it's a valid format (4 digits + 2 letters)
  if (DUTCH_POSTAL_CODE_REGEX.test(cleanCode)) {
    // Insert a space between digits and letters
    return `${cleanCode.substring(0, 4)} ${cleanCode.substring(4).toUpperCase()}`;
  }
  
  // Return original if not valid
  return code;
};

// --- Interfaces ---
interface AddressFormProps {
  initialAddress?: DeliveryAddressRaw;
  isValidating: boolean;
  validationError?: string;
  onAutocompleteFocus?: () => void;
  onAutocompleteBlur?: () => void;
  onClose?: () => void;
}

interface PlaceSuggestion {
  place_id: string;
  description: string;
}

// Define the type for the form data based on the Zod schema
type AddressFormData = z.infer<typeof AddressZodSchema> & {
  formattedAddress?: string; // Keep formattedAddress outside Zod validation if needed
  coordinates?: { lat: number; lng: number };
  country?: string;
};

// --- Address Form Component --- Refactored with React Hook Form
export function AddressForm({
  initialAddress,
  isValidating,
  validationError,
  onAutocompleteFocus,
  onAutocompleteBlur,
  onClose,
}: AddressFormProps) {
  const t = useTranslations('app/(store)/components/store-subheader');
  const { handleAddressSubmit } = useDelivery();

  // --- RHF Setup ---
  const form = useForm<AddressFormData>({
    resolver: zodResolver(AddressZodSchema),
    defaultValues: {
      street: initialAddress?.street || '',
      houseNumber: initialAddress?.houseNumber || '',
      city: initialAddress?.city || '',
      zipCode: initialAddress?.zipCode || '',
      additionalInfo: initialAddress?.additionalInfo || '',
      // Keep non-schema fields separate if needed, or add to schema if they should be validated
      formattedAddress: initialAddress?.formattedAddress || '',
      coordinates: initialAddress?.coordinates || { lat: 0, lng: 0 },
      country: initialAddress?.country || 'NL',
    },
  });
  const { handleSubmit, control, setValue, reset, watch, formState: { errors, isSubmitting: isRHFSubmitting } } = form;

  // --- State for Autocomplete & Google Maps --- (Keep these)
  const [autocompleteValue, setAutocompleteValue] = useState(initialAddress?.formattedAddress || '');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearchReady, setIsSearchReady] = useState(false);
  
  // --- Refs --- (Keep these)
  const formRef = useRef<HTMLFormElement>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const isSelectingAutocomplete = useRef(false); // Ref to track autocomplete selection

  // --- Effects for Google Maps initialization and suggestion fetching --- (Keep these)
  useEffect(() => {
    const checkGoogleMapsReady = () => {
      if (window.google?.maps?.places) {
        setIsSearchReady(true);
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
        logger.debug('addressForm', 'Google Maps and Places API ready via window object');
      } else {
        // If not ready, check again shortly
        setTimeout(checkGoogleMapsReady, 100); 
      }
    };
    checkGoogleMapsReady();

    // Cleanup function is not strictly necessary here as we're not initializing anything
    // that needs explicit cleanup related to this effect's trigger.
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isSearchReady || !autocompleteValue.trim() || !window.google?.maps?.places || !sessionTokenRef.current) {
        setSuggestions([]);
        return;
      }

      try {
        const request = {
          input: autocompleteValue,
          types: ['address'], // More specific than includedPrimaryTypes
          componentRestrictions: { 
            country: COUNTRY_RESTRICTION 
          },
          language: 'nl',
          sessionToken: sessionTokenRef.current,
        };

        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(request, (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const formattedSuggestions: PlaceSuggestion[] = predictions.map(p => ({
              place_id: p.place_id,
              description: p.description,
            }));
            
            setSuggestions(formattedSuggestions);
          } else {
            logger.error('addressForm', 'Error fetching place suggestions:', { status });
            setSuggestions([]);
          }
        });
      } catch (error) {
        logger.error('addressForm', 'Error fetching place suggestions:', { error });
        setSuggestions([]);
      }
    };

    // Debounce the suggestions request
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [autocompleteValue, isSearchReady]);

  // Log when relevant states change
  useEffect(() => {
    logger.debug('addressForm', 'Places API ready state:', { 
      isSearchReady, 
      windowGoogleExists: !!window.google,
      googleMapsExists: !!window.google?.maps,
      googleMapsPlacesExists: !!window.google?.maps?.places
    });
  }, [isSearchReady]); // Removed isLoaded dependency

  // Initialize autocomplete value when loaded
  useEffect(() => {
    // Removed isLoaded check
    if (isSearchReady && initialAddress?.formattedAddress) {
      setAutocompleteValue(initialAddress.formattedAddress);
    }
  }, [isSearchReady, initialAddress]); // Removed isLoaded dependency

  // Reset form when initialAddress changes
  useEffect(() => {
    if (initialAddress) {
      reset({ // Use RHF reset
        street: initialAddress.street || '',
        houseNumber: initialAddress.houseNumber || '',
        city: initialAddress.city || '',
        zipCode: initialAddress.zipCode || '',
        additionalInfo: initialAddress.additionalInfo || '',
        formattedAddress: initialAddress.formattedAddress || '',
        coordinates: initialAddress.coordinates || { lat: 0, lng: 0 },
        country: initialAddress.country || 'NL',
      });
      setAutocompleteValue(initialAddress.formattedAddress || '');
    } else {
        reset({ // Reset to empty if initialAddress is null/undefined
            street: '',
            houseNumber: '',
            city: '',
            zipCode: '',
            additionalInfo: '',
            formattedAddress: '',
            coordinates: { lat: 0, lng: 0 },
            country: 'NL',
          });
        setAutocompleteValue('');
    }
  }, [initialAddress, reset]);

  // --- Handlers for places autocomplete - ADAPTED for RHF ---
  const handleAutocompleteSelect = async (description: string, placeId?: string) => {
    try {
      logger.debug('addressForm', 'Handling selection for address:', { description });
      setSuggestions([]);
      setAutocompleteValue(description); // Still update autocomplete display on selection
      setValue('formattedAddress', description);
      
      const geocoder = new window.google.maps.Geocoder();
      let geocodeResults;

      try {
        if (placeId) {
          geocodeResults = await geocoder.geocode({ placeId });
        } else {
          geocodeResults = await geocoder.geocode({ address: description });
        }
        if (!geocodeResults?.results?.length) {
          throw new Error('No geocoding results found');
        }
      } catch (error) {
        logger.error('addressForm', 'Geocoding error:', { error });
        addToast({ description: 'Error processing address. Please try again or enter manually.', color: 'danger' });
        return;
      }

      const result = geocodeResults.results[0];
      if (!result || !result.geometry || !result.geometry.location) {
        addToast({ description: 'Invalid address format. Please try again or enter manually.', color: 'danger' });
        return;
      }

      const coords = {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng()
      };

      // Initialize variables before the loop
      let street = '';
      let houseNumber = '';
      let city = '';
      let zipCode = '';
      let country = '';

      // Process address components
      result.address_components.forEach(component => {
        const types = component.types;
        if (types.includes('route')) street = component.long_name;
        if (types.includes('street_number')) houseNumber = component.long_name;
        if (types.includes('locality') || types.includes('postal_town')) city = component.long_name;
        if (types.includes('postal_code')) zipCode = formatDutchPostalCode(component.long_name);
        if (types.includes('country')) country = component.short_name;
      });

      // Update RHF form values
      setValue('street', street, { shouldValidate: true });
      setValue('houseNumber', houseNumber, { shouldValidate: true });
      setValue('city', city, { shouldValidate: true });
      setValue('zipCode', zipCode, { shouldValidate: true });
      setValue('country', country);
      setValue('coordinates', coords);
      // additionalInfo remains unchanged from user input

      // Trigger validation for all fields after setting them
      form.trigger();

      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();

    } catch (error) {
      logger.error('addressForm', 'Error selecting place:', { error });
      addToast({ description: 'Error processing address. Please try typing manually.', color: 'danger' });
    }
  };

  // --- Form Submission - ADAPTED for RHF ---
  const onRHFSubmit = async (data: AddressFormData) => {
    // data here is the validated form data from RHF + Zod
    if (isValidating || isRHFSubmitting) {
      onClose && onClose();
      return;
    }

    // Construct the full address object expected by the server action
    // Ensure coordinates and country are included, even if not part of Zod schema
    const submissionData: DeliveryAddressRaw = {
      street: data.street,
      houseNumber: data.houseNumber,
      city: data.city,
      zipCode: data.zipCode,
      country: data.country || 'NL', // Ensure country has a fallback
      coordinates: data.coordinates || { lat: 0, lng: 0 }, // Ensure coordinates exist
      formattedAddress: data.formattedAddress || `${data.street} ${data.houseNumber}, ${data.zipCode} ${data.city}, ${data.country || 'NL'}`,
      additionalInfo: data.additionalInfo,
    };
    
    // If formattedAddress wasn't set by autocomplete, create it now
    if (!submissionData.formattedAddress && submissionData.street && submissionData.houseNumber && submissionData.zipCode && submissionData.city && submissionData.country) {
        submissionData.formattedAddress = `${submissionData.street} ${submissionData.houseNumber}, ${submissionData.zipCode} ${submissionData.city}, ${submissionData.country}`;
    }
    
    try {
      const success = await handleAddressSubmit(submissionData); // Call the context handler
      if (success) {
        onClose && onClose();
      }
    } catch (err) {
      // Errors should ideally be handled within handleAddressSubmit in the provider
      logger.error('addressForm', 'Form submission failed:', { error: err });
      addToast({ description: "An error occurred submitting the address.", color: "danger" });
    }
  };

  return (
    // Use FormProvider if needed, or just Form if context isn't passed down further
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={handleSubmit(onRHFSubmit)} // Use RHF's handleSubmit
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Server Validation Error (Moved to top for visibility) */}
        {validationError && (
          <div className={`text-sm p-2 rounded mb-2 ${
            validationError.toLowerCase().includes('within') || 
            validationError.toLowerCase().includes('success') ? 
            'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
          }`}>
            {validationError} 
          </div>
        )}
        
        {/* HeroUI Autocomplete Component - Keep as is, but ensure it interacts with RHF state if needed */}
        <div className="relative">
          <Autocomplete 
            label={t('searchAddress') || "Search for an address"}
            placeholder={ 
              !isSearchReady 
                ? "Loading Google Maps..." 
                : t('typeToSearchAddress') || "Type to search (e.g. Damstraat 1, Amsterdam)"
            }
            value={autocompleteValue}
            onInputChange={setAutocompleteValue} // Still control the visual input directly
            onSelectionChange={(key) => {
              const selected = suggestions.find(item => item.place_id === key as string);
              if (selected) {
                handleAutocompleteSelect(selected.description, selected.place_id);
              }
            }}
            isDisabled={!isSearchReady || isValidating || isRHFSubmitting}
            variant="bordered"
            isLoading={!isSearchReady}
            startContent={
              <Icon icon="solar:magnifer-linear" className="text-default-400" width={20} />
            }
            classNames={{
              base: "w-full",
              listbox: "max-h-[200px]",
              popoverContent: "z-[1000]"
            }}
            onFocus={onAutocompleteFocus}
            onBlur={onAutocompleteBlur}
            menuTrigger="input"
            items={suggestions}
          >
            {suggestions.map((item) => (
              <AutocompleteItem key={item.place_id} textValue={item.description}>
                <div className="flex items-center">
                  <Icon icon="solar:map-point-linear" className="text-default-500 mr-2" width={16} />
                  <span>{item.description}</span>
                </div>
              </AutocompleteItem>
            ))}
          </Autocomplete>
        </div>

        {/* Manual Address Fields - Refactored with RHF */}
        <>
          <Divider/>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <FormField
                control={control}
                name="street"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t('street') || "Street"}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('enterStreet') || "Street name"}
                        isRequired
                        variant="bordered"
                        maxLength={MAX_CHARS_ADDRESS.street}
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        isDisabled={isValidating || isRHFSubmitting}
                      />
                    </FormControl>
                    {/* <FormMessage /> */} {/* Use errorMessage prop instead if available */} 
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="houseNumber"
                render={({ field, fieldState }) => (
                  <FormItem className="w-1/3">
                    <FormLabel>{t('houseNumber') || "House Number"}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('enterHouseNumber') || "Number"}
                        isRequired
                        variant="bordered"
                        maxLength={MAX_CHARS_ADDRESS.houseNumber}
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        isDisabled={isValidating || isRHFSubmitting}
                      />
                    </FormControl>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2">
              <FormField
                control={control}
                name="zipCode"
                render={({ field, fieldState }) => (
                  <FormItem className="w-1/3">
                    <FormLabel>{t('zipCode') || "Postal Code"}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('enterZipCode') || "1234 AB"}
                        isRequired
                        variant="bordered"
                        maxLength={MAX_CHARS_ADDRESS.zipCode}
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        isDisabled={isValidating || isRHFSubmitting}
                        // Apply formatting on blur or change if needed
                        onBlur={(e) => field.onChange(formatDutchPostalCode(e.target.value))} 
                      />
                    </FormControl>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="city"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t('city') || "City"}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('enterCity') || "City"}
                        isRequired
                        variant="bordered"
                        maxLength={MAX_CHARS_ADDRESS.city}
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        isDisabled={isValidating || isRHFSubmitting}
                      />
                    </FormControl>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="additionalInfo"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('additionalInfo') || "Additional Information"}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('enterAdditionalInfo') || "Apartment number, floor, delivery instructions..."}
                      variant="bordered"
                      maxLength={MAX_CHARS_ADDRESS.additionalInfo}
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      // Use RHF value for description
                      description={`${field.value?.length || 0}/${MAX_CHARS_ADDRESS.additionalInfo}`}
                      isDisabled={isValidating || isRHFSubmitting}
                    />
                  </FormControl>
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="submit"
              color="primary"
              isLoading={isValidating || isRHFSubmitting} // Use RHF submitting state
              isDisabled={isValidating || isRHFSubmitting} // Disable during validation or RHF submission
            >
              {t('confirm') || "Confirm Address"}
            </Button>
          </div>
        </>
      </form>
    </Form>
  );
}