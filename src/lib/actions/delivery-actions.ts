'use server';

import { containerDeliveryRegions } from "@/db";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from 'uuid';

export type DeliveryRegion = {
  id?: string;
  storeId: string;
  regionName: string;
  postalCodes: string[];
  price: number;
  coordinates?: {
    lat: number;
    lng: number;
    radius?: number;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

// Type for the response from API to be safer with typing
export type DeliveryActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getDeliveryRegions(storeId: string): Promise<DeliveryActionResponse<DeliveryRegion[]>> {
  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.storeId = @storeId ORDER BY c.createdAt DESC",
      parameters: [
        {
          name: "@storeId",
          value: storeId
        }
      ]
    };
    
    const { resources } = await containerDeliveryRegions.items
      .query(querySpec)
      .fetchAll();
    
    return { success: true, data: resources };
  } catch (error) {
    console.error("Failed to fetch delivery regions:", error);
    return { success: false, error: "Failed to fetch delivery regions" };
  }
}

export async function addDeliveryRegion(data: DeliveryRegion): Promise<DeliveryActionResponse<DeliveryRegion>> {
  try {
    const now = new Date();
    const region = {
      id: uuidv4(),
      storeId: data.storeId,
      regionName: data.regionName,
      postalCodes: data.postalCodes,
      price: data.price,
      coordinates: data.coordinates || undefined,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    
    const { resource } = await containerDeliveryRegions.items.create(region);
    
    revalidatePath('/settings');
    return { success: true, data: resource };
  } catch (error) {
    console.error("Failed to add delivery region:", error);
    return { success: false, error: "Failed to add delivery region" };
  }
}

export async function updateDeliveryRegion(id: string, data: Partial<DeliveryRegion>): Promise<DeliveryActionResponse<DeliveryRegion>> {
  try {
    const { resource } = await containerDeliveryRegions.item(id, id).read();
    
    if (!resource) {
      return { success: false, error: "Delivery region not found" };
    }
    
    const updatedRegion = {
      ...resource,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    const { resource: result } = await containerDeliveryRegions.item(id, id).replace(updatedRegion);
    
    revalidatePath('/settings');
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to update delivery region:", error);
    return { success: false, error: "Failed to update delivery region" };
  }
}

export async function deleteDeliveryRegion(id: string): Promise<DeliveryActionResponse> {
  try {
    await containerDeliveryRegions.item(id, id).delete();
    
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete delivery region:", error);
    return { success: false, error: "Failed to delete delivery region" };
  }
}

// This is for development and testing purposes
export async function getTestDeliveryRegions(): Promise<DeliveryRegion[]> {
  return [
    {
      id: "test-1",
      storeId: "test-store",
      regionName: "Amsterdam Centrum",
      postalCodes: ["1011", "1012", "1013"],
      price: 5.99,
      coordinates: {
        lat: 52.3676,
        lng: 4.9041,
        radius: 2000
      }
    },
    {
      id: "test-2",
      storeId: "test-store",
      regionName: "Amsterdam Zuid",
      postalCodes: ["1071", "1072", "1073"],
      price: 4.99,
      coordinates: {
        lat: 52.3507,
        lng: 4.8711,
        radius: 3000
      }
    }
  ];
}

// Function to search for postal code and get coordinates
export async function searchPostalCode(postalCode: string): Promise<DeliveryActionResponse<{lat: number, lng: number}>> {
  try {
    // Format postal code to ensure proper format
    const formattedCode = postalCode.trim().replace(/\s+/g, '');
    
    // First try to use Google Geocoding API
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      try {
        // Add Netherlands as a country restriction for more accurate results
        // You can adjust this to your target country
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedCode}&components=country:NL&key=${apiKey}`
        );
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results?.length > 0) {
          const location = data.results[0].geometry.location;
          return {
            success: true,
            data: {
              lat: location.lat,
              lng: location.lng
            }
          };
        } else {
          // Log error details for debugging
          console.log("Google API error:", data.status, data.error_message);
        }
      } catch (error) {
        console.error("Error calling Google Geocoding API:", error);
      }
    }
    
    // Fallback to our test data if API call fails or API key is not available
    // This is helpful for development or when API limits are reached
    const postalCodeMap: Record<string, {lat: number, lng: number}> = {
      // Amsterdam postal codes
      "1011": {lat: 52.3740, lng: 4.9000}, // Amsterdam Centrum
      "1012": {lat: 52.3760, lng: 4.8980},
      "1013": {lat: 52.3830, lng: 4.8950},
      "1071": {lat: 52.3507, lng: 4.8711}, // Amsterdam Zuid
      "1072": {lat: 52.3580, lng: 4.8800},
      "1073": {lat: 52.3560, lng: 4.8900},
      // Rotterdam postal codes
      "3011": {lat: 51.9200, lng: 4.4800}, // Rotterdam Centrum
      "3012": {lat: 51.9230, lng: 4.4750},
      "3013": {lat: 51.9280, lng: 4.4700},
      // Utrecht postal codes
      "3511": {lat: 52.0910, lng: 5.1170}, // Utrecht Centrum
      "3512": {lat: 52.0930, lng: 5.1200},
      "3513": {lat: 52.0950, lng: 5.1150},
      // Den Haag postal codes
      "2511": {lat: 52.0770, lng: 4.3070}, // Den Haag Centrum
      "2512": {lat: 52.0800, lng: 4.3100},
      "2513": {lat: 52.0820, lng: 4.3050},
      // Maastricht postal codes
      "6229": {lat: 50.8464, lng: 5.7190}, // Maastricht University area
    };
    
    // Only take first 4 digits for our test data matching
    const codePrefix = formattedCode.substring(0, 4);
    
    if (postalCodeMap[codePrefix]) {
      return { 
        success: true, 
        data: postalCodeMap[codePrefix]
      };
    }
    
    return { 
      success: false, 
      error: "Postal code not found" 
    };
  } catch (error) {
    console.error("Failed to search postal code:", error);
    return { success: false, error: "Failed to search postal code" };
  }
}

