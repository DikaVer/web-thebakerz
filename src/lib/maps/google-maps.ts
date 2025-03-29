import { MerchantDeliveryRegion } from '@/lib/actions/delivery-actions';

export interface AddressComponents {
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  country: string;
  formattedAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface GoogleMapsLocation {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  formatted_address: string;
  geometry: {
    location: GoogleMapsLocation;
  };
  place_id: string;
  types: string[];
}

export interface GeocodingResponse {
  status: 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';
  results: GeocodingResult[];
  error_message?: string;
}

/**
 * Geocode an address using Google Maps API
 */
export async function geocodeAddress(address: {
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
}): Promise<AddressComponents | null> {
  try {
    // The original formatting of the address with street, house number, zip code and city
    const formattedAddress = `${address.street} ${address.houseNumber}, ${address.zipCode} ${address.city}, Netherlands`;
    
    // Prioritize the city in the query by adding it explicitly
    const searchQuery = `${formattedAddress} ${address.city}`;
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        searchQuery
      )}&region=nl&components=country:nl&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );

    const data: GeocodingResponse = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding error:', data.status, data.error_message);
      return null;
    }

    // Get the first result which should be the most relevant
    let result = data.results[0];
    
    // Look for a result that matches the city more closely
    const cityMatches = data.results.filter(r => {
      return r.address_components.some(component => 
        (component.types.includes('locality') || component.types.includes('postal_town')) &&
        component.long_name.toLowerCase() === address.city.toLowerCase()
      );
    });
    
    if (cityMatches.length > 0) {
      // Use the first result that matches the city
      result = cityMatches[0];
    }
    
    // Extract components from result
    const components: AddressComponents = {
      street: address.street, // Start with user provided values
      houseNumber: address.houseNumber,
      city: address.city,
      zipCode: address.zipCode,
      country: 'Netherlands',
      formattedAddress: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
    };

    // Extract address components from Google, but prefer our user-provided values
    result.address_components.forEach((component) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        // Only update if empty
        if (!components.houseNumber) {
          components.houseNumber = component.long_name;
        }
      } else if (types.includes('route')) {
        // Only update if empty
        if (!components.street) {
          components.street = component.long_name;
        }
      } else if (types.includes('locality') || types.includes('postal_town')) {
        // Check if Google's city differs significantly from user input
        const googleCity = component.long_name;
        if (googleCity.toLowerCase() !== address.city.toLowerCase()) {
          console.log(`City mismatch: User provided "${address.city}" but Google suggests "${googleCity}"`);
          // We still prefer the user's input for city
        }
      } else if (types.includes('postal_code')) {
        // Only update if empty
        if (!components.zipCode) {
          components.zipCode = component.long_name;
        }
      } else if (types.includes('country')) {
        components.country = component.long_name;
      }
    });

    return components;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates using the Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Check if an address is within delivery range of a store
 */
export function checkDeliveryRange(
  addressCoordinates: { lat: number; lng: number },
  storeCoordinates: { latitude: number; longitude: number },
  deliveryRegions: MerchantDeliveryRegion[]
): { inRange: boolean; closestRegion: MerchantDeliveryRegion | null } {
  if (!deliveryRegions || deliveryRegions.length === 0) {
    return { inRange: false, closestRegion: null };
  }

  // Calculate distance from address to store
  const distance = calculateDistance(
    addressCoordinates.lat,
    addressCoordinates.lng,
    storeCoordinates.latitude,
    storeCoordinates.longitude
  );

  // Find the closest delivery region that covers this distance
  let closestRegion: MerchantDeliveryRegion | null = null;
  let minDistance = Infinity;
  console.log(distance);

  for (const region of deliveryRegions) {
    if (distance <= region.radiusKm && distance < minDistance) {
      minDistance = distance;
      closestRegion = region;
    }
  }

  return {
    inRange: !!closestRegion,
    closestRegion
  };
} 