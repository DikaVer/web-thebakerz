'use server';

import { AddressFormType, ValidationResult } from '@/components/providers/delivery-provider';
import { MerchantDeliveryRegion } from '@/lib/actions/delivery-actions';
import { containerDeliveryLocations, containerDeliveryRegions } from '@/db';
import { updateDeliveryAddress as dbUpdateDeliveryAddress } from '@/app/(store)/[id]/delivery-actions';
import { haversineDistance } from '@/lib/utils';
/**
 * Validates an address on the server side
 * Performs both address validation and distance calculation
 */
export async function validateAddress(
  addressData: AddressFormType,
  storeId: string
): Promise<ValidationResult> {
  console.log("Server: Validating address...", addressData.formattedAddress);
  
  try {
    // 1. Ensure we have coordinates
    let coords = addressData.coordinates;
    
    // Geocode if coordinates are missing
    if (!coords && addressData.formattedAddress) {
      try {
        console.log("Server: Geocoding address:", addressData.formattedAddress);
        // Use Google Maps Geocoding API on the server
        const geocodingResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            addressData.formattedAddress
          )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        
        const geocodeData = await geocodingResponse.json();
        
        if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
          const location = geocodeData.results[0].geometry.location;
          coords = { lat: location.lat, lng: location.lng };
          console.log("Server: Geocoded coordinates:", coords);
        } else {
          return {
            isValid: false,
            isInRange: false,
            message: "Could not geocode address. Please check the details."
          };
        }
      } catch (error) {
        console.error("Server: Geocoding error:", error);
        return {
          isValid: false,
          isInRange: false,
          message: "Failed to verify address location."
        };
      }
    } else if (!coords) {
      return {
        isValid: false,
        isInRange: false,
        message: "Address is incomplete, missing coordinates."
      };
    }
    
    // 2. Get delivery regions for the store
    console.log("Server: Fetching delivery regions for store:", storeId);
    // Query the delivery regions from the database
    const querySpec = {
      query: "SELECT * FROM c WHERE c.storeId = @storeId",
      parameters: [{ name: "@storeId", value: storeId }]
    };

    const { resources: deliveryRegions } = await containerDeliveryRegions.items
      .query(querySpec)
      .fetchAll();
    
    if (!deliveryRegions || deliveryRegions.length === 0) {
      return { 
        isValid: true, 
        isInRange: false, 
        message: "No delivery regions defined by the merchant.", 
        validatedAddress: addressData, 
        coordinates: coords, 
        formattedAddress: addressData.formattedAddress 
      };
    }
    
    // 3. Calculate distances and find the closest region
    console.log("Server: Calculating distances to", deliveryRegions.length, "regions");
    let closestRegion: MerchantDeliveryRegion | null = null;
    let minDistance = Infinity;
    
    for (const region of deliveryRegions) {
      if (region.coordinates) {
        const distance = haversineDistance(coords, region.coordinates);
        console.log(`Server: Distance to ${region.name}: ${distance.toFixed(2)} km`);
        if (distance < minDistance) {
          minDistance = distance;
          closestRegion = region;
        }
      } else {
        console.warn(`Server: Delivery region '${region.name}' is missing coordinates.`);
      }
    }
    
    // 4. Determine if the address is within range and find the applicable pricing tier
    if (closestRegion) {
      console.log(`Server: Found closest region: ${closestRegion.name} at ${minDistance.toFixed(2)} km`);
      
      // First check if we have multi-range pricing 
      let applicableRange = null;
      
      if (closestRegion.ranges && Array.isArray(closestRegion.ranges) && closestRegion.ranges.length > 0) {
        // Sort ranges by distance (ascending)
        const sortedRanges = [...closestRegion.ranges].sort((a, b) => a.range - b.range);
        console.log(`Server: Region has ${sortedRanges.length} delivery ranges`);
        
        // Find the applicable range based on the distance
        for (const range of sortedRanges) {
          if (minDistance <= range.range) {
            applicableRange = range;
            console.log(`Server: Found applicable range: ${range.range} km with delivery price ${range.deliveryPriceInCents / 100}€`);
            break;
          }
        }
      }

      if (applicableRange) {
        // Address is within range - use the applicable range pricing or fall back to legacy pricing
        const deliveryPriceInCents = applicableRange.deliveryPriceInCents;
        
        const minOrderPriceInCents = applicableRange.minOrderPriceInCents;

        console.log(`Server: Address is within delivery range. Using delivery price: ${deliveryPriceInCents / 100}€, min order: ${minOrderPriceInCents / 100}€`);
        return {
          isValid: true,
          isInRange: true,
          message: `Address is within the '${closestRegion.name}' delivery zone.`,
          deliveryRegion: {
            ...closestRegion,
            ranges: [applicableRange]
          },
          formattedAddress: addressData.formattedAddress,
          coordinates: coords,
          validatedAddress: { ...addressData, coordinates: coords },
        };
      } else {
        console.log(`Server: Address is outside the nearest delivery zone (${minDistance.toFixed(2)} km away).`);
        return {
          isValid: true,
          isInRange: false,
          message: `Address is outside our delivery area. Nearest location is ${minDistance.toFixed(1)} km away.`,
          formattedAddress: addressData.formattedAddress,
          coordinates: coords,
          validatedAddress: { ...addressData, coordinates: coords },
        };
      }
    } else {
      // Should not happen if deliveryRegions is not empty, but handle defensively
      return { 
        isValid: true, 
        isInRange: false, 
        message: "Could not determine delivery eligibility.", 
        formattedAddress: addressData.formattedAddress, 
        coordinates: coords, 
        validatedAddress: { ...addressData, coordinates: coords }
      };
    }
  } catch (error) {
    console.error("Server: Error validating address:", error);
    return {
      isValid: false,
      isInRange: false,
      message: "An unexpected error occurred while validating the address."
    };
  }
}

/**
 * Saves a validated address to the database
 */
export async function saveDeliveryAddress(
  storeId: string,
  address: AddressFormType
): Promise<{ success?: string; error?: string }> {
  try {
    // Use the existing updateDeliveryAddress implementation
    console.log("Server: Saving address:", address);
    return await dbUpdateDeliveryAddress(storeId, address);
  } catch (error) {
    console.error("Server: Error saving address:", error);
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
  addressData: AddressFormType
): Promise<{
  validationResult: ValidationResult;
  saveResult: { success?: string; error?: string };
}> {
  console.log("Server: Validating and saving address");
  
  // 1. Validate the address
  const validationResult = await validateAddress(addressData, storeId);
  
  // 2. If valid (even if out of range), save it
  let saveResult: { success?: string; error?: string } = {};
  
  if (validationResult.isValid && validationResult.validatedAddress && validationResult.isInRange) {
    saveResult = await saveDeliveryAddress(storeId, validationResult.validatedAddress);
  } else {
    saveResult = { error: "Address validation failed" };
  }
  
  return {
    validationResult,
    saveResult
  };
}

