'use server';

import { ValidationResult } from '@/components/providers/delivery-provider';
import { MerchantDeliveryRegion, getMerchantDeliveryRegions, DeliveryRange } from '@/lib/actions/delivery-actions';
import { updateDeliveryAddress as dbUpdateDeliveryAddress, DeliveryAddress, DeliveryAddressRaw } from '@/app/(store)/[id]/delivery-actions';
import { haversineDistance } from '@/lib/utils';
import { logger } from '@/lib/logger';

/**
 * Validates an address on the server side
 * Performs both address validation and distance calculation
 */
export async function validateAddress(
  addressData: DeliveryAddressRaw,
  storeId: string
): Promise<ValidationResult> {
  logger.debug("validateAddress", "Validating address...", { address: addressData.formattedAddress });
  
  try {
    // 1. Validate required fields
    if (!addressData.street || !addressData.houseNumber || !addressData.city || !addressData.zipCode) {
      return {
        isValid: false,
        isInRange: false,
        message: "Please fill in all required address fields.",
        validatedAddress: addressData
      };
    }

    // 2. Ensure we have coordinates
    let coords = addressData.coordinates;
    
    // Geocode if coordinates are missing
    if (!coords && addressData.formattedAddress) {
      try {
        logger.debug("validateAddress", "Geocoding address:", { address: addressData.formattedAddress });
        const geocodingResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            addressData.formattedAddress
          )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        
        const geocodeData = await geocodingResponse.json();
        
        if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
          const location = geocodeData.results[0].geometry.location;
          coords = { lat: location.lat, lng: location.lng };
          logger.debug("validateAddress", "Geocoded coordinates:", { coords });
        } else {
          return {
            isValid: false,
            isInRange: false,
            message: "Could not verify address location. Please check the details.",
            validatedAddress: addressData
          };
        }
      } catch (error) {
        logger.error("validateAddress", "Geocoding error:", { error });
        return {
          isValid: false,
          isInRange: false,
          message: "Failed to verify address location.",
          validatedAddress: addressData
        };
      }
    }
    
    // 3. Get delivery regions for the store
    logger.debug("validateAddress", "Fetching delivery regions for store:", { storeId });
    const deliveryRegions = await getMerchantDeliveryRegions(storeId);
    if (!deliveryRegions || deliveryRegions.length === 0) {
      return { 
        isValid: true, 
        isInRange: false, 
        message: "No delivery regions defined by the merchant.", 
        validatedAddress: addressData, 
      };
    }
    
    // 4. Calculate distances and find the closest region
    logger.debug("validateAddress", "Calculating distances to regions", { regionCount: deliveryRegions.length });
    let closestRegion: MerchantDeliveryRegion | null = null;
    let applicableRange: DeliveryRange | null = null;
    let minDistance = Infinity;
    let minPrice = Infinity;
    
    for (const region of deliveryRegions) {
      logger.debug("validateAddress", `Checking region: ${region.name}`);
      // Check for country-wide delivery first
      if (region.isCountry && addressData.country && 
          region.minOrderPriceInCents && region.deliveryPriceInCents && 
          minPrice > region.minOrderPriceInCents && 
          region.name.toLowerCase() === addressData.country.toLowerCase()) {

          logger.debug("validateAddress", `Found country-wide delivery region: ${region.name}`);
          closestRegion = region;
          minPrice = region.minOrderPriceInCents;
          applicableRange = {
            range: 0,
            deliveryPriceInCents: region.deliveryPriceInCents,
            minOrderPriceInCents: region.minOrderPriceInCents
          };
      } else  {
        // Check for city/region based delivery
        if (region.coordinates && coords) {
          const distance = haversineDistance(coords, region.coordinates);
          logger.debug("validateAddress", `Distance to ${region.name}: ${distance.toFixed(2)} km`);
          if (distance < minDistance && region.ranges) {
            const sortedRanges = [...region.ranges].sort((a, b) => a.range - b.range);

            for (const range of sortedRanges) {
              if (range.minOrderPriceInCents <= minPrice && distance <= range.range) {

                minPrice = range.minOrderPriceInCents;
                closestRegion = region;
                minDistance = distance;
                applicableRange = range;
                break;
              }
            }
          }
        }
      }
    }
    
    // 5. Determine if the address is within range and find the applicable pricing tier
    if (closestRegion && applicableRange) {
      logger.debug("validateAddress", `Found closest region: ${closestRegion.name} at ${minDistance.toFixed(2)} km`);
      logger.debug("validateAddress", `Found applicable range: ${applicableRange?.range} km with delivery price ${(applicableRange?.deliveryPriceInCents / 100).toFixed(2)}€`);

      if (applicableRange || closestRegion.isCountry) {
        const deliveryPriceInCents = applicableRange?.deliveryPriceInCents || closestRegion.deliveryPriceInCents || 100000;
        const minOrderPriceInCents = applicableRange?.minOrderPriceInCents || closestRegion.minOrderPriceInCents || 100000;

        logger.debug("validateAddress", `Address is within delivery range. Using delivery price: ${deliveryPriceInCents / 100}€, min order: ${minOrderPriceInCents / 100}€`);
        return {
          isValid: true,
          isInRange: true,
          message: `Address is within the '${closestRegion.name}' delivery zone.`,
          deliveryRegion: {
            ...closestRegion,
            ranges: [applicableRange]
          },
          validatedAddress: { ...addressData, coordinates: coords },
        };
      } else {
        logger.debug("validateAddress", `Address is outside the nearest delivery zone (${minDistance.toFixed(2)} km away).`);
        return {
          isValid: true,
          isInRange: false,
          message: `Address is outside our delivery area. Nearest location is ${minDistance.toFixed(1)} km away.`,
          validatedAddress: { ...addressData, coordinates: coords },
        };
      }
    } else {
      return { 
        isValid: true, 
        isInRange: false, 
        message: "Could not determine delivery eligibility.", 
        validatedAddress: { ...addressData, coordinates: coords }
      };
    }
  } catch (error) {
    logger.error("validateAddress", "Error validating address:", { error });
    return {
      isValid: false,
      isInRange: false,
      message: "An unexpected error occurred while validating the address.",
      validatedAddress: addressData
    };
  }
}

/**
 * Saves a validated address to the database
 */
export async function saveDeliveryAddress(
  storeId: string,
  address: Omit<DeliveryAddress, 'id' | 'storeId' | 'userId' | 'createdAt' | 'type'>
): Promise<{ success?: string; error?: string }> {
  try {
    // Use the existing updateDeliveryAddress implementation
    logger.debug("saveDeliveryAddress", "Saving address:", { address });
    return await dbUpdateDeliveryAddress(storeId, address);
  } catch (error) {
    logger.error("saveDeliveryAddress", "Error saving address:", { error });
    return {
      error: "Failed to save address"
    };
  }
}

/**
 * Handles both validation and saving in one server action
 */
export async function validateAndSaveAddress(
  storeId: string,
  addressData: DeliveryAddressRaw
): Promise<{
  validationResult: ValidationResult;
  saveResult: { success?: string; error?: string };
}> {
  logger.debug("validateAndSaveAddress", "Validating and saving address");
  
  // 1. Validate the address
  const validationResult = await validateAddress(addressData, storeId);
  
  // 2. If valid (even if out of range), save it
  let saveResult: { success?: string; error?: string } = {};
  
  if (validationResult.isValid && validationResult.validatedAddress && validationResult.isInRange) {

    const deliveryAddress: DeliveryAddressRaw = {
      ...validationResult.validatedAddress,
    }

    saveResult = await saveDeliveryAddress(storeId, deliveryAddress);
  } else {
    saveResult = { error: "Address validation failed" };
  }
  
  return {
    validationResult,
    saveResult
  };
}

