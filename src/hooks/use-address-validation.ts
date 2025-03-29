import { useState, useCallback } from 'react';
import { MerchantDeliveryRegion } from '@/lib/actions/delivery-actions';
import { 
  geocodeAddress, 
  checkDeliveryRange, 
  AddressComponents
} from '@/lib/maps/google-maps';
import { AddressZodSchema } from '@/lib/schemas/address.schema';
import { ZodError } from 'zod';

export interface AddressForm {
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  additionalInfo: string;
}

export interface ValidationResult {
  isValid: boolean;
  isInRange: boolean;
  formattedAddress?: string;
  validatedAddress?: AddressComponents;
  deliveryRegion?: MerchantDeliveryRegion;
  error?: string;
}

export function useAddressValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: false,
    isInRange: false
  });

  const validateAddress = useCallback(
    async (
      address: AddressForm,
      storeCoordinates: { latitude: number; longitude: number },
      deliveryRegions: MerchantDeliveryRegion[]
    ): Promise<ValidationResult> => {
      setIsValidating(true);
      
      try {
        // Validate with Zod schema first
        try {
          AddressZodSchema.parse(address);
        } catch (error) {
          if (error instanceof ZodError) {
            const fieldErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
            const result = {
              isValid: false,
              isInRange: false,
              error: `Validation failed: ${fieldErrors}`
            };
            setValidationResult(result);
            return result;
          }
        }

        // Geocode the address using Google Maps API
        const geocodedAddress = await geocodeAddress({
          street: address.street,
          houseNumber: address.houseNumber,
          city: address.city,
          zipCode: address.zipCode
        });

        if (!geocodedAddress) {
          const result = {
            isValid: false,
            isInRange: false,
            error: 'Could not validate the address. Please check and try again.'
          };
          setValidationResult(result);
          return result;
        }

        // Verify that the geocoded city matches the input city
        if (geocodedAddress.city.toLowerCase() !== address.city.toLowerCase()) {
          console.warn(`City mismatch warning: Input "${address.city}" vs Geocoded "${geocodedAddress.city}"`);
          // We still use the user's input for the city as we fixed it in the geocoding function
        }

        // Check if the address is within delivery range
        const { inRange, closestRegion } = checkDeliveryRange(
          geocodedAddress.coordinates,
          storeCoordinates,
          deliveryRegions
        );

        const result = {
          isValid: true,
          isInRange: inRange,
          formattedAddress: geocodedAddress.formattedAddress,
          validatedAddress: geocodedAddress,
          deliveryRegion: closestRegion || undefined,
          error: inRange ? undefined : 'Address is outside our delivery range'
        };

        setValidationResult(result);
        return result;
      } catch (error) {
        console.error('Error validating address:', error);
        
        const result = {
          isValid: false,
          isInRange: false,
          error: 'An error occurred while validating the address'
        };
        
        setValidationResult(result);
        return result;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  const resetValidation = useCallback(() => {
    setValidationResult({
      isValid: false,
      isInRange: false
    });
  }, []);

  return {
    isValidating,
    validationResult,
    validateAddress,
    resetValidation
  };
} 