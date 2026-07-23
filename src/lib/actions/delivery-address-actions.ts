/**
 * @fileoverview Server actions for delivery address validation and persistence.
 *
 * Exports validateAddress, which geocodes an address with the Google Maps
 * Geocoding API, verifies postal code and city, and matches the coordinates
 * against the store's delivery regions (city ranges with a country-wide
 * fallback) using haversine distance to determine delivery eligibility and
 * pricing. Also provides reverse geocoding from coordinates and a wrapper for
 * saving a validated delivery address to the database.
 */
'use server';

import { ValidationResult } from '@/components/providers/delivery-provider';
import { MerchantDeliveryRegion, getMerchantDeliveryRegions, DeliveryRange } from '@/lib/actions/delivery-actions';
import { updateDeliveryAddress as dbUpdateDeliveryAddress, DeliveryAddress, DeliveryAddressRaw, ExtendedDeliveryAddressRaw } from '@/app/(store)/[id]/delivery-actions';
import { haversineDistance } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { getTranslations } from 'next-intl/server';

/**
 * Validates an address on the server side
 * Performs both address validation and distance calculation
 */
export async function validateAddress(
  addressData: DeliveryAddressRaw,
  storeId: string
): Promise<ValidationResult> {
  logger.debug("validateAddress", "Validating address...", { address: addressData.formattedAddress });
  const t = await getTranslations('lib/actions/delivery-address-actions');
  
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
    let coords = undefined; // Don't use client-side coordinates
    
    // Always geocode if formattedAddress is available
    if (addressData.formattedAddress) {
      try {
        logger.debug("validateAddress", "Geocoding address:", { address: addressData.formattedAddress });
        const geocodingResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            addressData.formattedAddress
          )}&key=${process.env.NEXT_PRIVATE_GOOGLE_GEO_VALIDATION}`
        );
        
        // Check if the request itself was successful
        if (!geocodingResponse.ok) {
          logger.error("validateAddress", "Geocoding HTTP error:", { 
            status: geocodingResponse.status,
            statusText: geocodingResponse.statusText 
          });
          return {
            isValid: false,
            isInRange: false,
            message: t('FailedToVerifyAddressLocation') || "Failed to verify address location.",
            validatedAddress: addressData
          };
        }
        
        const geocodeData = await geocodingResponse.json();
        
        // Log the actual response data, not the Response object
        logger.debug("validateAddress", "Geocoding response data:", { 
          status: geocodeData.status,
          resultCount: geocodeData.results?.length || 0
        });
        
        if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
          const result = geocodeData.results[0];
          const location = result.geometry.location;
          const locationType = result.geometry.location_type;
          
          // Check if the result is sufficiently precise - we want ROOFTOP or RANGE_INTERPOLATED
          // GEOMETRIC_CENTER or APPROXIMATE are too imprecise and may be city centers
          const isPreciseLocation = locationType === 'ROOFTOP' || locationType === 'RANGE_INTERPOLATED';
          
          // Extract address components to verify postal code and city
          let foundStreet = false;
          let foundHouseNumber = false;
          let foundPostalCode = false;
          let foundCity = false;
          let postalCodeMatches = false;
          let cityMatches = false;
          
          // Loop through address components to verify postal code and city
          for (const component of result.address_components) {
            const types = component.types;
            
            // Still identify all components but only validate postal code and city
            if (types.includes('route')) {
              foundStreet = true;
              // Just log street info but don't validate it
              logger.debug("validateAddress", "Street info:", { 
                original: addressData.street, 
                geocoded: component.long_name 
              });
            }
            
            if (types.includes('street_number')) {
              foundHouseNumber = true;
              // Just log house number info but don't validate it
              logger.debug("validateAddress", "House number info:", { 
                original: addressData.houseNumber, 
                geocoded: component.long_name 
              });
            }
            
            if (types.includes('postal_code')) {
              foundPostalCode = true;
              // Normalize and compare postal codes (remove spaces)
              const normalizedInput = addressData.zipCode.replace(/\s+/g, '').toUpperCase();
              const normalizedGeocoded = component.long_name.replace(/\s+/g, '').toUpperCase();
              postalCodeMatches = normalizedInput === normalizedGeocoded;
              
              if (!postalCodeMatches) {
                logger.debug("validateAddress", "Postal code mismatch:", { 
                  original: normalizedInput, 
                  geocoded: normalizedGeocoded 
                });
              }
            }
            
            if (types.includes('locality') || types.includes('postal_town')) {
              foundCity = true;
              // Case-insensitive city comparison
              cityMatches = component.long_name.toLowerCase() === addressData.city.toLowerCase();
              
              if (!cityMatches) {
                logger.debug("validateAddress", "City mismatch:", { 
                  original: addressData.city, 
                  geocoded: component.long_name 
                });
              }
            }
          }
          
          // Only validate that we have precise location and correct postal code and city
          const isValidAddress = foundPostalCode && postalCodeMatches && foundCity && cityMatches;
          
          if (!isValidAddress) {
            logger.debug("validateAddress", "Address validation failed", { 
              isPreciseLocation,
              locationType,
              foundPostalCode, postalCodeMatches,
              foundCity, cityMatches 
            });
            
            // Return more specific error message based on what's invalid
            let errorMessage = t('CouldNotVerifyAddressLocation') || "Could not verify this address location.";
            
            // if (!isPreciseLocation) {
            //   errorMessage = t('AddressNotPreciseEnough') || "This address is not precise enough. Please check the street and house number.";
            // } else 
            if (!foundPostalCode || !postalCodeMatches) {
              errorMessage = t('InvalidPostalCode') || "The postal code appears to be invalid. Please check it and try again.";
            } else if (!foundCity || !cityMatches) {
              errorMessage = t('InvalidCity') || "The city does not match the postal code. Please check both fields.";
            }

            logger.debug("validateAddress", "Validation result:", { 
              isValid: false,
              isInRange: false,
              message: errorMessage,
              validatedAddress: addressData
            });
            
            return {
              isValid: false,
              isInRange: false,
              message: errorMessage,
              validatedAddress: addressData
            };
          }
          
          coords = { lat: location.lat, lng: location.lng };
          logger.debug("validateAddress", "Geocoded coordinates:", { 
            coords,
            locationType,
            formattedAddress: result.formatted_address 
          });
        } else {
          // Log more details about failed geocoding
          logger.error("validateAddress", "Geocoding API error:", { 
            status: geocodeData.status,
            errorMessage: geocodeData.error_message || 'No error message provided' 
          });
          
          return {
            isValid: false,
            isInRange: false,
            message: t('CouldNotVerifyAddressLocation') || "Failed to verify address location.",
            validatedAddress: addressData
          };
        }
      } catch (error) {
        logger.error("validateAddress", "Geocoding error:", { error });
        return {
          isValid: false,
          isInRange: false,
          message: t('FailedToVerifyAddressLocation') || "Failed to verify address location.",
          validatedAddress: addressData
        };
      }
    } else {
      return {
        isValid: false,
        isInRange: false,
        message: t('MissingRequiredFields') || "Missing required fields.",
        validatedAddress: addressData
      };
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
    
    // Store country region as fallback
    let countryRegion: MerchantDeliveryRegion | null = null;
    let countryRange: DeliveryRange | null = null;
    
    for (const region of deliveryRegions) {
      logger.debug("validateAddress", `Checking region: ${region.name}`);
      
      if (region.isCountry && addressData.country && 
          region.minOrderPriceInCents && region.deliveryPriceInCents && region.deliveryWindow &&
          region.name.toLowerCase() === addressData.country.toLowerCase()) {

          logger.debug("validateAddress", `Found country-wide delivery region: ${region.name}`);
          // Store as potential fallback instead of immediately using it
          countryRegion = region;
          countryRange = {
            range: 0,
            deliveryPriceInCents: region.deliveryPriceInCents,
            minOrderPriceInCents: region.minOrderPriceInCents,
            deliveryWindow: region.deliveryWindow
          };
      } else  {
        // Prioritize city/region based delivery
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
    
    // If no city delivery was found, fall back to country delivery
    if (!closestRegion && countryRegion && countryRange) {
      logger.debug("validateAddress", `No city delivery found, using country-wide delivery: ${countryRegion.name}`);
      closestRegion = countryRegion;
      applicableRange = countryRange;
      minPrice = countryRange.minOrderPriceInCents;
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


export async function getAddressFromCoordinates(latitude: number, longitude: number) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PRIVATE_GOOGLE_GEO_VALIDATION}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch address from coordinates");
  }

  const data = await response.json();
  return data;
}


/**
 * Saves a validated address to the database
 */
export async function saveDeliveryAddress(
  address: ExtendedDeliveryAddressRaw
): Promise<{ success?: string; error?: string }> {
  try {
    // Use the existing updateDeliveryAddress implementation
    logger.debug("saveDeliveryAddress", "Saving address:", { address });
    return await dbUpdateDeliveryAddress(address);
  } catch (error) {
    logger.error("saveDeliveryAddress", "Error saving address:", { error });
    return {
      error: "Failed to save address"
    };
  }
}


