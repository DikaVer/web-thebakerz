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
import { MAX_CHARS_ADDRESS, GOOGLE_MAPS_LIBRARIES, COUNTRY_RESTRICTION, DUTCH_POSTAL_CODE_REGEX } from '@/lib/schemas/address.schema';
import { DeliveryAddress, DeliveryAddressRaw } from '@/app/(store)/[id]/delivery-actions';
import { logger } from '@/lib/logger';

// --- Define validation schema ---
const AddressZodSchema = z.object({
  street: z.string().min(2, 'Street is required').max(MAX_CHARS_ADDRESS.street),
  houseNumber: z.string().min(1, 'House number is required').max(MAX_CHARS_ADDRESS.houseNumber),
  city: z.string().min(2, 'City is required').max(MAX_CHARS_ADDRESS.city),
  zipCode: z.string().min(4, 'Valid postal code required').max(MAX_CHARS_ADDRESS.zipCode)
    .refine(val => DUTCH_POSTAL_CODE_REGEX.test(val.replace(/\s+/g, '')), 
      { message: 'Should be a valid Dutch postal code (e.g. 1234 AB)' }),
  additionalInfo: z.string().max(MAX_CHARS_ADDRESS.additionalInfo).optional(),
});

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

// --- Address Form Component ---
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

  // --- State ---
  const [address, setAddress] = useState<DeliveryAddressRaw>({
    formattedAddress: '',
    street: '',
    houseNumber: '',
    city: '',
    zipCode: '',
    additionalInfo: '',
    coordinates: { lat: 0, lng: 0 },
    country: 'NL',
    ...initialAddress,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryAddress, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autocompleteValue, setAutocompleteValue] = useState(initialAddress?.formattedAddress || '');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearchReady, setIsSearchReady] = useState(false);
  
  // --- Refs ---
  const formRef = useRef<HTMLFormElement>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Initialize services when Maps API is available globally
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
  }, []); // Empty dependency array, runs once on mount and checks periodically

  // Fetch suggestions when input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isSearchReady || !autocompleteValue.trim() || !window.google?.maps?.places || !sessionTokenRef.current) {
        setSuggestions([]);
        return;
      }

      try {
        const request = {
          input: autocompleteValue,
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

  // --- Validation ---
  const validateField = useCallback((field: keyof DeliveryAddress, value: string): boolean => {
    try {
      // Check if the field is one of the known schema fields
      if (field === 'street' || field === 'houseNumber' || field === 'city' || 
          field === 'zipCode' || field === 'additionalInfo') {
        const fieldSchema = z.object({ [field]: AddressZodSchema.shape[field] });
        fieldSchema.parse({ [field]: value });
        setErrors(prev => ({ ...prev, [field]: undefined }));
        return true;
      }
      return true; // Fields not in schema (like formattedAddress) pass validation
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(e => e.path[0] === field);
        setErrors(prev => ({ ...prev, [field]: fieldError?.message }));
      }
      return false;
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    try {
      if (!address) return false;
      // Extract fields that should be validated
      const { street, houseNumber, city, zipCode, additionalInfo } = address;
      AddressZodSchema.parse({ street, houseNumber, city, zipCode, additionalInfo });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof DeliveryAddress, string>> = {};
        error.errors.forEach(err => {
          const field = err.path[0] as keyof DeliveryAddress;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [address]);

  // --- Field Input Handlers ---
  const handleInputChange = useCallback((field: keyof DeliveryAddress, value: string) => {
    if (field === 'zipCode') {
      const formattedZipCode = formatDutchPostalCode(value);
      setAddress(prev => ({
        ...prev,
        [field]: formattedZipCode
      }));
      validateField(field, formattedZipCode);
    } else {
      setAddress(prev => ({
        ...prev,
        [field]: value
      }));
      validateField(field, value);
    }
  }, [validateField]);

  // --- Handlers for places autocomplete ---
  const handleAutocompleteSelect = async (description: string, placeId?: string) => {
    try {
      logger.debug('addressForm', 'Handling selection for address:', { description });
      setSuggestions([]);
      setAutocompleteValue(description);
      
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
        setErrors(prev => ({ 
          ...prev, 
          formattedAddress: 'Error processing address. Please try again or enter manually.' 
        }));
        return;
      }
      
      const result = geocodeResults.results[0];
      if (!result || !result.geometry || !result.geometry.location) {
        setErrors(prev => ({ 
          ...prev, 
          formattedAddress: 'Invalid address format. Please try again or enter manually.' 
        }));
        return;
      }

      const coords = {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng()
      };
      
      let street = '';
      let houseNumber = '';
      let city = '';
      let zipCode = '';
      let country = '';
      
      for (const component of result.address_components) {
        const types = component.types;
        
        if (types.includes('route')) {
          street = component.long_name;
        }
        
        if (types.includes('street_number')) {
          houseNumber = component.long_name;
        }
        
        if (types.includes('locality') || types.includes('postal_town')) {
          city = component.long_name;
        }
        
        if (types.includes('postal_code')) {
          zipCode = formatDutchPostalCode(component.long_name);
        }
        
        if (types.includes('country')) {
          country = component.short_name;
        }
      }
      
      // Validate required fields
      if (!street || !houseNumber || !city || !zipCode) {
        setErrors({
          street: !street ? 'Street is required' : '',
          houseNumber: !houseNumber ? 'House number is required' : '',
          city: !city ? 'City is required' : '',
          zipCode: !zipCode ? 'Valid postal code required' : ''
        });
      }
      
      const addressData: DeliveryAddressRaw = {
        formattedAddress: description,
        street: street,
        houseNumber: houseNumber,
        city: city,
        zipCode: zipCode,
        country: country,
        coordinates: coords,
        additionalInfo: address.additionalInfo
      };

      // Update address state
      setAddress(prev => ({
        ...prev,
        ...addressData
      }));
      
      // Clear any existing errors
      setErrors({});
      
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      
    } catch (error) {
      logger.error('addressForm', 'Error selecting place:', { error });
      setErrors(prev => ({ 
        ...prev, 
        formattedAddress: 'Error processing address. Please try typing manually.' 
      }));
    }
  };

  // --- Form Submission ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isValidating || isSubmitting) {
      onClose && onClose();
      return;
    }
    
    // Create formatted address if needed
    if (!address.formattedAddress && address.street && address.city) {
      const formattedAddress = `${address.street} ${address.houseNumber}, ${address.zipCode} ${address.city}, Netherlands`;
      const updatedAddress = {
        ...address,
        formattedAddress
      };
      
      // Update address and validate in a single state update
      setAddress(updatedAddress);
      
      if (validateForm()) {
        try {
          setIsSubmitting(true);
          const success = await handleAddressSubmit(updatedAddress);
          
          if (success) {
            onClose && onClose();
          }
        } catch (err) {
          logger.error('addressForm', 'Form submission failed:', { error: err });
        } finally {
          setIsSubmitting(false);
        }
      }
    } else {
      if (validateForm()) {
        try {
          setIsSubmitting(true);
          const success = await handleAddressSubmit(address);
          
          if (success) {
            onClose && onClose();
          }
        } catch (err) {
          logger.error('addressForm', 'Form submission failed:', { error: err });
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  // --- Effects ---
  // Update state if initialAddress changes and validate fields
  useEffect(() => {
    if (initialAddress) {
      setAddress(prev => ({ ...prev, ...initialAddress }));
      
      if (initialAddress.formattedAddress) {
        setAutocompleteValue(initialAddress.formattedAddress);
      }
      
      // Validate fields after state is updated
      setTimeout(() => {
        if (initialAddress.street) validateField('street', initialAddress.street);
        if (initialAddress.houseNumber) validateField('houseNumber', initialAddress.houseNumber);
        if (initialAddress.city) validateField('city', initialAddress.city);
        if (initialAddress.zipCode) validateField('zipCode', initialAddress.zipCode);
        if (initialAddress.additionalInfo) validateField('additionalInfo', initialAddress.additionalInfo);
      }, 0);
    }
  }, [initialAddress, validateField]);


  return (
    <form
      ref={formRef}
      onSubmit={handleFormSubmit}
      className="flex flex-col gap-4"
      noValidate
    >
      {/* HeroUI Autocomplete Component */}
      <div className="relative">
        <Autocomplete
          label={t('searchAddress') || "Search for an address"}
          placeholder={ 
            !isSearchReady 
              ? "Loading Google Maps..." 
              : t('typeToSearchAddress') || "Type to search (e.g. Damstraat 1, Amsterdam)"
          }
          value={autocompleteValue}
          onInputChange={setAutocompleteValue}
          onSelectionChange={(key) => {
            // Find the selected item from suggestions
            const selected = suggestions.find(item => item.place_id === key);
            if (selected) {
              handleAutocompleteSelect(selected.description, selected.place_id);
            }
          }}
          isDisabled={!isSearchReady || isValidating || isSubmitting}
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
      {address.coordinates.lat !== 0 && address.coordinates.lng !== 0 && (
        <>
        <Divider/>

          {/* Manual Address Fields */}
          <div className="flex flex-col gap-4">
        <div className="flex gap-2">
            <Input
                  label={t('street') || "Street"}
                  placeholder={t('enterStreet') || "Street name"}
                  value={address.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  isRequired
                  variant="bordered"
                  maxLength={MAX_CHARS_ADDRESS.street}
                  isInvalid={!!errors.street}
                  errorMessage={errors.street}
                  isDisabled={isValidating || isSubmitting}
                  className="flex-1"
            />
            <Input
                  label={t('houseNumber') || "House Number"}
                  placeholder={t('enterHouseNumber') || "Number"}
                  value={address.houseNumber}
                  onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                  isRequired
                  variant="bordered"
                  maxLength={MAX_CHARS_ADDRESS.houseNumber}
                  isInvalid={!!errors.houseNumber}
                  errorMessage={errors.houseNumber}
                  isDisabled={isValidating || isSubmitting}
                  className="w-1/3"
            />
        </div>

        <div className="flex gap-2">
            <Input
                  label={t('zipCode') || "Postal Code"}
                  placeholder={t('enterZipCode') || "1234 AB"}
                  value={address.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  isRequired
                  variant="bordered"
                  maxLength={MAX_CHARS_ADDRESS.zipCode}
                  isInvalid={!!errors.zipCode}
                  errorMessage={errors.zipCode}
                  isDisabled={isValidating || isSubmitting}
                  className="w-1/3"
            />
            <Input
                  label={t('city') || "City"}
                  placeholder={t('enterCity') || "City"}
                  value={address.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  isRequired
                  variant="bordered"
                  maxLength={MAX_CHARS_ADDRESS.city}
                  isInvalid={!!errors.city}
                  errorMessage={errors.city}
                  isDisabled={isValidating || isSubmitting}
                  className="flex-1"
            />
        </div>

        <Textarea
                label={t('additionalInfo') || "Additional Information"}
                placeholder={t('enterAdditionalInfo') || "Apartment number, floor, delivery instructions..."}
                value={address.additionalInfo || ''}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                variant="bordered"
                maxLength={MAX_CHARS_ADDRESS.additionalInfo}
                isInvalid={!!errors.additionalInfo}
                errorMessage={errors.additionalInfo}
                description={`${address.additionalInfo?.length || 0}/${MAX_CHARS_ADDRESS.additionalInfo}`}
                isDisabled={isValidating || isSubmitting}
        />
          </div>

          {/* Server Validation Error */}
          {validationError && (
              <div className={`text-sm mt-1 ${
                validationError.toLowerCase().includes('within') || 
                validationError.toLowerCase().includes('success') ? 
                'text-success' : 'text-danger'
              }`}>
                {validationError}
              </div>
        )}

          {/* Submit Button */}
        <div className="flex justify-end gap-2 mt-2">
            <Button
              type="submit"
              color="primary"
                isLoading={isValidating || isSubmitting}
                isDisabled={isValidating || isSubmitting || Object.values(errors).some(e => !!e)}
            >
              {t('confirm') || "Confirm Address"}
            </Button>
        </div>
        </>
      )}
    </form>
  );
}