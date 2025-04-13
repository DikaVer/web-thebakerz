'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Input,
  Textarea,
  Button,
  Spinner,
  Divider,
  addToast,
  Autocomplete,
  AutocompleteItem,
} from '@heroui/react';
import { AddressFormType } from '@/components/providers/delivery-provider'; // Import from our provider
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { useLoadScript } from '@react-google-maps/api';
import { Icon } from '@iconify/react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { useDelivery } from '@/components/providers/delivery-provider';

// --- Constants ---
const MAX_CHARS = {
  street: 100,
  houseNumber: 20,
  city: 100,
  zipCode: 20,
  additionalInfo: 100,
};
const GOOGLE_MAPS_LIBRARIES = ['places'];
const COUNTRY_RESTRICTION = ['nl']; // Netherlands

// Dutch postal code regex: 4 digits followed by 2 letters (with or without space)
const DUTCH_POSTAL_CODE_REGEX = /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/;

// --- Define validation schema ---
const AddressZodSchema = z.object({
  street: z.string().min(2, 'Street is required').max(MAX_CHARS.street),
  houseNumber: z.string().min(1, 'House number is required').max(MAX_CHARS.houseNumber),
  city: z.string().min(2, 'City is required').max(MAX_CHARS.city),
  zipCode: z.string().min(4, 'Valid postal code required').max(MAX_CHARS.zipCode)
    .refine(val => DUTCH_POSTAL_CODE_REGEX.test(val.replace(/\s+/g, '')), 
      { message: 'Should be a valid Dutch postal code (e.g. 1234 AB)' }),
  additionalInfo: z.string().max(MAX_CHARS.additionalInfo).optional(),
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
  initialAddress?: AddressFormType;
  isValidating: boolean;
  validationError?: string;
  onAutocompleteFocus?: () => void;
  onAutocompleteBlur?: () => void;
  onClose?: () => void;
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
  const { handleAddressSubmit, validationResult } = useDelivery();

  // --- State ---
  const [address, setAddress] = useState<AddressFormType>({
    formattedAddress: '',
    street: '',
    houseNumber: '',
    city: '',
    zipCode: '',
    additionalInfo: '',
    coordinates: undefined,
    ...initialAddress,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormType, string>>>({});
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- Refs ---
  const formRef = useRef<HTMLFormElement>(null);

  // --- Google Maps API Integration ---
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES as any,
    language: 'nl', // Set Dutch language for suggestions
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

  // --- usePlacesAutocomplete hook with optimized options ---
  const {
    ready,
    value: autocompleteValue,
    suggestions: { status, data },
    setValue: setAutocompleteValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    callbackName: "googleMapsAutocompleteCallback",
    requestOptions: {
      componentRestrictions: { country: COUNTRY_RESTRICTION },
      types: ['address'],
    },
    debounce: 350,
    cacheKey: 'delivery-location',
    initOnMount: true,
  });

  // Initialize Google Places Autocomplete when loaded
  useEffect(() => {
    if (isLoaded && ready) {
      // Initialize when both Google Maps is loaded and the hook is ready
      setAutocompleteValue(initialAddress?.formattedAddress || "", false);
    }
  }, [isLoaded, ready, initialAddress, setAutocompleteValue]);

  // --- Validation ---
  const validateField = useCallback((field: keyof AddressFormType, value: string): boolean => {
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
      // Extract fields that should be validated
      const { street, houseNumber, city, zipCode, additionalInfo } = address;
      AddressZodSchema.parse({ street, houseNumber, city, zipCode, additionalInfo });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof AddressFormType, string>> = {};
        error.errors.forEach(err => {
          const field = err.path[0] as keyof AddressFormType;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [address]);

  // --- Field Input Handlers ---
  const handleInputChange = useCallback((field: keyof AddressFormType, value: string) => {
    // For zipCode field, format the input as a Dutch postal code
    if (field === 'zipCode') {
      // Handle postal code formatting
      const formattedZipCode = formatDutchPostalCode(value);
      setAddress(prev => ({ ...prev, [field]: formattedZipCode }));
      validateField(field, formattedZipCode);
    } else {
      setAddress(prev => ({ ...prev, [field]: value }));
      validateField(field, value);
    }
  }, [validateField]);

  // --- Handlers for places autocomplete ---
  const handleAutocompleteSelect = async (description: string) => {
    try {
      console.log('Handling selection for address:', description);
      // Clear suggestions and update input field immediately for faster UI feedback
      clearSuggestions();
      setAutocompleteValue(description, false);
      
      // Get geocode results for the selected address
      const geocodeResults = await getGeocode({ address: description });
      
      if (!geocodeResults || geocodeResults.length === 0) {
        throw new Error('No geocoding results found');
      }
      
      console.log('Geocoding results received:', geocodeResults[0].formatted_address);
      
      // Extract coordinates
      const coords = await getLatLng(geocodeResults[0]);
      console.log('Coordinates extracted:', coords);
      
      // Extract address components
      let street = '';
      let houseNumber = '';
      let city = '';
      let zipCode = '';
      
      const addressComponents = geocodeResults[0].address_components;
      if (!addressComponents) {
        throw new Error('No address components found in geocoding result');
      }
      
      for (const component of addressComponents) {
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
          // Format Dutch postal code (e.g., 1234AB -> 1234 AB)
          const rawCode = component.long_name.replace(/\s+/g, '');
          zipCode = rawCode.length >= 6 
            ? `${rawCode.substring(0, 4)} ${rawCode.substring(4).toUpperCase()}`
            : rawCode;
        }
      }
      
      console.log('Extracted address components:', { street, houseNumber, city, zipCode });
      
      // Check if we have all the required fields
      if (!street || !city) {
        // Attempt to extract from formatted address if components are missing
        const parts = description.split(',');
        if (!street && parts.length > 0) {
          const streetPart = parts[0].trim().split(' ');
          if (streetPart.length > 1) {
            // Last part might be the house number
            houseNumber = houseNumber || streetPart.pop() || '';
            street = streetPart.join(' ');
          } else {
            street = streetPart[0];
          }
        }
        if (!city && parts.length > 1) {
          city = parts[1].trim();
        }
        
        console.log('Attempted to extract from formatted address:', { street, houseNumber, city });
      }
      
      // Update the address state with parsed components
      const updatedAddress = {
        ...address,
        formattedAddress: description,
        street: street || '',
        houseNumber: houseNumber || '',
        city: city || '',
        zipCode: zipCode || '',
        coordinates: coords
      };
      
      console.log('Setting address to:', updatedAddress);
      setAddress(updatedAddress);
      
      // Validate the parsed fields
      validateField('street', street);
      validateField('houseNumber', houseNumber);
      validateField('city', city);
      validateField('zipCode', zipCode);
      
      // Notify user if any required fields are missing
      if (!street || !houseNumber || !city || !zipCode) {
        setErrors(prev => ({
          ...prev,
          ...(street ? {} : { street: 'Street information is missing. Please add it manually.' }),
          ...(houseNumber ? {} : { houseNumber: 'House number is missing. Please add it manually.' }),
          ...(city ? {} : { city: 'City information is missing. Please add it manually.' }),
          ...(zipCode ? {} : { zipCode: 'Postal code is missing. Please add it manually.' })
        }));
      }
      
    } catch (error) {
      console.error('Error selecting place:', error);
      setErrors(prev => ({ 
        ...prev, 
        formattedAddress: 'Error processing address. Please try typing manually.' 
      }));
    }
  };

  // --- Current Location ---
  const handleLocationClick = async () => {
    if (!navigator.geolocation) {
      addToast({
        description: "Geolocation is not supported by your browser",
        color: "danger",
        timeout: 3000
      });
      return;
    }
    
    setIsLocating(true);
    
    try {
      // Improved geolocation implementation with better error handling and timeout management
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const locationTimeout = setTimeout(() => {
          reject(new Error("Location request timed out. Please try again."));
        }, 10000); // 10 seconds timeout
        
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(locationTimeout);
            resolve(pos);
          },
          (err) => {
            clearTimeout(locationTimeout);
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0
          }
        );
      });
      
      const { latitude, longitude } = position.coords;
      console.log("Successfully retrieved coordinates:", { latitude, longitude });
      
      // Use reverse geocoding to get address details
      const geocoder = new window.google.maps.Geocoder();
      console.log("Performing reverse geocoding...");
      const results = await geocoder.geocode({ location: { lat: latitude, lng: longitude } });
      
      if (results.results && results.results.length > 0) {
        const result = results.results[0];
        console.log("Reverse geocoding successful:", result.formatted_address);
        
        // Extract components similar to handleAutocompleteSelect
        let street = '';
        let houseNumber = '';
        let city = '';
        let zipCode = '';
        
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
    }
    
        // Set the address from geolocation result
        const updatedAddress = {
      ...address,
          formattedAddress: result.formatted_address,
          street: street || '',
          houseNumber: houseNumber || '',
          city: city || '',
          zipCode: zipCode || '',
          coordinates: { 
            lat: latitude, 
            lng: longitude 
          }
        };
        
        console.log("Setting address with components:", updatedAddress);
        setAddress(updatedAddress);
        setAutocompleteValue(result.formatted_address, false);
        
        // Validate the fields
        validateField('street', street);
        validateField('houseNumber', houseNumber);
        validateField('city', city);
        validateField('zipCode', zipCode);
        
        // Provide friendly notification for missing fields
        if (!street || !houseNumber || !city || !zipCode) {
          // Still missing some fields
          addToast({
            description: "Some address details might be missing. Please review before submitting.",
            color: "warning",
            timeout: 5000
          });
        } else {
          addToast({
            description: "Your location has been found!",
            color: "success",
            timeout: 2000
          });
        }
      } else {
        throw new Error("No address found for your location");
      }
    } catch (error: any) {
      console.error("Geolocation error:", error);
      
      // More specific error messages based on error code
      let errorMessage = "Could not determine your location";
      
      if (error.code) {
        switch(error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = "Location access was denied. Please allow location access in your browser settings.";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = "Your current location is unavailable. Please try again later.";
            break;
          case 3: // TIMEOUT
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addToast({
        description: errorMessage,
        color: "danger",
        timeout: 4000
      });
    } finally {
      setIsLocating(false);
    }
  };

  // --- Form Submission ---
  const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
    
    if (isValidating || isSubmitting) {
      onClose && onClose();
      return; // Prevent multiple submissions
    }
    
    // Make sure we have formatted address if street and city are provided
    if (!address.formattedAddress && address.street && address.city) {
      const formattedAddress = `${address.street} ${address.houseNumber}, ${address.zipCode} ${address.city}, Netherlands`;
      setAddress(prev => ({ ...prev, formattedAddress }));
    }
    
    // Make sure zipCode is properly formatted
    if (address.zipCode) {
      const formattedZipCode = formatDutchPostalCode(address.zipCode);
      if (formattedZipCode !== address.zipCode) {
        setAddress(prev => ({ ...prev, zipCode: formattedZipCode }));
      }
    }
    
    if (validateForm()) {
      console.log('Form is valid, submitting:', address);
      
      try {
        setIsSubmitting(true);
        
        // Use the delivery provider's handleAddressSubmit to validate and save the address via server-side validation
        const success = await handleAddressSubmit(address);
        
        if (success) {
          // If the address is valid and within delivery range, close the modal with small delay to show success state
          onClose && onClose();
        }
      } catch (err) {
        console.error('Form submission failed:', err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.error('Form validation failed');
      
      // Provide a user-friendly error message
      if (Object.keys(errors).length > 0) {
        const errorFieldNames = Object.keys(errors).map(field => {
          switch(field) {
            case 'street': return 'Street';
            case 'houseNumber': return 'House number';
            case 'city': return 'City';
            case 'zipCode': return 'Postal code';
            case 'additionalInfo': return 'Additional information';
            default: return field;
          }
        }).join(', ');
        
        addToast?.({
          description: `Please correct the following fields: ${errorFieldNames}`,
          color: "danger",
          timeout: 4000
        }) ?? alert(`Please correct the following fields: ${errorFieldNames}`);
      }
    }
  };

  // --- Effects ---
  // Update state if initialAddress changes and validate fields
  useEffect(() => {
    if (initialAddress) {
      setAddress(prev => ({ ...prev, ...initialAddress }));
      
      if (initialAddress.formattedAddress) {
        setAutocompleteValue(initialAddress.formattedAddress, false);
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
  }, [initialAddress, setAutocompleteValue, validateField]);


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
          placeholder={loadError 
            ? "Google Maps could not be loaded. Please check your connection." 
            : (!isLoaded 
              ? "Loading Google Maps..." 
              : t('typeToSearchAddress') || "Type to search (e.g. Damstraat 1, Amsterdam)"
            )
          }
          value={autocompleteValue}
          onInputChange={setAutocompleteValue}
          onSelectionChange={(key) => {
            // Find the selected item from data
            const selected = data.find(item => item.place_id === key);
            if (selected) {
              handleAutocompleteSelect(selected.description);
            }
          }}
          isDisabled={ !ready || isValidating || isLocating || isSubmitting}
          variant="bordered"
          isLoading={!isLoaded || !ready || isLocating}
          startContent={
            <Icon icon="solar:magnifer-linear" className="text-default-400" width={20} />
          }
          endContent={
            ((isValidating || isSubmitting) && <Spinner size="sm" color="current" />) ||
            (isLoaded && !isValidating && !isLocating && !isSubmitting && (
              <Button 
                isIconOnly 
                variant="light" 
                size="sm" 
                onPress={handleLocationClick}
                title="Use current location"
                isDisabled={!ready}
              >
                <Icon icon="solar:map-arrow-square-outline" width={20} className="text-primary-500" />
              </Button>
            ))
          }
          description={
            loadError
              ? "Error loading Google Maps. Please check your API key and try again."
              : !isLoaded
              ? "Loading Google Maps..."
              : !ready
              ? "Initializing address search..."
              : isLocating
              ? "Finding your location..."
              : isSubmitting
              ? "Validating address..."
              : "Type to search for an address"
          }
          classNames={{
            base: "w-full",
            listbox: "max-h-[200px]",
            popoverContent: "z-[1000]"
          }}
          onFocus={onAutocompleteFocus}
          onBlur={onAutocompleteBlur}
          menuTrigger="input"
          items={data}
        >
          {data.map((item) => (
            <AutocompleteItem key={item.place_id} textValue={item.description}>
              <div className="flex items-center">
                <Icon icon="solar:map-point-linear" className="text-default-500 mr-2" width={16} />
                <span>{item.description}</span>
              </div>
            </AutocompleteItem>
          ))}
        </Autocomplete>
      </div>
      {address.coordinates && (
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
              maxLength={MAX_CHARS.street}
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
              maxLength={MAX_CHARS.houseNumber}
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
                  maxLength={MAX_CHARS.zipCode}
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
                  maxLength={MAX_CHARS.city}
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
                maxLength={MAX_CHARS.additionalInfo}
                isInvalid={!!errors.additionalInfo}
                errorMessage={errors.additionalInfo}
                description={`${address.additionalInfo?.length || 0}/${MAX_CHARS.additionalInfo}`}
                isDisabled={isValidating || isSubmitting}
        />
          </div>

          {/* Server Validation Error */}
          {validationError && (
              <div className="text-danger text-sm mt-1">{validationError}</div>
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